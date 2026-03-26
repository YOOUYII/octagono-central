import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Prediction } from '../models/prediction.model';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PredictionsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/predictions`;

  getMyPredictions(eventId?: string) {
    let params = new HttpParams();
    if (eventId) params = params.set('event_id', eventId);
    return this.http.get<Prediction[]>(`${this.apiUrl}/my-picks`, { params });
  }

  makePrediction(prediction: Partial<Prediction>) {
    return this.http.post<{ message: string, data: Prediction }>(`${this.apiUrl}/predict`, prediction);
  }

  getGlobalRanking() {
    return this.http.get<User[]>(`${this.apiUrl}/ranking`);
  }
}
