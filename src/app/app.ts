import { Component, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    @if (isAuthenticated()) {
      <app-navbar />
    }
    <main class="min-h-screen">
      <router-outlet />
    </main>
  `
})
export class App {
  private authService: AuthService;
  
  isAuthenticated = computed(() => this.authService.isAuthenticated());

  constructor(authService: AuthService) {
    this.authService = authService;
  }
}
