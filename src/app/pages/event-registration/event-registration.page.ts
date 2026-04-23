import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {IonContent, IonHeader, IonTitle, IonToolbar,IonList, IonItem, IonLabel, IonInput, IonButton} from '@ionic/angular/standalone';
import { AppEvent } from '../../interfaces/event';
import { EventService } from 'src/app/services/event';
import { Router } from '@angular/router';

@Component({
  selector: 'app-event-registration',
  templateUrl: './event-registration.page.html',
  styleUrls: ['./event-registration.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar,IonList, IonItem, IonLabel, IonInput, IonButton,CommonModule, FormsModule]})

  export class EventRegistrationPage implements OnInit {

  newEvent: AppEvent = {
    cost: 70,
    category: 'transportation',
    description: 'office to roasters. carried by dan for ksh.70',
    date: new Date()
  };

  constructor(private eventService: EventService, private router: Router) {}

  ngOnInit() {}

  submitEvent() {
    if (this.newEvent.cost && this.newEvent.category && this.newEvent.description) {
      // Add event to service
      this.eventService.addEvent(this.newEvent);
      
      console.log('Event submitted:', this.newEvent);

      this.newEvent = {
        cost: 0,
        category: '',
        description: '',
        date: new Date()
      };
      this.router.navigate(['/event-list']);
    }
  }
}