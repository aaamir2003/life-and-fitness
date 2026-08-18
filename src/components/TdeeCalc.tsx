import { useState } from 'react';
import { Calculator, Activity, Zap, HeartPulse, TrendingDown, TrendingUp, Minus, Cpu } from 'lucide-react';
import type { UserProfile } from '../types';
import { calculateBMR, calculateTDEE, calculateTargetCalories, calculateMacros } from '../utils/calories';

interface TdeeCalcProps {
  profile: UserProfile | null;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

export default function TdeeCalc({ profile, setProfile }: TdeeCalcProps) {
  const [form, setForm] = useState<UserProfile>(profile || {
    weight: 70, height: 175, age: 25, gender: 'male', activityLevel: 'moderate', goal: 'maintain',
  });
  const [saved, setSaved] = useState(!!profile);

  const save = () => { setProfile(form); setSaved(true); };

  const bmr = saved && profile ? Math.round(calculateBMR(profile)) : null;
  const tdee = saved && profile ? calculateTDEE(profile) : null;
  const target = saved && profile ? calculateTargetCalories(profile) : null;
  const macros = target ? calculateMacros(target, profile!.goal) : null;

  const goalBtns = [
    { v: 'lose' as const, l: 'Lose', i: <TrendingDown size={15} />, on: 'border-sky-500 bg-sky-50 dark:bg-sky-900/25 text-sky-700 dark:text-sky-300' },
    { v: 'maintain' as const, l: 'Maintain', i: <Minus size={15} />, on: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/25 text-emerald-700 dark:text-emerald-300' },
    { v: 'gain' as const, l: 'Gain', i: <TrendingUp size={15} />, on: 'border-amber-500 bg-amber-50 dark:bg-amber-900/25 text-amber-700 dark:text-amber-300' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 anim-in">
      {/* Input form */}
      <div className="glass p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-semibold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Calculator size={19} className="text-teal-600" />
            Metabolic Calculator
          </h3>
          <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500">Mifflin-St Jeor</span>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500">Gender</span>
              <select className="field mt-1" value={form.gender}
                onChange={e => setForm(p => ({ ...p, gender: e.target.value as UserProfile['gender'] }))}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </label>
            <label className="block">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500">Age</span>
              <input type="number" className="field mt-1 font-mono" min={10} max={100} value={form.age}
                onChange={e => setForm(p => ({ ...p, age: +e.target.value }))} />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500">Weight (kg)</span>
              <input type="number" className="field mt-1 font-mono" min={30} max={250} value={form.weight}
                onChange={e => setForm(p => ({ ...p, weight: +e.target.value }))} />
            </label>
            <label className="block">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500">Height (cm)</span>
              <input type="number" className="field mt-1 font-mono" min={100} max={250} value={form.height}
                onChange={e => setForm(p => ({ ...p, height: +e.target.value }))} />
            </label>
          </div>
          <label className="block">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500">Activity level</span>
            <select className="field mt-1" value={form.activityLevel}
              onChange={e => setForm(p => ({ ...p, activityLevel: e.target.value as UserProfile['activityLevel'] }))}>
              <option value="sedentary">Sedentary — office job, little exercise</option>
              <option value="light">Light — training 1–3 days/week</option>
              <option value="moderate">Moderate — training 3–5 days/week</option>
              <option value="active">Very active — training 6–7 days/week</option>
              <option value="extra">Athlete — physical job + daily training</option>
            </select>
          </label>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500">Weight goal</span>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {goalBtns.map(g => (
                <button key={g.v} onClick={() => setForm(p => ({ ...p, goal: g.v }))}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 text-xs font-semibold cursor-pointer transition-all active:scale-95 ${
                    form.goal === g.v ? g.on : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}>
                  {g.i}{g.l}
                </button>
              ))}
            </div>
          </div>
          <button onClick={save}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold text-sm shadow-lg shadow-teal-600/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2">
            <Cpu size={16} /> Compute & Save Profile
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {saved && profile && bmr && tdee && target && macros ? (
          <>
            <div className="glass p-6 anim-pop">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                <Activity size={16} className="text-emerald-500" /> Computed Results
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 text-center">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">BMR</p>
                  <p className="font-mono font-bold text-xl text-slate-700 dark:text-slate-100 tabular mt-1">{bmr}</p>
                  <p className="text-[10px] text-slate-400">kcal · rest</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 text-center">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">TDEE</p>
                  <p className="font-mono font-bold text-xl text-teal-600 dark:text-teal-300 tabular mt-1">{tdee}</p>
                  <p className="text-[10px] text-slate-400">kcal · daily</p>
                </div>
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 text-center text-white shadow-lg shadow-teal-600/25">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-teal-100/80">Target</p>
                  <p className="font-mono font-bold text-xl tabular mt-1">{target}</p>
                  <p className="text-[10px] text-teal-100/70">kcal · goal</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-4">
                {profile.goal === 'lose' ? '−500 kcal deficit → ~0.5 kg fat loss per week'
                  : profile.goal === 'gain' ? '+500 kcal surplus → ~0.5 kg lean gain per week'
                  : 'Calories matched to your expenditure — weight stays stable'}
              </p>
            </div>

            <div className="glass p-6 anim-pop" style={{ animationDelay: '80ms' }}>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                <Zap size={16} className="text-amber-500" /> Recommended Macros
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Protein', val: macros.protein, color: 'bg-sky-500', pct: profile.goal === 'lose' ? 35 : 30 },
                  { label: 'Carbs', val: macros.carbs, color: 'bg-amber-500', pct: profile.goal === 'lose' ? 35 : 45 },
                  { label: 'Fat', val: macros.fat, color: 'bg-rose-500', pct: profile.goal === 'lose' ? 30 : 25 },
                ].map(m => (
                  <div key={m.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500 dark:text-slate-400">{m.label}</span>
                      <span className="font-mono font-semibold text-slate-700 dark:text-slate-200 tabular">{m.val} g/day</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200/80 dark:bg-slate-700/70 overflow-hidden">
                      <div className={`h-full rounded-full ${m.color} anim-bar`} style={{ width: `${m.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass p-5 anim-pop" style={{ animationDelay: '160ms' }}>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                <HeartPulse size={16} className="text-rose-500" /> BMI Check
              </h3>
              {(() => {
                const bmi = profile.weight / ((profile.height / 100) ** 2);
                const cat = bmi < 18.5 ? ['Underweight', 'text-sky-600 dark:text-sky-400', 'bg-sky-500']
                  : bmi < 25 ? ['Normal', 'text-emerald-600 dark:text-emerald-400', 'bg-emerald-500']
                  : bmi < 30 ? ['Overweight', 'text-amber-600 dark:text-amber-400', 'bg-amber-500']
                  : ['Obese', 'text-rose-600 dark:text-rose-400', 'bg-rose-500'];
                return (
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-bold text-3xl text-slate-700 dark:text-slate-100 tabular">{bmi.toFixed(1)}</span>
                    <span className={`text-sm font-bold ${cat[1]}`}>{cat[0]}</span>
                  </div>
                );
              })()}
            </div>
          </>
        ) : (
          <div className="glass p-12 text-center">
            <Calculator size={36} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Enter your profile and the engine will compute your BMR, TDEE, target calories and macros.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
