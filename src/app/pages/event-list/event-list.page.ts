import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonAccordion, IonAccordionGroup, IonContent, IonHeader, IonTitle, IonToolbar,IonList,IonItem,IonLabel, IonButton, IonInput, IonSegment, IonSegmentButton, IonIcon } from '@ionic/angular/standalone';
import { AppEvent, category, categoryDescription, categoryWithDescriptions, EntityId } from 'src/app/interfaces/event';
import { EventApi } from 'src/app/services/event-api';
import { Category } from 'src/app/services/category';
import { forkJoin } from 'rxjs';
import { addIcons } from 'ionicons';
import { createOutline, trashOutline } from 'ionicons/icons';

addIcons({ createOutline, trashOutline });


@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.page.html',
  styleUrls: ['./event-list.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonButton, IonInput, IonSegment, IonSegmentButton, IonAccordion, IonAccordionGroup, IonIcon, CommonModule, FormsModule, KeyValuePipe]
})
export class EventListPage implements OnInit, OnDestroy {

  events: AppEvent[] = [];
  groupedEvents: { [key: string]: AppEvent[] } = {};
  categories: category[] = [];
  categoryDescriptions: categoryDescription[] = [];
  categoriesWithDescriptions: categoryWithDescriptions[] = [];
  editingId: EntityId | null = null;
  currentTab: 'events' | 'categories' = 'events';

  //for adding new category
  newCategoryName: string = '';
  newCategoryDescription: string = '';
  private syncingEventDescriptions: boolean = false;
  private hasLoadedEvents: boolean = false;
  private hasLoadedCategories: boolean = false;
  private hasLoadedCategoryDescriptions: boolean = false;
  private syncTimerId?: ReturnType<typeof setInterval>;


  constructor(private eventApi: EventApi, private categoryService: Category) {}

