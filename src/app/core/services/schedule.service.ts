import { Injectable, signal, computed } from '@angular/core';
import { 
  WeeklySchedule, 
  DaySchedule, 
  ScheduledExercise, 
  DayOfWeek, 
  DAYS_OF_WEEK 
} from '../../shared/models/schedule.model';
import { Exercise } from '../../shared/models/exercise.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private scheduleSignal = signal<WeeklySchedule | null>(null);
  private readonly STORAGE_KEY = 'fitness_schedule';

  readonly schedule = this.scheduleSignal.asReadonly();
  
  readonly totalExercises = computed(() => {
    const schedule = this.scheduleSignal();
    if (!schedule) return 0;
    return schedule.week.reduce((sum, day) => sum + day.exercises.length, 0);
  });

  readonly totalWorkoutDays = computed(() => {
    const schedule = this.scheduleSignal();
    if (!schedule) return 0;
    return schedule.week.filter(day => !day.restDay && day.exercises.length > 0).length;
  });

  constructor(private authService: AuthService) {
    this.loadSchedule();
  }

  private generateId(): string {
    return 'sched_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private loadSchedule(): void {
    const userId = this.authService.currentUser()?.id || 'guest';
    const stored = localStorage.getItem(`${this.STORAGE_KEY}_${userId}`);
    
    if (stored) {
      try {
        const schedule = JSON.parse(stored);
        this.scheduleSignal.set(schedule);
      } catch {
        this.initializeEmptySchedule();
      }
    } else {
      this.initializeEmptySchedule();
    }
  }

  private initializeEmptySchedule(): void {
    const userId = this.authService.currentUser()?.id || 'guest';
    const schedule: WeeklySchedule = {
      id: this.generateId(),
      userId,
      week: DAYS_OF_WEEK.map(day => ({
        day,
        exercises: [],
        restDay: day === 'sunday'
      })),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.scheduleSignal.set(schedule);
  }

  private saveSchedule(): void {
    const schedule = this.scheduleSignal();
    if (!schedule) return;
    
    const userId = this.authService.currentUser()?.id || 'guest';
    schedule.updatedAt = new Date();
    localStorage.setItem(`${this.STORAGE_KEY}_${userId}`, JSON.stringify(schedule));
  }

  addExerciseToDay(day: DayOfWeek, exercise: Exercise, sets: number = 3, reps: number = 10): void {
    const schedule = this.scheduleSignal();
    if (!schedule) return;

    const dayIndex = schedule.week.findIndex(d => d.day === day);
    if (dayIndex === -1) return;

    // Check if exercise already exists for this day
    const existingExercise = schedule.week[dayIndex].exercises.find(
      e => e.exercise.id === exercise.id
    );
    if (existingExercise) return;

    const scheduledExercise: ScheduledExercise = {
      id: this.generateId(),
      exercise,
      sets,
      reps,
      completed: false
    };

    const updatedWeek = [...schedule.week];
    updatedWeek[dayIndex] = {
      ...updatedWeek[dayIndex],
      exercises: [...updatedWeek[dayIndex].exercises, scheduledExercise],
      restDay: false
    };

    this.scheduleSignal.set({
      ...schedule,
      week: updatedWeek,
      updatedAt: new Date()
    });
    this.saveSchedule();
  }

  removeExerciseFromDay(day: DayOfWeek, scheduledExerciseId: string): void {
    const schedule = this.scheduleSignal();
    if (!schedule) return;

    const dayIndex = schedule.week.findIndex(d => d.day === day);
    if (dayIndex === -1) return;

    const updatedWeek = [...schedule.week];
    updatedWeek[dayIndex] = {
      ...updatedWeek[dayIndex],
      exercises: updatedWeek[dayIndex].exercises.filter(e => e.id !== scheduledExerciseId)
    };

    this.scheduleSignal.set({
      ...schedule,
      week: updatedWeek,
      updatedAt: new Date()
    });
    this.saveSchedule();
  }

  updateExerciseInDay(day: DayOfWeek, scheduledExerciseId: string, updates: Partial<ScheduledExercise>): void {
    const schedule = this.scheduleSignal();
    if (!schedule) return;

    const dayIndex = schedule.week.findIndex(d => d.day === day);
    if (dayIndex === -1) return;

    const updatedWeek = [...schedule.week];
    updatedWeek[dayIndex] = {
      ...updatedWeek[dayIndex],
      exercises: updatedWeek[dayIndex].exercises.map(e => 
        e.id === scheduledExerciseId ? { ...e, ...updates } : e
      )
    };

    this.scheduleSignal.set({
      ...schedule,
      week: updatedWeek,
      updatedAt: new Date()
    });
    this.saveSchedule();
  }

  toggleExerciseCompletion(day: DayOfWeek, scheduledExerciseId: string): void {
    const schedule = this.scheduleSignal();
    if (!schedule) return;

    const dayIndex = schedule.week.findIndex(d => d.day === day);
    if (dayIndex === -1) return;

    const exercise = schedule.week[dayIndex].exercises.find(e => e.id === scheduledExerciseId);
    if (!exercise) return;

    this.updateExerciseInDay(day, scheduledExerciseId, { completed: !exercise.completed });
  }

  toggleRestDay(day: DayOfWeek): void {
    const schedule = this.scheduleSignal();
    if (!schedule) return;

    const dayIndex = schedule.week.findIndex(d => d.day === day);
    if (dayIndex === -1) return;

    const updatedWeek = [...schedule.week];
    const isCurrentlyRestDay = updatedWeek[dayIndex].restDay;
    
    updatedWeek[dayIndex] = {
      ...updatedWeek[dayIndex],
      restDay: !isCurrentlyRestDay,
      exercises: !isCurrentlyRestDay ? [] : updatedWeek[dayIndex].exercises
    };

    this.scheduleSignal.set({
      ...schedule,
      week: updatedWeek,
      updatedAt: new Date()
    });
    this.saveSchedule();
  }

  getDaySchedule(day: DayOfWeek): DaySchedule | undefined {
    return this.scheduleSignal()?.week.find(d => d.day === day);
  }

  clearDaySchedule(day: DayOfWeek): void {
    const schedule = this.scheduleSignal();
    if (!schedule) return;

    const dayIndex = schedule.week.findIndex(d => d.day === day);
    if (dayIndex === -1) return;

    const updatedWeek = [...schedule.week];
    updatedWeek[dayIndex] = {
      ...updatedWeek[dayIndex],
      exercises: [],
      restDay: false
    };

    this.scheduleSignal.set({
      ...schedule,
      week: updatedWeek,
      updatedAt: new Date()
    });
    this.saveSchedule();
  }

  clearAllSchedules(): void {
    this.initializeEmptySchedule();
    this.saveSchedule();
  }

  refreshSchedule(): void {
    this.loadSchedule();
  }

  getTodayDayName(): DayOfWeek {
    const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  }

  getTodaySchedule(): DaySchedule | undefined {
    return this.getDaySchedule(this.getTodayDayName());
  }
}

