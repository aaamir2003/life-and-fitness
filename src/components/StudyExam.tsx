import { useMemo, useState } from 'react';
import {
  Brain, Plus, Trash2, CalendarDays, Cpu, GraduationCap,
  ClipboardList, ChevronRight, Check, Timer, ListChecks, Award, TrendingUp,
} from 'lucide-react';
import type { Topic, StudyPlanResult, QuizQuestion, QuizAttempt } from '../types';
import { generateStudyPlan } from '../utils/planner';
import { QUIZ_BANK } from '../data/quizBank';
import { generateId, getToday, daysUntil, formatDate, formatSeconds, shuffle, TOPIC_COLORS } from '../utils/helpers';
import PomodoroTimer from './PomodoroTimer';

interface StudyExamProps {
  topics: Topic[];
  setTopics: React.Dispatch<React.SetStateAction<Topic[]>>;
  examDate: string;
  setExamDate: React.Dispatch<React.SetStateAction<string>>;
  plan: StudyPlanResult | null;
  setPlan: React.Dispatch<React.SetStateAction<StudyPlanResult | null>>;
  customQuestions: QuizQuestion[];
  setCustomQuestions: React.Dispatch<React.SetStateAction<QuizQuestion[]>>;
  attempts: QuizAttempt[];
  setAttempts: React.Dispatch<React.SetStateAction<QuizAttempt[]>>;
  pomodoroTotal: number;
  onPomodoroComplete: (minutes: number, topicId: string) => void;
}

interface Session {
  qs: QuizQuestion[];
  idx: number;
  picked: number | null;
  startedAt: number;
  correctCount: number;
  subject: string;
}

const DIFF_COLORS: Record<string, string> = {
  easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  hard: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
};

const KIND_STYLES: Record<string, string> = {
  study: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  review: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  mock: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  rest: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
};

