import { Injectable } from '@angular/core';
import { AppEvent } from '../interfaces/event';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EventApi {
  private apiUrl = 'http://localhost:3000/events';

  constructor(private http: HttpClient) {}
  
  // CRUD operations
  //get all events
  getEvents(): Observable<AppEvent[]> {
    return this.http.get<AppEvent[]>(this.apiUrl);
  }
  //add new event
  addEvent(event: AppEvent): Observable<AppEvent> {
    return this.http.post<AppEvent>(this.apiUrl, event);
  }

  // UPDATE event
  updateEvent(id: number, event: AppEvent): Observable<AppEvent> {
    return this.http.put<AppEvent>(`${this.apiUrl}/${id}`, event);
  }
  
//delete event by id
  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
