import { Routes } from '@angular/router';

export const chatbotRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./chat/chat.component').then(m => m.ChatComponent)
  }
];

