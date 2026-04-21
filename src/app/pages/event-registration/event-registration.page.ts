import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Event } from '../../interfaces/event';

@Component({
  selector: 'app-event-registration',
  templateUrl: './event-registration.page.html',
  styleUrls: ['./event-registration.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class EventRegistrationPage implements OnInit {
  newEvent:Event = {
     cost: 70,
     category:'transportation',
     description:'office to roasters.carried by dan for ksh.70'
  }

  constructor() { }

  ngOnInit() {
  }

}
