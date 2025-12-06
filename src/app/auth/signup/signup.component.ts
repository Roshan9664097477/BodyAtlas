import { Component, signal, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

interface RoutePoint {
  x: number;
  y: number;
  delay: number;
}

interface Route {
  start: RoutePoint;
  end: RoutePoint;
  color: string;
}

interface Dot {
  x: number;
  y: number;
  radius: number;
  opacity: number;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  signupForm: FormGroup;
  loading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  focusedField = signal('');
  isHovered = signal(false);
  googleLoading = signal(false);
  isGoogleConfigured = signal(false);

  private animationFrameId: number | null = null;
  private startTime = Date.now();
  private dots: Dot[] = [];
  private routes: Route[] = [
    { start: { x: 80, y: 120, delay: 0 }, end: { x: 180, y: 60, delay: 2 }, color: '#8b5cf6' },
    { start: { x: 180, y: 60, delay: 2 }, end: { x: 240, y: 100, delay: 4 }, color: '#8b5cf6' },
    { start: { x: 40, y: 40, delay: 1 }, end: { x: 130, y: 150, delay: 3 }, color: '#8b5cf6' },
    { start: { x: 260, y: 50, delay: 0.5 }, end: { x: 160, y: 160, delay: 2.5 }, color: '#8b5cf6' },
    { start: { x: 120, y: 180, delay: 1.5 }, end: { x: 220, y: 140, delay: 3.5 }, color: '#6366f1' },
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required]],
      age: ['', [Validators.required, Validators.min(13), Validators.max(120)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
    
    this.isGoogleConfigured.set(this.authService.isGoogleConfigured());
  }

  ngAfterViewInit() {
    this.initCanvas();
    this.initGoogleSignIn();
  }

  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private initGoogleSignIn() {
    // Initialize Google Sign-In with custom button handling
    this.authService.initializeGoogleSignIn('google-signup-btn', (response) => {
      this.handleGoogleCallback(response);
    });
  }

  private async handleGoogleCallback(response: any) {
    this.googleLoading.set(true);
    this.errorMessage.set('');

    try {
      await this.authService.handleGoogleSignIn(response);
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Google sign-up failed. Please try again.');
    } finally {
      this.googleLoading.set(false);
    }
  }

  signUpWithGoogle() {
    if (!this.authService.isGoogleConfigured()) {
      this.errorMessage.set('Google Sign-In is not configured. Please add your Google Client ID in environment.ts');
      return;
    }

    // Trigger Google One Tap or redirect
    this.authService.promptGoogleOneTap((response) => {
      this.handleGoogleCallback(response);
    });
  }

  private initCanvas() {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      canvas.width = width;
      canvas.height = height;
      this.dots = this.generateDots(width, height);
      this.startAnimation();
    });

    resizeObserver.observe(parent);
  }

  private generateDots(width: number, height: number): Dot[] {
    const dots: Dot[] = [];
    const gap = 14;
    const dotRadius = 1.2;

    for (let x = 0; x < width; x += gap) {
      for (let y = 0; y < height; y += gap) {
        // Create a fitness-themed pattern (dumbbell/body shape)
        const centerX = width / 2;
        const centerY = height / 2;
        const distFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        
        // Create circular patterns and connecting lines
        const isInPattern =
          // Main circle (body)
          (distFromCenter < height * 0.25 && distFromCenter > height * 0.15) ||
          // Top circle (head)
          (Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - (centerY - height * 0.25), 2)) < height * 0.1) ||
          // Left arm
          ((x < centerX - width * 0.1 && x > centerX - width * 0.3) && 
           (y < centerY + height * 0.05 && y > centerY - height * 0.05)) ||
          // Right arm
          ((x > centerX + width * 0.1 && x < centerX + width * 0.3) && 
           (y < centerY + height * 0.05 && y > centerY - height * 0.05)) ||
          // Left weight
          (Math.sqrt(Math.pow(x - (centerX - width * 0.3), 2) + Math.pow(y - centerY, 2)) < height * 0.08) ||
          // Right weight
          (Math.sqrt(Math.pow(x - (centerX + width * 0.3), 2) + Math.pow(y - centerY, 2)) < height * 0.08) ||
          // Scattered background dots
          (Math.random() > 0.92);

        if (isInPattern) {
          dots.push({
            x,
            y,
            radius: dotRadius,
            opacity: Math.random() * 0.4 + 0.15,
          });
        }
      }
    }
    return dots;
  }

  private startAnimation() {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.startTime = Date.now();

    const animate = () => {
      this.drawDots(ctx, canvas.width, canvas.height);
      this.drawRoutes(ctx);

      // Reset animation after 15 seconds
      const currentTime = (Date.now() - this.startTime) / 1000;
      if (currentTime > 15) {
        this.startTime = Date.now();
      }

      this.animationFrameId = requestAnimationFrame(animate);
    };

    animate();
  }

  private drawDots(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.clearRect(0, 0, width, height);

    this.dots.forEach(dot => {
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${dot.opacity})`;
      ctx.fill();
    });
  }

  private drawRoutes(ctx: CanvasRenderingContext2D) {
    const currentTime = (Date.now() - this.startTime) / 1000;

    this.routes.forEach(route => {
      const elapsed = currentTime - route.start.delay;
      if (elapsed <= 0) return;

      const duration = 3;
      const progress = Math.min(elapsed / duration, 1);

      const x = route.start.x + (route.end.x - route.start.x) * progress;
      const y = route.start.y + (route.end.y - route.start.y) * progress;

      // Draw the route line
      ctx.beginPath();
      ctx.moveTo(route.start.x, route.start.y);
      ctx.lineTo(x, y);
      ctx.strokeStyle = route.color;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw start point
      ctx.beginPath();
      ctx.arc(route.start.x, route.start.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = route.color;
      ctx.fill();

      // Draw moving point
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#a78bfa';
      ctx.fill();

      // Glow effect
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(167, 139, 250, 0.3)';
      ctx.fill();

      // End point when complete
      if (progress === 1) {
        ctx.beginPath();
        ctx.arc(route.end.x, route.end.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = route.color;
        ctx.fill();
      }
    });
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
    const control = this.signupForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  async onSubmit() {
    if (this.signupForm.invalid) {
      Object.keys(this.signupForm.controls).forEach(key => {
        this.signupForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const { confirmPassword, ...signupData } = this.signupForm.value;
      await this.authService.signup(signupData);
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Signup failed. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }
}
