import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar,IonList,IonItem,IonLabel } from '@ionic/angular/standalone';
import { EventService } from 'src/app/services/event';
import { AppEvent } from 'src/app/interfaces/event';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.page.html',
  styleUrls: ['./event-list.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, CommonModule, FormsModule]
})
export class EventListPage implements OnInit {

      events: AppEvent[] = [];
      age: number = 0;

      constructor(private eventService: EventService) { }

  ngOnInit() {
     this.events = this.eventService.getEvents();
  }
}

