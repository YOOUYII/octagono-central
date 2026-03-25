import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Event } from '../models/event.model';
import { Fight } from '../models/fight.model';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/events';

  getEvents(params?: { status?: string; page?: number; limit?: number }) {
    let httpParams = new HttpParams();
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.limit) httpParams = httpParams.set('limit', params.limit);
    return this.http.get<{ data: Event[]; total: number }>(this.apiUrl, { params: httpParams });
  }

  getEventById(id: string) {
    return this.http.get<Event & { fights: Fight[] }>(`${this.apiUrl}/${id}`);
  }

  createEvent(event: Partial<Event>) {
    return this.http.post<Event>(this.apiUrl, event);
  }

  updateEvent(id: string, event: Partial<Event>) {
    return this.http.put<Event>(`${this.apiUrl}/${id}`, event);
  }

  deleteEvent(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
