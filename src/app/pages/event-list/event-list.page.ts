import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonAccordion,
  IonAccordionGroup,
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { AppEvent, category, categoryDescription, categoryWithDescriptions, EntityId } from 'src/app/interfaces/event';
import { EventApi } from 'src/app/services/event-api';
import { Category } from 'src/app/services/category';
import { forkJoin, Observable } from 'rxjs';
import { addIcons } from 'ionicons';
import { createOutline, trashOutline } from 'ionicons/icons';

addIcons({ createOutline, trashOutline });

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.page.html',
  styleUrls: ['./event-list.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonInput,
    IonSegment,
    IonSegmentButton,
    IonAccordion,
    IonAccordionGroup,
    IonIcon,
    CommonModule,
    FormsModule,
    KeyValuePipe
  ]
})
export class EventListPage implements OnInit, OnDestroy {
  events: AppEvent[] = [];
  groupedEvents: { [key: string]: AppEvent[] } = {};
  categories: category[] = [];
  categoryDescriptions: categoryDescription[] = [];
  categoriesWithDescriptions: categoryWithDescriptions[] = [];
  editingId: EntityId | null = null;
  currentTab: 'events' | 'categories' = 'events';

  newCategoryName: string = '';
  newCategoryDescription: string = '';

  private syncTimerId?: ReturnType<typeof setInterval>;
  private isSyncingDescriptions: boolean = false;

  constructor(private eventApi: EventApi, private categoryService: Category) {}

  ngOnInit() {
    this.refreshAllData();
    this.startCategorySyncWatcher();
  }

  ngOnDestroy() {
    if (this.syncTimerId) {
      clearInterval(this.syncTimerId);
      this.syncTimerId = undefined;
    }
  }

  onTabChanged() {
    if (this.currentTab === 'categories') {
      this.refreshAllData();
    }
  }

  private startCategorySyncWatcher() {
    this.syncTimerId = setInterval(() => {
      if (this.currentTab === 'categories') {
        this.refreshAllData();
      }
    }, 4000);
  }

  private refreshAllData() {
    this.eventApi.getEvents().subscribe({
      next: (events) => {
        this.events = events;

        this.categoryService.getCategories().subscribe({
          next: (categories) => {
            this.categories = this.removeDuplicateCategories(categories);

            this.categoryService.getCategoryDescriptions().subscribe({
              next: (descriptions) => {
                this.categoryDescriptions = descriptions;
                this.groupEventsByCategory();
                this.buildCategoriesWithDescriptions();
                this.syncDescriptionsFromEvents();
              },
              error: (error) => {
                console.error('Failed to load category descriptions:', error);
              }
            });
          },
          error: (error) => {
            console.error('Failed to load categories:', error);
          }
        });
      },
      error: (error) => {
        console.error('Failed to load events:', error);
      }
    });
  }

  private removeDuplicateCategories(inputCategories: category[]): category[] {
    const uniqueCategories: category[] = [];

    for (const currentCategory of inputCategories) {
      const alreadyExists = uniqueCategories.find(
        (existingCategory) =>
          this.categoryService.normalizeCategoryName(existingCategory.categoryName) ===
          this.categoryService.normalizeCategoryName(currentCategory.categoryName)
      );

      if (!alreadyExists) {
        uniqueCategories.push(currentCategory);
      }
    }

    return uniqueCategories;
  }

  private groupEventsByCategory() {
    this.groupedEvents = this.events.reduce((grouped, event) => {
      const matchedCategory = this.categories.find(
        (cat) => cat.id != null && event.categoryId != null && String(cat.id) === String(event.categoryId)
      );
      const categoryName = matchedCategory?.categoryName || event.category || 'Other';

      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(event);
      return grouped;
    }, {} as { [key: string]: AppEvent[] });
  }

  private buildCategoriesWithDescriptions() {
    this.categoriesWithDescriptions = this.categories.map((cat) => ({
      category: cat,
      descriptions: this.categoryDescriptions.filter(
        (description) => String(description.categoryId) === String(cat.id)
      )
    }));
  }

