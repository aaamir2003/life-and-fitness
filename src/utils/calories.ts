import { UserProfile } from '../types';

export function calculateBMR(profile: UserProfile): number {
  // Mifflin-St Jeor Equation
  if (profile.gender === 'male') {
    return 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
  }
  return 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
}

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  extra: 1.9,
};

export function calculateTDEE(profile: UserProfile): number {
  const bmr = calculateBMR(profile);
  return Math.round(bmr * (ACTIVITY_MULTIPLIERS[profile.activityLevel] || 1.2));
}

export function calculateTargetCalories(profile: UserProfile): number {
  const tdee = calculateTDEE(profile);
  switch (profile.goal) {
    case 'lose': return tdee - 500;
    case 'gain': return tdee + 500;
    default: return tdee;
  }
}

export function calculateMacros(targetCalories: number, goal: string) {
  let proteinPct: number, fatPct: number, carbPct: number;
  switch (goal) {
    case 'lose':
      proteinPct = 0.35; fatPct = 0.30; carbPct = 0.35;
      break;
    case 'gain':
      proteinPct = 0.30; fatPct = 0.25; carbPct = 0.45;
      break;
    default:
      proteinPct = 0.30; fatPct = 0.25; carbPct = 0.45;
  }
  return {
    protein: Math.round((targetCalories * proteinPct) / 4),
    fat: Math.round((targetCalories * fatPct) / 9),
    carbs: Math.round((targetCalories * carbPct) / 4),
  };
}

// MET values for calorie burn estimation
const MET_VALUES: Record<string, number> = {
  'Walking': 3.5,
  'Running': 8.0,
  'Cycling': 7.5,
  'Swimming': 7.0,
  'Jump Rope': 12.0,
  'HIIT': 8.0,
  'Weight Training': 3.5,
  'Push-ups': 3.8,
  'Pull-ups': 3.8,
  'Squats': 5.0,
  'Deadlift': 6.0,
  'Bench Press': 3.5,
  'Plank': 3.0,
  'Yoga': 2.5,
  'Pilates': 3.0,
  'Stretching': 2.3,
  'Rowing': 7.0,
  'Elliptical': 5.0,
  'Stair Climbing': 9.0,
  'Dancing': 5.5,
  'Boxing': 7.8,
  'Martial Arts': 5.5,
  'Other': 4.0,
};

export function estimateCaloriesBurned(exerciseName: string, durationMinutes: number, weightKg: number): number {
  const met = MET_VALUES[exerciseName] || MET_VALUES['Other'];
  return Math.round(met * weightKg * (durationMinutes / 60));
}

export function getExerciseList(): string[] {
  return Object.keys(MET_VALUES);
}
