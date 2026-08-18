import {
  Printer, BookOpen, Dumbbell, Flame, Target, Gamepad2,
  Award, TrendingUp, BarChart3, ClipboardList, Brain, CalendarDays,
} from 'lucide-react';
import type {
  Topic, StudyPlanResult, QuizAttempt, CalorieEntry, Workout,
  Goal, RecreationItem, UserProfile, WorkoutPlanDay, FitnessProfile,
} from '../types';
import { calculateTargetCalories, calculateTDEE } from '../utils/calories';
import { getToday, daysUntil, formatMinutes, formatSeconds } from '../utils/helpers';

interface ReportProps {
  topics: Topic[];
  examDate: string;
  plan: StudyPlanResult | null;
  attempts: QuizAttempt[];
  calorieEntries: CalorieEntry[];
  userProfile: UserProfile | null;
  workouts: Workout[];
  workoutPlan: WorkoutPlanDay[] | null;
  fitnessProfile: FitnessProfile | null;
  goals: Goal[];
  recreationItems: RecreationItem[];
  pomodoroTotal: number;
}

const GOAL_LABELS: Record<string, string> = { cut: 'Cut', bulk: 'Bulk', endurance: 'Endurance', loss: 'Weight Loss' };

export default function Report({
  topics, examDate, plan, attempts, calorieEntries, userProfile,
  workouts, workoutPlan, fitnessProfile, goals, recreationItems, pomodoroTotal,
}: ReportProps) {
  const today = getToday();
  const totalDone = topics.reduce((s, t) => s + Math.min(t.doneHours, t.estHours), 0);
  const totalEst = topics.reduce((s, t) => s + t.estHours, 0);
  const todayIntake = calorieEntries.filter(e => e.date === today).reduce((s, e) => s + e.kcal, 0);
  const totalBurn = workouts.reduce((s, w) => s + w.caloriesBurned, 0);
  const totalWorkMin = workouts.reduce((s, w) => s + w.duration, 0);
  const goalsDone = goals.filter(g => g.completed).length;
  const avgQuiz = attempts.length ? Math.round(attempts.reduce((s, a) => s + (a.correct / a.total) * 100, 0) / attempts.length) : null;
  const targetCal = userProfile ? calculateTargetCalories(userProfile) : 2000;
  const daysLeft = examDate ? daysUntil(examDate) : null;

  const studyScore = totalEst > 0 ? Math.min((totalDone / totalEst) * 100, 100) : 0;
  const quizScore = avgQuiz ?? 0;
  const fitnessScore = Math.min(workouts.length * 12, 100);
  const goalsScore = goals.length > 0 ? (goalsDone / goals.length) * 100 : 0;
  const overall = Math.round((studyScore * 0.35 + quizScore * 0.25 + fitnessScore * 0.2 + goalsScore * 0.2));

  return (
    <div className="space-y-5 anim-in">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 no-print flex-wrap">
        <div>
          <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 size={22} className="text-teal-600" /> Performance Report
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Full-spectrum view of study, quizzes, nutrition and training.</p>
        </div>
        <button onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold text-sm shadow-lg shadow-teal-600/25 active:scale-95 transition-all cursor-pointer">
          <Printer size={16} /> Print / Save PDF
        </button>
      </div>

      {/* Print header */}
      <div className="print-only text-center mb-6 border-b-2 border-slate-200 pb-4">
        <h1 className="font-display font-bold text-2xl text-slate-900">AI Life & Fitness Manager — Performance Report</h1>
        <p className="text-sm text-slate-500 mt-1">
          Generated {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Overview tiles */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { l: 'Study hours', v: `${totalDone.toFixed(1)}h`, i: <BookOpen size={16} />, c: 'from-sky-500 to-teal-500' },
          { l: 'Quiz average', v: avgQuiz !== null ? `${avgQuiz}%` : '—', i: <ClipboardList size={16} />, c: 'from-teal-500 to-emerald-500' },
          { l: 'Workouts', v: `${workouts.length}`, i: <Dumbbell size={16} />, c: 'from-emerald-500 to-lime-500' },
          { l: 'Kcal burned', v: `${totalBurn}`, i: <Flame size={16} />, c: 'from-amber-500 to-orange-500' },
          { l: 'Goals done', v: `${goalsDone}/${goals.length}`, i: <Target size={16} />, c: 'from-rose-500 to-amber-500' },
        ].map((s, i) => (
          <div key={i} className="glass p-4">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.c} flex items-center justify-center text-white mb-2.5 shadow-md`}>{s.i}</div>
            <p className="font-mono font-bold text-xl text-slate-800 dark:text-slate-100 tabular">{s.v}</p>
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mt-0.5">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Study */}
        <div className="glass p-5">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
            <BookOpen size={15} className="text-sky-600" /> Study & Exam
          </h3>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 text-center">
              <p className="font-mono font-bold text-lg text-slate-700 dark:text-slate-100 tabular">{totalDone.toFixed(1)}/{totalEst.toFixed(0)}h</p>
              <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400">volume done</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 text-center">
              <p className="font-mono font-bold text-lg text-sky-600 dark:text-sky-400 tabular">{formatMinutes(pomodoroTotal)}</p>
              <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400">focus time</p>
            </div>
          </div>
          {examDate && (
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-2 font-mono tabular">
              <CalendarDays size={12} /> Exam: {examDate}{daysLeft !== null && daysLeft > 0 ? ` · ${daysLeft} days left` : ''}
            </p>
          )}
          {plan && (
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-2 font-mono tabular">
              <Brain size={12} className="text-teal-600" /> AI plan: {plan.dailyLoad}h/day · {plan.totalRemaining}h remaining
            </p>
          )}
          <div className="h-2 rounded-full bg-slate-200/80 dark:bg-slate-700 overflow-hidden mb-3">
            <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-teal-500 anim-bar" style={{ width: `${studyScore}%` }} />
          </div>
          {topics.length > 0 && (
            <ul className="space-y-1.5">
              {topics.map(t => (
                <li key={t.id} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                  <span className="text-xs text-slate-600 dark:text-slate-300 flex-1 truncate">{t.title}</span>
                  <span className="font-mono text-[10px] text-slate-400 tabular">{Math.min(t.doneHours, t.estHours).toFixed(1)}/{t.estHours}h</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quiz */}
        <div className="glass p-5">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
            <ClipboardList size={15} className="text-teal-600" /> Quiz Performance
          </h3>
          {attempts.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 py-6 text-center">No quiz attempts recorded yet.</p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 text-center">
                  <p className="font-mono font-bold text-lg text-teal-600 dark:text-teal-300 tabular">{avgQuiz}%</p>
                  <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400">average</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 text-center">
                  <p className="font-mono font-bold text-lg text-emerald-600 dark:text-emerald-400 tabular">
                    {Math.max(...attempts.map(a => Math.round((a.correct / a.total) * 100)))}%
                  </p>
                  <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400">best</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 text-center">
                  <p className="font-mono font-bold text-lg text-slate-700 dark:text-slate-100 tabular">{attempts.length}</p>
                  <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400">attempts</p>
                </div>
              </div>
              <ul className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {attempts.slice(0, 10).map(a => {
                  const pct = Math.round((a.correct / a.total) * 100);
                  return (
                    <li key={a.id}>
                      <div className="flex justify-between text-[11px] mb-0.5">
                        <span className="text-slate-500 dark:text-slate-400 truncate">{a.subject} · {formatSeconds(a.seconds)}</span>
                        <span className="font-mono font-bold text-slate-600 dark:text-slate-300 tabular">{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-200/80 dark:bg-slate-700 overflow-hidden">
                        <div className={`h-full rounded-full ${pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>

        {/* Nutrition */}
        <div className="glass p-5">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
            <Flame size={15} className="text-amber-500" /> Nutrition
          </h3>
          {userProfile ? (
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 text-center">
                <p className="font-mono font-bold text-lg text-slate-700 dark:text-slate-100 tabular">{calculateTDEE(userProfile)}</p>
                <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400">TDEE</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 text-center">
                <p className="font-mono font-bold text-lg text-teal-600 dark:text-teal-300 tabular">{targetCal}</p>
                <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400">target</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 text-center">
                <p className={`font-mono font-bold text-lg tabular ${todayIntake > targetCal ? 'text-rose-500' : 'text-amber-600 dark:text-amber-400'}`}>{todayIntake}</p>
                <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400">today</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">No metabolic profile set — using 2,000 kcal default target.</p>
          )}
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-slate-500 dark:text-slate-400">Today's intake vs target</span>
            <span className="font-mono font-bold text-slate-600 dark:text-slate-300 tabular">{Math.round((todayIntake / targetCal) * 100)}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-200/80 dark:bg-slate-700 overflow-hidden mb-3">
            <div className={`h-full rounded-full ${todayIntake > targetCal ? 'bg-rose-500' : 'bg-gradient-to-r from-teal-400 to-emerald-500'}`}
              style={{ width: `${Math.min((todayIntake / targetCal) * 100, 100)}%` }} />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular">{calorieEntries.length} meal entries tracked all-time.</p>
        </div>

        {/* Training */}
        <div className="glass p-5">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
            <Dumbbell size={15} className="text-emerald-600" /> Training
          </h3>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 text-center">
              <p className="font-mono font-bold text-lg text-slate-700 dark:text-slate-100 tabular">{workouts.length}</p>
              <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400">sessions</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 text-center">
              <p className="font-mono font-bold text-lg text-sky-600 dark:text-sky-400 tabular">{formatMinutes(totalWorkMin)}</p>
              <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400">volume</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 text-center">
              <p className="font-mono font-bold text-lg text-amber-600 dark:text-amber-400 tabular">{totalBurn}</p>
              <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400">kcal</p>
            </div>
          </div>
          {fitnessProfile && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-mono">
              Goal: <strong className="text-teal-600 dark:text-teal-300">{GOAL_LABELS[fitnessProfile.goal]}</strong> · {fitnessProfile.daysPerWeek} days/wk · {fitnessProfile.level}
            </p>
          )}
          {workoutPlan && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-mono">
              AI program: {workoutPlan.map(d => d.focus).join(' → ')}
            </p>
          )}
          {workouts.length > 0 && (
            <ul className="space-y-1.5">
              {[...workouts].reverse().slice(0, 5).map(w => (
                <li key={w.id} className="flex items-center gap-2 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-300 flex-1 truncate">{w.name}</span>
                  <span className="font-mono text-[10px] text-slate-400 tabular">{w.duration}m · {w.caloriesBurned} kcal</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Goals */}
        <div className="glass p-5">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
            <Target size={15} className="text-amber-600" /> Goals
          </h3>
          {(['short', 'mid', 'long'] as const).map(cat => {
            const cg = goals.filter(g => g.category === cat);
            if (cg.length === 0) return null;
            const done = cg.filter(g => g.completed).length;
            const label = cat === 'short' ? 'Short-term' : cat === 'mid' ? 'Mid-term' : 'Long-term';
            return (
              <div key={cat} className="mb-3">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-500 dark:text-slate-400">{label}</span>
                  <span className="font-mono font-bold text-slate-600 dark:text-slate-300 tabular">{done}/{cg.length}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200/80 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500" style={{ width: `${(done / cg.length) * 100}%` }} />
                </div>
              </div>
            );
          })}
          {goals.length === 0 && <p className="text-sm text-slate-400 dark:text-slate-500 py-4 text-center">No goals defined yet.</p>}
        </div>

        {/* Leisure */}
        <div className="glass p-5">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
            <Gamepad2 size={15} className="text-rose-500" /> Life Balance
          </h3>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 text-center">
              <p className="font-mono font-bold text-lg text-slate-700 dark:text-slate-100 tabular">{recreationItems.length}</p>
              <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400">activities</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 text-center">
              <p className="font-mono font-bold text-lg text-emerald-600 dark:text-emerald-400 tabular">{recreationItems.filter(i => i.status === 'completed').length}</p>
              <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400">enjoyed</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 text-center">
              <p className="font-mono font-bold text-lg text-sky-600 dark:text-sky-400 tabular">{recreationItems.filter(i => i.status === 'in-progress').length}</p>
              <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400">in progress</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Rest is part of the plan — {recreationItems.length > 0 ? 'your balance activities keep burnout away.' : 'schedule downtime to sustain performance.'}
          </p>
        </div>
      </div>

      {/* Overall score */}
      <div className="glass p-6">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
          <TrendingUp size={15} className="text-teal-600" /> Overall Performance Index
        </h3>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-32 h-32 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" strokeWidth="9" className="stroke-slate-200 dark:stroke-slate-700" />
              <circle cx="60" cy="60" r="52" fill="none" strokeWidth="9" strokeLinecap="round"
                className="stroke-teal-500"
                strokeDasharray={`${(2 * Math.PI * 52 * overall) / 100} ${2 * Math.PI * 52}`} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono font-bold text-3xl text-teal-600 dark:text-teal-300 tabular">{overall}</span>
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">/ 100</span>
            </div>
          </div>
          <div className="flex-1 w-full space-y-3">
            {[
              { label: 'Study volume (35%)', score: studyScore, color: 'bg-sky-500' },
              { label: 'Quiz accuracy (25%)', score: quizScore, color: 'bg-teal-500' },
              { label: 'Training consistency (20%)', score: fitnessScore, color: 'bg-emerald-500' },
              { label: 'Goal completion (20%)', score: goalsScore, color: 'bg-amber-500' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-500 dark:text-slate-400">{item.label}</span>
                  <span className="font-mono font-bold text-slate-600 dark:text-slate-300 tabular">{Math.round(item.score)}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200/80 dark:bg-slate-700 overflow-hidden">
                  <div className={`h-full rounded-full ${item.color} anim-bar`} style={{ width: `${item.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="print-only text-center text-xs text-slate-400 pt-3 border-t border-slate-200">
        <p>Generated by AI Life & Fitness Manager · {new Date().toLocaleDateString()}</p>
      </div>

      <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 no-print">
        <Award size={13} /> Report auto-saves as you log — print anytime for a clean PDF without navigation.
      </div>
    </div>
  );
}
