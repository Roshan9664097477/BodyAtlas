import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { ScheduleService } from '../core/services/schedule.service';
import { ExerciseService } from '../core/services/exercise.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  scheduleService = inject(ScheduleService);
  exerciseService = inject(ExerciseService);

  ngOnInit() {
    this.exerciseService.loadExercises();
    this.scheduleService.refreshSchedule();
  }

  getFirstName(): string {
    return this.authService.currentUser()?.name?.split(' ')[0] || 'Athlete';
  }

  getTodayLabel(): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  }

  getTodaySchedule() {
    return this.scheduleService.getTodaySchedule();
  }

  getTodayExercises() {
    return this.getTodaySchedule()?.exercises || [];
  }

  getTodayExerciseCount(): number {
    return this.getTodayExercises().length;
  }

  isTodayRestDay(): boolean {
    return this.getTodaySchedule()?.restDay || false;
  }
}
