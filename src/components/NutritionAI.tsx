import { useEffect, useRef, useState } from 'react';
import { Search, Plus, Trash2, Utensils, Cpu, Flame, CheckCircle2, Database } from 'lucide-react';
import type { CalorieEntry, FoodItem } from '../types';
import { searchFoods, FOODS, FOOD_CATEGORIES } from '../data/foods';
import { generateId, getToday } from '../utils/helpers';

interface NutritionAIProps {
  entries: CalorieEntry[];
  setEntries: React.Dispatch<React.SetStateAction<CalorieEntry[]>>;
  targetCal: number;
}

const ANALYZE_STEPS = ['Parsing query…', 'Matching nutrition database…', 'Computing macro breakdown…'];
const PORTIONS = [50, 100, 150, 200, 250, 300];

export default function NutritionAI({ entries, setEntries, targetCal }: NutritionAIProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [grams, setGrams] = useState(100);
  const [meal, setMeal] = useState('Lunch');
  const [added, setAdded] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const today = getToday();
  const todayEntries = entries.filter(e => e.date === today);
  const intake = todayEntries.reduce((s, e) => s + e.kcal, 0);
  const remaining = targetCal - intake;

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); setSearching(false); return; }
    setSearching(true);
    debounceRef.current = setTimeout(() => {
      setResults(searchFoods(query));
      setSearching(false);
    }, 450);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  useEffect(() => {
    if (!analyzing) return;
    const iv = setInterval(() => setStepIdx(s => (s + 1) % ANALYZE_STEPS.length), 380);
    return () => clearInterval(iv);
  }, [analyzing]);

  const selectFood = (f: FoodItem) => {
    setSelected(null);
    setAnalyzing(true);
    setStepIdx(0);
    setAdded(false);
    setTimeout(() => {
      setSelected(f);
      setGrams(f.serving);
      setAnalyzing(false);
    }, 1150);
  };

  const scale = grams / 100;
  const kcal = selected ? Math.round(selected.per100.kcal * scale) : 0;
  const protein = selected ? +(selected.per100.p * scale).toFixed(1) : 0;
  const carbs = selected ? +(selected.per100.c * scale).toFixed(1) : 0;
  const fat = selected ? +(selected.per100.f * scale).toFixed(1) : 0;

  const addEntry = () => {
    if (!selected || kcal <= 0) return;
    setEntries(prev => [...prev, {
      id: generateId(), date: today, name: selected.name, grams, meal, kcal, protein, carbs, fat,
    }]);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
    setSelected(null);
    setQuery('');
    setResults([]);
  };

  const removeEntry = (id: string) => setEntries(prev => prev.filter(e => e.id !== id));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 anim-in">
      {/* AI search side */}
      <div className="lg:col-span-3 space-y-4">
        <div className="glass p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Cpu size={19} className="text-teal-600" />
              AI Food Search
            </h3>
            <span className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500">
              <Database size={11} /> {FOODS.length}-item nutrition DB
            </span>
          </div>

          <div className="relative">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search any food — kabab, pizza, قورمه‌سبزی, oatmeal…"
              className="field !pl-10 !py-3 text-[15px]"
            />
            {searching && (
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 ai-dots flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block" />
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block" />
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block" />
              </span>
            )}
          </div>

          {/* Suggestions */}
          {!selected && !analyzing && results.length > 0 && (
            <ul className="mt-3 space-y-1.5 anim-pop">
              {results.map(f => (
                <li key={f.id}>
                  <button onClick={() => selectFood(f)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 hover:bg-teal-50 dark:hover:bg-teal-900/20 border border-transparent hover:border-teal-300/50 dark:hover:border-teal-700/50 transition-all cursor-pointer group text-left">
                    <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-700 text-slate-500 dark:text-slate-300 shrink-0">
                      {FOOD_CATEGORIES[f.cat]}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{f.name}</span>
                      <span className="block text-xs text-slate-400 dark:text-slate-500 truncate" dir="rtl">{f.fa}</span>
                    </span>
                    <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 tabular shrink-0">
                      {f.per100.kcal} <span className="font-normal text-[9px] text-slate-400">kcal/100g</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!selected && !analyzing && !searching && query.trim() && results.length === 0 && (
            <p className="mt-3 text-sm text-slate-400 dark:text-slate-500 p-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/40">
              No matches in the database. Try “kabab”, “pizza”, “berenj”, or a Persian name like “آش”.
            </p>
          )}

          {/* Analyzing state */}
          {analyzing && (
            <div className="mt-4 p-5 rounded-xl border border-teal-300/40 dark:border-teal-700/40 bg-teal-50/60 dark:bg-teal-900/15 anim-pop">
              <div className="flex items-center gap-2 mb-3">
                <Cpu size={15} className="text-teal-600 dark:text-teal-400" />
                <span className="font-mono text-xs text-teal-700 dark:text-teal-300">{ANALYZE_STEPS[stepIdx]}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden bg-teal-100 dark:bg-teal-900/40">
                <div className="h-full w-full ai-scan rounded-full" />
              </div>
            </div>
          )}

          {/* Selected food card */}
          {selected && !analyzing && (
            <div className="mt-4 p-5 rounded-xl border border-teal-300/50 dark:border-teal-700/50 bg-gradient-to-br from-teal-50/80 to-emerald-50/60 dark:from-teal-900/20 dark:to-emerald-900/10 anim-pop">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h4 className="font-display font-bold text-lg text-slate-800 dark:text-slate-100">{selected.name}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400" dir="rtl">{selected.fa} · {FOOD_CATEGORIES[selected.cat]}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono font-bold text-3xl text-teal-700 dark:text-teal-300 tabular">{kcal}</p>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">kcal total</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { l: 'Protein', v: `${protein}g`, c: 'bg-sky-500', kcalPct: kcal > 0 ? (protein * 4 / kcal) * 100 : 0 },
                  { l: 'Carbs', v: `${carbs}g`, c: 'bg-amber-500', kcalPct: kcal > 0 ? (carbs * 4 / kcal) * 100 : 0 },
                  { l: 'Fat', v: `${fat}g`, c: 'bg-rose-500', kcalPct: kcal > 0 ? (fat * 9 / kcal) * 100 : 0 },
                ].map(m => (
                  <div key={m.l} className="p-2.5 rounded-lg bg-white/70 dark:bg-slate-800/60">
                    <div className="flex justify-between items-baseline mb-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{m.l}</span>
                      <span className="font-mono font-bold text-sm text-slate-700 dark:text-slate-200 tabular">{m.v}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200/80 dark:bg-slate-700 overflow-hidden">
                      <div className={`h-full rounded-full ${m.c} anim-bar`} style={{ width: `${Math.min(m.kcalPct, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500">Portion (grams)</span>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="number" min={10} value={grams}
                      onChange={e => setGrams(+e.target.value || 0)}
                      className="field !w-20 !py-1.5 font-mono text-center" />
                    <div className="flex gap-1 flex-wrap">
                      {[...new Set([selected.serving, ...PORTIONS])].map(p => (
                        <button key={p} onClick={() => setGrams(p)}
                          className={`px-2 py-1 rounded-lg text-[11px] font-mono cursor-pointer transition-all ${
                            grams === p
                              ? 'bg-teal-600 text-white shadow'
                              : 'bg-white/70 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 hover:bg-teal-50 dark:hover:bg-teal-900/30'
                          }`}>
                          {p === selected.serving ? `${p}★` : p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="sm:w-40">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500">Meal</span>
                  <select value={meal} onChange={e => setMeal(e.target.value)} className="field mt-1 !py-1.5">
                    {['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Pre-Workout', 'Post-Workout'].map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <button onClick={addEntry}
                className={`mt-4 w-full py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer shadow-lg ${
                  added ? 'bg-emerald-500 shadow-emerald-500/25' : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-teal-600/25'
                }`}>
                {added ? <><CheckCircle2 size={16} /> Logged!</> : <><Plus size={16} /> Log {kcal} kcal to today</>}
              </button>
            </div>
          )}
        </div>

        <p className="text-[11px] text-slate-400 dark:text-slate-500 px-1 flex items-center gap-1.5">
          <Utensils size={12} />
          Values are per 100 g — approximate nutrition data for planning purposes, not medical advice.
        </p>
      </div>

      {/* Today's log */}
      <div className="lg:col-span-2">
        <div className="glass p-6 lg:sticky lg:top-28">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-display font-semibold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Flame size={18} className="text-amber-500" />
              Today's Intake
            </h3>
            <span className={`font-mono font-bold tabular ${remaining < 0 ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {remaining >= 0 ? `${remaining} left` : `${-remaining} over`}
            </span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-3 font-mono tabular">{intake} / {targetCal} kcal</p>

          <div className="h-3 rounded-full bg-slate-200/80 dark:bg-slate-700/70 overflow-hidden mb-5">
            <div className={`h-full rounded-full transition-all duration-700 ${
              intake > targetCal ? 'bg-gradient-to-r from-rose-400 to-rose-600' : 'bg-gradient-to-r from-teal-400 to-emerald-500'
            }`} style={{ width: `${Math.min((intake / targetCal) * 100, 100)}%` }} />
          </div>

          {todayEntries.length === 0 ? (
            <div className="text-center py-10">
              <Utensils size={32} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-sm text-slate-400 dark:text-slate-500">Nothing logged yet.<br />Search a food above to begin.</p>
            </div>
          ) : (
            <ul className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {todayEntries.map(e => (
                <li key={e.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{e.name}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono tabular">
                      {e.meal} · {e.grams}g · P{e.protein} C{e.carbs} F{e.fat}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-sm text-amber-600 dark:text-amber-400 tabular shrink-0">{e.kcal}</span>
                  <button onClick={() => removeEntry(e.id)}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-50 dark:hover:bg-rose-900/25 text-slate-400 hover:text-rose-500 cursor-pointer transition-all shrink-0">
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
