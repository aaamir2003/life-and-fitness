import type {
  Topic, StudyPlanDay, StudyPlanAssignment, StudyPlanResult,
  FitnessProfile, WorkoutPlanDay, PlanExercise, FitnessGoal,
} from '../types';
import { addDays, daysUntil, getToday } from './helpers';

/* ════════════════════════════════════════════════════════
   AI Study Plan Generator
   Distributes remaining topic volume across available days,
   inserts weekly review days and a mock-exam phase before
   the exam date.
   ════════════════════════════════════════════════════════ */
export function generateStudyPlan(topics: Topic[], examDate: string): StudyPlanResult {
  const examDays = Math.max(1, daysUntil(examDate));
  const remMap = new Map<string, number>();
  const nameMap = new Map<string, string>();
  let totalRemaining = 0;

  topics.forEach(t => {
    const rem = Math.max(0, +(t.estHours - t.doneHours).toFixed(2));
    nameMap.set(t.id, t.title);
    if (rem > 0.2) { remMap.set(t.id, rem); totalRemaining += rem; }
  });
  totalRemaining = +totalRemaining.toFixed(1);

  const studyDays = Math.max(1, Math.floor(examDays * 0.85));
  const rawLoad = totalRemaining > 0 ? totalRemaining / studyDays : 0;
  const dailyLoad = Math.min(12, Math.ceil(rawLoad * 2) / 2);

  const days: StudyPlanDay[] = [];
  if (totalRemaining === 0) {
    return { days, dailyLoad: 0, totalRemaining: 0, studyDays, examDays };
  }

  for (let i = 0; i < examDays; i++) {
    const date = addDays(getToday(), i);
    const left = examDays - i;

    // Final 3 days: mock exam & error analysis
    if (examDays > 6 && left <= 3) {
      days.push({
        date, kind: 'mock', totalHours: 3,
        assignments: [{ topicId: 'mock', title: 'Mock Exam + Error Analysis', hours: 3, kind: 'mock' }],
      });
      continue;
    }

    // Every 7th day: spaced review
    if ((i + 1) % 7 === 0) {
      const heavy = [...remMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2);
      const assignments: StudyPlanAssignment[] = heavy.map(([id]) => ({
        topicId: id,
        title: `Review: ${nameMap.get(id) || 'topic'}`,
        hours: 0.75, kind: 'review',
      }));
      days.push({
        date, kind: 'review',
        totalHours: +assignments.reduce((s, a) => s + a.hours, 0).toFixed(2),
        assignments,
      });
      continue;
    }

    // Regular study day: allocate load across the 3 heaviest topics
    const avail = [...remMap.entries()]
      .filter(([, h]) => h > 0.2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    if (avail.length === 0) {
      days.push({ date, kind: 'rest', totalHours: 0, assignments: [] });
      continue;
    }

    const share = dailyLoad / avail.length;
    const assignments: StudyPlanAssignment[] = [];
    avail.forEach(([id, h]) => {
      const hours = Math.min(Math.round(Math.min(share, h) * 2) / 2, h);
      if (hours > 0) {
        remMap.set(id, +(h - hours).toFixed(2));
        assignments.push({ topicId: id, title: nameMap.get(id) || '', hours, kind: 'study' });
      }
    });

    days.push({
      date, kind: 'study',
      totalHours: +assignments.reduce((s, a) => s + a.hours, 0).toFixed(2),
      assignments,
    });
  }

  return { days, dailyLoad, totalRemaining, studyDays, examDays };
}

/* ════════════════════════════════════════════════════════
   AI Workout Plan Generator
   Builds a split based on weekly availability, rep/rest
   scheme by goal, and volume by level & intensity.
   ════════════════════════════════════════════════════════ */
const POOL: Record<string, string[]> = {
  push: ['Bench Press', 'Push-ups', 'Overhead Press', 'Incline DB Press', 'Dips', 'Lateral Raises'],
  pull: ['Pull-ups', 'Barbell Row', 'Lat Pulldown', 'Face Pulls', 'Barbell Curl', 'Seated Cable Row'],
  legs: ['Back Squat', 'Romanian Deadlift', 'Walking Lunges', 'Leg Press', 'Calf Raises', 'Bulgarian Split Squat'],
  core: ['Plank', 'Hanging Leg Raises', 'Russian Twists', 'Cable Crunches', 'Ab Wheel Rollout'],
  full: ['Burpees', 'Kettlebell Swings', 'Goblet Squats', 'Thrusters', 'Mountain Climbers', 'Renegade Rows'],
};

const DAY_NAMES = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

interface Split { focus: string; groups: string[] }

function splitFor(n: number): Split[] {
  if (n <= 2) return [
    { focus: 'Full Body A', groups: ['full', 'core'] },
    { focus: 'Full Body B', groups: ['full', 'core'] },
  ];
  if (n === 3) return [
    { focus: 'Push Day', groups: ['push', 'core'] },
    { focus: 'Pull Day', groups: ['pull', 'core'] },
    { focus: 'Leg Day', groups: ['legs', 'core'] },
  ];
  if (n === 4) return [
    { focus: 'Push Day', groups: ['push'] },
    { focus: 'Pull Day', groups: ['pull'] },
    { focus: 'Leg Day', groups: ['legs'] },
    { focus: 'Full Body + Core', groups: ['full', 'core'] },
  ];
  if (n === 5) return [
    { focus: 'Push Day', groups: ['push'] },
    { focus: 'Pull Day', groups: ['pull'] },
    { focus: 'Leg Day', groups: ['legs'] },
    { focus: 'Upper Mix', groups: ['push', 'pull'] },
    { focus: 'Legs + Core', groups: ['legs', 'core'] },
  ];
  if (n === 6) return [
    { focus: 'Push', groups: ['push'] },
    { focus: 'Pull', groups: ['pull'] },
    { focus: 'Legs', groups: ['legs'] },
    { focus: 'Push (Volume)', groups: ['push', 'core'] },
    { focus: 'Pull (Volume)', groups: ['pull', 'core'] },
    { focus: 'Legs (Volume)', groups: ['legs', 'core'] },
  ];
  return [
    { focus: 'Push', groups: ['push'] },
    { focus: 'Pull', groups: ['pull'] },
    { focus: 'Legs', groups: ['legs'] },
    { focus: 'Push', groups: ['push'] },
    { focus: 'Pull', groups: ['pull'] },
    { focus: 'Legs', groups: ['legs'] },
    { focus: 'Active Recovery', groups: ['core'] },
  ];
}

const SCHEME: Record<FitnessGoal, { sets: number; reps: string; rest: number; cardio: number }> = {
  cut: { sets: 3, reps: '12–15', rest: 45, cardio: 20 },
  bulk: { sets: 4, reps: '8–10', rest: 100, cardio: 8 },
  endurance: { sets: 3, reps: '15–20', rest: 30, cardio: 25 },
  loss: { sets: 3, reps: '12–15', rest: 60, cardio: 25 },
};

export function generateWorkoutPlan(p: FitnessProfile): WorkoutPlanDay[] {
  const scheme = SCHEME[p.goal];
  let sets = scheme.sets + (p.intensity === 'heavy' ? 1 : p.intensity === 'light' ? -1 : 0);
  sets = Math.min(5, Math.max(2, sets));
  const rest = scheme.rest + (p.intensity === 'light' ? 15 : 0) + (p.level === 'beginner' ? 20 : 0);
  const perGroup = p.level === 'beginner' ? 2 : 3;
  const splits = splitFor(p.daysPerWeek);

  return splits.map((split, di) => {
    const exercises: PlanExercise[] = [];
    split.groups.forEach((g, gi) => {
      const pool = POOL[g];
      for (let k = 0; k < perGroup && k < pool.length; k++) {
        exercises.push({
          name: pool[(k * 2 + di + gi) % pool.length],
          sets,
          reps: g === 'core' ? '15 reps / 45s' : scheme.reps,
          rest: g === 'core' ? Math.min(rest, 30) : rest,
        });
      }
    });

    const skipCardio = p.goal === 'bulk' && di % 2 === 1;
    const cardioMin = skipCardio ? 0 : scheme.cardio;
    const cardioName = p.goal === 'endurance'
      ? 'Steady-State Run'
      : p.goal === 'bulk' ? 'Incline Walk (Warm-up)'
      : di % 2 === 0 ? 'HIIT Sprints' : 'Tempo Run';

    const strengthMin = exercises.reduce((s, e) => s + e.sets * 1.6, 0);
    const estMinutes = Math.min(p.minutesPerDay, Math.round(strengthMin + cardioMin + 8));
    const estBurn = Math.round(((strengthMin * 4.2 + cardioMin * 8.5) * p.weight) / 60);

    return {
      day: DAY_NAMES[di % 7],
      focus: split.focus,
      exercises,
      cardio: cardioMin > 0 ? { name: cardioName, minutes: cardioMin } : undefined,
      estMinutes,
      estBurn,
    };
  });
}