  private resolveCategoryIdFromEvent(event: AppEvent): EntityId | undefined {
    const hasValidCategoryId = this.categories.some(
      (cat) => cat.id != null && event.categoryId != null && String(cat.id) === String(event.categoryId)
    );
    if (hasValidCategoryId && event.categoryId != null) {
      return event.categoryId;
    }

    if (!event.category) {
      return undefined;
    }

    const matchedByName = this.categories.find(
      (cat) =>
        this.categoryService.normalizeCategoryName(cat.categoryName) ===
        this.categoryService.normalizeCategoryName(event.category ?? '')
    );
    return matchedByName?.id;
  }

  private syncDescriptionsFromEvents() {
    if (this.isSyncingDescriptions) {
      return;
    }

    const expectedDescriptions: categoryDescription[] = [];
    for (const event of this.events) {
      const trimmedDescription = event.description?.trim();
      if (!trimmedDescription) {
        continue;
      }

      const resolvedCategoryId = this.resolveCategoryIdFromEvent(event);
      if (resolvedCategoryId == null) {
        continue;
      }

      const alreadyAdded = expectedDescriptions.find(
        (item) =>
          String(item.categoryId) === String(resolvedCategoryId) &&
          this.categoryService.normalizeDescription(item.description) ===
            this.categoryService.normalizeDescription(trimmedDescription)
      );

      if (!alreadyAdded) {
        expectedDescriptions.push({
          categoryId: resolvedCategoryId,
          description: trimmedDescription
        });
      }
    }

    const descriptionsToCreate: categoryDescription[] = [];
    for (const expected of expectedDescriptions) {
      const existsInDb = this.categoryDescriptions.find(
        (current) =>
          String(current.categoryId) === String(expected.categoryId) &&
          this.categoryService.normalizeDescription(current.description) ===
            this.categoryService.normalizeDescription(expected.description)
      );
      if (!existsInDb) {
        descriptionsToCreate.push(expected);
      }
    }

    const descriptionsToDelete: categoryDescription[] = [];
    const seenKeys: string[] = [];
    for (const current of this.categoryDescriptions) {
      const key =
        `${String(current.categoryId)}::` +
        this.categoryService.normalizeDescription(current.description);

      const shouldExist = expectedDescriptions.find(
        (expected) =>
          String(expected.categoryId) === String(current.categoryId) &&
          this.categoryService.normalizeDescription(expected.description) ===
            this.categoryService.normalizeDescription(current.description)
      );

      const isDuplicate = seenKeys.includes(key);
      if (shouldExist && !isDuplicate) {
        seenKeys.push(key);
        continue;
      }

      if (current.id != null) {
        descriptionsToDelete.push(current);
      }
    }

    if (descriptionsToCreate.length === 0 && descriptionsToDelete.length === 0) {
      return;
    }

    const syncRequests: Observable<unknown>[] = [];
    for (const item of descriptionsToCreate) {
      syncRequests.push(this.categoryService.addCategoryDescription(item));
    }
    for (const item of descriptionsToDelete) {
      if (item.id != null) {
        syncRequests.push(this.categoryService.deleteCategoryDescription(item.id));
      }
    }

    if (syncRequests.length === 0) {
      return;
    }

    this.isSyncingDescriptions = true;
    forkJoin(syncRequests).subscribe({
      next: () => {
        this.isSyncingDescriptions = false;
        this.refreshAllData();
      },
      error: (error) => {
        this.isSyncingDescriptions = false;
        console.error('Failed syncing category descriptions from events:', error);
      }
    });
  }

  deleteEvent(id: EntityId) {
    const shouldDelete = confirm('Are you sure you want to delete this event?');
    if (!shouldDelete) {
      return;
    }

    this.eventApi.deleteEvent(id).subscribe({
      next: () => {
        alert('Event deleted successfully.');
        this.refreshAllData();
      },
      error: (error) => {
        console.error('Failed to delete event:', error);
        alert('Failed to delete event.');
      }
    });
  }

