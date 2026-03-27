import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, ButtonModule, InputTextModule, MessageModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  otpForm: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.pattern('^[0-9]{4}$')]]
  });

  step = signal<'credentials' | 'otp'>('credentials');
  loading = signal(false);
  errorMessage = signal('');
  emailNotVerified = signal(false);

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading.set(true);
      this.errorMessage.set('');
      this.emailNotVerified.set(false);
      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe({
        next: (res) => {
          this.loading.set(false);
          if (res.requireOtp) {
            this.step.set('otp');
          } else {
            this.router.navigate(['/']);
          }
        },
        error: (err) => {
          this.loading.set(false);
          const msg: string = err.error?.error || '';
          if (msg.toLowerCase().includes('inactiva') || msg.toLowerCase().includes('verifica')) {
            this.emailNotVerified.set(true);
            this.errorMessage.set('');
          } else {
            this.errorMessage.set(msg || 'Correo o contraseña incorrectos');
          }
        }
      });
    }
  }

  onOtpSubmit() {
    if (this.otpForm.valid) {
      this.loading.set(true);
      this.errorMessage.set('');
      const email = this.loginForm.value.email;
      const code = this.otpForm.value.code;

      this.authService.verifyOtp(email, code).subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(err.error?.error || 'Código incorrecto o expirado');
        }
      });
    }
  }

  async loginWithBiometric() {
    this.errorMessage.set('');
    this.emailNotVerified.set(false);
    try {
      this.loading.set(true);
      await this.authService.loginWithBiometric();
      this.loading.set(false);
      this.router.navigate(['/']);
    } catch (err: any) {
      this.errorMessage.set(err.error?.error || 'Falló la autenticación biométrica');
      this.loading.set(false);
    }
  }
}
