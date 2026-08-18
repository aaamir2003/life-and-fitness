import { useState } from 'react';
import { Utensils, Calculator, Dumbbell } from 'lucide-react';
import type { UserProfile, CalorieEntry, FitnessProfile, WorkoutPlanDay, Workout } from '../types';
import NutritionAI from './NutritionAI';
import TdeeCalc from './TdeeCalc';
import WorkoutPlanner from './WorkoutPlanner';
import { calculateTargetCalories } from '../utils/calories';

interface FitnessHubProps {
  userProfile: UserProfile | null;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  calorieEntries: CalorieEntry[];
  setCalorieEntries: React.Dispatch<React.SetStateAction<CalorieEntry[]>>;
  fitnessProfile: FitnessProfile | null;
  setFitnessProfile: React.Dispatch<React.SetStateAction<FitnessProfile | null>>;
  workoutPlan: WorkoutPlanDay[] | null;
  setWorkoutPlan: React.Dispatch<React.SetStateAction<WorkoutPlanDay[] | null>>;
  workouts: Workout[];
  setWorkouts: React.Dispatch<React.SetStateAction<Workout[]>>;
}

export default function FitnessHub(props: FitnessHubProps) {
  const [sub, setSub] = useState<'food' | 'tdee' | 'workout'>('food');
  const targetCal = props.userProfile ? calculateTargetCalories(props.userProfile) : 2000;

  const subs = [
    { id: 'food' as const, l: 'AI Food Search', i: <Utensils size={15} />, badge: 'AI' },
    { id: 'tdee' as const, l: 'TDEE Calculator', i: <Calculator size={15} /> },
    { id: 'workout' as const, l: 'Smart Workout Plan', i: <Dumbbell size={15} />, badge: 'AI' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex gap-2 flex-wrap items-center">
        {subs.map(s => (
          <button key={s.id} onClick={() => setSub(s.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer active:scale-95 ${
              sub === s.id
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-600/25'
                : 'glass text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-300'
            }`}>
            {s.i}{s.l}
            {'badge' in s && s.badge && (
              <span className={`text-[8px] font-mono font-bold px-1 py-0.5 rounded ${sub === s.id ? 'bg-white/25 text-white' : 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300'}`}>
                {s.badge}
              </span>
            )}
          </button>
        ))}
        <span className="ml-auto hidden sm:block font-mono text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Daily target: <strong className="text-teal-600 dark:text-teal-300 tabular">{targetCal} kcal</strong>
        </span>
      </div>

      {sub === 'food' && (
        <NutritionAI entries={props.calorieEntries} setEntries={props.setCalorieEntries} targetCal={targetCal} />
      )}
      {sub === 'tdee' && (
        <TdeeCalc profile={props.userProfile} setProfile={props.setUserProfile} />
      )}
      {sub === 'workout' && (
        <WorkoutPlanner
          profile={props.fitnessProfile}
          setProfile={props.setFitnessProfile}
          plan={props.workoutPlan}
          setPlan={props.setWorkoutPlan}
          workouts={props.workouts}
          setWorkouts={props.setWorkouts}
        />
      )}
    </div>
  );
}
