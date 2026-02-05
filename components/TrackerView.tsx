import React, { useState, useMemo } from 'react';
import { UserData, PlannerGoal, DailyCompletion, Workout } from '../types';
import CatState from './CatState';
import WorkoutPlanner from './WorkoutPlanner';
import PreviewModal from './PreviewModal';
import { Target, Trophy, Sparkles } from 'lucide-react';

interface TrackerViewProps {
  userData: UserData;
  setUserData: (data: UserData) => void;
  plannerGoals: PlannerGoal[];
  dailyCompletions: DailyCompletion;
  onToggleCompletion: (id: string) => void;
  onAddGoal: (goal: PlannerGoal) => void;
  onDeleteGoal: (id: string) => void;
  workouts: Workout[];
}

const ProgressSection: React.FC<{ goals: PlannerGoal[], completions: DailyCompletion }> = ({ goals, completions }) => {
  const { daily, weekly } = useMemo(() => {
    const today = new Date();
    const todayKey = today.toISOString().split('T')[0];
    const todayDay = today.getDay();

    // Daily Calc
    const todayGoals = goals.filter(g => g.targetDays.includes(todayDay));
    const dailyDone = todayGoals.filter(g => (completions[todayKey] || []).includes(g.id)).length;
    const dailyRate = todayGoals.length === 0 ? 0 : Math.round((dailyDone / todayGoals.length) * 100);

    // Weekly Calc
    const first = today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1);
    let totalNeeded = 0, totalDone = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(new Date(first).setDate(new Date(first).getDate() + i));
      const dKey = d.toISOString().split('T')[0];
      const dGoals = goals.filter(g => g.targetDays.includes(d.getDay()));
      totalNeeded += dGoals.length;
      totalDone += (completions[dKey] || []).filter(id => dGoals.some(g => g.id === id)).length;
    }
    const weeklyRate = totalNeeded === 0 ? 0 : Math.round((totalDone / totalNeeded) * 100);

    return { daily: dailyRate, weekly: weeklyRate };
  }, [goals, completions]);

  const Bar = ({ label, value, color }: any) => (
    <div className="w-full">
      <div className="flex justify-between items-end mb-1">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{label}</span>
        <span className={`text-xs font-black ${color}`}>{value}%</span>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-50 shadow-inner">
        <div 
          className={`h-full bg-current ${color} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="flex-1 space-y-5 w-full">
      <Bar label="Daily Completion" value={daily} color="text-indigo-500" />
      <Bar label="Weekly Progress" value={weekly} color="text-purple-600" />
    </div>
  );
};

const TrackerView: React.FC<TrackerViewProps> = ({ 
  userData, setUserData, plannerGoals, dailyCompletions, onToggleCompletion, onAddGoal, onDeleteGoal, workouts
}) => {
  const [previewWorkout, setPreviewWorkout] = useState<Workout | null>(null);

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-700 pb-24 bg-[#F9FAFB] min-h-screen">
      <header className="flex justify-between items-center px-2">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">MeowFit</h1>
          <p className="text-sm font-medium text-gray-400">Achievement Hub</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-indigo-600 shadow-sm">
          <Trophy className="w-6 h-6" />
        </div>
      </header>

      {/* Hero Section: 左圖右條佈局 */}
      <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Sparkles size={80} />
        </div>
        
        <div className="flex items-center gap-6 relative z-10">
          {/* 左側：貓咪縮小一半 (w-1/3) */}
          <div className="w-1/3 min-w-[120px]">
            <CatState 
              userData={userData} 
              dailyCompletions={dailyCompletions} 
              plannerGoals={plannerGoals} 
              workouts={workouts}
            />
          </div>

          {/* 右側：進度條 */}
          <ProgressSection 
            goals={plannerGoals} 
            completions={dailyCompletions} 
          />
        </div>
      </section>

      {/* Action Focus */}
      <div className="space-y-4 px-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
            <Target size={18} />
          </div>
          <h2 className="text-lg font-black text-gray-800 tracking-tight">Active Drills</h2>
        </div>
        
        <WorkoutPlanner 
          goals={plannerGoals} completions={dailyCompletions} onToggle={onToggleCompletion} 
          onAdd={onAddGoal} onDelete={onDeleteGoal} workouts={workouts} onPreviewWorkout={setPreviewWorkout}
        />
      </div>

      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-[2rem] shadow-lg text-white mx-2">
        <h4 className="text-lg font-black tracking-tight italic">Dojo Spirit</h4>
        <p className="text-indigo-100 text-[11px] leading-relaxed mt-1 opacity-90">
          Every drill checked is a step closer to a Buff Cat.
        </p>
      </div>

      {previewWorkout && (
        <PreviewModal workout={previewWorkout} onClose={() => setPreviewWorkout(null)} />
      )}
    </div>
  );
};

export default TrackerView;