import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {IonContent, IonHeader, IonTitle, IonToolbar,IonList, IonItem, IonLabel, IonInput, IonButton, IonSelect, IonSelectOption} from '@ionic/angular/standalone';
import { AppEvent, category, EntityId } from '../../interfaces/event';
import { Router } from '@angular/router';
import { EventApi } from 'src/app/services/event-api';
import { Category } from 'src/app/services/category';

@Component({
  selector: 'app-event-registration',
  templateUrl: './event-registration.page.html',
  styleUrls: ['./event-registration.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar,IonList, IonItem, IonLabel, IonInput,IonButton, IonSelect, IonSelectOption, CommonModule, FormsModule]})

  export class EventRegistrationPage implements OnInit {

  newEvent: AppEvent = {
    categoryId: '',
    category: '',
    description: '',
    serviceProvider: '',
    serviceProviderDetails: '',
    cost: 0,
    date: new Date()
  };

  categories: category[] = [];
  newCategoryName: string = '';
  newCategoryDescription: string = '';
  showNewCategoryForm: boolean = false;
  @ViewChild('categorySelect') categorySelect?: IonSelect;

  constructor(private eventApi: EventApi, private router: Router,private categoryService: Category) {}

  ngOnInit() {
    this.loadCategories();
  }

  ionViewWillEnter() {
    this.loadCategories();
  }

  loadCategories(preferredCategoryId?: EntityId, openPicker: boolean = false) {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories.filter((cat, index, allCategories) =>
          index === allCategories.findIndex(
            (other) =>
              this.categoryService.normalizeCategoryName(other.categoryName) ===
              this.categoryService.normalizeCategoryName(cat.categoryName)
          )
        );
        const selectedCategoryId = preferredCategoryId ?? this.newEvent.categoryId;
        const selectedExists = this.categories.some(
          (cat) => cat.id != null && String(cat.id) === String(selectedCategoryId)
        );

        if (selectedExists && selectedCategoryId !== '' && selectedCategoryId != null) {
          this.newEvent.categoryId = selectedCategoryId;
        } else {
          this.newEvent.categoryId = '';
        }

        if (openPicker) {
          setTimeout(() => this.categorySelect?.open(), 0);
        }
      },
      error: (error) => {
        console.error('Failed to load categories:', error);
        if (openPicker) {
          alert('Unable to load categories from DB. Confirm JSON server is running on port 3000.');
        }
      }
    });
  }

  refreshCategories() {
    this.loadCategories(this.newEvent.categoryId);
  }

  openCategoryPicker() {
    this.loadCategories(this.newEvent.categoryId, true);
  }

  submitEvent() {
    console.log('Current event:', this.newEvent);
    console.log('Categories:', this.categories);

    const hasCategory = this.newEvent.categoryId !== '' && this.newEvent.categoryId !== null && this.newEvent.categoryId !== undefined;
    const hasRequiredFields = this.newEvent.cost > 0
      && hasCategory
      && !!this.newEvent.description.trim()
      && !!this.newEvent.serviceProvider.trim()
      && !!String(this.newEvent.serviceProviderDetails).trim();

    if (hasRequiredFields) {
      const selectedCategory = this.categories.find(
        cat => cat.id != null && String(cat.id) === String(this.newEvent.categoryId)
      );
      const eventToSave: AppEvent = {
        ...this.newEvent,
        category: selectedCategory?.categoryName ?? this.newEvent.category,
        date: new Date()
      };

      this.eventApi.addEvent(eventToSave).subscribe(() => {
        this.resetForm();
        this.router.navigate(['/event-list']);
      }, (error) => {
        console.error('Failed to create event:', error);
        alert('Error creating event. Confirm JSON server is running on port 3000.');
      });
    } else {
      alert('Please complete all required fields before registering the event.');
    }
  }

  createAndUseCategory() {
    const categoryName = this.newCategoryName.trim();
    const categoryDescription = this.newCategoryDescription.trim();

    if (!categoryName) {
      console.warn('Category name is empty');
      alert('Please enter a category name');
      return;
    }

    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        const existingCategory = this.categoryService.findCategoryByName(categories, categoryName);

        if (existingCategory?.id != null) {
          this.newEvent.categoryId = existingCategory.id;

          if (!categoryDescription) {
            alert(`Category "${existingCategory.categoryName}" already exists and has been selected. Add a different description before creating.`);
            return;
          }

          this.categoryService.getDescriptionsForCategory(existingCategory.id).subscribe({
            next: (existingDescriptions) => {
              const hasSameDescription = existingDescriptions.some(
                (description) =>
                  this.categoryService.normalizeDescription(description.description) ===
                  this.categoryService.normalizeDescription(categoryDescription)
              );

              if (hasSameDescription) {
                alert(`That description already exists under "${existingCategory.categoryName}". Please enter a different description.`);
                return;
              }

              this.categoryService.addCategoryDescription({
                categoryId: existingCategory.id!,
                description: categoryDescription
              }).subscribe({
                next: () => {
                  this.loadCategories(existingCategory.id);
                  this.newCategoryName = '';
                  this.newCategoryDescription = '';
                  this.showNewCategoryForm = false;
                  alert(`Category "${existingCategory.categoryName}" already existed, so it was selected and your new description was added.`);
                },
                error: (error) => {
                  console.error('❌ Failed to create category description:', error);
                  alert('Error creating category description. Check console.');
                }
              });
            },
            error: (error) => {
              console.error('❌ Failed to load category descriptions:', error);
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

            const finishCategoryCreation = () => {
              this.loadCategories(createdCategory.id);
              this.newCategoryName = '';
              this.newCategoryDescription = '';
              this.showNewCategoryForm = false;
              alert(`✅ Category "${createdCategory.categoryName}" created!`);
            };

            if (!categoryDescription) {
              finishCategoryCreation();
              return;
            }

            this.categoryService.addCategoryDescription({
              categoryId: createdCategory.id,
              description: categoryDescription
            }).subscribe({
              next: () => {
                finishCategoryCreation();
              },
              error: (error) => {
                console.error('❌ Failed to create category description:', error);
                alert('Category was created, but creating the description failed. Check console.');
              }
            });
          },
          error: (error) => {
            console.error('❌ Failed to create category:', error);
            alert('Error creating category. Check console.');
          }
        });
      },
      error: (error) => {
        console.error('❌ Failed to load categories before create:', error);
        alert('Error loading categories. Check console.');
      }
    });
  }

  resetForm() {
    this.newEvent = {
      categoryId: '',
      category: '',
      cost: 0,
      description: '',
      serviceProvider: '',
      serviceProviderDetails: '',
      date: new Date()
    };
    this.newCategoryName = '';
    this.newCategoryDescription = '';
    this.showNewCategoryForm = false;
  }
}
