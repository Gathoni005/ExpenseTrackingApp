import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {IonContent, IonHeader, IonTitle, IonToolbar,IonList, IonItem, IonLabel, IonInput, IonButton, IonSelect, IonSelectOption} from '@ionic/angular/standalone';
import { AppEvent, category } from '../../interfaces/event';
import { Router } from '@angular/router';
import { EventApi } from 'src/app/services/event-api';
import { Category } from 'src/app/services/category';

@Component({
  selector: 'app-event-registration',
  templateUrl: './event-registration.page.html',
  styleUrls: ['./event-registration.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar,IonList, IonItem, IonLabel, IonInput,IonButton,IonSelect, IonSelectOption,CommonModule, FormsModule]})

  export class EventRegistrationPage implements OnInit {

  newEvent: AppEvent = {
    categoryId: 0,
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

  constructor(private eventApi: EventApi, private router: Router,private categoryService: Category) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe((categories) => {
      this.categories = categories;
      console.log('Categories loaded:', this.categories);
    }, (error) => {
      console.error('Failed to load categories:', error);
    });
  }

  submitEvent() {
    console.log('Current event:', this.newEvent);
    console.log('Categories:', this.categories);

    if (this.newEvent.cost > 0 && this.newEvent.categoryId! > 0 && this.newEvent.description && this.newEvent.serviceProvider && this.newEvent.serviceProviderDetails) {
      this.eventApi.addEvent(this.newEvent).subscribe(() => {
        this.resetForm();
        this.router.navigate(['/event-list']);
      });
    } else {
      console.log('Validation failed - check all fields are filled');
    }
  }

  createAndUseCategory() {
    console.log('Creating category...', this.newCategoryName);

    if (this.newCategoryName.trim()) {
      const newCat: category = {
        categoryName: this.newCategoryName.trim().toLowerCase(),
        categoryDescription: this.newCategoryDescription,
        id: 0
      };

      console.log('Sending category:', newCat);

      this.categoryService.addCategory(newCat).subscribe(
        (createdCat) => {
          console.log('✅ Category created successfully:', createdCat);
          this.categories.push(createdCat);
          this.newEvent.categoryId = createdCat.id;
          this.newCategoryName = '';
          this.newCategoryDescription = '';
          this.showNewCategoryForm = false;
          alert(`✅ Category "${createdCat.categoryName}" created!`);
        },
        (error) => {
          console.error('❌ Failed to create category:', error);
          alert('Error creating category. Check console.');
        }
      );
    } else {
      console.warn('Category name is empty');
      alert('Please enter a category name');
    }
  }

  resetForm() {
    this.newEvent = {
      categoryId: 0,
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