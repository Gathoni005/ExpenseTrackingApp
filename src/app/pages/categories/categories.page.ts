import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenuButton,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { createOutline, trashOutline } from 'ionicons/icons';
import { forkJoin, of } from 'rxjs';
import { EntityId, category } from 'src/app/interfaces/event';
import { Category } from 'src/app/services/category';
import { MenuStateService } from 'src/app/services/menu-state.service';

// Icons used by update/delete buttons.
addIcons({ createOutline, trashOutline });

type ToastColor = 'success' | 'danger';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    CommonModule,
    FormsModule,
    AsyncPipe
  ]
})
export class CategoriesPage implements OnInit {
  categories: category[] = [];

  private categoryService = inject(Category);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);
  private menuStateService = inject(MenuStateService);

  // Used to hide menu button while menu is open.
  menuIsOpen$ = this.menuStateService.menuOpen$;

  ngOnInit() {
    this.loadCategories();
  }

  ionViewWillEnter() {
    this.loadCategories();
  }

  // Load categories from API/db.json.
  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Failed to load categories:', error);
      }
    });
  }

  async updateCategory(currentCategory: category) {
    const alert = await this.alertController.create({
      header: 'Update Category',
      inputs: [
        {
          name: 'categoryName',
          type: 'text',
          value: currentCategory.categoryName,
          placeholder: 'Category name'
        }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save',
          handler: (data) => {
            const updatedName = String(data.categoryName ?? '').trim();
            if (!updatedName) {
              return false;
            }

            const updatedCategory: category = {
              ...currentCategory,
              categoryName: updatedName
            };

            this.saveCategoryUpdate(updatedCategory);
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  // Save update and reflect it in UI immediately.
  private saveCategoryUpdate(updatedCategory: category) {
    if (updatedCategory.id == null) {
      return;
    }

    this.categoryService.updateCategory(updatedCategory).subscribe({
      next: async () => {
        this.updateCategoryInMemory(updatedCategory);
        await this.showToast('Category updated successfully.', 'success');
        this.refreshCategoriesFromServer();
      },
      error: async (error) => {
        console.error('Failed to update category:', error);
        await this.showToast('Failed to update category.', 'danger');
      }
    });
  }

  async deleteCategory(categoryToDelete: category) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this category?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => this.runDeleteCategory(categoryToDelete)
        }
      ]
    });

    await alert.present();
  }

  // Delete category + its related descriptions, then update UI immediately.
  private runDeleteCategory(categoryToDelete: category) {
    const categoryId = categoryToDelete.id;
    if (categoryId == null) {
      return;
    }

    this.categoryService.getCategoryDescriptions().subscribe({
      next: (allDescriptions) => {
        const relatedDescriptions = allDescriptions.filter(
          (description) =>
            description.id != null && String(description.categoryId) === String(categoryId)
        );

        const deleteDescriptionsRequest = relatedDescriptions.length
          ? forkJoin(
              relatedDescriptions.map((description) =>
                this.categoryService.deleteCategoryDescription(description.id!)
              )
            )
          : of([]);

        deleteDescriptionsRequest.subscribe({
          next: () => {
            this.categoryService.deleteCategory(categoryToDelete).subscribe({
              next: async () => {
                this.removeCategoryFromMemory(categoryId);
                await this.showToast('Category deleted successfully.', 'success');
                this.refreshCategoriesFromServer();
              },
              error: async (error) => {
                console.error('Failed to delete category:', error);
                await this.showToast('Failed to delete category.', 'danger');
              }
            });
          },
          error: async (error) => {
            console.error('Failed to delete related category descriptions:', error);
            await this.showToast('Failed to delete category.', 'danger');
          }
        });
      },
      error: async (error) => {
        console.error('Failed to load category descriptions:', error);
        await this.showToast('Failed to delete category.', 'danger');
      }
    });
  }

  private updateCategoryInMemory(updatedCategory: category) {
    this.categories = this.categories.map((item) => {
      if (item.id == null || updatedCategory.id == null) {
        return item;
      }
      return String(item.id) === String(updatedCategory.id) ? { ...item, ...updatedCategory } : item;
    });
  }

  private removeCategoryFromMemory(categoryId: EntityId) {
    this.categories = this.categories.filter((item) => {
      if (item.id == null) {
        return true;
      }
      return String(item.id) !== String(categoryId);
    });
  }

  // Final sync from server so UI and db.json stay aligned.
  private refreshCategoriesFromServer() {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Failed to refresh categories:', error);
      }
    });
  }

  private async showToast(message: string, color: ToastColor) {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 1800,
      position: 'top'
    });
    await toast.present();
  }
}
