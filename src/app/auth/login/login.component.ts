import { Component, signal, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  loginForm: FormGroup;
  loading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);
  focusedField = signal('');
  isHovered = signal(false);
  googleLoading = signal(false);
  isGoogleConfigured = signal(false);

  private animationFrameId: number | null = null;
  private startTime = Date.now();
  private dots: Dot[] = [];
  private routes: Route[] = [
    { start: { x: 100, y: 150, delay: 0 }, end: { x: 200, y: 80, delay: 2 }, color: '#3b82f6' },
    { start: { x: 200, y: 80, delay: 2 }, end: { x: 260, y: 120, delay: 4 }, color: '#3b82f6' },
    { start: { x: 50, y: 50, delay: 1 }, end: { x: 150, y: 180, delay: 3 }, color: '#3b82f6' },
    { start: { x: 280, y: 60, delay: 0.5 }, end: { x: 180, y: 180, delay: 2.5 }, color: '#3b82f6' },
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    
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
    this.authService.initializeGoogleSignIn('google-signin-btn', (response) => {
      this.handleGoogleCallback(response);
    });
  }

  private async handleGoogleCallback(response: any) {
    this.googleLoading.set(true);
    this.errorMessage.set('');

    try {
      await this.authService.handleGoogleSignIn(response);
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
      this.router.navigate([returnUrl]);
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Google sign-in failed. Please try again.');
    } finally {
      this.googleLoading.set(false);
    }
  }

  signInWithGoogle() {
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
    const gap = 12;
    const dotRadius = 1;

    for (let x = 0; x < width; x += gap) {
      for (let y = 0; y < height; y += gap) {
        // Create a world map silhouette pattern
        const isInMapShape =
          // North America
          ((x < width * 0.25 && x > width * 0.05) && (y < height * 0.4 && y > height * 0.1)) ||
          // South America
          ((x < width * 0.25 && x > width * 0.15) && (y < height * 0.8 && y > height * 0.4)) ||
          // Europe
          ((x < width * 0.45 && x > width * 0.3) && (y < height * 0.35 && y > height * 0.15)) ||
          // Africa
          ((x < width * 0.5 && x > width * 0.35) && (y < height * 0.65 && y > height * 0.35)) ||
          // Asia
          ((x < width * 0.7 && x > width * 0.45) && (y < height * 0.5 && y > height * 0.1)) ||
          // Australia
          ((x < width * 0.8 && x > width * 0.65) && (y < height * 0.8 && y > height * 0.6));

        if (isInMapShape && Math.random() > 0.3) {
          dots.push({
            x,
            y,
            radius: dotRadius,
            opacity: Math.random() * 0.5 + 0.1,
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
      ctx.fillStyle = '#60a5fa';
      ctx.fill();

      // Glow effect
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(96, 165, 250, 0.3)';
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

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    try {
      await this.authService.login(this.loginForm.value);
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
      this.router.navigate([returnUrl]);
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Login failed. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }
}
