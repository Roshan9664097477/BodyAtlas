import { Routes } from '@angular/router';

export const exercisesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/exercise-list.component').then(m => m.ExerciseListComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./detail/exercise-detail.component').then(m => m.ExerciseDetailComponent)
  }
];

