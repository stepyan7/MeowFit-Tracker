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

// ✨ 輔助函數：統一日期格式，避免時差
const getLocalDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const ProgressSection: React.FC<{ goals: PlannerGoal[], completions: DailyCompletion }> = ({ goals, completions }) => {
  const { daily, weekly } = useMemo(() => {
    const today = new Date();
    const todayKey = getLocalDateKey(today); // 👈 修正
    const todayDay = today.getDay();

    // 1. Daily Calc (修正過濾邏輯)
    const todayGoals = goals.filter(g => {
      if (g.type === 'specific') return g.date === todayKey;
      return g.targetDays.includes(todayDay);
    });
    
    const dailyDone = todayGoals.filter(g => (completions[todayKey] || []).includes(g.id)).length;
    const dailyRate = todayGoals.length === 0 ? 0 : Math.round((dailyDone / todayGoals.length) * 100);

    // 2. Weekly Calc (修正過濾邏輯)
    // 獲取本週一的日期
    const dayOfW = today.getDay();
    const diff = today.getDate() - dayOfW + (dayOfW === 0 ? -6 : 1);
    const monday = new Date(today.getFullYear(), today.getMonth(), diff);

    let totalNeeded = 0, totalDone = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      const dKey = getLocalDateKey(d);
      const dow = d.getDay();
      
      // 過濾該日應有的目標：具體日期匹配 OR 循環日期匹配
      const dGoals = goals.filter(g => {
        if (g.type === 'specific') return g.date === dKey;
        return g.targetDays.includes(dow);
      });

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
          <div className="w-1/3 min-w-[120px]">
            <CatState 
              userData={userData} 
              dailyCompletions={dailyCompletions} 
              plannerGoals={plannerGoals} 
              workouts={workouts}
            />
          </div>

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
          goals={plannerGoals} 
          completions={dailyCompletions} 
          onToggle={onToggleCompletion} 
          onAdd={onAddGoal} 
          onDelete={onDeleteGoal} 
          workouts={workouts} 
          onPreviewWorkout={setPreviewWorkout}
        />
      </div>

      {previewWorkout && (
        <PreviewModal workout={previewWorkout} onClose={() => setPreviewWorkout(null)} />
      )}
    </div>
  );
};

export default TrackerView;