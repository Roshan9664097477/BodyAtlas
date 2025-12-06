import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'exercises',
    canActivate: [authGuard],
    loadChildren: () => import('./exercises/exercises.routes').then(m => m.exercisesRoutes)
  },
  {
    path: 'schedule',
    canActivate: [authGuard],
    loadChildren: () => import('./schedule/schedule.routes').then(m => m.scheduleRoutes)
  },
  {
    path: 'chatbot',
    canActivate: [authGuard],
    loadChildren: () => import('./chatbot/chatbot.routes').then(m => m.chatbotRoutes)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
