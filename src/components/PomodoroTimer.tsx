import { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, Clock, Flame } from 'lucide-react';
import type { Topic } from '../types';
import { formatMinutes } from '../utils/helpers';

interface PomodoroTimerProps {
  topics: Topic[];
  totalMinutes: number;
  onComplete: (minutes: number, topicId: string) => void;
}

export default function PomodoroTimer({ topics, totalMinutes, onComplete }: PomodoroTimerProps) {
  const [workMin, setWorkMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [topicId, setTopicId] = useState('');
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = isBreak ? breakMin * 60 : workMin * 60;
  const progress = totalSeconds > 0 ? (totalSeconds - timeLeft) / totalSeconds : 0;
  const C = 2 * Math.PI * 120;

  const stop = useCallback(() => {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          stop();
          if (!isBreak) {
            onComplete(workMin, topicId);
            setSessions(s => s + 1);
            setIsBreak(true);
            return breakMin * 60;
          }
          setIsBreak(false);
          return workMin * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, isBreak, workMin, breakMin, topicId, stop, onComplete]);

  const reset = () => {
    stop();
    setIsBreak(false);
    setTimeLeft(workMin * 60);
  };

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');

  return (
    <div className="glass p-6 anim-in">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display font-semibold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Clock size={19} className="text-teal-600" />
          Focus Timer
        </h3>
        <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500">
          {sessions} session{sessions !== 1 ? 's' : ''} today
        </span>
      </div>

      <div className="flex justify-center mb-5">
        <div className={`relative w-52 h-52 rounded-full ${running ? 'pulse-soft' : ''}`}>
          <svg className="w-full h-full -rotate-90" viewBox="0 0 260 260">
            <circle cx="130" cy="130" r="120" fill="none" strokeWidth="9"
              className="stroke-slate-200 dark:stroke-slate-700/70" />
            <circle cx="130" cy="130" r="120" fill="none" strokeWidth="9" strokeLinecap="round"
              className={`pomodoro-circle ${isBreak ? 'stroke-emerald-500' : 'stroke-teal-500'}`}
              strokeDasharray={C}
              strokeDashoffset={C * (1 - progress)} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`font-mono text-5xl font-bold tabular ${isBreak ? 'text-emerald-600 dark:text-emerald-400' : 'text-teal-700 dark:text-teal-300'}`}>
              {mm}:{ss}
            </span>
            <span className={`mt-2 text-[10px] font-mono uppercase tracking-[0.2em] ${isBreak ? 'text-emerald-500' : 'text-teal-600 dark:text-teal-400'}`}>
              {isBreak ? '— break —' : '— deep focus —'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-2.5 mb-6">
        {!running ? (
          <button onClick={() => setRunning(true)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-sm font-semibold shadow-lg shadow-teal-600/25 active:scale-95 transition-all cursor-pointer">
            <Play size={15} /> Start
          </button>
        ) : (
          <button onClick={stop}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer">
            <Pause size={15} /> Pause
          </button>
        )}
        <button onClick={reset}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-200/80 dark:bg-slate-700/70 hover:bg-slate-300/80 dark:hover:bg-slate-600/70 text-slate-600 dark:text-slate-300 text-sm font-semibold active:scale-95 transition-all cursor-pointer">
          <RotateCcw size={15} /> Reset
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <label className="block">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500">Focus (min)</span>
          <input type="number" min={1} max={90} value={workMin}
            onChange={e => { setWorkMin(+e.target.value || 25); if (!running && !isBreak) setTimeLeft((+e.target.value || 25) * 60); }}
            className="field mt-1 font-mono" />
        </label>
        <label className="block">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500">Break (min)</span>
          <input type="number" min={1} max={30} value={breakMin}
            onChange={e => { setBreakMin(+e.target.value || 5); if (!running && isBreak) setTimeLeft((+e.target.value || 5) * 60); }}
            className="field mt-1 font-mono" />
        </label>
      </div>

      <label className="block">
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500">Credit to topic</span>
        <select value={topicId} onChange={e => setTopicId(e.target.value)} className="field mt-1">
          <option value="">General study</option>
          {topics.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>
      </label>

      <div className="mt-5 pt-4 border-t border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Flame size={13} className="text-amber-500" /> Lifetime focus
        </span>
        <span className="font-mono font-bold text-sm text-slate-700 dark:text-slate-200 tabular">{formatMinutes(totalMinutes)}</span>
      </div>
    </div>
  );
}
