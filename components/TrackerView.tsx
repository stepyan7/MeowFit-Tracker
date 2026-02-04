
import React, { useState } from 'react';
import { UserData, PlannerGoal, DailyCompletion, Workout } from '../types';
import CatState from './CatState';
import WorkoutPlanner from './WorkoutPlanner';
import PreviewModal from './PreviewModal';
import WeeklyCompletionRing from './WeeklyCompletionRing';
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

const TrackerView: React.FC<TrackerViewProps> = ({ 
  userData, setUserData, plannerGoals, dailyCompletions, onToggleCompletion, onAddGoal, onDeleteGoal, workouts
}) => {
  const [previewWorkout, setPreviewWorkout] = useState<Workout | null>(null);

  return (
    <div className="p-4 space-y-8 animate-in fade-in duration-700 pb-24">
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

      {/* Hero Achievement Section */}
      <section className="bg-white rounded-[3rem] p-8 shadow-sm border border-gray-100 flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
          <Sparkles size={120} />
        </div>
        
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex-1">
            <CatState 
              userData={userData} 
              dailyCompletions={dailyCompletions} 
              plannerGoals={plannerGoals} 
            />
          </div>
          <div className="flex-1 flex justify-center">
            <WeeklyCompletionRing 
              goals={plannerGoals} 
              completions={dailyCompletions} 
            />
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-50 w-full text-center">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
            Consistency is the path to evolution
          </p>
        </div>
      </section>

      {/* Action Focus: Planner Checklist */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
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
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
        <div className="relative z-10">
          <h4 className="text-lg font-black tracking-tight">Dojo Spirit</h4>
          <p className="text-indigo-100 text-[11px] leading-relaxed mt-1 font-medium">
            Every drill checked is a step closer to a Buff Cat. Keep the momentum going!
          </p>
        </div>
      </div>

      {/* Preview Modal for Planner Items */}
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
