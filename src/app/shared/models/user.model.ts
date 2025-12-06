export interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  avatar?: string; // Google profile picture URL
  createdAt: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  age: number;
  email: string;
  password: string;
}

