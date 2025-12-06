import { Exercise } from './exercise.model';

export type DayOfWeek = 
  | 'monday' 
  | 'tuesday' 
  | 'wednesday' 
  | 'thursday' 
  | 'friday' 
  | 'saturday' 
  | 'sunday';

export interface ScheduledExercise {
  id: string;
  exercise: Exercise;
  sets: number;
  reps: number;
  duration?: number; // in minutes
  notes?: string;
  completed: boolean;
}

export interface DaySchedule {
  day: DayOfWeek;
  exercises: ScheduledExercise[];
  restDay: boolean;
}

export interface WeeklySchedule {
  id: string;
  userId: string;
  week: DaySchedule[];
  createdAt: Date;
  updatedAt: Date;
}

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'monday',
  'tuesday', 
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday'
};

