import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Fighter } from '../models/fighter.model';

@Injectable({
  providedIn: 'root'
})
export class FightersService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/fighters';

  getFighters(params?: { page?: number; limit?: number; weight_class?: string; search?: string }) {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.limit) httpParams = httpParams.set('limit', params.limit);
    if (params?.weight_class) httpParams = httpParams.set('weight_class', params.weight_class);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    return this.http.get<{ data: Fighter[]; total: number }>(this.apiUrl, { params: httpParams });
  }

  getFighterById(id: string) {
    return this.http.get<Fighter>(`${this.apiUrl}/${id}`);
  }

  createFighter(fighter: Partial<Fighter>) {
    return this.http.post<Fighter>(this.apiUrl, fighter);
  }

  updateFighter(id: string, fighter: Partial<Fighter>) {
    return this.http.put<Fighter>(`${this.apiUrl}/${id}`, fighter);
  }

  deleteFighter(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
