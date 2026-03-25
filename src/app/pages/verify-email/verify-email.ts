import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './verify-email.html',
  styleUrls: ['./verify-email.css']
})
export class VerifyEmail implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  status = signal<'loading' | 'success' | 'error'>('loading');
  message = signal('Verificando tu correo electrónico...');

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (!token) {
        this.status.set('error');
        this.message.set('No se proporcionó un token de verificación.');
        return;
      }

      this.authService.verifyEmail(token).subscribe({
        next: (res) => {
          this.status.set('success');
          this.message.set(res.message || 'Correo verificado con éxito. Ya puedes iniciar sesión.');
        },
        error: (err) => {
          this.status.set('error');
          this.message.set(err.error?.error || 'El enlace de verificación es inválido o ha expirado.');
        }
      });
    });
  }
}
