
export enum BodyPart {
  CHEST = 'Chest',
  BACK = 'Back',
  LEGS = 'Legs',
  SHOULDERS = 'Shoulders',
  ARMS = 'Arms',
  CORE = 'Core',
  FULL_BODY = 'Full Body',
  YOGA = 'Yoga',
  STRETCH = 'Stretch'
}

export enum WorkoutSource {
  EQUIPMENT = 'Equipment',
  HOME = 'Home',
  YOUTUBE = 'YouTube',
  UPLOAD = 'Upload'
}

export const DEFAULT_BODY_PARTS: BodyPart[] = [
  BodyPart.CHEST,
  BodyPart.BACK,
  BodyPart.LEGS,
  BodyPart.SHOULDERS,
  BodyPart.ARMS,
  BodyPart.CORE,
  BodyPart.FULL_BODY,
  BodyPart.YOGA,
  BodyPart.STRETCH
];

export const DEFAULT_SOURCES: WorkoutSource[] = [
  WorkoutSource.EQUIPMENT,
  WorkoutSource.HOME,
  WorkoutSource.YOUTUBE,
  WorkoutSource.UPLOAD
];

export enum NekoMood {
  EXCELLENT = 'EXCELLENT',
  SATISFACTION = 'SATISFACTION',
  GOOD = 'GOOD',
  MOTIVATIONAL = 'MOTIVATIONAL',
  GUILT = 'GUILT',
  ANGRY = 'ANGRY',
  CHILL = 'CHILL',
  IGNORANCE = 'IGNORANCE',
  MONDAY = 'MONDAY',
  LAZY = 'LAZY',
  YOGA = 'YOGA',
  STRETCH = 'STRETCH',
  NIGHTOWL = 'NIGHTOWL'
}

export interface Workout {
  id: string;
  name: string;
  bodyPart: BodyPart;
  source: WorkoutSource;
  caloriesBurned: number;
  youtubeUrl?: string;
  localVideoUrl?: string;
  thumbnailUrl?: string;
  mediaId?: string;
  notes?: string;
  isFavorite?: boolean;
  createdAt: number;
}

export interface PlannerGoal {
  id: string;
  name: string;
  workoutId?: string; 
  
  // ✨ 核心修改：區分任務類型
  type: 'recurring' | 'specific'; 
  
  // 如果是 recurring，使用 targetDays (0-6)
  targetDays: number[]; 
  
  // 如果是 specific，使用具體日期 (YYYY-MM-DD)
  date?: string; 

  sets?: string;
  reps?: string;
  duration?: string;
}

export interface DailyCompletion {
  [dateKey: string]: string[]; // date string (YYYY-MM-DD) -> Array of goal IDs
}

export interface UserData {
  age: number;
  weight: number;
  height: number;
  gender: 'male' | 'female';
  activityLevel: number;
  dailySteps: number;
  caloriesConsumed: number;
  waterIntake: number;
  workoutsDone: number;
  primaryFocus: BodyPart;
}
