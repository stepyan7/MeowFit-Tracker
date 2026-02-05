
import React, { useState, useMemo } from 'react';
import { PlannerGoal, DailyCompletion, Workout } from '../types';
import { 
  X, Calendar, ChevronLeft, ChevronRight, Flame, 
  CheckCircle2, Circle, History, PawPrint,
  ChessQueen, BicepsFlexed, Smile, Cat, Angry, MoonStar 
} from 'lucide-react';

interface HistoryModalProps {
  goals: PlannerGoal[];
  completions: DailyCompletion;
  workouts: Workout[];
  onClose: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ goals, completions, workouts, onClose }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  
  const getDayCompletionStats = (dateKey: string, dow: number) => {
    const goalsForDay = goals.filter(g => {
      if (g.type === 'specific') return g.date === dateKey;
      return g.targetDays.includes(dow);
    });
    if (goalsForDay.length === 0) return { rate: 1, isRest: true };
    const completedIds = completions[dateKey] || [];
    const count = goalsForDay.filter(g => completedIds.includes(g.id)).length;
    return { rate: count / goalsForDay.length, isRest: false };
  };

  const getHeatmapColor = (rate: number, isRest: boolean) => {
    if (isRest) return 'bg-gray-50 border-gray-100 text-gray-400';
    if (rate === 1) return 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-100';
    if (rate >= 0.75) return 'bg-indigo-400 border-indigo-400 text-white';
    if (rate >= 0.5) return 'bg-indigo-300 border-indigo-300 text-white';
    if (rate >= 0.25) return 'bg-indigo-200 border-indigo-200 text-indigo-800';
    if (rate > 0) return 'bg-indigo-100 border-indigo-100 text-indigo-900';
    return 'bg-red-50 border-red-100 text-red-500';
  };

  const MoodIcon = ({ rate, isRest, className = "w-6 h-6" }: { rate: number, isRest: boolean, className?: string }) => {
    if (isRest) return <MoonStar className={`${className} text-sky-400`} />;
    if (rate >= 1) return <ChessQueen className={`${className} text-indigo-600`} />;
    if (rate >= 0.8) return <BicepsFlexed className={`${className} text-emerald-500`} />;
    if (rate >= 0.6) return <Smile className={`${className} text-amber-500`} />;
    if (rate >= 0.4) return <Cat className={`${className} text-orange-500`} />;
    return <Angry className={`${className} text-rose-500`} />;
  };

  const getStatusTextColor = (item: { rate: number, isRest: boolean }) => {
    if (item.isRest) return 'text-gray-400';
    if (item.rate === 1) return 'text-indigo-600';
    if (item.rate > 0) return 'text-emerald-500';
    return 'text-red-500';
  };

  const calculateCaloriesForDay = (dateKey: string) => {
    const completedIds = completions[dateKey] || [];
    return completedIds.reduce((sum, goalId) => {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return sum;
      const workout = workouts.find(w => w.id === goal.workoutId || w.name.toLowerCase() === goal.name.toLowerCase());
      return sum + (workout?.caloriesBurned || 0);
    }, 0);
  };

  const last14Days = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const dow = d.getDay();
      const { rate, isRest } = getDayCompletionStats(key, dow);
      return {
        key, date: d, rate, calories: calculateCaloriesForDay(key),
        isRest
      };
    });
  }, [goals, completions, workouts]);

  const renderCalendarDropdown = () => {
    const calendarDays = Array.from({ length: 28 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (27 - i));
      const key = d.toISOString().split('T')[0];
      const dow = d.getDay();
      const { rate, isRest } = getDayCompletionStats(key, dow);
      return { key, day: d.getDate(), rate, isRest };
    });

    return (
      <div className="bg-white border border-gray-100 rounded-[2rem] p-4 shadow-xl animate-in slide-in-from-top-4 duration-300 mb-4">
        <div className="grid grid-cols-7 gap-1">
          {['S','M','T','W','T','F','S'].map(d => (
            <div key={d} className="text-[8px] font-black text-gray-300 text-center uppercase py-1">{d}</div>
          ))}
          {calendarDays.map((d, i) => (
            <button 
              key={i} 
              onClick={() => { setSelectedDate(d.key); setShowCalendar(false); }}
              className={`aspect-square rounded-lg flex items-center justify-center text-[9px] font-black border transition-all ${getHeatmapColor(d.rate, d.isRest)}`}
            >
              {d.rate === 1 && !d.isRest ? <PawPrint size={10} /> : d.day}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderDailyDetail = (dateKey: string) => {
    const date = new Date(dateKey);
    const dow = date.getDay();
    const dayGoals = goals.filter(g => {
      if (g.type === 'specific') return g.date === dateKey;
      return g.targetDays.includes(dow);
    });
    const dayCompletions = completions[dateKey] || [];
    const totalCals = calculateCaloriesForDay(dateKey);
    const { rate, isRest } = getDayCompletionStats(dateKey, dow);

    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setSelectedDate(null)}
            className="flex items-center gap-1 text-[10px] font-black text-indigo-600 uppercase tracking-widest"
          >
            <ChevronLeft size={14} /> Back to Summary
          </button>
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex items-center justify-between">
          <div className="flex flex-col items-center">
            <MoodIcon rate={rate} isRest={isRest} className="w-8 h-8" />
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-2">Daily Spirit</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end text-orange-500">
              <Flame size={18} fill="currentColor" />
              <span className="text-2xl font-black">{totalCals}</span>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Burned</p>
          </div>
        </div>

        <div className="space-y-3">
          <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Drills Log</h5>
          {dayGoals.length > 0 ? dayGoals.map(goal => (
            <div key={goal.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3">
                {dayCompletions.includes(goal.id) ? (
                  <CheckCircle2 size={20} className="text-emerald-500" />
                ) : (
                  <Circle size={20} className="text-gray-200" />
                )}
                <span className={`text-xs font-bold ${dayCompletions.includes(goal.id) ? 'text-gray-700' : 'text-gray-400'}`}>
                  {goal.name}
                </span>
              </div>
              <span className="text-[10px] font-black text-gray-300 uppercase">
                {goal.sets || '1'} Sets
              </span>
            </div>
          )) : (
            <div className="py-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">Official Rest Day</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#F8FAFC] rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-20 p-8 space-y-6 max-h-[90vh] overflow-y-auto hide-scrollbar">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <History className="text-indigo-600" size={24} />
            <h3 className="text-2xl font-black text-gray-800">History</h3>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowCalendar(!showCalendar)} 
              className={`p-2 rounded-full transition-all ${showCalendar ? 'bg-indigo-600 text-white' : 'bg-white text-gray-400 border border-gray-100 shadow-sm'}`}
            >
              <Calendar size={18}/>
            </button>
            <button onClick={onClose} className="p-2 bg-white rounded-full text-gray-400 shadow-sm border border-gray-100">
              <X size={18}/>
            </button>
          </div>
        </div>

        {showCalendar && renderCalendarDropdown()}

        {selectedDate ? (
          renderDailyDetail(selectedDate)
        ) : (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Success Rate</p>
                <p className="text-xl font-black text-gray-800">
                  {Math.round(last14Days.filter(d=>!d.isRest).reduce((acc, d) => acc + d.rate, 0) / (last14Days.filter(d=>!d.isRest).length || 1) * 100)}%
                </p>
                <p className="text-[9px] font-bold text-indigo-500 uppercase">14-Day Avg</p>
              </div>
              <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Calories</p>
                <div className="flex items-center gap-1 text-orange-500">
                  <Flame size={14} fill="currentColor" />
                  <span className="text-xl font-black">
                    {last14Days.reduce((acc, d) => acc + d.calories, 0)}
                  </span>
                </div>
                <p className="text-[9px] font-bold text-gray-400 uppercase">Fortnight Total</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Recent Activity</h4>
              <div className="space-y-2">
                {last14Days.map(item => (
                  <button 
                    key={item.key}
                    onClick={() => setSelectedDate(item.key)}
                    className="w-full bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:border-indigo-100 hover:bg-indigo-50/20 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl group-hover:bg-white transition-colors">
                        <MoodIcon rate={item.rate} isRest={item.isRest} className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-black text-gray-700">
                          {item.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        <p className={`text-[9px] font-bold uppercase tracking-tighter ${getStatusTextColor(item)}`}>
                          {item.isRest ? 'Rest Day' : `${Math.round(item.rate * 100)}% Completed`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {item.calories > 0 && (
                        <div className="flex items-center gap-0.5 text-orange-500">
                          <Flame size={10} fill="currentColor" />
                          <span className="text-[10px] font-black">{item.calories}</span>
                        </div>
                      )}
                      <ChevronRight size={14} className="text-gray-300 group-hover:text-indigo-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryModal;
