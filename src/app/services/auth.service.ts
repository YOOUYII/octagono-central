import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';

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

  verifyOtp(email: string, code: string) {
    return this.http.post<any>(`${this.apiUrl}/login/verify-otp`, { email, code }).pipe(
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

  // --- BIOMETRÍA (Fase 8: Robusta) ---
  private base64UrlToBuffer(base64url: any): ArrayBuffer {
    if (typeof base64url !== 'string') {
        if (base64url && base64url.data) return new Uint8Array(base64url.data).buffer;
        return new ArrayBuffer(0);
    }
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64);
    const buffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) buffer[i] = binary.charCodeAt(i);
    return buffer.buffer;
  }

  private bufferToBase64Url(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  async registerBiometric(): Promise<any> {
    const options: any = await this.http.get(`${this.apiUrl}/biometric/register-challenge`).toPromise();
    const publicKey: PublicKeyCredentialCreationOptions = {
      ...options,
      challenge: this.base64UrlToBuffer(options.challenge),
      user: { ...options.user, id: this.base64UrlToBuffer(options.user.id) },
      excludeCredentials: (options.excludeCredentials || []).map((c: any) => ({ ...c, id: this.base64UrlToBuffer(c.id) }))
    };
    const credential = await navigator.credentials.create({ publicKey }) as PublicKeyCredential;
    const response = credential.response as AuthenticatorAttestationResponse;
    const body = {
      id: credential.id,
      rawId: this.bufferToBase64Url(credential.rawId),
      type: credential.type,
      response: {
        clientDataJSON: this.bufferToBase64Url(response.clientDataJSON),
        attestationObject: this.bufferToBase64Url(response.attestationObject),
      },
    };
    return this.http.post(`${this.apiUrl}/biometric/register`, body).toPromise();
  }

  async loginWithBiometric(): Promise<any> {
    const options: any = await this.http.get(`${this.apiUrl}/biometric/login-challenge`).toPromise();
    const publicKey: PublicKeyCredentialRequestOptions = {
      ...options,
      challenge: this.base64UrlToBuffer(options.challenge),
      allowCredentials: (options.allowCredentials || []).map((c: any) => ({ ...c, id: this.base64UrlToBuffer(c.id) }))
    };
    const assertion = await navigator.credentials.get({ publicKey }) as PublicKeyCredential;
    const assertResponse = assertion.response as AuthenticatorAssertionResponse;
    const body = {
      id: assertion.id,
      rawId: this.bufferToBase64Url(assertion.rawId),
      type: assertion.type,
      response: {
        clientDataJSON: this.bufferToBase64Url(assertResponse.clientDataJSON),
        authenticatorData: this.bufferToBase64Url(assertResponse.authenticatorData),
        signature: this.bufferToBase64Url(assertResponse.signature),
        userHandle: assertResponse.userHandle ? this.bufferToBase64Url(assertResponse.userHandle) : null,
      },
    };
    const res: any = await this.http.post(`${this.apiUrl}/biometric/login`, body).toPromise();
    if (res?.token) {
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
    }
    return res;
  }
}
