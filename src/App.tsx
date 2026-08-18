import { useEffect, useMemo, useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import StudyExam from './components/StudyExam';
import FitnessHub from './components/FitnessHub';
import GoalsManager from './components/GoalsManager';
import Recreation from './components/Recreation';
import Report from './components/Report';
import type {
  TabType, Topic, StudyPlanResult, QuizQuestion, QuizAttempt,
  UserProfile, CalorieEntry, FitnessProfile, WorkoutPlanDay,
  Workout, Goal, RecreationItem,
} from './types';
import { getToday } from './utils/helpers';

export default function App() {
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('aifm-dark', false);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Study & exam
  const [topics, setTopics] = useLocalStorage<Topic[]>('aifm-topics', []);
  const [examDate, setExamDate] = useLocalStorage<string>('aifm-exam-date', '');
  const [studyPlan, setStudyPlan] = useLocalStorage<StudyPlanResult | null>('aifm-study-plan', null);
  const [customQuestions, setCustomQuestions] = useLocalStorage<QuizQuestion[]>('aifm-custom-questions', []);
  const [quizAttempts, setQuizAttempts] = useLocalStorage<QuizAttempt[]>('aifm-quiz-attempts', []);
  const [pomodoroTotal, setPomodoroTotal] = useLocalStorage<number>('aifm-pomodoro', 0);
  const [studyDay, setStudyDay] = useLocalStorage<string>('aifm-study-day', '');

  // Nutrition & workouts
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile | null>('aifm-profile', null);
  const [calorieEntries, setCalorieEntries] = useLocalStorage<CalorieEntry[]>('aifm-calories', []);
  const [fitnessProfile, setFitnessProfile] = useLocalStorage<FitnessProfile | null>('aifm-fitness-profile', null);
  const [workoutPlan, setWorkoutPlan] = useLocalStorage<WorkoutPlanDay[] | null>('aifm-workout-plan', null);
  const [workouts, setWorkouts] = useLocalStorage<Workout[]>('aifm-workouts', []);

  // Goals & leisure
  const [goals, setGoals] = useLocalStorage<Goal[]>('aifm-goals', []);
  const [recreationItems, setRecreationItems] = useLocalStorage<RecreationItem[]>('aifm-recreation', []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  // Pomodoro completion → credit topic + mark study day
  const handlePomodoroComplete = (minutes: number, topicId: string) => {
    setPomodoroTotal(prev => prev + minutes);
    setStudyDay(getToday());
    if (topicId) {
      setTopics(prev => prev.map(t => t.id === topicId
        ? { ...t, doneHours: Math.min(t.estHours, +(t.doneHours + minutes / 60).toFixed(2)) }
        : t));
    }
  };

  // Daily progress for header ring
  const dailyProgress = useMemo(() => {
    const today = getToday();
    let total = 0;
    let done = 0;

    const shortGoals = goals.filter(g => g.category === 'short');
    total += shortGoals.length;
    done += shortGoals.filter(g => g.completed).length;

    total += 1; // nutrition logged?
    if (calorieEntries.some(e => e.date === today)) done += 1;

    total += 1; // trained?
    if (workouts.some(w => w.date === today)) done += 1;

    total += 1; // studied?
    if (studyDay === today) done += 1;

    total += 1; // quiz taken?
    if (quizAttempts.some(a => a.date === today)) done += 1;

    return total === 0 ? 0 : Math.round((done / total) * 100);
  }, [goals, calorieEntries, workouts, studyDay, quizAttempts]);

  return (
    <div className="min-h-screen scene relative">
      {/* Ambient glow orbs */}
      <div className="orb orb-a" aria-hidden="true" />
      <div className="orb orb-b" aria-hidden="true" />

      <div className="relative z-10">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          dailyProgress={dailyProgress}
        />

        <main className="max-w-7xl mx-auto px-4 py-6 pb-16" key={activeTab}>
          {activeTab === 'dashboard' && (
            <Dashboard
              topics={topics}
              examDate={examDate}
              plan={studyPlan}
              attempts={quizAttempts}
              calorieEntries={calorieEntries}
              workouts={workouts}
              workoutPlan={workoutPlan}
              goals={goals}
              userProfile={userProfile}
              pomodoroTotal={pomodoroTotal}
              onNavigate={tab => setActiveTab(tab)}
            />
          )}

          {activeTab === 'study' && (
            <StudyExam
              topics={topics}
              setTopics={setTopics}
              examDate={examDate}
              setExamDate={setExamDate}
              plan={studyPlan}
              setPlan={setStudyPlan}
              customQuestions={customQuestions}
              setCustomQuestions={setCustomQuestions}
              attempts={quizAttempts}
              setAttempts={setQuizAttempts}
              pomodoroTotal={pomodoroTotal}
              onPomodoroComplete={handlePomodoroComplete}
            />
          )}

          {activeTab === 'fitness' && (
            <FitnessHub
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              calorieEntries={calorieEntries}
              setCalorieEntries={setCalorieEntries}
              fitnessProfile={fitnessProfile}
              setFitnessProfile={setFitnessProfile}
              workoutPlan={workoutPlan}
              setWorkoutPlan={setWorkoutPlan}
              workouts={workouts}
              setWorkouts={setWorkouts}
            />
          )}

          {activeTab === 'goals' && (
            <GoalsManager goals={goals} setGoals={setGoals} />
          )}

          {activeTab === 'recreation' && (
            <Recreation items={recreationItems} setItems={setRecreationItems} />
          )}

          {activeTab === 'report' && (
            <Report
              topics={topics}
              examDate={examDate}
              plan={studyPlan}
              attempts={quizAttempts}
              calorieEntries={calorieEntries}
              userProfile={userProfile}
              workouts={workouts}
              workoutPlan={workoutPlan}
              fitnessProfile={fitnessProfile}
              goals={goals}
              recreationItems={recreationItems}
              pomodoroTotal={pomodoroTotal}
            />
          )}
        </main>
      </div>
    </div>
  );
}
