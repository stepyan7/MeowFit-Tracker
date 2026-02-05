
import React, { useState, useMemo } from 'react';
import { UserData, PlannerGoal, DailyCompletion, Workout } from '../types';
import CatState from './CatState';
import WorkoutPlanner from './WorkoutPlanner';
import PreviewModal from './PreviewModal';
import { Target, Trophy, Sparkles, X, Award, Flame, CalendarDays } from 'lucide-react';

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

const getLocalDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const ProgressSection: React.FC<{ goals: PlannerGoal[], completions: DailyCompletion }> = ({ goals, completions }) => {
  const { daily, weekly } = useMemo(() => {
    const today = new Date();
    const todayKey = getLocalDateKey(today);
    const todayDay = today.getDay();

    const todayGoals = goals.filter(g => {
      if (g.type === 'specific') return g.date === todayKey;
      return g.targetDays.includes(todayDay);
    });
    
    const dailyDone = todayGoals.filter(g => (completions[todayKey] || []).includes(g.id)).length;
    const dailyRate = todayGoals.length === 0 ? 0 : Math.round((dailyDone / todayGoals.length) * 100);

    const dayOfW = today.getDay();
    const diff = today.getDate() - dayOfW + (dayOfW === 0 ? -6 : 1);
    const monday = new Date(today.getFullYear(), today.getMonth(), diff);

    let totalNeeded = 0, totalDone = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      const dKey = getLocalDateKey(d);
      const dow = d.getDay();
      
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
  const [showAchievement, setShowAchievement] = useState(false);

  const achievementStats = useMemo(() => {
    const today = new Date();
    const dayOfW = today.getDay();
    const diff = today.getDate() - dayOfW + (dayOfW === 0 ? -6 : 1);
    const monday = new Date(today.getFullYear(), today.getMonth(), diff);
    
    let weeklyCount = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      const dKey = getLocalDateKey(d);
      if (d > today) break; 
      weeklyCount += (dailyCompletions[dKey] || []).length;
    }

    let monthlyCount = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dKey = getLocalDateKey(d);
      monthlyCount += (dailyCompletions[dKey] || []).length;
    }

    const quotes = [
      "你的肌肉正在尖叫，但我只聽到罐罐打開的聲音喵！",
      "不錯喵，你現在的汗水，都是未來換取貓草的資本！",
      "雖然你還是比我懶，但這週的表現勉強算你及格喵。",
      "看到這些數字，我覺得我的罐罐份量有望增加了喵！",
      "繼續保持喵，人類的意志力有時候還是很驚人的。"
    ];

    return { 
      weekly: weeklyCount, 
      monthly: monthlyCount, 
      quote: quotes[Math.floor(Math.random() * quotes.length)] 
    };
  }, [dailyCompletions]);

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-700 pb-24 bg-[#F9FAFB] min-h-screen">
      <header className="flex justify-between items-center px-2">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">MeowFit</h1>
          <p className="text-sm font-medium text-gray-400">Achievement Hub</p>
        </div>
        <button 
          onClick={() => setShowAchievement(true)}
          className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-indigo-600 shadow-sm active:scale-95 transition-all"
        >
          <Trophy className="w-6 h-6" />
        </button>
      </header>

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

      {showAchievement && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAchievement(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-[3rem] p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowAchievement(false)} 
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 bg-yellow-100 rounded-[2rem] flex items-center justify-center text-yellow-600">
                <Award size={40} />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-gray-800">成就解鎖</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Hall of Glory</p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="bg-indigo-50 p-4 rounded-3xl border border-indigo-100">
                  <CalendarDays className="text-indigo-600 w-5 h-5 mx-auto mb-2" />
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">本週成就</p>
                  <p className="text-2xl font-black text-gray-800">{achievementStats.weekly}</p>
                  <p className="text-[8px] font-bold text-gray-400 uppercase">Drills Done</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-3xl border border-purple-100">
                  <Flame className="text-purple-600 w-5 h-5 mx-auto mb-2" />
                  <p className="text-[10px] font-black text-purple-400 uppercase tracking-tighter">30日總計</p>
                  <p className="text-2xl font-black text-gray-800">{achievementStats.monthly}</p>
                  <p className="text-[8px] font-bold text-gray-400 uppercase">Drills Done</p>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 relative w-full">
                <div className="absolute -top-3 left-6 px-2 bg-white text-[10px] font-black text-gray-400 uppercase tracking-widest border border-gray-100 rounded-full">
                  Coach Nagging
                </div>
                <p className="text-xs font-bold text-gray-600 italic leading-relaxed">
                  「{achievementStats.quote}」
                </p>
              </div>

              <button 
                onClick={() => setShowAchievement(false)}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 active:scale-95 transition-all"
              >
                繼續變強喵
              </button>
            </div>
          </div>
        </div>
      )}

      {previewWorkout && (
        <PreviewModal workout={previewWorkout} onClose={() => setPreviewWorkout(null)} />
      )}
    </div>
  );
};

export default TrackerView;
