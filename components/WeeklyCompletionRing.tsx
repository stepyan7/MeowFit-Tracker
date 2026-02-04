
import React from 'react';
import { PlannerGoal, DailyCompletion } from '../types';
import { Award, Star } from 'lucide-react';

interface WeeklyCompletionRingProps {
  goals: PlannerGoal[];
  completions: DailyCompletion;
}

const WeeklyCompletionRing: React.FC<WeeklyCompletionRingProps> = ({ goals, completions }) => {
  const getWeeklyStats = () => {
    const curr = new Date();
    const first = curr.getDate() - curr.getDay() + (curr.getDay() === 0 ? -6 : 1); // Monday
    
    let totalAssigned = 0;
    let totalCompleted = 0;
    let perfectDays = 0;

    for (let i = 0; i < 7; i++) {
      const d = new Date(curr.setDate(first + i));
      const dateKey = d.toISOString().split('T')[0];
      const dow = d.getDay();
      
      const dayGoals = goals.filter(g => g.targetDays.includes(dow));
      const dayCompletions = completions[dateKey] || [];
      
      if (dayGoals.length > 0) {
        totalAssigned += dayGoals.length;
        const done = dayGoals.filter(g => dayCompletions.includes(g.id)).length;
        totalCompleted += done;
        // Count as perfect day only if 100% goals are done
        if (done === dayGoals.length) perfectDays++;
      } else {
        // Rest days with no goals are traditionally considered "Perfect" for consistency
        perfectDays++;
      }
    }

    const mastery = totalAssigned === 0 ? 0 : Math.round((totalCompleted / totalAssigned) * 100);
    return { mastery, perfectDays };
  };

  const { mastery, perfectDays } = getWeeklyStats();
  const radius = 56; 
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (mastery / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center py-2">
      <svg className="w-40 h-40 transform -rotate-90">
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="currentColor"
          strokeWidth="10"
          fill="transparent"
          className="text-gray-100"
        />
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="url(#ringGradient)"
          strokeWidth="10"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: offset }}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#d946ef" />
          </linearGradient>
        </defs>
      </svg>
      
      <div className="absolute flex flex-col items-center justify-center animate-in zoom-in-50 duration-500">
        <span className="text-3xl font-black text-gray-800 tracking-tighter">{mastery}%</span>
        <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Mastery</span>
      </div>

      <div className="absolute -bottom-1 flex flex-col items-center gap-1.5">
        <div className="bg-white px-3 py-1 rounded-xl shadow-md border border-indigo-50 flex items-center gap-1.5">
          <Award size={12} className="text-yellow-500" fill="currentColor" />
          <span className="text-[9px] font-black text-gray-700 uppercase tracking-tight">Cycle</span>
        </div>
        <div className="bg-emerald-500 px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-1 scale-90">
          <Star size={10} className="text-white fill-white" />
          <span className="text-[9px] font-black text-white whitespace-nowrap">Perfect Days: {perfectDays}/7</span>
        </div>
      </div>
    </div>
  );
};

export default WeeklyCompletionRing;
