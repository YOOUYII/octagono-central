import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`; // Gateway URL

  register(data: any) {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  verifyEmail(token: string) {
    return this.http.get<{ message: string }>(`${this.apiUrl}/verify-email?token=${token}`);
  }

  login(email: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(res => {
        if (res.token) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // --- BIOMETRÍA (Usando @simplewebauthn/browser para máxima compatibilidad) ---

  async registerBiometric(): Promise<any> {
    // 1. Obtener opciones del servidor
    const options: any = await this.http.get(`${this.apiUrl}/biometric/register-challenge`).toPromise();

    // 2. Iniciar registro en el navegador (La librería maneja las conversiones de Buffer/Base64 automáticamente)
    const attResponse = await startRegistration({ optionsJSON: options });

    // 3. Enviar respuesta al servidor para verificación
    return this.http.post(`${this.apiUrl}/biometric/register`, attResponse).toPromise();
  }

  async loginWithBiometric(): Promise<any> {
    // 1. Obtener opciones de login del servidor
    const options: any = await this.http.get(`${this.apiUrl}/biometric/login-challenge`).toPromise();

    // 2. Iniciar autenticación en el navegador
    const asseResponse = await startAuthentication({ optionsJSON: options });

    // 3. Enviar aserción al servidor
    const res: any = await this.http.post(`${this.apiUrl}/biometric/login`, asseResponse).toPromise();
    
    if (res?.token) {
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
    }
    return res;
  }
}
