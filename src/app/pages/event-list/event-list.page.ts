import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar,IonList,IonItem,IonLabel, IonButton, IonInput } from '@ionic/angular/standalone';
import { AppEvent } from 'src/app/interfaces/event';
import { EventApi } from 'src/app/services/event-api';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.page.html',
  styleUrls: ['./event-list.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonButton, IonInput, CommonModule, FormsModule]
})
export class EventListPage implements OnInit {

  events: AppEvent[] = [];
   editingId: number | null = null;

  constructor(private eventApi: EventApi) {}

  ngOnInit() {
    this.loadEvents();
  }

  // Load events
  loadEvents() {
    this.eventApi.getEvents().subscribe(data => {
      this.events = data;
    });
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
}