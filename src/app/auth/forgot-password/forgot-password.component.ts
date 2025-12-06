import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  resetToken = signal<string | null>(null);
  emailSent = signal(false);
  isHovered = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.forgotForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  async onSubmit() {
    if (this.forgotForm.invalid) {
      Object.keys(this.forgotForm.controls).forEach(key => {
        this.forgotForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      const result = await this.authService.requestPasswordReset(this.forgotForm.value.email);
      
      if (result.success) {
        this.emailSent.set(true);
        this.successMessage.set(result.message);
        
        // For demo purposes, show the reset token link
        if (result.token) {
          this.resetToken.set(result.token);
        }
      } else {
        this.errorMessage.set(result.message);
      }
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Failed to process request. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  navigateToReset() {
    const token = this.resetToken();
    if (token) {
      this.router.navigate(['/auth/reset-password'], { queryParams: { token } });
    }
  }
}

