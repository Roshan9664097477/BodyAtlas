import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Exercise, ExerciseFilter, MuscleGroup, Difficulty, MUSCLE_GROUPS, DIFFICULTIES } from '../../shared/models/exercise.model';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  private exercisesSignal = signal<Exercise[]>([]);
  private loadingSignal = signal<boolean>(false);
  private loadedSignal = signal<boolean>(false);
  
  readonly exercises = this.exercisesSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly loaded = this.loadedSignal.asReadonly();

  constructor(private http: HttpClient) {}

  async loadExercises(): Promise<void> {
    if (this.loadedSignal()) return;
    
    this.loadingSignal.set(true);
    try {
      const exercises = await firstValueFrom(
        this.http.get<Exercise[]>('/assets/data/exercises.json')
      );
      this.exercisesSignal.set(exercises);
      this.loadedSignal.set(true);
    } catch (error) {
      console.error('Failed to load exercises from JSON, using fallback data:', error);
      this.exercisesSignal.set(this.getFallbackExercises());
      this.loadedSignal.set(true);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  getExerciseById(id: string): Exercise | undefined {
    return this.exercisesSignal().find(e => e.id === id);
  }

  filterExercises(filter: ExerciseFilter): Exercise[] {
    let filtered = [...this.exercisesSignal()];
    
    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      filtered = filtered.filter(e => 
        e.name.toLowerCase().includes(term) ||
        e.description.toLowerCase().includes(term) ||
        e.targetMuscle.toLowerCase().includes(term) ||
        e.equipment.some(eq => eq.toLowerCase().includes(term))
      );
    }
    
    if (filter.muscleGroup) {
      filtered = filtered.filter(e => 
        e.targetMuscle === filter.muscleGroup ||
        e.secondaryMuscles.includes(filter.muscleGroup as MuscleGroup)
      );
    }
    
    if (filter.difficulty) {
      filtered = filtered.filter(e => e.difficulty === filter.difficulty);
    }
    
    if (filter.equipment) {
      filtered = filtered.filter(e => 
        e.equipment.some(eq => eq.toLowerCase().includes(filter.equipment!.toLowerCase()))
      );
    }
    
    return filtered;
  }

  getMuscleGroups(): MuscleGroup[] {
    return MUSCLE_GROUPS;
  }

  getDifficulties(): Difficulty[] {
    return DIFFICULTIES;
  }

  private getFallbackExercises(): Exercise[] {
    return [
      {
        id: 'ex-001',
        name: 'Barbell Bench Press',
        targetMuscle: 'chest',
        secondaryMuscles: ['triceps', 'shoulders'],
        description: 'The barbell bench press is a compound exercise that primarily targets the chest muscles while also engaging the triceps and shoulders. It is one of the most effective exercises for building upper body strength.',
        instructions: [
          'Lie flat on a bench with your feet firmly on the floor',
          'Grip the barbell slightly wider than shoulder-width apart',
          'Unrack the bar and lower it slowly to your mid-chest',
          'Press the bar back up explosively to the starting position',
          'Keep your core tight and maintain a slight arch in your lower back'
        ],
        difficulty: 'intermediate',
        equipment: ['Barbell', 'Flat Bench', 'Weight Plates'],
        imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop',
        calories: 150,
        duration: 20
      },
      {
        id: 'ex-002',
        name: 'Pull-ups',
        targetMuscle: 'back',
        secondaryMuscles: ['biceps', 'shoulders', 'core'],
        description: 'Pull-ups are a fundamental bodyweight exercise that targets the latissimus dorsi, biceps, and core muscles. They are excellent for building upper body pulling strength.',
        instructions: [
          'Grab the pull-up bar with an overhand grip, hands slightly wider than shoulder-width',
          'Hang with arms fully extended and engage your core',
          'Pull your body up by driving your elbows down and back',
          'Continue until your chin is above the bar',
          'Lower yourself with control to the starting position'
        ],
        difficulty: 'intermediate',
        equipment: ['Pull-up Bar'],
        imageUrl: 'https://images.unsplash.com/photo-1598971639058-a0ad89231689?w=400&h=300&fit=crop',
        calories: 100,
        duration: 15
      },
      {
        id: 'ex-003',
        name: 'Barbell Squats',
        targetMuscle: 'quadriceps',
        secondaryMuscles: ['glutes', 'hamstrings', 'core'],
        description: 'Barbell squats are the king of lower body exercises. They target the quadriceps, glutes, and hamstrings while also engaging the core for stability.',
        instructions: [
          'Position the barbell on your upper back, gripping it firmly',
          'Stand with feet shoulder-width apart, toes slightly pointed out',
          'Brace your core and keep your chest up',
          'Lower your body by bending at the hips and knees simultaneously',
          'Go down until thighs are parallel to the floor, then drive back up'
        ],
        difficulty: 'intermediate',
        equipment: ['Barbell', 'Squat Rack', 'Weight Plates'],
        imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&fit=crop',
        calories: 180,
        duration: 25
      },
      {
        id: 'ex-004',
        name: 'Deadlift',
        targetMuscle: 'back',
        secondaryMuscles: ['hamstrings', 'glutes', 'core'],
        description: 'The deadlift is a compound exercise that works the entire posterior chain. It is one of the best exercises for overall strength and muscle development.',
        instructions: [
          'Stand with feet hip-width apart, bar over mid-foot',
          'Bend at hips and knees to grip the bar just outside your legs',
          'Keep your back flat, chest up, and shoulders over the bar',
          'Drive through your heels and extend hips and knees together',
          'Stand fully upright, then reverse the movement to lower the bar'
        ],
        difficulty: 'advanced',
        equipment: ['Barbell', 'Weight Plates'],
        imageUrl: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&h=300&fit=crop',
        calories: 200,
        duration: 25
      },
      {
        id: 'ex-005',
        name: 'Overhead Shoulder Press',
        targetMuscle: 'shoulders',
        secondaryMuscles: ['triceps', 'core'],
        description: 'The overhead press is an excellent exercise for building shoulder strength and size. It primarily targets the deltoids while engaging the triceps.',
        instructions: [
          'Hold dumbbells or a barbell at shoulder height',
          'Stand with feet shoulder-width apart, core braced',
          'Press the weight directly overhead until arms are fully extended',
          'Lower the weight back to shoulder height with control',
          'Avoid excessive arching of the lower back'
        ],
        difficulty: 'beginner',
        equipment: ['Dumbbells', 'Barbell (optional)'],
        imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=300&fit=crop',
        calories: 90,
        duration: 15
      },
      {
        id: 'ex-006',
        name: 'Bicep Curls',
        targetMuscle: 'biceps',
        secondaryMuscles: ['arms'],
        description: 'Bicep curls are an isolation exercise that specifically targets the biceps brachii muscle. They are great for building arm size and definition.',
        instructions: [
          'Stand with dumbbells at your sides, palms facing forward',
          'Keep your elbows close to your body',
          'Curl the weights up toward your shoulders',
          'Squeeze your biceps at the top of the movement',
          'Lower the weights slowly with control'
        ],
        difficulty: 'beginner',
        equipment: ['Dumbbells', 'EZ Bar (optional)'],
        imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=300&fit=crop',
        calories: 60,
        duration: 10
      },
      {
        id: 'ex-007',
        name: 'Tricep Dips',
        targetMuscle: 'triceps',
        secondaryMuscles: ['chest', 'shoulders'],
        description: 'Tricep dips are an effective bodyweight exercise for building tricep strength and size. They also engage the chest and shoulders.',
        instructions: [
          'Position yourself on parallel bars or between two sturdy surfaces',
          'Start with arms fully extended, supporting your body weight',
          'Lower your body by bending your elbows to about 90 degrees',
          'Keep your elbows close to your body throughout the movement',
          'Push back up to the starting position'
        ],
        difficulty: 'intermediate',
        equipment: ['Parallel Bars', 'Bench'],
        imageUrl: 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=400&h=300&fit=crop',
        calories: 80,
        duration: 12
      },
      {
        id: 'ex-008',
        name: 'Plank',
        targetMuscle: 'core',
        secondaryMuscles: ['abs', 'shoulders'],
        description: 'The plank is an isometric core exercise that builds stability and endurance. It engages the entire core while also working the shoulders.',
        instructions: [
          'Start in a push-up position, then lower to your forearms',
          'Keep your body in a straight line from head to heels',
          'Engage your core by pulling your belly button toward your spine',
          'Keep your hips level - dont let them sag or pike up',
          'Hold the position while breathing steadily'
        ],
        difficulty: 'beginner',
        equipment: ['Exercise Mat'],
        imageUrl: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400&h=300&fit=crop',
        calories: 50,
        duration: 5
      },
      {
        id: 'ex-009',
        name: 'Walking Lunges',
        targetMuscle: 'quadriceps',
        secondaryMuscles: ['glutes', 'hamstrings'],
        description: 'Walking lunges are a dynamic lower body exercise that improves balance, coordination, and leg strength. They target the quadriceps and glutes.',
        instructions: [
          'Stand with feet hip-width apart',
          'Take a large step forward with one leg',
          'Lower your body until both knees are at 90-degree angles',
          'Push off the back foot and step forward into the next lunge',
          'Continue alternating legs as you walk forward'
        ],
        difficulty: 'beginner',
        equipment: ['Bodyweight', 'Dumbbells (optional)'],
        imageUrl: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=400&h=300&fit=crop',
        calories: 100,
        duration: 15
      },
      {
        id: 'ex-010',
        name: 'Russian Twists',
        targetMuscle: 'abs',
        secondaryMuscles: ['core'],
        description: 'Russian twists are a rotational core exercise that targets the obliques. They improve rotational strength and core stability.',
        instructions: [
          'Sit on the floor with knees bent and feet elevated slightly',
          'Lean back to about 45 degrees while keeping your spine straight',
          'Hold a weight or clasp your hands at chest level',
          'Rotate your torso to one side, then to the other',
          'Keep your core engaged throughout the movement'
        ],
        difficulty: 'intermediate',
        equipment: ['Medicine Ball', 'Weight Plate', 'Dumbbell'],
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
        calories: 70,
        duration: 10
      },
      {
        id: 'ex-011',
        name: 'Lat Pulldown',
        targetMuscle: 'back',
        secondaryMuscles: ['biceps', 'shoulders'],
        description: 'The lat pulldown is a cable machine exercise that targets the latissimus dorsi. It is an excellent exercise for building a wider back.',
        instructions: [
          'Sit at the lat pulldown machine with thighs secured',
          'Grip the bar wider than shoulder-width with an overhand grip',
          'Pull the bar down to your upper chest while squeezing shoulder blades',
          'Keep your torso slightly leaned back throughout',
          'Return to the starting position with control'
        ],
        difficulty: 'beginner',
        equipment: ['Cable Machine', 'Lat Pulldown Bar'],
        imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
        calories: 85,
        duration: 15
      },
      {
        id: 'ex-012',
        name: 'Calf Raises',
        targetMuscle: 'calves',
        secondaryMuscles: ['legs'],
        description: 'Calf raises isolate and strengthen the gastrocnemius and soleus muscles. They are essential for developing lower leg strength.',
        instructions: [
          'Stand on the edge of a step or platform with heels hanging off',
          'Hold onto something for balance if needed',
          'Lower your heels below the level of the step',
          'Rise up onto your toes as high as possible',
          'Squeeze at the top, then lower with control'
        ],
        difficulty: 'beginner',
        equipment: ['Step Platform', 'Calf Raise Machine'],
        imageUrl: 'https://images.unsplash.com/photo-1595078475328-1ab05d0a6a0e?w=400&h=300&fit=crop',
        calories: 40,
        duration: 8
      },
      {
        id: 'ex-013',
        name: 'Dumbbell Rows',
        targetMuscle: 'back',
        secondaryMuscles: ['biceps', 'shoulders'],
        description: 'Dumbbell rows are a unilateral back exercise that helps build thickness in the lats and middle back while also engaging the biceps.',
        instructions: [
          'Place one knee and hand on a bench for support',
          'Hold a dumbbell in the opposite hand, arm extended',
          'Pull the dumbbell up toward your hip, elbow close to body',
          'Squeeze your back muscles at the top',
          'Lower with control and repeat'
        ],
        difficulty: 'beginner',
        equipment: ['Dumbbells', 'Flat Bench'],
        imageUrl: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=400&h=300&fit=crop',
        calories: 75,
        duration: 12
      },
      {
        id: 'ex-014',
        name: 'Push-ups',
        targetMuscle: 'chest',
        secondaryMuscles: ['triceps', 'shoulders', 'core'],
        description: 'Push-ups are a classic bodyweight exercise that targets the chest, triceps, and shoulders. They require no equipment and can be done anywhere.',
        instructions: [
          'Start in a high plank position with hands slightly wider than shoulders',
          'Keep your body in a straight line from head to heels',
          'Lower your chest toward the floor by bending your elbows',
          'Go down until your chest nearly touches the ground',
          'Push back up to the starting position'
        ],
        difficulty: 'beginner',
        equipment: ['Bodyweight'],
        imageUrl: 'https://images.unsplash.com/photo-1598971457999-ca4ef48a9a71?w=400&h=300&fit=crop',
        calories: 70,
        duration: 10
      },
      {
        id: 'ex-015',
        name: 'Romanian Deadlift',
        targetMuscle: 'hamstrings',
        secondaryMuscles: ['glutes', 'back'],
        description: 'The Romanian deadlift is a hip-hinge movement that primarily targets the hamstrings and glutes while also strengthening the lower back.',
        instructions: [
          'Stand with feet hip-width apart, holding a barbell or dumbbells',
          'Keep a slight bend in your knees throughout the movement',
          'Hinge at the hips, pushing them back while lowering the weight',
          'Keep your back flat and the weight close to your legs',
          'Lower until you feel a stretch in your hamstrings, then return to standing'
        ],
        difficulty: 'intermediate',
        equipment: ['Barbell', 'Dumbbells'],
        imageUrl: 'https://images.unsplash.com/photo-1534368786749-b63e05c92717?w=400&h=300&fit=crop',
        calories: 120,
        duration: 15
      },
      {
        id: 'ex-016',
        name: 'Leg Press',
        targetMuscle: 'quadriceps',
        secondaryMuscles: ['glutes', 'hamstrings'],
        description: 'The leg press is a machine-based exercise that allows you to safely lift heavy weights to build lower body strength and size.',
        instructions: [
          'Sit in the leg press machine with back and head against the pad',
          'Place feet shoulder-width apart on the platform',
          'Release the safety handles and lower the weight toward your chest',
          'Lower until your knees are at about 90 degrees',
          'Push the weight back up without locking your knees'
        ],
        difficulty: 'beginner',
        equipment: ['Leg Press Machine'],
        imageUrl: 'https://images.unsplash.com/photo-1596357395217-80de13130e92?w=400&h=300&fit=crop',
        calories: 140,
        duration: 18
      },
      {
        id: 'ex-017',
        name: 'Face Pulls',
        targetMuscle: 'shoulders',
        secondaryMuscles: ['back'],
        description: 'Face pulls are an excellent exercise for rear deltoid and upper back development. They help improve posture and shoulder health.',
        instructions: [
          'Set a cable machine with rope attachment at face height',
          'Grip the rope with palms facing each other',
          'Pull the rope toward your face, separating the ends',
          'Focus on squeezing your rear deltoids and upper back',
          'Return to the starting position with control'
        ],
        difficulty: 'beginner',
        equipment: ['Cable Machine', 'Rope Attachment'],
        imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&h=300&fit=crop',
        calories: 50,
        duration: 10
      },
      {
        id: 'ex-018',
        name: 'Burpees',
        targetMuscle: 'full-body',
        secondaryMuscles: ['chest', 'legs', 'core'],
        description: 'Burpees are a high-intensity full-body exercise that combines a squat, push-up, and jump. They are excellent for cardiovascular conditioning.',
        instructions: [
          'Start standing with feet shoulder-width apart',
          'Drop into a squat and place hands on the floor',
          'Jump your feet back into a plank position',
          'Perform a push-up, then jump feet back to squat position',
          'Explosively jump up with arms overhead'
        ],
        difficulty: 'intermediate',
        equipment: ['Bodyweight'],
        imageUrl: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=400&h=300&fit=crop',
        calories: 150,
        duration: 15
      },
      {
        id: 'ex-019',
        name: 'Hip Thrusts',
        targetMuscle: 'glutes',
        secondaryMuscles: ['hamstrings', 'core'],
        description: 'Hip thrusts are the best exercise for targeting and developing the gluteus maximus. They help build strong, powerful glutes.',
        instructions: [
          'Sit on the ground with upper back against a bench',
          'Roll a barbell over your hips or use bodyweight',
          'Plant feet firmly on the floor, shoulder-width apart',
          'Drive through your heels to lift hips toward the ceiling',
          'Squeeze glutes at the top, then lower with control'
        ],
        difficulty: 'intermediate',
        equipment: ['Barbell', 'Bench', 'Hip Thrust Pad'],
        imageUrl: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=400&h=300&fit=crop',
        calories: 100,
        duration: 15
      },
      {
        id: 'ex-020',
        name: 'Mountain Climbers',
        targetMuscle: 'core',
        secondaryMuscles: ['shoulders', 'legs'],
        description: 'Mountain climbers are a dynamic core exercise that also provides cardiovascular benefits. They engage the entire body while primarily targeting the core.',
        instructions: [
          'Start in a high plank position with hands under shoulders',
          'Drive one knee toward your chest',
          'Quickly switch legs, bringing the other knee forward',
          'Continue alternating legs at a quick pace',
          'Keep your hips level and core engaged throughout'
        ],
        difficulty: 'beginner',
        equipment: ['Bodyweight'],
        imageUrl: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=400&h=300&fit=crop',
        calories: 100,
        duration: 10
      }
    ];
  }
}

