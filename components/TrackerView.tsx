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

// 內置簡潔的長條狀進度條組件
const WeeklyProgressBar: React.FC<{ goals: PlannerGoal[], completions: DailyCompletion }> = ({ goals, completions }) => {
  const stats = useMemo(() => {
    const curr = new Date();
    // 獲取本週週一
    const first = curr.getDate() - curr.getDay() + (curr.getDay() === 0 ? -6 : 1);
    let totalNeeded = 0;
    let totalDone = 0;

    for (let i = 0; i < 7; i++) {
      const d = new Date(new Date(first).setDate(new Date(first).getDate() + i));
      const dow = d.getDay();
      const dayGoals = goals.filter(g => g.targetDays.includes(dow));
      if (dayGoals.length > 0) {
        totalNeeded += dayGoals.length;
        const key = d.toISOString().split('T')[0];
        totalDone += (completions[key] || []).filter(id => dayGoals.some(g => g.id === id)).length;
      }
    }
    return totalNeeded === 0 ? 0 : Math.round((totalDone / totalNeeded) * 100);
  }, [goals, completions]);

  return (
    <div className="w-full max-w-[300px] px-4">
      <div className="flex justify-between items-end mb-2">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Weekly Progress</span>
        <span className="text-xs font-black text-indigo-600">{stats}%</span>
      </div>
      <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-50">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${stats}%` }}
        />
      </div>
    </div>
  );
};

const TrackerView: React.FC<TrackerViewProps> = ({ 
  userData, setUserData, plannerGoals, dailyCompletions, onToggleCompletion, onAddGoal, onDeleteGoal, workouts
}) => {
  const [previewWorkout, setPreviewWorkout] = useState<Workout | null>(null);

  return (
    <div className="p-4 space-y-8 animate-in fade-in duration-700 pb-24 bg-[#F9FAFB]">
      {/* Header */}
      <header className="flex justify-between items-center px-2">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">MeowFit</h1>
          <p className="text-sm font-medium text-gray-400">Achievement Hub</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-indigo-600 shadow-sm">
          <Trophy className="w-6 h-6" />
        </div>
      </header>

      {/* Hero Achievement Section - 橘貓教練核心展示區 */}
      <section className="bg-white rounded-[3.5rem] p-8 shadow-sm border border-gray-100 flex flex-col items-center relative overflow-hidden">
        {/* 背景裝飾 */}
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
          <Sparkles size={120} />
        </div>
        
        {/* 貓咪教練主體 (內含對話框、400x400圖片、下方Quote) */}
        <div className="w-full z-10">
          <CatState 
            userData={userData} 
            dailyCompletions={dailyCompletions} 
            plannerGoals={plannerGoals} 
            workouts={workouts}
          />
        </div>

        {/* 縮小後的長條進度條 (取代原本龐大的環形) */}
        <div className="w-full mt-4 flex justify-center z-10">
          <WeeklyProgressBar 
            goals={plannerGoals} 
            completions={dailyCompletions} 
          />
        </div>

        {/* 裝飾性標語 */}
        <div className="mt-8 pt-6 border-t border-gray-50 w-full text-center">
          <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.4em]">
            Consistency is the path to evolution
          </p>
        </div>
      </section>

      {/* Action Focus: Planner Checklist */}
      <div className="space-y-4 px-2">
        <div className="flex items-center gap-2">
          <Target size={18} className="text-indigo-600" />
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

      {/* Footer Encouragement */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-7 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group mx-2">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
        <div className="relative z-10">
          <h4 className="text-xl font-black tracking-tight italic">Dojo Spirit</h4>
          <p className="text-indigo-100 text-[12px] leading-relaxed mt-2 font-medium opacity-90">
            Every drill checked is a step closer to a Buff Cat. <br/>Keep the momentum going!
          </p>
        </div>
      </div>

      {/* Preview Modal */}
      {previewWorkout && (
        <PreviewModal 
          workout={previewWorkout} 
          onClose={() => setPreviewWorkout(null)} 
        />
      )}
    </div>
  );
};

export default TrackerView;