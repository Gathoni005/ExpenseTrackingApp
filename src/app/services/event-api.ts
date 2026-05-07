import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppEvent, EntityId } from '../interfaces/event';

@Injectable({
  providedIn: 'root'
})
export class EventApi {
  // JSON server endpoint for events.
  private apiUrl = 'http://localhost:3000/events';

  constructor(private http: HttpClient) {}

  getEvents(): Observable<AppEvent[]> {
    return this.http.get<AppEvent[]>(this.apiUrl);
  }

  addEvent(event: AppEvent): Observable<AppEvent> {
    return this.http.post<AppEvent>(this.apiUrl, event);
  }

  updateEvent(id: EntityId, event: AppEvent): Observable<AppEvent> {
    return this.http.put<AppEvent>(`${this.apiUrl}/${id}`, event);
  }

  deleteEvent(id: EntityId): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
