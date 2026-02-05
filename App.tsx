
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import TrackerView from './components/TrackerView';
import WorkoutGuide from './components/WorkoutGuide';
import CalendarView from './components/CalendarView';
import SettingsView from './components/SettingsView';
import { UserData, BodyPart, Workout, WorkoutSource, DEFAULT_BODY_PARTS, DEFAULT_SOURCES, PlannerGoal, DailyCompletion } from './types';
import { loadWorkouts, saveWorkouts } from './utils/persistence';

const INITIAL_WORKOUTS: Workout[] = [
  { id: '1', name: 'Elite Chest Press', bodyPart: BodyPart.CHEST, source: WorkoutSource.EQUIPMENT, caloriesBurned: 120, createdAt: Date.now(), isFavorite: false },
  { id: '2', name: 'Explosive Jump Squats', bodyPart: BodyPart.LEGS, source: WorkoutSource.HOME, caloriesBurned: 150, createdAt: Date.now(), isFavorite: true },
  { id: '3', name: 'Calisthenics Back Flow', bodyPart: BodyPart.BACK, source: WorkoutSource.YOUTUBE, youtubeUrl: 'https://www.youtube.com/watch?v=pYcpY20QaE8', caloriesBurned: 100, createdAt: Date.now(), isFavorite: false }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('tracker');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [bodyParts, setBodyParts] = useState<BodyPart[]>([]);
  const [sources, setSources] = useState<WorkoutSource[]>([]);
  
  // Advanced Planner States
  const [plannerGoals, setPlannerGoals] = useState<PlannerGoal[]>([]);
  const [dailyCompletions, setDailyCompletions] = useState<DailyCompletion>({});

  const [userData, setUserData] = useState<UserData>({
    age: 28, weight: 69.1, height: 175, gender: 'male',
    activityLevel: 1.55, dailySteps: 5430, caloriesConsumed: 1450,
    waterIntake: 1200, workoutsDone: 1, primaryFocus: BodyPart.CHEST
  });

  useEffect(() => {
    const savedWorkouts = loadWorkouts();
    setWorkouts(savedWorkouts.length ? savedWorkouts : INITIAL_WORKOUTS);

    // Unified Category Loading
    const savedCategories = localStorage.getItem('meowfit_categories');
    if (savedCategories) {
      try {
        const { bodyParts: savedParts, sources: savedSources } = JSON.parse(savedCategories);
        if (savedParts) setBodyParts(savedParts);
        if (savedSources) setSources(savedSources);
      } catch (e) {
        console.error("Failed to parse categories", e);
      }
    } else {
      // Legacy or default fallback
      const savedParts = localStorage.getItem('meowfit_bodyparts');
      const savedSources = localStorage.getItem('meowfit_sources');
      setBodyParts(savedParts ? JSON.parse(savedParts) : DEFAULT_BODY_PARTS);
      setSources(savedSources ? JSON.parse(savedSources) : DEFAULT_SOURCES);
    }

    const savedGoals = localStorage.getItem('meowfit_planner_goals');
    setPlannerGoals(savedGoals ? JSON.parse(savedGoals) : []);

    const savedCompletions = localStorage.getItem('meowfit_completions');
    setDailyCompletions(savedCompletions ? JSON.parse(savedCompletions) : {});
  }, []);

  // Category Persistence
  useEffect(() => {
    if (bodyParts.length > 0 || sources.length > 0) {
      localStorage.setItem('meowfit_categories', JSON.stringify({ bodyParts, sources }));
    }
  }, [bodyParts, sources]);

  useEffect(() => {
    localStorage.setItem('meowfit_planner_goals', JSON.stringify(plannerGoals));
  }, [plannerGoals]);

  useEffect(() => {
    localStorage.setItem('meowfit_completions', JSON.stringify(dailyCompletions));
  }, [dailyCompletions]);

  const handleToggleCompletion = (goalId: string) => {
    const dateKey = new Date().toISOString().split('T')[0];
    const currentDayCompletions = dailyCompletions[dateKey] || [];
    
    let newCompletions;
    if (currentDayCompletions.includes(goalId)) {
      newCompletions = currentDayCompletions.filter(id => id !== goalId);
    } else {
      newCompletions = [...currentDayCompletions, goalId];
    }
    
    setDailyCompletions({
      ...dailyCompletions,
      [dateKey]: newCompletions
    });
  };

  const handleAddGoal = (goal: PlannerGoal) => {
    setPlannerGoals([...plannerGoals, goal]);
  };

  const handleDeleteGoal = (id: string) => {
    setPlannerGoals(plannerGoals.filter(g => g.id !== id));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'tracker':
        return (
          <TrackerView 
            userData={userData} 
            setUserData={setUserData} 
            plannerGoals={plannerGoals}
            dailyCompletions={dailyCompletions}
            onToggleCompletion={handleToggleCompletion}
            onAddGoal={handleAddGoal}
            onDeleteGoal={handleDeleteGoal}
            workouts={workouts}
          />
        );
      case 'workout':
        return (
          <WorkoutGuide 
            workouts={workouts} 
            onAddWorkout={(w) => { const upd = [w, ...workouts]; setWorkouts(upd); saveWorkouts(upd); }}
            onUpdateWorkout={(w) => { const upd = workouts.map(i => i.id === w.id ? w : i); setWorkouts(upd); saveWorkouts(upd); }}
            onDeleteWorkout={(id) => { const upd = workouts.filter(w => w.id !== id); setWorkouts(upd); saveWorkouts(upd); }}
            onToggleFavorite={(id) => { const upd = workouts.map(w => w.id === id ? { ...w, isFavorite: !w.isFavorite } : w); setWorkouts(upd); saveWorkouts(upd); }}
            bodyParts={bodyParts}
            sources={sources}
          />
        );
      case 'calendar': 
        return (
          <CalendarView 
            goals={plannerGoals} 
            completions={dailyCompletions} 
            workouts={workouts} 
          />
        );
      case 'settings':
        return (
          <SettingsView 
            userData={userData} setUserData={setUserData} 
            bodyParts={bodyParts} setBodyParts={setBodyParts}
            sources={sources} setSources={setSources}
          />
        );
      default: return <TrackerView userData={userData} setUserData={setUserData} plannerGoals={[]} dailyCompletions={{}} onToggleCompletion={()=>{}} onAddGoal={()=>{}} onDeleteGoal={()=>{}} workouts={[]} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col max-w-lg mx-auto shadow-2xl overflow-hidden relative border-x border-gray-100">
      <main className="flex-1 overflow-y-auto hide-scrollbar bg-inherit pb-24">
        {renderContent()}
      </main>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;
