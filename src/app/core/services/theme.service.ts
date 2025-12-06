import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'fitpro-theme';
  
  // true = dark theme (default), false = light theme
  isDarkTheme = signal(true);

  constructor() {
    // Load saved theme preference
    const savedTheme = localStorage.getItem(this.STORAGE_KEY);
    if (savedTheme) {
      this.isDarkTheme.set(savedTheme === 'dark');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDarkTheme.set(prefersDark);
    }

    // Apply theme on changes
    effect(() => {
      this.applyTheme(this.isDarkTheme());
    });

    // Initial apply
    this.applyTheme(this.isDarkTheme());
  }

  toggleTheme(): void {
    this.isDarkTheme.set(!this.isDarkTheme());
    localStorage.setItem(this.STORAGE_KEY, this.isDarkTheme() ? 'dark' : 'light');
  }

  setTheme(isDark: boolean): void {
    this.isDarkTheme.set(isDark);
    localStorage.setItem(this.STORAGE_KEY, isDark ? 'dark' : 'light');
  }

  private applyTheme(isDark: boolean): void {
    const body = document.body;
    const html = document.documentElement;

    if (isDark) {
      body.classList.remove('light-theme');
      body.classList.add('dark-theme');
      html.classList.remove('light-theme');
      html.classList.add('dark-theme');
    } else {
      body.classList.remove('dark-theme');
      body.classList.add('light-theme');
      html.classList.remove('dark-theme');
      html.classList.add('light-theme');
    }
  }
}

