
import React from 'react';
import { UserData, BodyPart, NekoMood, PlannerGoal, DailyCompletion } from '../types';
import { Sparkles } from 'lucide-react';

interface CatStateProps {
  userData: UserData;
  dailyCompletions: DailyCompletion;
  plannerGoals: PlannerGoal[];
}

const CatState: React.FC<CatStateProps> = ({ userData, dailyCompletions, plannerGoals }) => {
  const getWeeklyStats = () => {
    const curr = new Date();
    const first = curr.getDate() - curr.getDay() + (curr.getDay() === 0 ? -6 : 1);
    
    let perfectDays = 0;
    let totalAssigned = 0;
    let totalCompleted = 0;

    for (let i = 0; i < 7; i++) {
      const d = new Date(curr.setDate(first + i));
      const dateKey = d.toISOString().split('T')[0];
      const dow = d.getDay();
      const dayGoals = plannerGoals.filter(g => g.targetDays.includes(dow));
      const dayCompletions = dailyCompletions[dateKey] || [];
      
      if (dayGoals.length > 0) {
        totalAssigned += dayGoals.length;
        const count = dayGoals.filter(g => dayCompletions.includes(g.id)).length;
        totalCompleted += count;
        // Check for 100% completion
        if (count === dayGoals.length) perfectDays++;
      } else {
        // Rest day counts as perfect
        perfectDays++;
      }
    }
    const rate = totalAssigned === 0 ? 1 : totalCompleted / totalAssigned;
    return { rate, perfectDays };
  };

  const { rate, perfectDays } = getWeeklyStats();

  const getMood = (): NekoMood => {
    if (rate >= 0.8) return NekoMood.EXCITED;
    if (rate >= 0.5) return NekoMood.HAPPY;
    if (rate >= 0.2) return NekoMood.BORED;
    return NekoMood.ANGRY;
  };

  const mood = getMood();
  const isSuperHappy = perfectDays >= 5;
  
  const visuals = {
    [NekoMood.LAZY]: { emoji: '🐱💤', text: 'Lazy', color: 'text-slate-400', bubble: 'Zzz...' },
    [NekoMood.HAPPY]: { emoji: '🐱✨', text: 'Happy', color: 'text-emerald-500', bubble: 'Mrow!' },
    [NekoMood.SPORTY]: { emoji: '🐱🔥', text: 'Sporty', color: 'text-orange-500', bubble: 'Burn it!' },
    [NekoMood.BUFF]: { emoji: '😼💪', text: 'Buff', color: 'text-indigo-600', bubble: 'I AM GAINS' },
    [NekoMood.EXCITED]: { emoji: '😻✨', text: 'Stoked', color: 'text-pink-500', bubble: 'WOW!' },
    [NekoMood.BORED]: { emoji: '😿', text: 'Bored', color: 'text-slate-300', bubble: '...' },
    [NekoMood.ANGRY]: { emoji: '😾💢', text: 'Angry', color: 'text-rose-500', bubble: 'MOVE!' },
  };

  const current = visuals[mood] || visuals[NekoMood.HAPPY];

  return (
    <div className="flex flex-col items-center text-center space-y-2">
      <div className="relative group cursor-help">
        <div className="text-7xl drop-shadow-md transition-transform duration-500 hover:scale-110 relative">
          {current.emoji}
          {isSuperHappy && (
            <div className="absolute -top-2 -right-2 text-yellow-400 animate-pulse">
              <Sparkles size={24} fill="currentColor" />
            </div>
          )}
        </div>
        <div className="absolute -top-4 -right-8 bg-white px-3 py-1 rounded-2xl shadow-md border border-gray-50 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
          <p className="text-[10px] font-black text-gray-600 italic">
            {isSuperHappy ? "✨ UNSTOPPABLE! ✨" : `"${current.bubble}"`}
          </p>
        </div>
      </div>
      <div>
        <h3 className={`text-xl font-black tracking-tight ${isSuperHappy ? 'text-indigo-600' : current.color}`}>
          {isSuperHappy ? 'Supreme' : current.text} Cat
        </h3>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
          {userData.primaryFocus} Focus
        </p>
      </div>
    </div>
  );
};

export default CatState;
