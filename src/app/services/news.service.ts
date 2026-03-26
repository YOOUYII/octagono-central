import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { News } from '../models/news.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/news`;

  getNews(params?: { category?: string; page?: number; limit?: number }) {
    let httpParams = new HttpParams();
    if (params?.category) httpParams = httpParams.set('category', params.category);
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.limit) httpParams = httpParams.set('limit', params.limit);
    
    return this.http.get<{ data: News[]; total: number }>(this.apiUrl, { params: httpParams });
  }

  getNewsById(id: string) {
    return this.http.get<News>(`${this.apiUrl}/${id}`);
  }

  toggleLike(id: string) {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/like`, {});
  }
}
