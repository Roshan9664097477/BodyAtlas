export interface Exercise {
  id: string;
  name: string;
  targetMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  description: string;
  instructions: string[];
  difficulty: Difficulty;
  equipment: string[];
  imageUrl: string;
  videoUrl?: string;
  calories: number;
  duration: number; // in minutes
}

export type MuscleGroup = 
  | 'chest' 
  | 'back' 
  | 'shoulders' 
  | 'arms' 
  | 'biceps'
  | 'triceps'
  | 'legs' 
  | 'quadriceps'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'abs' 
  | 'core'
  | 'full-body';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface ExerciseFilter {
  searchTerm?: string;
  muscleGroup?: MuscleGroup | '';
  difficulty?: Difficulty | '';
  equipment?: string;
}

export const MUSCLE_GROUPS: MuscleGroup[] = [
  'chest', 'back', 'shoulders', 'arms', 'biceps', 'triceps',
  'legs', 'quadriceps', 'hamstrings', 'glutes', 'calves',
  'abs', 'core', 'full-body'
];

export const DIFFICULTIES: Difficulty[] = ['beginner', 'intermediate', 'advanced'];

