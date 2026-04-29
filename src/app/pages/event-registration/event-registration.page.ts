import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {IonContent, IonHeader, IonTitle, IonToolbar,IonList, IonItem, IonLabel, IonInput, IonButton,IonSelect, IonSelectOption} from '@ionic/angular/standalone';
import { AppEvent } from '../../interfaces/event';
import { Router } from '@angular/router';
import { EventApi } from 'src/app/services/event-api';

@Component({
  selector: 'app-event-registration',
  templateUrl: './event-registration.page.html',
  styleUrls: ['./event-registration.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar,IonList, IonItem, IonLabel, IonInput,IonSelect, IonSelectOption, IonButton,CommonModule, FormsModule]})

  export class EventRegistrationPage implements OnInit {

  newEvent: AppEvent = {
    category: 'transportation',
    description: 'office to roasters',
    serviceProvider: 'dan',
    serviceProviderDetails: '0700000000',
    cost: 70,
    date: new Date()
  };

  constructor(private eventApi: EventApi, private router: Router) {}

  ngOnInit() {}

  submitEvent() {
    if (this.newEvent.cost && this.newEvent.category && this.newEvent.description && this.newEvent.serviceProvider && this.newEvent.serviceProviderDetails  ) {
      // Add event to service
      this.eventApi.addEvent(this.newEvent).subscribe(() => {
        console.log('Event submitted:', this.newEvent);
      });

      this.newEvent = {
        cost: 0,
        category: '',
        description: '',
        serviceProvider: '',
        serviceProviderDetails: '',
        date: new Date()
      };
      this.router.navigate(['/event-list']);
    }
  }
}