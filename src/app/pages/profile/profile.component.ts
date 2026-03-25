import { Component, OnInit, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  public authService = inject(AuthService);
  
  user = signal<any>(null);
  regStatus = signal('');
  regError = signal(false);

  ngOnInit() {
    this.user.set(this.authService.getCurrentUser());
  }

  async registerBiometrics() {
    this.regStatus.set('Solicitando huella...');
    this.regError.set(false);
    try {
      if (this.authService.registerBiometric) {
        await this.authService.registerBiometric();
        this.regStatus.set('¡Huella dactilar guardada correctamente!');
      } else {
        this.regStatus.set('Función biométrica no configurada aún.');
      }
    } catch (err: any) {
      this.regError.set(true);
      this.regStatus.set('Error al escanear: ' + (err.message || 'Inténtalo de nuevo'));
    }
  }
}
