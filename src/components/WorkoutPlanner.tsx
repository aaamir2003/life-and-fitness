import { useState } from 'react';
import {
  Dumbbell, Flame, HeartPulse, Target, Scissors, Cpu,
  Check, Trash2, History, Clock3, Zap,
} from 'lucide-react';
import type { FitnessProfile, WorkoutPlanDay, Workout, FitnessGoal } from '../types';
import { generateWorkoutPlan } from '../utils/planner';
import { generateId, getToday, formatDate, formatMinutes } from '../utils/helpers';

interface WorkoutPlannerProps {
  profile: FitnessProfile | null;
  setProfile: React.Dispatch<React.SetStateAction<FitnessProfile | null>>;
  plan: WorkoutPlanDay[] | null;
  setPlan: React.Dispatch<React.SetStateAction<WorkoutPlanDay[] | null>>;
  workouts: Workout[];
  setWorkouts: React.Dispatch<React.SetStateAction<Workout[]>>;
}

const GOALS: { v: FitnessGoal; label: string; desc: string; icon: React.ReactNode; on: string }[] = [
  { v: 'cut', label: 'Cut', desc: 'Fat loss, muscle retention', icon: <Scissors size={17} />, on: 'border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300' },
  { v: 'bulk', label: 'Bulk', desc: 'Maximize muscle growth', icon: <Dumbbell size={17} />, on: 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300' },
  { v: 'endurance', label: 'Endurance', desc: 'Stamina & conditioning', icon: <HeartPulse size={17} />, on: 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300' },
  { v: 'loss', label: 'Weight Loss', desc: 'Targeted, sustainable loss', icon: <Target size={17} />, on: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' },
];

export default function WorkoutPlanner({ profile, setProfile, plan, setPlan, workouts, setWorkouts }: WorkoutPlannerProps) {
  const [form, setForm] = useState<FitnessProfile>(profile || {
    goal: 'cut', weight: 70, level: 'intermediate', intensity: 'moderate', daysPerWeek: 4, minutesPerDay: 60,
  });
  const [expanded, setExpanded] = useState<number | null>(0);

  const generate = () => {
    setProfile(form);
    setPlan(generateWorkoutPlan(form));
  };

  const logDay = (d: WorkoutPlanDay) => {
    setWorkouts(prev => [...prev, {
      id: generateId(), date: getToday(),
      type: form?.goal === 'endurance' || profile?.goal === 'endurance' ? 'endurance' : 'strength',
      name: `${d.focus} (AI plan)`, duration: d.estMinutes, caloriesBurned: d.estBurn,
    }]);
  };

  const today = getToday();
  const todayWorkouts = workouts.filter(w => w.date === today);
  const weekWorkouts = workouts.slice(-14);
  const totalBurn = workouts.reduce((s, w) => s + w.caloriesBurned, 0);
  const totalMin = workouts.reduce((s, w) => s + w.duration, 0);

  const goalLabel: Record<string, string> = { cut: 'Cut', bulk: 'Bulk', endurance: 'Endurance', loss: 'Weight Loss' };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 anim-in">
      {/* Profile + generator */}
      <div className="lg:col-span-2 space-y-4">
        <div className="glass p-6">
          <h3 className="font-display font-semibold text-lg text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Cpu size={19} className="text-teal-600" /> Smart Workout Builder
          </h3>

          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500">Training goal</span>
          <div className="grid grid-cols-2 gap-2 mt-1 mb-4">
            {GOALS.map(g => (
              <button key={g.v} onClick={() => setForm(p => ({ ...p, goal: g.v }))}
                className={`flex items-start gap-2.5 p-3 rounded-xl border-2 text-left cursor-pointer transition-all active:scale-[0.98] ${
                  form.goal === g.v ? g.on : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                }`}>
                <span className="mt-0.5 shrink-0">{g.icon}</span>
                <span>
                  <span className="block text-sm font-bold">{g.label}</span>
                  <span className="block text-[10px] opacity-75 leading-tight mt-0.5">{g.desc}</span>
                </span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <label className="block">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500">Body weight (kg)</span>
              <input type="number" min={30} max={250} value={form.weight} className="field mt-1 font-mono"
                onChange={e => setForm(p => ({ ...p, weight: +e.target.value }))} />
            </label>
            <label className="block">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500">Fitness level</span>
              <select value={form.level} className="field mt-1"
                onChange={e => setForm(p => ({ ...p, level: e.target.value as FitnessProfile['level'] }))}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </label>
          </div>

          <label className="block mb-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500">Session intensity</span>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {(['light', 'moderate', 'heavy'] as const).map(i => (
                <button key={i} onClick={() => setForm(p => ({ ...p, intensity: i }))}
                  className={`py-2 rounded-xl text-xs font-bold capitalize cursor-pointer transition-all active:scale-95 ${
                    form.intensity === i
                      ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/25'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}>
                  {i}
                </button>
              ))}
            </div>
          </label>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <label className="block">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500">Days / week</span>
              <select value={form.daysPerWeek} className="field mt-1 font-mono"
                onChange={e => setForm(p => ({ ...p, daysPerWeek: +e.target.value }))}>
                {[2, 3, 4, 5, 6, 7].map(n => <option key={n} value={n}>{n} days</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500">Time / session</span>
              <select value={form.minutesPerDay} className="field mt-1 font-mono"
                onChange={e => setForm(p => ({ ...p, minutesPerDay: +e.target.value }))}>
                {[30, 45, 60, 75, 90].map(n => <option key={n} value={n}>{n} min</option>)}
              </select>
            </label>
          </div>

          <button onClick={generate}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold text-sm shadow-lg shadow-teal-600/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2">
            <Cpu size={16} /> {plan ? 'Regenerate Program' : 'Build My Program'}
          </button>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 text-center">
            Engine adapts split, volume, rest times and cardio to your goal & schedule.
          </p>
        </div>

        {/* History */}
        <div className="glass p-5">
          <h3 className="font-display font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
            <History size={17} className="text-amber-500" /> Performance History
          </h3>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { l: 'Sessions', v: `${workouts.length}`, c: 'text-slate-700 dark:text-slate-200' },
              { l: 'Total time', v: formatMinutes(totalMin), c: 'text-sky-600 dark:text-sky-400' },
              { l: 'Total burn', v: `${totalBurn}`, c: 'text-amber-600 dark:text-amber-400' },
            ].map((s, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 text-center">
                <p className={`font-mono font-bold text-sm tabular ${s.c}`}>{s.v}</p>
                <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
          {weekWorkouts.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">No workouts logged yet.</p>
          ) : (
            <ul className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {[...weekWorkouts].reverse().map(w => (
                <li key={w.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50/70 dark:bg-slate-800/40 group">
                  <span className="font-mono text-[10px] text-slate-400 tabular w-12 shrink-0">{formatDate(w.date)}</span>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300 flex-1 truncate">{w.name}</span>
                  <span className="font-mono text-[10px] text-slate-400 tabular shrink-0">{w.duration}m</span>
                  <span className="font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400 tabular shrink-0">{w.caloriesBurned} kcal</span>
                  <button onClick={() => setWorkouts(prev => prev.filter(x => x.id !== w.id))}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:text-rose-500 text-slate-400 cursor-pointer transition-all shrink-0">
                    <Trash2 size={12} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Generated plan */}
      <div className="lg:col-span-3">
        {!plan ? (
          <div className="glass p-12 text-center h-full flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-100/80 dark:bg-amber-900/30 flex items-center justify-center mb-4">
              <Dumbbell size={30} className="text-amber-500" />
            </div>
            <p className="font-display font-semibold text-slate-700 dark:text-slate-200 mb-1">No program yet</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs">
              Choose a goal, set your level and weekly availability — the engine builds a full split with sets, reps and rest.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Program summary */}
            <div className="glass p-4 flex items-center gap-4 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500">AI Program</span>
              <span className="px-2.5 py-1 rounded-lg bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs font-bold">
                {goalLabel[profile?.goal || form.goal]}
              </span>
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400 tabular">{plan.length} days/week</span>
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400 tabular">
                ~{plan.reduce((s, d) => s + d.estBurn, 0)} kcal/week burn
              </span>
              {todayWorkouts.length > 0 && (
                <span className="ml-auto flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <Check size={14} /> Trained today
                </span>
              )}
            </div>

            {plan.map((d, di) => {
              const open = expanded === di;
              return (
                <div key={di} className="glass overflow-hidden">
                  <button onClick={() => setExpanded(open ? null : di)}
                    className="w-full p-4 flex items-center gap-3 text-left cursor-pointer hover:bg-white/30 dark:hover:bg-white/[0.03] transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 text-white flex items-center justify-center font-mono font-bold text-sm shrink-0 shadow-md shadow-teal-600/20">
                      {di + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-semibold text-sm text-slate-800 dark:text-slate-100">{d.day} — {d.focus}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono tabular">
                        {d.exercises.length} exercises · ~{d.estMinutes} min · ~{d.estBurn} kcal
                      </p>
                    </div>
                    <ChevronIcon open={open} />
                  </button>
                  {open && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-200/60 dark:border-slate-700/50 anim-pop">
                      <ul className="mt-3 space-y-1.5">
                        {d.exercises.map((ex, i) => (
                          <li key={i} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 p-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-800/40">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2 min-w-0">
                              <Zap size={12} className="text-amber-500 shrink-0" />
                              <span className="truncate">{ex.name}</span>
                            </span>
                            <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-300 tabular shrink-0">{ex.sets} × {ex.reps}</span>
                            <span className="font-mono text-[10px] text-slate-400 tabular shrink-0 flex items-center gap-1">
                              <Clock3 size={10} /> {ex.rest}s rest
                            </span>
                          </li>
                        ))}
                      </ul>
                      {d.cardio && (
                        <div className="mt-2 flex items-center gap-2 p-2.5 rounded-lg bg-rose-50/80 dark:bg-rose-900/15 text-rose-700 dark:text-rose-300">
                          <Flame size={14} />
                          <span className="text-xs font-semibold">{d.cardio.name} — {d.cardio.minutes} min</span>
                        </div>
                      )}
                      <button onClick={() => logDay(d)}
                        className="mt-3 w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer">
                        <Check size={14} /> Mark Done — log {d.estBurn} kcal burned
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round"
      className={`text-slate-400 shrink-0 transition-transform duration-300 ${open ? 'rotate-90' : ''}`}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
