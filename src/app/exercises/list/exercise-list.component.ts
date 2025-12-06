import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExerciseService } from '../../core/services/exercise.service';
import { ScheduleService } from '../../core/services/schedule.service';
import { Exercise, ExerciseFilter, MuscleGroup, Difficulty, MUSCLE_GROUPS, DIFFICULTIES } from '../../shared/models/exercise.model';
import { DayOfWeek, DAYS_OF_WEEK, DAY_LABELS } from '../../shared/models/schedule.model';

@Component({
  selector: 'app-exercise-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './exercise-list.component.html',
  styleUrl: './exercise-list.component.css'
})
export class ExerciseListComponent implements OnInit {
  exerciseService: ExerciseService;
  scheduleService: ScheduleService;

  searchTerm = '';
  selectedMuscleGroup: MuscleGroup | '' = '';
  selectedDifficulty: Difficulty | '' = '';
  
  muscleGroups = MUSCLE_GROUPS;
  difficulties = DIFFICULTIES;
  daysOfWeek = DAYS_OF_WEEK;
  dayLabels = DAY_LABELS;

  filteredExercises = signal<Exercise[]>([]);
  showScheduleModal = signal(false);
  selectedExercise = signal<Exercise | null>(null);
  selectedDay = signal<DayOfWeek | null>(null);
  modalSets = 3;
  modalReps = 10;
  showToast = signal(false);

  constructor(
    exerciseService: ExerciseService,
    scheduleService: ScheduleService
  ) {
    this.exerciseService = exerciseService;
    this.scheduleService = scheduleService;
  }

  ngOnInit() {
    this.exerciseService.loadExercises().then(() => {
      this.applyFilters();
    });
  }

  applyFilters() {
    const filter: ExerciseFilter = {
      searchTerm: this.searchTerm,
      muscleGroup: this.selectedMuscleGroup,
      difficulty: this.selectedDifficulty
    };
    this.filteredExercises.set(this.exerciseService.filterExercises(filter));
  }

  hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.selectedMuscleGroup || this.selectedDifficulty);
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedMuscleGroup = '';
    this.selectedDifficulty = '';
    this.applyFilters();
  }

  formatMuscle(muscle: string): string {
    return muscle.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  getDayShort(day: DayOfWeek): string {
    const shorts: Record<DayOfWeek, string> = {
      monday: 'Mon',
      tuesday: 'Tue',
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
      sunday: 'Sun'
    };
    return shorts[day];
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop';
  }

  openAddToSchedule(exercise: Exercise) {
    this.selectedExercise.set(exercise);
    this.selectedDay.set(null);
    this.modalSets = 3;
    this.modalReps = 10;
    this.showScheduleModal.set(true);
  }

  closeScheduleModal() {
    this.showScheduleModal.set(false);
    this.selectedExercise.set(null);
    this.selectedDay.set(null);
  }

  addToSchedule() {
    const exercise = this.selectedExercise();
    const day = this.selectedDay();
    
    if (exercise && day) {
      this.scheduleService.addExerciseToDay(day, exercise, this.modalSets, this.modalReps);
      this.closeScheduleModal();
      
      this.showToast.set(true);
      setTimeout(() => this.showToast.set(false), 3000);
    }
  }
}