  startEdit(id: EntityId) {
    const shouldEdit = confirm('Do you want to edit this event?');
    if (!shouldEdit) {
      return;
    }
    this.editingId = id;
  }

  saveUpdate(event: AppEvent) {
    if (event.id == null) {
      console.error('Cannot update event without an id.');
      return;
    }

    this.eventApi.updateEvent(event.id, event).subscribe({
      next: () => {
        this.editingId = null;
        alert('Event updated successfully.');
        this.refreshAllData();
      },
      error: (error) => {
        console.error('Failed to update event:', error);
        alert('Failed to update event.');
      }
    });
  }

  addCategory() {
    const categoryName = this.newCategoryName.trim();
    const categoryDescription = this.newCategoryDescription.trim();

    if (!categoryName) {
      alert('Please enter a category name.');
      return;
    }

    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        const existingCategory = this.categoryService.findCategoryByName(categories, categoryName);

        if (existingCategory?.id != null) {
          if (!categoryDescription) {
            alert(`Category "${existingCategory.categoryName}" already exists. Add a different description.`);
            return;
          }

          this.categoryService.getDescriptionsForCategory(existingCategory.id).subscribe({
            next: (existingDescriptions) => {
              const duplicateDescription = existingDescriptions.find(
                (description) =>
                  this.categoryService.normalizeDescription(description.description) ===
                  this.categoryService.normalizeDescription(categoryDescription)
              );

              if (duplicateDescription) {
                alert(`That description already exists under "${existingCategory.categoryName}".`);
                return;
              }

              this.categoryService.addCategoryDescription({
                categoryId: existingCategory.id!,
                description: categoryDescription
              }).subscribe({
                next: () => {
                  this.newCategoryName = '';
                  this.newCategoryDescription = '';
                  alert(`Category "${existingCategory.categoryName}" already existed, so your description was added to it.`);
                  this.refreshAllData();
                },
                error: (error) => {
                  console.error('Failed to create category description:', error);
                  alert('Error adding description. Check console.');
                }
              });
            },
            error: (error) => {
              console.error('Failed to load category descriptions:', error);
              alert('Error loading category descriptions. Check console.');
            }
          });

          return;
        }

        this.categoryService.addCategory({
          categoryName: this.categoryService.normalizeCategoryName(categoryName)
        }).subscribe({
          next: (createdCategory) => {
            if (createdCategory.id == null) {
              alert('Category was created but no category id was returned.');
              return;
            }

            if (!categoryDescription) {
              this.newCategoryName = '';
              this.newCategoryDescription = '';
              alert(`Category "${createdCategory.categoryName}" created.`);
              this.refreshAllData();
              return;
            }

            this.categoryService.addCategoryDescription({
              categoryId: createdCategory.id,
              description: categoryDescription
            }).subscribe({
              next: () => {
                this.newCategoryName = '';
                this.newCategoryDescription = '';
                alert(`Category "${createdCategory.categoryName}" created.`);
                this.refreshAllData();
              },
              error: (error) => {
                console.error('Failed to add initial category description:', error);
                alert('Category was created, but adding description failed. Check console.');
              }
            });
          },
          error: (error) => {
            console.error('Failed to create category:', error);
            alert('Error creating category. Check console.');
          }
        });
      },
      error: (error) => {
        console.error('Failed to load categories before create:', error);
        alert('Error loading categories. Check console.');
      }
    });
  }

  deleteCategoryDescription(description: categoryDescription) {
    if (description.id == null) {
      console.error('Cannot delete category description without id.');
      return;
    }

    this.categoryService.deleteCategoryDescription(description.id).subscribe({
      next: () => {
        this.refreshAllData();
      },
      error: (error) => {
        console.error('Failed to delete category description:', error);
        alert('Failed to delete category description.');
      }
    });
  }
}
