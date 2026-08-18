import { useState } from 'react';
import {
  Plus, Trash2, Film, BookOpen, Gamepad2, Plane,
  Palette, Star, Check, X, Coffee, Sparkles,
} from 'lucide-react';
import type { RecreationItem } from '../types';
import { generateId } from '../utils/helpers';

interface RecreationProps {
  items: RecreationItem[];
  setItems: React.Dispatch<React.SetStateAction<RecreationItem[]>>;
}

const CAT_STYLE: Record<string, { icon: React.ReactNode; chip: string }> = {
  movie: { icon: <Film size={16} />, chip: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300' },
  series: { icon: <Film size={16} />, chip: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300' },
  book: { icon: <BookOpen size={16} />, chip: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300' },
  game: { icon: <Gamepad2 size={16} />, chip: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300' },
  travel: { icon: <Plane size={16} />, chip: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300' },
  hobby: { icon: <Palette size={16} />, chip: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-300' },
  other: { icon: <Coffee size={16} />, chip: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' },
};

const STATUS_CHIP: Record<string, string> = {
  planned: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  'in-progress': 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
};

export default function Recreation({ items, setItems }: RecreationProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [filterCat, setFilterCat] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [form, setForm] = useState<Omit<RecreationItem, 'id'>>({
    title: '', category: 'movie', status: 'planned', rating: 0, notes: '',
  });

  const addItem = () => {
    if (!form.title.trim()) return;
    setItems(prev => [...prev, { id: generateId(), ...form, title: form.title.trim() }]);
    setForm({ title: '', category: 'movie', status: 'planned', rating: 0, notes: '' });
    setShowAdd(false);
  };

  const updateItem = (id: string, updates: Partial<RecreationItem>) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));

  const filtered = items.filter(i =>
    (filterCat === 'all' || i.category === filterCat) &&
    (filterStatus === 'all' || i.status === filterStatus)
  );

  const cats = ['all', 'movie', 'series', 'book', 'game', 'travel', 'hobby', 'other'];

  return (
    <div className="space-y-5 anim-in">
      {/* Banner */}
      <div className="glass p-6 relative overflow-hidden">
        <div className="absolute -top-20 -right-14 w-52 h-52 rounded-full bg-amber-500/10 dark:bg-amber-400/10 pointer-events-none" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-600 dark:text-amber-400 mb-1 flex items-center gap-1.5">
              <Sparkles size={12} /> Work–life balance
            </p>
            <h2 className="font-display font-bold text-xl md:text-2xl text-slate-900 dark:text-white">Recreation & Leisure</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-lg">
              Track movies, books, games and trips. Deliberate rest is a performance tool — not a distraction.
            </p>
          </div>
          <button onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-semibold shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer shrink-0">
            <Plus size={15} /> Add
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex gap-1.5 flex-wrap">
          {cats.map(c => (
            <button key={c} onClick={() => setFilterCat(c)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold capitalize cursor-pointer transition-all active:scale-95 ${
                filterCat === c
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/25'
                  : 'glass text-slate-500 dark:text-slate-400 hover:text-teal-700 dark:hover:text-teal-300'
              }`}>
              {c}
            </button>
          ))}
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="field !w-auto !py-1.5 text-xs">
          <option value="all">All status</option>
          <option value="planned">Planned</option>
          <option value="in-progress">In progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="glass p-5 anim-pop">
          <h3 className="font-display font-semibold text-slate-800 dark:text-slate-100 mb-4">New Activity</h3>
          <div className="space-y-3">
            <input placeholder="Title — e.g. Inception, Shahnameh reading, hiking…" value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && addItem()} className="field" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as RecreationItem['category'] }))} className="field">
                <option value="movie">Movie</option>
                <option value="series">Series</option>
                <option value="book">Book</option>
                <option value="game">Game</option>
                <option value="travel">Travel</option>
                <option value="hobby">Hobby</option>
                <option value="other">Other</option>
              </select>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as RecreationItem['status'] }))} className="field">
                <option value="planned">Planned</option>
                <option value="in-progress">In progress</option>
                <option value="completed">Completed</option>
              </select>
              <div className="col-span-2 sm:col-span-1 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} onClick={() => setForm(p => ({ ...p, rating: s }))} className="cursor-pointer transition-transform hover:scale-110">
                    <Star size={20} className={s <= form.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'} />
                  </button>
                ))}
              </div>
            </div>
            <textarea placeholder="Notes (optional)" rows={2} value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="field resize-none" />
            <div className="flex gap-2">
              <button onClick={addItem}
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

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="glass p-12 text-center">
          <Gamepad2 size={38} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <p className="text-sm text-slate-400 dark:text-slate-500">Nothing here yet — add a movie, book or trip you're looking forward to.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item, idx) => (
            <div key={item.id}
              className="glass p-5 group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 anim-in"
              style={{ animationDelay: `${Math.min(idx * 60, 360)}ms` }}>
              <div className="flex items-start justify-between mb-3">
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${CAT_STYLE[item.category].chip}`}>
                  {CAT_STYLE[item.category].icon}
                </span>
                <button onClick={() => setItems(prev => prev.filter(i => i.id !== item.id))}
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-500 cursor-pointer transition-all">
                  <Trash2 size={14} />
                </button>
              </div>

              <h4 className="font-display font-semibold text-slate-800 dark:text-slate-100 mb-1">{item.title}</h4>
              {item.notes && <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">{item.notes}</p>}

              <div className="flex items-center justify-between mt-3">
                <select value={item.status}
                  onChange={e => updateItem(item.id, { status: e.target.value as RecreationItem['status'] })}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider font-bold border-0 cursor-pointer focus:outline-none ${STATUS_CHIP[item.status]}`}>
                  <option value="planned">Planned</option>
                  <option value="in-progress">In progress</option>
                  <option value="completed">Completed</option>
                </select>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} onClick={() => updateItem(item.id, { rating: s })} className="cursor-pointer transition-transform hover:scale-110">
                      <Star size={14} className={s <= item.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
