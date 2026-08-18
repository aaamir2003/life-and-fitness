export type TabType = 'dashboard' | 'study' | 'fitness' | 'goals' | 'recreation' | 'report';

/* ── Study & Exam ── */
export interface Topic {
  id: string;
  title: string;
  estHours: number;
  doneHours: number;
  difficulty: 'easy' | 'medium' | 'hard';
  color: string;
}

export interface StudyPlanAssignment {
  topicId: string;
  title: string;
  hours: number;
  kind: 'study' | 'review' | 'mock';
}

export interface StudyPlanDay {
  date: string;
  kind: 'study' | 'review' | 'mock' | 'rest';
  assignments: StudyPlanAssignment[];
  totalHours: number;
}

export interface StudyPlanResult {
  days: StudyPlanDay[];
  dailyLoad: number;
  totalRemaining: number;
  studyDays: number;
  examDays: number;
}

export interface QuizQuestion {
  id: string;
  subject: string;
  question: string;
  options: string[];
  correct: number;
  custom?: boolean;
}

export interface QuizAttempt {
  id: string;
  date: string;
  subject: string;
  total: number;
  correct: number;
  seconds: number;
}

/* ── Nutrition ── */
export interface FoodItem {
  id: string;
  name: string;
  fa: string;
  cat: string;
  serving: number;
  kw: string[];
  per100: { kcal: number; p: number; c: number; f: number };
}

export interface CalorieEntry {
  id: string;
  date: string;
  name: string;
  grams: number;
  meal: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface UserProfile {
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'extra';
  goal: 'lose' | 'maintain' | 'gain';
}

/* ── Workouts ── */
export type FitnessGoal = 'cut' | 'bulk' | 'endurance' | 'loss';

export interface FitnessProfile {
  goal: FitnessGoal;
  weight: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  intensity: 'light' | 'moderate' | 'heavy';
  daysPerWeek: number;
  minutesPerDay: number;
}

export interface PlanExercise {
  name: string;
  sets: number;
  reps: string;
  rest: number;
}

export interface WorkoutPlanDay {
  day: string;
  focus: string;
  exercises: PlanExercise[];
  cardio?: { name: string; minutes: number };
  estMinutes: number;
  estBurn: number;
}

export interface Workout {
  id: string;
  date: string;
  type: 'cardio' | 'strength' | 'endurance' | 'flexibility' | 'other';
  name: string;
  duration: number;
  caloriesBurned: number;
}

/* ── Goals & Leisure ── */
export interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'short' | 'mid' | 'long';
  progress: number;
  completed: boolean;
  createdAt: string;
  deadline?: string;
}

export interface RecreationItem {
  id: string;
  title: string;
  category: 'movie' | 'series' | 'book' | 'game' | 'travel' | 'hobby' | 'other';
  status: 'planned' | 'in-progress' | 'completed';
  rating: number;
  notes: string;
}
