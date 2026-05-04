import { Component, OnInit } from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar,IonList,IonItem,IonLabel, IonButton, IonInput, IonSegment, IonSegmentButton } from '@ionic/angular/standalone';
import { AppEvent, category } from 'src/app/interfaces/event';
import { EventApi } from 'src/app/services/event-api';
import { Category } from 'src/app/services/category';


@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.page.html',
  styleUrls: ['./event-list.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonButton, IonInput, IonSegment, IonSegmentButton, CommonModule, FormsModule, KeyValuePipe]
})
export class EventListPage implements OnInit {

  events: AppEvent[] = [];
  groupedEvents: { [key: string]: AppEvent[] } = {};
  categories: category[] = [];
  editingId: number | null = null;
  currentTab: 'events' | 'categories' = 'events';

  //for adding new category
  newCategory: category = {
    categoryName: '',
    categoryDescription: ''
  };


  constructor(private eventApi: EventApi, private categoryService: Category) {}

  ngOnInit() {
    this.loadEvents();
    this.loadCategories();
  }

  // Load events
  loadEvents() {
    this.eventApi.getEvents().subscribe(data => {
      this.events = data;
      this.groupEventsByCategory();
    });
  }

  groupEventsByCategory() {
    this.groupedEvents = this.events.reduce((grouped, event) => {
      const categoryName = this.categories.find(c => c.id === event.categoryId)?.categoryName || 'Other';
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(event);
      return grouped;
    }, {} as { [key: string]: AppEvent[] });
  }

  // Delete event
  deleteEvent(id: number) {
    this.eventApi.deleteEvent(id).subscribe(() => {
      this.loadEvents();
    });
  }

    // Enable edit mode
  startEdit(id: number) {
    this.editingId = id;
  }

 // Save update
  saveUpdate(event: AppEvent) {
    this.eventApi.updateEvent(event.id!, event).subscribe(() => {
      this.editingId = null;
      this.loadEvents();
    });
  }

  // ===== CATEGORIES CRUD ===== //
  loadCategories() {
    this.categoryService.getCategories().subscribe(data => {
      this.categories = data;
    });
  }

  addCategory() {
    if (this.newCategory.categoryName && this.newCategory.categoryDescription) {
      this.categoryService.addCategory(this.newCategory).subscribe(() => {
        this.loadCategories();
        // Reset form
        this.newCategory = {
          categoryName: '',
          categoryDescription: ''
        };
      });
    }
  }

  deleteCategory(cat: category) {
    this.categoryService.deleteCategory(cat).subscribe(() => {
      this.loadCategories();
    });
  }

  updateCategory(cat: category) {
    this.categoryService.updateCategory(cat).subscribe(() => {
      this.loadCategories();
    });
  }
}