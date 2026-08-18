import {
  Brain, Flame, Dumbbell, Target, GraduationCap, ClipboardList,
  Lightbulb, CalendarDays, TrendingUp, Utensils, BookOpen, BarChart3,
} from 'lucide-react';
import type {
  Topic, StudyPlanResult, QuizAttempt, CalorieEntry,
  Workout, Goal, UserProfile, WorkoutPlanDay,
} from '../types';
import { getToday, getDailyQuote, daysUntil, greeting, formatMinutes } from '../utils/helpers';
import { calculateTargetCalories } from '../utils/calories';

interface DashboardProps {
  topics: Topic[];
  examDate: string;
  plan: StudyPlanResult | null;
  attempts: QuizAttempt[];
  calorieEntries: CalorieEntry[];
  workouts: Workout[];
  workoutPlan: WorkoutPlanDay[] | null;
  goals: Goal[];
  userProfile: UserProfile | null;
  pomodoroTotal: number;
  onNavigate: (tab: 'study' | 'fitness' | 'goals' | 'recreation' | 'report') => void;
}

export default function Dashboard({
  topics, examDate, plan, attempts, calorieEntries, workouts, workoutPlan,
  goals, userProfile, pomodoroTotal, onNavigate,
}: DashboardProps) {
  const today = getToday();
  const quote = getDailyQuote();
  const targetCal = userProfile ? calculateTargetCalories(userProfile) : 2000;

  const daysLeft = examDate ? daysUntil(examDate) : null;
  const remainingHours = topics.reduce((s, t) => s + Math.max(0, t.estHours - t.doneHours), 0);
  const totalEst = topics.reduce((s, t) => s + t.estHours, 0);
  const totalDone = topics.reduce((s, t) => s + Math.min(t.doneHours, t.estHours), 0);

  const todayIntake = calorieEntries.filter(e => e.date === today).reduce((s, e) => s + e.kcal, 0);
  const todayBurn = workouts.filter(w => w.date === today).reduce((s, w) => s + w.caloriesBurned, 0);
  const todaySessions = workouts.filter(w => w.date === today).length;

  const goalsDone = goals.filter(g => g.completed).length;
  const avgQuiz = attempts.length ? Math.round(attempts.reduce((s, a) => s + (a.correct / a.total) * 100, 0) / attempts.length) : null;

  /* ── AI hints ── */
  const hints: { icon: React.ReactNode; text: string; tone: string }[] = [];
  if (daysLeft !== null && daysLeft > 0 && remainingHours > 0) {
    const load = remainingHours / daysLeft;
    hints.push({
      icon: <GraduationCap size={15} />,
      tone: 'text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-900/30',
      text: load <= 8
        ? `Exam in ${daysLeft} days — a sustainable ${load.toFixed(1)}h/day covers all ${remainingHours.toFixed(0)}h of remaining material.`
        : `Exam in ${daysLeft} days — you need ${load.toFixed(1)}h/day. Consider trimming scope or extending daily sessions.`,
    });
  } else if (topics.length === 0) {
    hints.push({
      icon: <Brain size={15} />,
      tone: 'text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/30',
      text: 'Add your topics and exam date in Study & Exam to unlock the AI planner.',
    });
  }

  const budget = targetCal - todayIntake;
  hints.push({
    icon: <Utensils size={15} />,
    tone: budget < 0 ? 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30' : 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30',
    text: budget >= 0
      ? `${budget} kcal remaining in today's budget (${todayIntake}/${targetCal} consumed).`
      : `You're ${-budget} kcal over today's budget — a walk could rebalance it.`,
  });

  if (todaySessions > 0) {
    hints.push({
      icon: <Dumbbell size={15} />,
      tone: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30',
      text: `${todaySessions} workout${todaySessions > 1 ? 's' : ''} logged today, ${todayBurn} kcal burned. Strong consistency!`,
    });
  } else if (workoutPlan) {
    hints.push({
      icon: <Dumbbell size={15} />,
      tone: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30',
      text: `No training yet today — your program suggests “${workoutPlan[0].focus}” (~${workoutPlan[0].estBurn} kcal).`,
    });
  } else {
    hints.push({
      icon: <Dumbbell size={15} />,
      tone: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30',
      text: 'Build a smart workout program — the engine adapts it to your goal and schedule.',
    });
  }

  if (avgQuiz !== null) {
    hints.push({
      icon: <ClipboardList size={15} />,
      tone: 'text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-900/30',
      text: `Quiz average is ${avgQuiz}% across ${attempts.length} attempt${attempts.length > 1 ? 's' : ''}. ${avgQuiz < 60 ? 'Retake weak subjects for spaced repetition.' : 'Keep testing to lock it in.'}`,
    });
  }

  const ringPct = Math.min((todayIntake / targetCal) * 100, 100);
  const studyPct = totalEst > 0 ? (totalDone / totalEst) * 100 : 0;
  const activeTasks = [
    ...topics.filter(t => t.doneHours < t.estHours).slice(0, 3).map(t => ({ id: t.id, label: t.title, tag: 'topic' })),
    ...goals.filter(g => !g.completed && g.category === 'short').slice(0, 3).map(g => ({ id: g.id, label: g.title, tag: 'goal' })),
  ];

  return (
    <div className="space-y-5">
      {/* ═══ Row 1: Briefing + Energy ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* AI Briefing */}
        <div className="lg:col-span-7 glass p-6 anim-in relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-teal-500/10 dark:bg-teal-400/10 pointer-events-none" />
          <div className="relative">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-teal-600 dark:text-teal-400 mb-1 flex items-center gap-1.5">
                  <Brain size={12} /> AI Daily Briefing
                </p>
                <h2 className="font-display font-bold text-2xl md:text-[27px] text-slate-900 dark:text-white leading-tight">
                  {greeting()}, achiever.
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-mono">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
              {daysLeft !== null && daysLeft > 0 && (
                <div className="text-right shrink-0">
                  <p className="font-display font-bold text-4xl text-rose-600 dark:text-rose-400 tabular leading-none">D-{daysLeft}</p>
                  <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mt-1">to exam</p>
                </div>
              )}
            </div>

            <ul className="space-y-2.5 mb-5">
              {hints.slice(0, 3).map((h, i) => (
                <li key={i} className="flex items-start gap-3 anim-in" style={{ animationDelay: `${120 + i * 90}ms` }}>
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${h.tone}`}>{h.icon}</span>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{h.text}</p>
                </li>
              ))}
            </ul>

            <blockquote className="border-l-2 border-teal-500/60 pl-3.5 py-0.5">
              <p className="text-sm italic text-slate-500 dark:text-slate-400">“{quote.text}”</p>
              <cite className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 not-italic">— {quote.author}</cite>
            </blockquote>
          </div>
        </div>

        {/* Energy balance */}
        <div className="lg:col-span-5 glass p-6 anim-in" style={{ animationDelay: '100ms' }}>
          <h3 className="font-display font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
            <Flame size={18} className="text-amber-500" /> Energy Balance — Today
          </h3>
          <div className="flex items-center gap-5">
            <div className="relative w-28 h-28 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" strokeWidth="10" className="stroke-slate-200 dark:stroke-slate-700" />
                <circle cx="60" cy="60" r="52" fill="none" strokeWidth="10" strokeLinecap="round"
                  className={todayIntake > targetCal ? 'stroke-rose-500' : 'stroke-amber-500'}
                  strokeDasharray={`${(2 * Math.PI * 52 * ringPct) / 100} ${2 * Math.PI * 52}`}
                  style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.22,0.9,0.35,1)' }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono font-bold text-lg text-slate-800 dark:text-slate-100 tabular">{todayIntake}</span>
                <span className="text-[9px] font-mono text-slate-400">/ {targetCal}</span>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-900/15">
                <span className="text-xs text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1.5"><Utensils size={13} /> Intake</span>
                <span className="font-mono font-bold text-sm text-amber-700 dark:text-amber-300 tabular">{todayIntake} kcal</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-900/15">
                <span className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1.5"><Dumbbell size={13} /> Burned</span>
                <span className="font-mono font-bold text-sm text-emerald-700 dark:text-emerald-300 tabular">{todayBurn} kcal</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/60">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Net</span>
                <span className={`font-mono font-bold text-sm tabular ${todayIntake - todayBurn > targetCal ? 'text-rose-500' : 'text-slate-700 dark:text-slate-200'}`}>
                  {todayIntake - todayBurn} kcal
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Row 2: Domain cards ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-5">
        {/* Study */}
        <div className="lg:col-span-4 glass p-5 anim-in" style={{ animationDelay: '140ms' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-sm">
              <BookOpen size={16} className="text-sky-600" /> Study Progress
            </h3>
            <button onClick={() => onNavigate('study')} className="text-[10px] font-mono uppercase tracking-widest text-teal-600 dark:text-teal-400 hover:underline cursor-pointer">Open →</button>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="font-mono font-bold text-3xl text-slate-800 dark:text-slate-100 tabular">{totalDone.toFixed(1)}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono tabular">/ {totalEst.toFixed(0)}h studied</span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-200/80 dark:bg-slate-700 overflow-hidden mb-3">
            <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-teal-500 anim-bar" style={{ width: `${studyPct}%` }} />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-400 dark:text-slate-500 tabular">
            <span>{topics.length} topics</span>
            <span>{formatMinutes(pomodoroTotal)} focused</span>
            {plan && <span className="text-teal-600 dark:text-teal-400 font-bold">{plan.dailyLoad}h/day plan</span>}
          </div>
        </div>

        {/* Workouts */}
        <div className="lg:col-span-4 glass p-5 anim-in" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-sm">
              <Dumbbell size={16} className="text-emerald-600" /> Training
            </h3>
            <button onClick={() => onNavigate('fitness')} className="text-[10px] font-mono uppercase tracking-widest text-teal-600 dark:text-teal-400 hover:underline cursor-pointer">Open →</button>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="font-mono font-bold text-3xl text-slate-800 dark:text-slate-100 tabular">{workouts.length}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono tabular">sessions logged</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-lg bg-slate-50/80 dark:bg-slate-800/50 text-center">
              <p className="font-mono font-bold text-sm text-amber-600 dark:text-amber-400 tabular">{todayBurn}</p>
              <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400">kcal today</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-50/80 dark:bg-slate-800/50 text-center">
              <p className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400 tabular">
                {workoutPlan ? workoutPlan.length + 'd/wk' : '—'}
              </p>
              <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400">program</p>
            </div>
          </div>
        </div>

        {/* Goals + Quiz */}
        <div className="sm:col-span-2 lg:col-span-4 grid grid-rows-2 gap-5">
          <div className="glass p-5 anim-in" style={{ animationDelay: '260ms' }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-sm">
                <Target size={16} className="text-amber-600" /> Goals
              </h3>
              <button onClick={() => onNavigate('goals')} className="text-[10px] font-mono uppercase tracking-widest text-teal-600 dark:text-teal-400 hover:underline cursor-pointer">Open →</button>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-2xl text-slate-800 dark:text-slate-100 tabular">{goalsDone}<span className="text-sm text-slate-400">/{goals.length}</span></span>
              <div className="flex-1 h-2 rounded-full bg-slate-200/80 dark:bg-slate-700 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 anim-bar"
                  style={{ width: `${goals.length ? (goalsDone / goals.length) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
          <div className="glass p-5 anim-in" style={{ animationDelay: '320ms' }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-sm">
                <ClipboardList size={16} className="text-sky-600" /> Quiz Score
              </h3>
              <button onClick={() => onNavigate('study')} className="text-[10px] font-mono uppercase tracking-widest text-teal-600 dark:text-teal-400 hover:underline cursor-pointer">Open →</button>
            </div>
            {avgQuiz !== null ? (
              <div className="flex items-center gap-3">
                <span className={`font-mono font-bold text-2xl tabular ${avgQuiz >= 70 ? 'text-emerald-600 dark:text-emerald-400' : avgQuiz >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-500'}`}>
                  {avgQuiz}%
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">{attempts.length} attempts · avg accuracy</span>
              </div>
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500">Take your first quiz to see analytics here.</p>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Row 3: Tasks + quick actions ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 glass p-5 anim-in" style={{ animationDelay: '360ms' }}>
          <h3 className="font-display font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-sm mb-3">
            <TrendingUp size={16} className="text-teal-600" /> Priority Queue
            <span className="text-[10px] font-mono text-slate-400 ml-auto tabular">{activeTasks.length} active</span>
          </h3>
          {activeTasks.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 py-6 text-center">
              All clear! Add topics or short-term goals to build your queue.
            </p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeTasks.slice(0, 6).map(t => (
                <li key={t.id} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 hover:bg-teal-50/70 dark:hover:bg-teal-900/15 transition-colors">
                  <span className={`w-1.5 h-8 rounded-full shrink-0 ${t.tag === 'topic' ? 'bg-sky-500' : 'bg-amber-500'}`} />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate flex-1">{t.label}</span>
                  <span className="text-[8px] font-mono uppercase tracking-widest text-slate-400 shrink-0">{t.tag}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-5 glass p-5 anim-in" style={{ animationDelay: '420ms' }}>
          <h3 className="font-display font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-sm mb-3">
            <Lightbulb size={16} className="text-amber-500" /> Jump In
          </h3>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { l: 'Log a meal', t: 'fitness' as const, i: <Utensils size={17} />, c: 'from-amber-500 to-orange-500' },
              { l: 'Take a quiz', t: 'study' as const, i: <ClipboardList size={17} />, c: 'from-sky-500 to-teal-500' },
              { l: 'Full report', t: 'report' as const, i: <BarChart3 size={17} />, c: 'from-emerald-500 to-teal-600' },
            ].map((a, i) => (
              <button key={i} onClick={() => onNavigate(a.t)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br ${a.c} text-white font-semibold text-xs shadow-lg active:scale-95 hover:scale-[1.03] transition-transform cursor-pointer`}>
                {a.i}{a.l}
              </button>
            ))}
          </div>
          {examDate && daysLeft !== null && daysLeft > 0 && (
            <p className="mt-3 text-[11px] font-mono text-slate-400 dark:text-slate-500 flex items-center gap-1.5 tabular">
              <CalendarDays size={12} /> Exam locked: {examDate} · {daysLeft} days out
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