  ngOnInit() {
    this.loadEvents();
    this.loadCategories();
    this.loadCategoryDescriptions();
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
      this.refreshCategoryData();
    }
  }

  private startCategorySyncWatcher() {
    this.syncTimerId = setInterval(() => {
      if (this.currentTab === 'categories') {
        this.refreshCategoryData();
      }
    }, 4000);
  }

  private refreshCategoryData() {
    this.loadEvents();
    this.loadCategories();
    this.loadCategoryDescriptions();
  }

  // Load events
  loadEvents() {
    this.eventApi.getEvents().subscribe(data => {
      this.events = data;
      this.hasLoadedEvents = true;
      this.groupEventsByCategory();
      this.syncDescriptionsFromEvents();
    });
  }

  groupEventsByCategory() {
    this.groupedEvents = this.events.reduce((grouped, event) => {
      const matchedCategory = this.categories.find(
        c => c.id != null && event.categoryId != null && String(c.id) === String(event.categoryId)
      );
      const categoryName = matchedCategory?.categoryName || event.category || 'Other';
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(event);
      return grouped;
    }, {} as { [key: string]: AppEvent[] });
  }

  // Delete event
  deleteEvent(id: EntityId) {
    const shouldDelete = confirm('Are you sure you want to delete this event?');
    if (!shouldDelete) {
      return;
    }

    this.eventApi.deleteEvent(id).subscribe({
      next: () => {
        this.loadEvents();
        alert('Event deleted successfully.');
      },
      error: (error) => {
        console.error('Failed to delete event:', error);
        alert('Failed to delete event.');
      }
    });
  }

    // Enable edit mode
  startEdit(id: EntityId) {
    const shouldEdit = confirm('Do you want to edit this event?');
    if (!shouldEdit) {
      return;
    }
    this.editingId = id;
  }

 // Save update
  saveUpdate(event: AppEvent) {
    if (event.id == null) {
      console.error('Cannot update event without an id.');
      return;
    }
    this.eventApi.updateEvent(event.id!, event).subscribe({
      next: () => {
        this.editingId = null;
        this.loadEvents();
        alert('Event updated successfully.');
      },
      error: (error) => {
        console.error('Failed to update event:', error);
        alert('Failed to update event.');
      }
    });
  }

  // ===== CATEGORIES CRUD ===== //
  loadCategories() {
    this.categoryService.getCategories().subscribe(data => {
      this.categories = data.filter((cat, index, allCategories) =>
        index === allCategories.findIndex(
          (other) =>
            this.categoryService.normalizeCategoryName(other.categoryName) ===
          this.categoryService.normalizeCategoryName(cat.categoryName)
        )
      );
      this.hasLoadedCategories = true;
      this.groupEventsByCategory();
      this.syncDescriptionsFromEvents();
    });
  }

  loadCategoryDescriptions() {
    this.categoryService.getCategoryDescriptions().subscribe((descriptions) => {
      this.categoryDescriptions = descriptions;
      this.hasLoadedCategoryDescriptions = true;
      this.syncDescriptionsFromEvents();
    });
  }

  buildCategoriesWithDescriptions() {
    this.categoriesWithDescriptions = this.categories.map((cat) => ({
      category: cat,
      descriptions: this.categoryDescriptions.filter(
        (description) => String(description.categoryId) === String(cat.id)
      )
    }));
  }

  private resolveEventCategoryId(event: AppEvent): EntityId | undefined {
    const hasExistingCategoryId = this.categories.some(
      (cat) => cat.id != null && event.categoryId != null && String(cat.id) === String(event.categoryId)
    );
    if (hasExistingCategoryId && event.categoryId != null) {
      return event.categoryId;
    }

    if (!event.category) {
      return undefined;
    }

    const matchedCategory = this.categories.find(
      (cat) =>
        this.categoryService.normalizeCategoryName(cat.categoryName) ===
        this.categoryService.normalizeCategoryName(event.category ?? '')
    );
    return matchedCategory?.id;
  }

  private syncDescriptionsFromEvents() {
    if (!this.hasLoadedEvents || !this.hasLoadedCategories || !this.hasLoadedCategoryDescriptions || this.syncingEventDescriptions) {
      this.buildCategoriesWithDescriptions();
      return;
    }

    const existingDescriptionKeys = new Set(
      this.categoryDescriptions.map(
        (description) =>
          `${String(description.categoryId)}::${this.categoryService.normalizeDescription(description.description)}`
      )
    );
    const eventDescriptionByKey = new Map<string, categoryDescription>();
    const descriptionsToCreate: categoryDescription[] = [];
    const descriptionsToDelete: categoryDescription[] = [];

    for (const event of this.events) {
      const eventDescription = event.description?.trim();
      if (!eventDescription) {
        continue;
      }

      const resolvedCategoryId = this.resolveEventCategoryId(event);
      if (resolvedCategoryId == null) {
        continue;
      }

      const descriptionKey = `${String(resolvedCategoryId)}::${this.categoryService.normalizeDescription(eventDescription)}`;
      if (!eventDescriptionByKey.has(descriptionKey)) {
        eventDescriptionByKey.set(descriptionKey, {
          categoryId: resolvedCategoryId,
          description: eventDescription
        });
      }
    }

    for (const [key, description] of eventDescriptionByKey.entries()) {
      if (!existingDescriptionKeys.has(key)) {
        descriptionsToCreate.push(description);
      }
    }

    const keptExistingKeys = new Set<string>();
    for (const existingDescription of this.categoryDescriptions) {
      const key = `${String(existingDescription.categoryId)}::${this.categoryService.normalizeDescription(existingDescription.description)}`;
      const isExpectedFromEvents = eventDescriptionByKey.has(key);
      const isDuplicate = keptExistingKeys.has(key);

      if (isExpectedFromEvents && !isDuplicate) {
        keptExistingKeys.add(key);
        continue;
      }

      if (existingDescription.id != null) {
        descriptionsToDelete.push(existingDescription);
      }
    }

    if (descriptionsToCreate.length === 0 && descriptionsToDelete.length === 0) {
      this.buildCategoriesWithDescriptions();
      return;
    }

    this.syncingEventDescriptions = true;
    const syncRequests = [
      ...descriptionsToCreate.map((description) => this.categoryService.addCategoryDescription(description)),
      ...descriptionsToDelete.map((description) => this.categoryService.deleteCategoryDescription(description.id!))
    ];

    forkJoin(syncRequests).subscribe({
      next: () => {
        this.syncingEventDescriptions = false;
        this.loadCategoryDescriptions();
      },
      error: (error) => {
        this.syncingEventDescriptions = false;
        console.error('Failed syncing category descriptions from events:', error);
        this.buildCategoriesWithDescriptions();
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
              const duplicateDescription = existingDescriptions.some(
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
                  this.loadCategoryDescriptions();
                  this.loadCategories();
                  alert(`Category "${existingCategory.categoryName}" already existed, so your description was added to it.`);
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

            const finishAdd = () => {
              this.newCategoryName = '';
              this.newCategoryDescription = '';
              this.loadCategoryDescriptions();
              this.loadCategories();
            };

            if (!categoryDescription) {
              finishAdd();
              return;
            }

            this.categoryService.addCategoryDescription({
              categoryId: createdCategory.id,
              description: categoryDescription
            }).subscribe({
              next: () => finishAdd(),
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
    this.categoryService.deleteCategoryDescription(description.id).subscribe(() => {
      this.loadCategoryDescriptions();
    });
  }
}
