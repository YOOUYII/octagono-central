import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: number;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/auth/admin';

  getUsers(): Observable<User[]> {
    const token = localStorage.getItem('token');
    return this.http.get<User[]>(`${this.apiUrl}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  changeStatus(id: string, status: number): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.patch(`${this.apiUrl}/users/${id}/status`, { status }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  changeRole(id: string, role: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.patch(`${this.apiUrl}/users/${id}/role`, { role }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  deleteUser(id: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.delete(`${this.apiUrl}/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}
