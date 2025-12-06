import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ScheduleService } from '../../core/services/schedule.service';
import { DayOfWeek, DAYS_OF_WEEK, DAY_LABELS, ScheduledExercise, DaySchedule } from '../../shared/models/schedule.model';

@Component({
  selector: 'app-week-planner',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './week-planner.component.html',
  styleUrl: './week-planner.component.css'
})
export class WeekPlannerComponent implements OnInit {
  daysOfWeek = DAYS_OF_WEEK;
  dayLabels = DAY_LABELS;

  showEditModal = signal(false);
  editingDay = signal<DayOfWeek | null>(null);
  editingExercise = signal<ScheduledExercise | null>(null);
  editSets = 3;
  editReps = 10;

  showToast = signal(false);
  toastMessage = signal('');
  toastType = signal<'success' | 'error'>('success');

  constructor(public scheduleService: ScheduleService) {}

  ngOnInit() {
    this.scheduleService.refreshSchedule();
  }

  getDayLabel(day: DayOfWeek): string {
    return this.dayLabels[day];
  }

  getDaySchedule(day: DayOfWeek): DaySchedule | undefined {
    return this.scheduleService.getDaySchedule(day);
  }

  isToday(day: DayOfWeek): boolean {
    const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()] === day;
  }

  getDayExerciseCount(day: DayOfWeek): number {
    return this.getDaySchedule(day)?.exercises?.length || 0;
  }

  getDayCalories(day: DayOfWeek): number {
    const exercises = this.getDaySchedule(day)?.exercises || [];
    return exercises.reduce((sum: number, ex: ScheduledExercise) => sum + (ex.exercise.calories || 0), 0);
  }

  getTotalExercises(): number {
    return this.daysOfWeek.reduce((sum, day) => sum + this.getDayExerciseCount(day), 0);
  }

  getWorkoutDays(): number {
    return this.daysOfWeek.filter(day => {
      const daySchedule = this.getDaySchedule(day);
      return !daySchedule?.restDay && (daySchedule?.exercises?.length || 0) > 0;
    }).length;
  }

  getRestDays(): number {
    return this.daysOfWeek.filter(day => this.getDaySchedule(day)?.restDay).length;
  }

  getTotalCalories(): number {
    return this.daysOfWeek.reduce((sum, day) => sum + this.getDayCalories(day), 0);
  }

  toggleRestDay(day: DayOfWeek) {
    this.scheduleService.toggleRestDay(day);
    const isRest = this.getDaySchedule(day)?.restDay;
    this.showNotification(isRest ? 'Rest day set' : 'Workout day set', 'success');
  }

  removeExercise(day: DayOfWeek, exerciseId: string) {
    this.scheduleService.removeExerciseFromDay(day, exerciseId);
    this.showNotification('Exercise removed', 'error');
  }

  openEditModal(day: DayOfWeek, exercise: ScheduledExercise) {
    this.editingDay.set(day);
    this.editingExercise.set(exercise);
    this.editSets = exercise.sets;
    this.editReps = exercise.reps;
    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.editingDay.set(null);
    this.editingExercise.set(null);
  }

  saveEdit() {
    const day = this.editingDay();
    const exercise = this.editingExercise();
    
    if (day && exercise) {
      this.scheduleService.updateExerciseInDay(day, exercise.id, { sets: this.editSets, reps: this.editReps });
      this.showNotification('Exercise updated', 'success');
      this.closeEditModal();
    }
  }

  incrementSets() {
    if (this.editSets < 10) this.editSets++;
  }

  decrementSets() {
    if (this.editSets > 1) this.editSets--;
  }

  incrementReps() {
    if (this.editReps < 50) this.editReps++;
  }

  decrementReps() {
    if (this.editReps > 1) this.editReps--;
  }

  formatMuscle(muscle: string): string {
    return muscle.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=100&h=100&fit=crop';
  }

  showNotification(message: string, type: 'success' | 'error') {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 2500);
  }
}
