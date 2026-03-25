import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';

export const passwordMatchValidator = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  
  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { passwordMismatch: true };
  }
  return null;
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, ButtonModule, InputTextModule, MessageModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordMatchValidator });

  loading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  onSubmit() {
    if (this.registerForm.valid) {
      this.loading.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');
      
      const { name, email, password } = this.registerForm.value;

      this.authService.register({ name, email, password }).subscribe({
        next: (res: any) => {
          this.loading.set(false);
          this.successMessage.set(res.message || 'Registro exitoso. Revisa tu correo.');
          this.registerForm.reset();
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(err.error?.error || 'Error al intentar registrar el usuario');
        }
      });
    }
  }
}
