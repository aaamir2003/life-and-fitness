import { useState } from 'react';
import {
  Plus, Trash2, Edit2, Check, X, Target,
  Calendar, TrendingUp, Award, Flag,
} from 'lucide-react';
import type { Goal } from '../types';
import { generateId, getToday } from '../utils/helpers';

interface GoalsManagerProps {
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
}

export default function GoalsManager({ goals, setGoals }: GoalsManagerProps) {
  const [filter, setFilter] = useState<'all' | 'short' | 'mid' | 'long'>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', category: 'short' as Goal['category'], deadline: '' });

  const addGoal = () => {
    if (!form.title.trim()) return;
    setGoals(prev => [...prev, {
      id: generateId(), title: form.title.trim(), description: form.description,
      category: form.category, progress: 0, completed: false,
      createdAt: getToday(), deadline: form.deadline || undefined,
    }]);
    setForm({ title: '', description: '', category: 'short', deadline: '' });
    setShowAdd(false);
  };

  const updateGoal = (id: string, updates: Partial<Goal>) =>
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));

  const toggleComplete = (id: string) =>
    setGoals(prev => prev.map(g => g.id === id ? { ...g, completed: !g.completed, progress: g.completed ? g.progress : 100 } : g));

  const deleteGoal = (id: string) => setGoals(prev => prev.filter(g => g.id !== id));

  const filtered = goals.filter(g => filter === 'all' || g.category === filter);
  const completedCount = goals.filter(g => g.completed).length;

  const CAT: Record<string, { label: string; icon: React.ReactNode; chip: string }> = {
    short: { label: 'Short-term', icon: <Flag size={11} />, chip: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300' },
    mid: { label: 'Mid-term', icon: <TrendingUp size={11} />, chip: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
    long: { label: 'Long-term', icon: <Award size={11} />, chip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  };

  const filterBtns = [
    { v: 'all' as const, l: 'All' },
    { v: 'short' as const, l: 'Short-term' },
    { v: 'mid' as const, l: 'Mid-term' },
    { v: 'long' as const, l: 'Long-term' },
  ];

  return (
    <div className="space-y-5 anim-in">
      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { l: 'Total goals', v: goals.length, c: 'text-slate-800 dark:text-slate-100' },
          { l: 'Completed', v: completedCount, c: 'text-emerald-600 dark:text-emerald-400' },
          { l: 'In progress', v: goals.length - completedCount, c: 'text-amber-600 dark:text-amber-400' },
          { l: 'Success rate', v: `${goals.length ? Math.round((completedCount / goals.length) * 100) : 0}%`, c: 'text-teal-600 dark:text-teal-300' },
        ].map((s, i) => (
          <div key={i} className="glass p-4 text-center">
            <p className={`font-mono font-bold text-2xl tabular ${s.c}`}>{s.v}</p>
            <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mt-0.5">{s.l}</p>
          </div>
        ))}
      </div>

      {/* Filter + add */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex gap-2 flex-wrap">
          {filterBtns.map(f => {
            const count = f.v === 'all' ? goals.length : goals.filter(g => g.category === f.v).length;
            return (
              <button key={f.v} onClick={() => setFilter(f.v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer active:scale-95 tabular ${
                  filter === f.v
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/25'
                    : 'glass text-slate-500 dark:text-slate-400 hover:text-teal-700 dark:hover:text-teal-300'
                }`}>
                {f.l} · {count}
              </button>
            );
          })}
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-sm font-semibold shadow-lg shadow-teal-600/25 active:scale-95 transition-all cursor-pointer">
          <Plus size={15} /> New Goal
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="glass p-5 anim-pop">
          <h3 className="font-display font-semibold text-slate-800 dark:text-slate-100 mb-4">Create Goal</h3>
          <div className="space-y-3">
            <input placeholder="Goal title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && addGoal()} className="field" />
            <textarea placeholder="Description (optional)" rows={2} value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="field resize-none" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as Goal['category'] }))} className="field">
                <option value="short">Short-term — weekly / monthly</option>
                <option value="mid">Mid-term — quarterly</option>
                <option value="long">Long-term — yearly / vision</option>
              </select>
              <input type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} className="field font-mono" />
            </div>
            <div className="flex gap-2">
              <button onClick={addGoal}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold active:scale-95 transition-all cursor-pointer flex items-center gap-1.5">
                <Check size={14} /> Save
              </button>
              <button onClick={() => setShowAdd(false)}
                className="px-5 py-2 rounded-xl bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-300/80 dark:hover:bg-slate-600 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5">
                <X size={14} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="glass p-12 text-center">
          <Target size={38} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <p className="text-sm text-slate-400 dark:text-slate-500">No goals in this category — create one to start tracking.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(goal => {
            const cc = CAT[goal.category];
            const isEditing = editingId === goal.id;
            return (
              <div key={goal.id} className={`glass p-4 transition-all duration-300 ${goal.completed ? 'opacity-70' : ''}`}>
                <div className="flex items-start gap-3">
                  <button onClick={() => toggleComplete(goal.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 cursor-pointer transition-all active:scale-90 ${
                      goal.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600 hover:border-emerald-400 text-transparent'
                    }`}>
                    <Check size={12} />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {isEditing ? (
                        <input value={goal.title} onChange={e => updateGoal(goal.id, { title: e.target.value })} className="field !w-auto !py-1 text-sm font-semibold" />
                      ) : (
                        <h4 className={`text-sm font-bold ${goal.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'}`}>
                          {goal.title}
                        </h4>
                      )}
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider ${cc.chip}`}>
                        {cc.icon}{cc.label}
                      </span>
                    </div>
                    {goal.description && <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{goal.description}</p>}

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full bg-slate-200/80 dark:bg-slate-700/70 overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${goal.completed ? 'bg-emerald-500' : 'bg-gradient-to-r from-teal-500 to-emerald-500'}`}
                          style={{ width: `${goal.progress}%` }} />
                      </div>
                      {isEditing ? (
                        <input type="number" min={0} max={100} value={goal.progress}
                          onChange={e => updateGoal(goal.id, { progress: Math.min(100, Math.max(0, +e.target.value)) })}
                          className="field !w-16 !py-1 font-mono text-xs text-center" />
                      ) : (
                        <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400 w-10 text-right tabular">{goal.progress}%</span>
                      )}
                    </div>

                    {goal.deadline && (
                      <p className="flex items-center gap-1 text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-1.5 tabular">
                        <Calendar size={10} /> deadline {goal.deadline}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-0.5 shrink-0">
                    <button onClick={() => setEditingId(isEditing ? null : goal.id)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-teal-600 dark:hover:text-teal-300 cursor-pointer transition-colors">
                      {isEditing ? <Check size={14} /> : <Edit2 size={14} />}
                    </button>
                    <button onClick={() => deleteGoal(goal.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-500 cursor-pointer transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
