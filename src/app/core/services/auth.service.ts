import { Injectable, signal, computed, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { User, AuthResponse, LoginCredentials, SignupData } from '../../shared/models/user.model';
import { environment } from '../../../environments/environment';

// Declare google global for TypeScript
declare const google: any;

export interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  sub: string; // Google user ID
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSignal = signal<User | null>(null);
  private tokenSignal = signal<string | null>(null);
  
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.tokenSignal());
  readonly token = this.tokenSignal.asReadonly();
  
  private readonly STORAGE_KEY = 'fitness_auth';
  private readonly USERS_KEY = 'fitness_users';
  private googleInitialized = false;

  constructor(private router: Router, private ngZone: NgZone) {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const { user, token } = JSON.parse(stored);
        this.currentUserSignal.set(user);
        this.tokenSignal.set(token);
      } catch {
        this.clearStorage();
      }
    }
  }

  private saveToStorage(user: User, token: string): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify({ user, token }));
  }

  private clearStorage(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private getUsers(): Map<string, { user: User; password: string; isGoogleUser?: boolean }> {
    const stored = localStorage.getItem(this.USERS_KEY);
    if (stored) {
      const arr = JSON.parse(stored);
      return new Map(arr);
    }
    return new Map();
  }

  private saveUsers(users: Map<string, { user: User; password: string; isGoogleUser?: boolean }>): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify([...users]));
  }

  private generateToken(): string {
    return 'token_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private generateId(): string {
    return 'user_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Initialize Google Sign-In
  initializeGoogleSignIn(buttonId: string, callback: (response: any) => void): void {
    // Wait for Google script to load
    const checkGoogle = setInterval(() => {
      if (typeof google !== 'undefined' && google.accounts) {
        clearInterval(checkGoogle);
        this.setupGoogleSignIn(buttonId, callback);
      }
    }, 100);

    // Timeout after 10 seconds
    setTimeout(() => clearInterval(checkGoogle), 10000);
  }

  private setupGoogleSignIn(buttonId: string, callback: (response: any) => void): void {
    if (environment.googleClientId === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
      console.warn('Google Client ID not configured. Please add your Client ID in environment.ts');
      return;
    }

    try {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response: any) => {
          this.ngZone.run(() => callback(response));
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Render the Google Sign-In button
      const buttonElement = document.getElementById(buttonId);
      if (buttonElement) {
        google.accounts.id.renderButton(buttonElement, {
          type: 'standard',
          theme: 'filled_black',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width: buttonElement.offsetWidth,
        });
      }

      this.googleInitialized = true;
    } catch (error) {
      console.error('Error initializing Google Sign-In:', error);
    }
  }

  // Trigger Google One Tap
  promptGoogleOneTap(callback: (response: any) => void): void {
    if (typeof google === 'undefined' || !google.accounts) {
      console.warn('Google Sign-In not loaded');
      return;
    }

    if (environment.googleClientId === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
      console.warn('Google Client ID not configured');
      return;
    }

    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: any) => {
        this.ngZone.run(() => callback(response));
      },
    });

    google.accounts.id.prompt();
  }

  // Decode JWT token from Google
  decodeGoogleToken(token: string): GoogleUser | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding Google token:', error);
      return null;
    }
  }

  // Handle Google Sign-In response
  async handleGoogleSignIn(response: any): Promise<AuthResponse> {
    const googleUser = this.decodeGoogleToken(response.credential);
    
    if (!googleUser) {
      throw new Error('Failed to decode Google credentials');
    }

    const users = this.getUsers();
    let userData = users.get(googleUser.email);

    if (userData) {
      // Existing user - log them in
      const token = this.generateToken();
      this.currentUserSignal.set(userData.user);
      this.tokenSignal.set(token);
      this.saveToStorage(userData.user, token);
      return { user: userData.user, token };
    } else {
      // New user - create account
      const user: User = {
        id: 'google_' + googleUser.sub,
        name: googleUser.name,
        email: googleUser.email,
        age: 0, // Google doesn't provide age
        avatar: googleUser.picture,
        createdAt: new Date()
      };

      // Save as Google user (no password needed)
      users.set(googleUser.email, { 
        user, 
        password: '', 
        isGoogleUser: true 
      });
      this.saveUsers(users);

      const token = this.generateToken();
      this.currentUserSignal.set(user);
      this.tokenSignal.set(token);
      this.saveToStorage(user, token);

      return { user, token };
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const users = this.getUsers();
    const userData = users.get(credentials.email);
    
    if (!userData) {
      throw new Error('User not found. Please sign up first.');
    }

    // Check if this is a Google-only account
    if (userData.isGoogleUser && !userData.password) {
      throw new Error('This account uses Google Sign-In. Please use "Login with Google" button.');
    }
    
    if (userData.password !== credentials.password) {
      throw new Error('Invalid password. Please try again.');
    }
    
    const token = this.generateToken();
    this.currentUserSignal.set(userData.user);
    this.tokenSignal.set(token);
    this.saveToStorage(userData.user, token);
    
    return { user: userData.user, token };
  }

  async signup(data: SignupData): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const users = this.getUsers();
    
    if (users.has(data.email)) {
      const existingUser = users.get(data.email);
      if (existingUser?.isGoogleUser) {
        throw new Error('An account with this email already exists via Google. Please use Google Sign-In.');
      }
      throw new Error('An account with this email already exists.');
    }
    
    const user: User = {
      id: this.generateId(),
      name: data.name,
      email: data.email,
      age: data.age,
      createdAt: new Date()
    };
    
    users.set(data.email, { user, password: data.password });
    this.saveUsers(users);
    
    const token = this.generateToken();
    this.currentUserSignal.set(user);
    this.tokenSignal.set(token);
    this.saveToStorage(user, token);
    
    return { user, token };
  }

  logout(): void {
    this.currentUserSignal.set(null);
    this.tokenSignal.set(null);
    this.clearStorage();
    
    // Also sign out from Google if available
    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.disableAutoSelect();
    }
    
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  // Check if Google Client ID is configured
  isGoogleConfigured(): boolean {
    return environment.googleClientId !== 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
  }

  // Password Reset Functionality
  private readonly RESET_TOKENS_KEY = 'fitness_reset_tokens';

  private getResetTokens(): Map<string, { email: string; token: string; expiresAt: number }> {
    const stored = localStorage.getItem(this.RESET_TOKENS_KEY);
    if (stored) {
      const arr = JSON.parse(stored);
      return new Map(arr);
    }
    return new Map();
  }

  private saveResetTokens(tokens: Map<string, { email: string; token: string; expiresAt: number }>): void {
    localStorage.setItem(this.RESET_TOKENS_KEY, JSON.stringify([...tokens]));
  }

  private generateResetToken(): string {
    return 'reset_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  async requestPasswordReset(email: string): Promise<{ success: boolean; token?: string; message: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const users = this.getUsers();
    const userData = users.get(email);

    if (!userData) {
      // For security, don't reveal if email exists or not
      return { 
        success: true, 
        message: 'If an account with this email exists, you will receive a password reset link.' 
      };
    }

    // Check if this is a Google-only account
    if (userData.isGoogleUser && !userData.password) {
      return { 
        success: false, 
        message: 'This account uses Google Sign-In. Please use Google to access your account.' 
      };
    }

    // Generate reset token (expires in 1 hour)
    const resetToken = this.generateResetToken();
    const expiresAt = Date.now() + (60 * 60 * 1000); // 1 hour

    const tokens = this.getResetTokens();
    tokens.set(resetToken, { email, token: resetToken, expiresAt });
    this.saveResetTokens(tokens);

    // In a real app, this would send an email
    // For demo purposes, we return the token
    console.log(`Password reset token for ${email}: ${resetToken}`);
    
    return { 
      success: true, 
      token: resetToken, // In production, this would not be returned
      message: 'Account verified! You can now reset your password.' 
    };
  }

  async validateResetToken(token: string): Promise<{ valid: boolean; email?: string }> {
    const tokens = this.getResetTokens();
    const tokenData = tokens.get(token);

    if (!tokenData) {
      return { valid: false };
    }

    if (Date.now() > tokenData.expiresAt) {
      // Token expired, remove it
      tokens.delete(token);
      this.saveResetTokens(tokens);
      return { valid: false };
    }

    return { valid: true, email: tokenData.email };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const validation = await this.validateResetToken(token);
    
    if (!validation.valid || !validation.email) {
      return { 
        success: false, 
        message: 'Invalid or expired reset link. Please request a new password reset.' 
      };
    }

    const users = this.getUsers();
    const userData = users.get(validation.email);

    if (!userData) {
      return { 
        success: false, 
        message: 'User account not found.' 
      };
    }

    // Update password
    userData.password = newPassword;
    users.set(validation.email, userData);
    this.saveUsers(users);

    // Remove used token
    const tokens = this.getResetTokens();
    tokens.delete(token);
    this.saveResetTokens(tokens);

    return { 
      success: true, 
      message: 'Your password has been successfully reset. You can now login with your new password.' 
    };
  }
}
