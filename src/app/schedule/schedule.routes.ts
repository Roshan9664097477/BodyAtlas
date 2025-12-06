import { Routes } from '@angular/router';

export const scheduleRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./week-planner/week-planner.component').then(m => m.WeekPlannerComponent)
  }
];

