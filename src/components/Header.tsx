import type { ReactNode } from 'react';
import {
  LayoutDashboard, GraduationCap, Dumbbell, Target,
  Gamepad2, BarChart3, Sun, Moon, Brain,
} from 'lucide-react';
import type { TabType } from '../types';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  dailyProgress: number;
}

const TABS: { id: TabType; label: string; icon: ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { id: 'study', label: 'Study & Exam', icon: <GraduationCap size={16} /> },
  { id: 'fitness', label: 'Fitness & AI Nutrition', icon: <Dumbbell size={16} /> },
  { id: 'goals', label: 'Goals', icon: <Target size={16} /> },
  { id: 'recreation', label: 'Leisure', icon: <Gamepad2 size={16} /> },
  { id: 'report', label: 'Report', icon: <BarChart3 size={16} /> },
];

export default function Header({ activeTab, setActiveTab, darkMode, toggleDarkMode, dailyProgress }: HeaderProps) {
  return (
    <header className="no-print sticky top-0 z-50">
      {/* Brand bar */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-950 via-teal-900 to-emerald-900">
        <div className="absolute inset-0 opacity-[0.13]"
          style={{ backgroundImage: 'radial-gradient(rgba(94,234,212,0.6) 1px, transparent 1.4px)', backgroundSize: '18px 18px' }} />
        <div className="relative max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-teal-400/15 border border-teal-300/25 flex items-center justify-center">
              <Brain className="text-teal-300" size={21} />
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-bold text-white text-[15px] leading-tight truncate">
                AI Life & Fitness Manager
              </h1>
              <div className="flex items-center gap-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                </span>
                <p className="text-teal-200/70 text-[10px] font-mono uppercase tracking-[0.18em]">AI engine online</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Daily progress */}
            <div className="flex items-center gap-2" title="Today's progress">
              <div className="relative w-10 h-10">
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3.5" />
                  <circle cx="20" cy="20" r="16" fill="none" stroke="#5eead4" strokeWidth="3.5" strokeLinecap="round"
                    strokeDasharray={`${Math.round(100.5 * dailyProgress / 100)} 100.5`}
                    className="transition-all duration-700" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-white text-[9px] font-mono font-bold tabular">
                  {Math.round(dailyProgress)}%
                </span>
              </div>
              <div className="hidden md:block leading-tight">
                <p className="text-teal-200/70 text-[9px] font-mono uppercase tracking-widest">Today</p>
                <p className="text-white text-xs font-semibold">Daily status</p>
              </div>
            </div>

            {/* Theme toggle */}
            <button onClick={toggleDarkMode} aria-label="Toggle theme"
              className="relative w-[58px] h-[30px] shrink-0 rounded-full bg-teal-400/15 border border-teal-300/25 backdrop-blur-sm p-[3px] cursor-pointer hover:bg-teal-400/25 transition-colors">
              <div className={`w-[22px] h-[22px] rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(.34,1.56,.64,1)] ${darkMode ? 'translate-x-[28px]' : 'translate-x-0'}`}>
                {darkMode ? <Moon size={13} className="text-teal-700" /> : <Sun size={13} className="text-amber-500" />}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="glass !rounded-none !border-x-0 !border-t-0">
        <nav className="max-w-7xl mx-auto px-2 flex overflow-x-auto">
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-1.5 px-3 md:px-4 py-3 text-[13px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  active ? 'text-teal-700 dark:text-teal-300' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}>
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                {active && <span className="absolute bottom-0 left-2 right-2 h-[2.5px] rounded-t-full bg-gradient-to-r from-teal-500 to-emerald-500" />}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
