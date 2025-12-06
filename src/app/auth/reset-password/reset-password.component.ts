import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  loading = signal(false);
  validating = signal(true);
  errorMessage = signal('');
  successMessage = signal('');
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  isHovered = signal(false);
  tokenValid = signal(false);
  resetComplete = signal(false);
  userEmail = signal('');
  
  private token: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.token = this.route.snapshot.queryParams['token'] || '';
    this.validateToken();
  }

  private async validateToken() {
    if (!this.token) {
      this.validating.set(false);
      this.tokenValid.set(false);
      this.errorMessage.set('No reset token provided. Please request a new password reset link.');
      return;
    }

    try {
      const result = await this.authService.validateResetToken(this.token);
      this.validating.set(false);
      
      if (result.valid) {
        this.tokenValid.set(true);
        this.userEmail.set(result.email || '');
      } else {
        this.tokenValid.set(false);
        this.errorMessage.set('Invalid or expired reset link. Please request a new password reset.');
      }
    } catch (error) {
      this.validating.set(false);
      this.tokenValid.set(false);
      this.errorMessage.set('Failed to validate reset link. Please try again.');
    }
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  isFieldInvalid(field: string): boolean {
    const control = this.resetForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  async onSubmit() {
    if (this.resetForm.invalid) {
      Object.keys(this.resetForm.controls).forEach(key => {
        this.resetForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const result = await this.authService.resetPassword(this.token, this.resetForm.value.password);
      
      if (result.success) {
        this.resetComplete.set(true);
        this.successMessage.set(result.message);
      } else {
        this.errorMessage.set(result.message);
      }
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Failed to reset password. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  navigateToLogin() {
    this.router.navigate(['/auth/login']);
  }
}

