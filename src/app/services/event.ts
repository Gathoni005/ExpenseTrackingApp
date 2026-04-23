import { Injectable } from '@angular/core';
import { AppEvent } from '../interfaces/event';

@Injectable({
  providedIn: 'root',
})
export class EventService {

  private events: AppEvent[] = [];

  getEvents(): AppEvent[] {
    return this.events;
  }

  addEvent(event: AppEvent) {
    this.events.push(event);
  }
}