export default function StudyExam(props: StudyExamProps) {
  const {
    topics, setTopics, examDate, setExamDate, plan, setPlan,
    customQuestions, setCustomQuestions, attempts, setAttempts,
    pomodoroTotal, onPomodoroComplete,
  } = props;

  const [view, setView] = useState<'plan' | 'quiz' | 'focus'>('plan');
  const [newTitle, setNewTitle] = useState('');
  const [newHours, setNewHours] = useState(10);
  const [newDiff, setNewDiff] = useState<Topic['difficulty']>('medium');

  // Quiz state
  const [quizSubject, setQuizSubject] = useState('Mixed');
  const [quizCount, setQuizCount] = useState(5);
  const [session, setSession] = useState<Session | null>(null);
  const [result, setResult] = useState<QuizAttempt | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [cq, setCq] = useState({ subject: '', question: '', o: ['', '', '', ''], correct: 0 });

  const pool = useMemo(() => [...QUIZ_BANK, ...customQuestions], [customQuestions]);
  const subjects = useMemo(() => [...new Set(pool.map(q => q.subject))], [pool]);

  const daysLeft = examDate ? daysUntil(examDate) : null;
  const totalRemaining = topics.reduce((s, t) => s + Math.max(0, t.estHours - t.doneHours), 0);
  const totalEst = topics.reduce((s, t) => s + t.estHours, 0);
  const totalDone = topics.reduce((s, t) => s + Math.min(t.doneHours, t.estHours), 0);

  /* ── Topics ── */
  const addTopic = () => {
    if (!newTitle.trim()) return;
    setTopics(prev => [...prev, {
      id: generateId(), title: newTitle.trim(), estHours: newHours || 1, doneHours: 0,
      difficulty: newDiff, color: TOPIC_COLORS[prev.length % TOPIC_COLORS.length],
    }]);
    setNewTitle('');
  };

  const logHours = (id: string, h: number) => {
    setTopics(prev => prev.map(t => t.id === id ? { ...t, doneHours: Math.min(t.estHours, +(t.doneHours + h).toFixed(2)) } : t));
  };

  const runPlanner = () => {
    if (!examDate || topics.length === 0) return;
    setPlan(generateStudyPlan(topics, examDate));
  };

  /* ── Quiz ── */
  const subjectPool = quizSubject === 'Mixed' ? pool : pool.filter(q => q.subject === quizSubject);

  const startQuiz = () => {
    if (subjectPool.length === 0) return;
    setSession({
      qs: shuffle(subjectPool).slice(0, Math.min(quizCount, subjectPool.length)),
      idx: 0, picked: null, startedAt: Date.now(), correctCount: 0, subject: quizSubject,
    });
    setResult(null);
  };

  const pick = (i: number) => {
    if (!session || session.picked !== null) return;
    const correct = i === session.qs[session.idx].correct;
    setSession(s => s && { ...s, picked: i, correctCount: s.correctCount + (correct ? 1 : 0) });
  };

  const next = () => {
    if (!session) return;
    if (session.idx + 1 >= session.qs.length) {
      const attempt: QuizAttempt = {
        id: generateId(), date: getToday(), subject: session.subject,
        total: session.qs.length, correct: session.correctCount,
        seconds: Math.floor((Date.now() - session.startedAt) / 1000),
      };
      setAttempts(prev => [attempt, ...prev]);
      setResult(attempt);
      setSession(null);
    } else {
      setSession(s => s && { ...s, idx: s.idx + 1, picked: null });
    }
  };

  const addCustomQuestion = () => {
    if (!cq.question.trim() || cq.o.some(o => !o.trim()) || !cq.subject.trim()) return;
    setCustomQuestions(prev => [...prev, {
      id: generateId(), subject: cq.subject.trim(), question: cq.question.trim(),
      options: cq.o.map(o => o.trim()), correct: cq.correct, custom: true,
    }]);
    setCq({ subject: '', question: '', o: ['', '', '', ''], correct: 0 });
    setShowCustomForm(false);
  };

  const avgScore = attempts.length ? Math.round(attempts.reduce((s, a) => s + (a.correct / a.total) * 100, 0) / attempts.length) : null;
  const bestScore = attempts.length ? Math.max(...attempts.map(a => Math.round((a.correct / a.total) * 100))) : null;

  const weeks = useMemo(() => {
    if (!plan) return [];
    const out: { label: string; days: typeof plan.days }[] = [];
    plan.days.forEach((d, i) => {
      const wi = Math.floor(i / 7);
      if (!out[wi]) out[wi] = { label: `Week ${wi + 1}`, days: [] };
      out[wi].days.push(d);
    });
    return out;
  }, [plan]);

  const todayPlan = plan?.days.find(d => d.date === getToday());

  const viewBtns = [
    { id: 'plan' as const, l: 'AI Study Plan', i: <Brain size={15} /> },
    { id: 'quiz' as const, l: 'Quiz Engine', i: <ClipboardList size={15} /> },
    { id: 'focus' as const, l: 'Pomodoro', i: <Timer size={15} /> },
  ];

  return (
    <div className="space-y-5 anim-in">
      {/* Sub-nav */}
      <div className="flex gap-2 flex-wrap">
        {viewBtns.map(v => (
          <button key={v.id} onClick={() => setView(v.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer active:scale-95 ${
              view === v.id
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-600/25'
                : 'glass text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-300'
            }`}>
            {v.i}{v.l}
          </button>
        ))}
      </div>

      {/* ═══ PLAN VIEW ═══ */}
      {view === 'plan' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Left: exam + topics */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass p-5">
              <h3 className="font-display font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                <CalendarDays size={18} className="text-rose-500" /> Exam Date
              </h3>
              <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} className="field font-mono" />
              {daysLeft !== null && daysLeft > 0 && (
                <div className="mt-4 flex items-end gap-3">
                  <span className="font-display font-bold text-5xl text-rose-600 dark:text-rose-400 tabular leading-none">{daysLeft}</span>
                  <div className="pb-1">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">days until exam</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-mono tabular">{totalRemaining.toFixed(1)}h of material remaining</p>
                  </div>
                </div>
              )}
              {daysLeft !== null && daysLeft <= 0 && (
                <p className="mt-3 text-xs text-rose-500 font-semibold">Exam date has passed — pick a future date to plan.</p>
              )}
            </div>

            <div className="glass p-5">
              <h3 className="font-display font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                <GraduationCap size={18} className="text-teal-600" /> Topics ({topics.length})
              </h3>
              <div className="space-y-2.5 mb-4">
                <input placeholder="Topic / chapter title…" value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTopic()}
                  className="field" />
                <div className="grid grid-cols-2 gap-2.5">
                  <input type="number" min={1} value={newHours} onChange={e => setNewHours(+e.target.value || 1)}
                    className="field font-mono" title="Estimated hours" placeholder="Est. hours" />
                  <select value={newDiff} onChange={e => setNewDiff(e.target.value as Topic['difficulty'])} className="field">
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <button onClick={addTopic}
                  className="w-full py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer">
                  <Plus size={15} /> Add Topic
                </button>
              </div>

              {topics.length === 0 ? (
                <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-6">
                  Add your chapters & subjects — the AI will schedule them.
                </p>
              ) : (
                <ul className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {topics.map(t => {
                    const pct = t.estHours > 0 ? Math.min((t.doneHours / t.estHours) * 100, 100) : 0;
                    return (
                      <li key={t.id} className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 group">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex-1 truncate">{t.title}</span>
                          <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${DIFF_COLORS[t.difficulty]}`}>{t.difficulty}</span>
                          <button onClick={() => setTopics(prev => prev.filter(x => x.id !== t.id))}
                            className="p-1 rounded opacity-0 group-hover:opacity-100 hover:text-rose-500 text-slate-400 cursor-pointer transition-all">
                            <Trash2 size={13} />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-slate-200/80 dark:bg-slate-700 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: t.color }} />
                          </div>
                          <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 tabular shrink-0">
                            {t.doneHours.toFixed(1)}/{t.estHours}h
                          </span>
                          <button onClick={() => logHours(t.id, 1)}
                            className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-900/70 cursor-pointer transition-colors shrink-0">
                            +1h
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* Right: AI plan output */}
          <div className="lg:col-span-3">
            <div className="glass p-5 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                <h3 className="font-display font-semibold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Brain size={19} className="text-teal-600" /> AI-Generated Plan
                </h3>
                <button onClick={runPlanner} disabled={!examDate || topics.length === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-lg shadow-teal-600/25 active:scale-95 transition-all cursor-pointer">
                  <Cpu size={15} /> {plan ? 'Regenerate' : 'Generate Plan'}
                </button>
              </div>

              {!plan ? (
                <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-teal-100/80 dark:bg-teal-900/30 flex items-center justify-center mb-4">
                    <Brain size={30} className="text-teal-500" />
                  </div>
                  <p className="font-display font-semibold text-slate-700 dark:text-slate-200 mb-1">No plan yet</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs">
                    Set an exam date, add topics with estimated volume, then let the engine build your optimal daily schedule.
                  </p>
                </div>
              ) : (
                <>
                  {/* Summary chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                    {[
                      { l: 'Daily load', v: `${plan.dailyLoad}h`, c: 'text-teal-600 dark:text-teal-300' },
                      { l: 'Remaining', v: `${plan.totalRemaining}h`, c: 'text-slate-700 dark:text-slate-200' },
                      { l: 'Study days', v: `${plan.studyDays}`, c: 'text-slate-700 dark:text-slate-200' },
                      { l: 'Status', v: plan.dailyLoad <= 8 ? 'On track' : 'Intensive', c: plan.dailyLoad <= 8 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400' },
                    ].map((s, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 text-center">
                        <p className={`font-mono font-bold text-sm tabular ${s.c}`}>{s.v}</p>
                        <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mt-0.5">{s.l}</p>
                      </div>
                    ))}
                  </div>

                  {plan.days.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                      <Award size={36} className="text-emerald-500 mb-3" />
                      <p className="font-display font-semibold text-slate-700 dark:text-slate-200">All material covered!</p>
                      <p className="text-sm text-slate-400 dark:text-slate-500">You've completed every topic. Use remaining days for revision.</p>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto max-h-[560px] pr-1 space-y-4">
                      {weeks.map((w, wi) => (
                        <div key={wi}>
                          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-2 sticky top-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm py-1 rounded z-10">
                            {w.label}
                          </p>
                          <ul className="space-y-1.5">
                            {w.days.map(d => (
                              <li key={d.date} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 transition-colors">
                                <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500 tabular w-14 shrink-0">{formatDate(d.date)}</span>
                                <span className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded w-14 text-center shrink-0 ${KIND_STYLES[d.kind]}`}>
                                  {d.kind}
                                </span>
                                <span className="flex-1 text-xs text-slate-600 dark:text-slate-300 min-w-0 truncate">
                                  {d.assignments.length === 0 ? 'Free day — rest & recovery'
                                    : d.assignments.map(a => `${a.title} · ${a.hours}h`).join('  +  ')}
                                </span>
                                {d.totalHours > 0 && (
                                  <span className="font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400 tabular shrink-0">{d.totalHours}h</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ QUIZ VIEW ═══ */}
      {view === 'quiz' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Setup / custom builder */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass p-5">
              <h3 className="font-display font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                <ClipboardList size={18} className="text-sky-600" /> Start a Quiz
              </h3>
              <label className="block mb-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500">Subject</span>
                <select value={quizSubject} onChange={e => setQuizSubject(e.target.value)} className="field mt-1">
                  <option value="Mixed">Mixed — all subjects</option>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label className="block mb-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500">Questions</span>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {[5, 10].map(n => (
                    <button key={n} onClick={() => setQuizCount(n)}
                      className={`py-2 rounded-xl font-mono font-bold text-sm cursor-pointer transition-all ${
                        quizCount === n
                          ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/25'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}>
                      {n} Q
                    </button>
                  ))}
                </div>
              </label>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-3 font-mono tabular">
                Pool: {subjectPool.length} questions available
              </p>
              <button onClick={startQuiz} disabled={subjectPool.length === 0 || !!session}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 disabled:opacity-40 text-white text-sm font-semibold shadow-lg shadow-sky-600/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2">
                <ChevronRight size={16} /> Start Session
              </button>
            </div>

            {/* Custom question builder */}
            <div className="glass p-5">
              <button onClick={() => setShowCustomForm(s => !s)}
                className="w-full flex items-center justify-between cursor-pointer">
                <h3 className="font-display font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Plus size={16} className="text-teal-600" /> Build Custom Question
                </h3>
                <ChevronRight size={16} className={`text-slate-400 transition-transform ${showCustomForm ? 'rotate-90' : ''}`} />
              </button>
              {showCustomForm && (
                <div className="mt-4 space-y-2.5 anim-pop">
                  <input placeholder="Subject (e.g. Konkur Math)" value={cq.subject}
                    onChange={e => setCq(p => ({ ...p, subject: e.target.value }))} className="field" />
                  <textarea placeholder="Question text…" rows={2} value={cq.question}
                    onChange={e => setCq(p => ({ ...p, question: e.target.value }))} className="field resize-none" />
                  {cq.o.map((o, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <button onClick={() => setCq(p => ({ ...p, correct: i }))}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer transition-all ${
                          cq.correct === i ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-emerald-400'
                        }`} title="Mark as correct answer">
                        <Check size={12} />
                      </button>
                      <input placeholder={`Option ${i + 1}`} value={o}
                        onChange={e => setCq(p => ({ ...p, o: p.o.map((x, j) => j === i ? e.target.value : x) }))} className="field !py-2" />
                    </div>
                  ))}
                  <button onClick={addCustomQuestion}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold active:scale-[0.98] transition-all cursor-pointer">
                    Save to Question Bank
                  </button>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Tap the circle to mark the correct option. Custom questions join the AI pool instantly.</p>
                </div>
              )}
            </div>
          </div>

          {/* Session / history */}
          <div className="lg:col-span-3">
            {session ? (
              <div className="glass p-6 anim-pop">
                <div className="flex items-center justify-between mb-5">
                  <span className="font-mono text-xs text-slate-400 dark:text-slate-500 tabular">
                    Q {session.idx + 1} / {session.qs.length}
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular">
                    {session.correctCount} correct
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-200/80 dark:bg-slate-700 overflow-hidden mb-6">
                  <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-teal-500 transition-all duration-500"
                    style={{ width: `${((session.idx + (session.picked !== null ? 1 : 0)) / session.qs.length) * 100}%` }} />
                </div>

                <p className="font-display font-semibold text-xl text-slate-800 dark:text-slate-100 mb-6 leading-relaxed">
                  {session.qs[session.idx].question}
                </p>

                <div className="space-y-2.5">
                  {session.qs[session.idx].options.map((opt, i) => {
                    const answered = session.picked !== null;
                    const isCorrect = i === session.qs[session.idx].correct;
                    const isPicked = i === session.picked;
                    return (
                      <button key={i} onClick={() => pick(i)} disabled={answered}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left text-sm font-medium transition-all cursor-pointer ${
                          !answered
                            ? 'border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/40 hover:border-teal-400 dark:hover:border-teal-600 hover:bg-teal-50/60 dark:hover:bg-teal-900/15'
                            : isCorrect
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/25 text-emerald-700 dark:text-emerald-300'
                              : isPicked
                                ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/25 text-rose-700 dark:text-rose-300'
                                : 'border-slate-200 dark:border-slate-700 opacity-40'
                        }`}>
                        <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-[11px] font-mono font-bold shrink-0 ${
                          answered && isCorrect ? 'border-emerald-500 bg-emerald-500 text-white'
                            : answered && isPicked ? 'border-rose-500 bg-rose-500 text-white'
                            : 'border-slate-300 dark:border-slate-600 text-slate-400'
                        }`}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {session.picked !== null && (
                  <button onClick={next}
                    className="mt-5 w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-sm font-semibold shadow-lg shadow-teal-600/25 active:scale-[0.98] transition-all cursor-pointer anim-pop">
                    {session.idx + 1 >= session.qs.length ? 'Finish & Analyze' : 'Next Question'}
                  </button>
                )}
              </div>
            ) : result ? (
              /* Result summary */
              <div className="glass p-8 text-center anim-pop">
                {(() => {
                  const pct = Math.round((result.correct / result.total) * 100);
                  const C = 2 * Math.PI * 52;
                  return (
                    <>
                      <div className="relative w-32 h-32 mx-auto mb-5">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                          <circle cx="60" cy="60" r="52" fill="none" strokeWidth="9" className="stroke-slate-200 dark:stroke-slate-700" />
                          <circle cx="60" cy="60" r="52" fill="none" strokeWidth="9" strokeLinecap="round"
                            className={pct >= 70 ? 'stroke-emerald-500' : pct >= 40 ? 'stroke-amber-500' : 'stroke-rose-500'}
                            strokeDasharray={`${(C * pct) / 100} ${C}`} />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="font-mono font-bold text-3xl text-slate-800 dark:text-slate-100 tabular">{pct}%</span>
                        </div>
                      </div>
                      <h3 className="font-display font-bold text-xl text-slate-800 dark:text-slate-100 mb-1">
                        {pct >= 80 ? 'Outstanding!' : pct >= 60 ? 'Solid work!' : pct >= 40 ? 'Getting there.' : 'Keep practicing.'}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1 font-mono tabular">
                        {result.correct}/{result.total} correct · {formatSeconds(result.seconds)} · {result.subject}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">Result saved to your performance report.</p>
                      <button onClick={() => setResult(null)}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white text-sm font-semibold shadow-lg shadow-sky-600/25 active:scale-95 transition-all cursor-pointer">
                        New Session
                      </button>
                    </>
                  );
                })()}
              </div>
            ) : (
              /* History */
              <div className="glass p-5 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <TrendingUp size={18} className="text-emerald-500" /> Attempt History
                  </h3>
                  {attempts.length > 0 && (
                    <div className="flex gap-2">
                      <span className="text-[10px] font-mono px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 tabular">avg {avgScore}%</span>
                      <span className="text-[10px] font-mono px-2 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 tabular">best {bestScore}%</span>
                    </div>
                  )}
                </div>
                {attempts.length === 0 ? (
                  <div className="text-center py-14">
                    <ListChecks size={34} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                    <p className="text-sm text-slate-400 dark:text-slate-500">No attempts yet — start a quiz to test your knowledge.</p>
                  </div>
                ) : (
                  <ul className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                    {attempts.map(a => {
                      const pct = Math.round((a.correct / a.total) * 100);
                      return (
                        <li key={a.id} className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50">
                          <div className="flex items-center gap-3">
                            <span className={`font-mono font-bold text-sm tabular w-12 shrink-0 ${pct >= 70 ? 'text-emerald-600 dark:text-emerald-400' : pct >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-500'}`}>
                              {pct}%
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{a.subject}</p>
                              <div className="h-1.5 rounded-full bg-slate-200/80 dark:bg-slate-700 overflow-hidden mt-1">
                                <div className={`h-full rounded-full anim-bar ${pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                  style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                            <span className="font-mono text-[10px] text-slate-400 tabular shrink-0">{a.correct}/{a.total} · {formatSeconds(a.seconds)}</span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ FOCUS VIEW ═══ */}
      {view === 'focus' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          <PomodoroTimer topics={topics} totalMinutes={pomodoroTotal} onComplete={onPomodoroComplete} />
          <div className="space-y-4">
            <div className="glass p-5 anim-in" style={{ animationDelay: '80ms' }}>
              <h3 className="font-display font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                <ListChecks size={18} className="text-teal-600" /> Today's Assigned Study
              </h3>
              {todayPlan && todayPlan.assignments.length > 0 ? (
                <ul className="space-y-2">
                  {todayPlan.assignments.map((a, i) => (
                    <li key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50">
                      <span className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${KIND_STYLES[a.kind]}`}>{a.kind}</span>
                      <span className="text-sm text-slate-700 dark:text-slate-200 flex-1 truncate">{a.title}</span>
                      <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400 tabular shrink-0">{a.hours}h</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  {plan ? "Today is a rest day in your plan — recharge!" : 'Generate an AI plan to see today\'s assignments here.'}
                </p>
              )}
            </div>
            <div className="glass p-5 anim-in" style={{ animationDelay: '160ms' }}>
              <h3 className="font-display font-semibold text-slate-800 dark:text-slate-100 mb-3">How focus feeds the plan</h3>
              <ul className="space-y-2.5 text-sm text-slate-500 dark:text-slate-400">
                {[
                  'Each completed focus block credits the linked topic automatically.',
                  'Finished sessions count toward your daily progress in the header.',
                  'Regenerate the AI plan anytime to rebalance remaining volume.',
                ].map((t, i) => (
                  <li key={i} className="flex gap-2.5">
                    <Check size={15} className="text-teal-500 shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass p-5 anim-in" style={{ animationDelay: '240ms' }}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">Overall syllabus coverage</span>
                <span className="font-mono font-bold text-sm text-teal-600 dark:text-teal-300 tabular">
                  {totalEst > 0 ? Math.round((totalDone / totalEst) * 100) : 0}%
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-200/80 dark:bg-slate-700 overflow-hidden mt-2">
                <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 anim-bar"
                  style={{ width: `${totalEst > 0 ? (totalDone / totalEst) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
