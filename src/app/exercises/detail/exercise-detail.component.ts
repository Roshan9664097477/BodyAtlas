import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExerciseService } from '../../core/services/exercise.service';
import { ScheduleService } from '../../core/services/schedule.service';
import { Exercise } from '../../shared/models/exercise.model';
import { DayOfWeek, DAYS_OF_WEEK } from '../../shared/models/schedule.model';

@Component({
  selector: 'app-exercise-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './exercise-detail.component.html',
  styleUrl: './exercise-detail.component.css'
})
export class ExerciseDetailComponent implements OnInit {
  exercise = signal<Exercise | null>(null);
  loading = signal(true);
  selectedDay = signal<DayOfWeek | null>(null);
  sets = 3;
  reps = 10;
  showToast = signal(false);
  daysOfWeek = DAYS_OF_WEEK;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private exerciseService: ExerciseService,
    private scheduleService: ScheduleService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadExercise(id);
    } else {
      this.loading.set(false);
    }
  }

  async loadExercise(id: string) {
    this.loading.set(true);
    await this.exerciseService.loadExercises();
    const exercise = this.exerciseService.getExerciseById(id);
    this.exercise.set(exercise || null);
    this.loading.set(false);
  }

  formatMuscle(muscle: string): string {
    return muscle.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
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
    img.src = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop';
  }

  addToSchedule() {
    const exercise = this.exercise();
    const day = this.selectedDay();
    
    if (exercise && day) {
      this.scheduleService.addExerciseToDay(day, exercise, this.sets, this.reps);
      
      this.showToast.set(true);
      setTimeout(() => this.showToast.set(false), 3000);
    }
  }
}
