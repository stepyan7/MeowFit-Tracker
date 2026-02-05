import React, { useState, useMemo } from 'react';
import { PlannerGoal, DailyCompletion, Workout } from '../types';
import { ChevronLeft, ChevronRight, CheckCircle2, Flame, MapPin, PawPrint, Calendar as CalendarIcon, X } from 'lucide-react';

interface CalendarViewProps {
  goals: PlannerGoal[];
  completions: DailyCompletion;
  workouts: Workout[];
}

// ✨ 核心修復：獲取本地日期 Key，避免時差
const getLocalDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ✨ 安全解析日期字串，避免顯示時跳回前一天
const parseDateKey = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const CalendarView: React.FC<CalendarViewProps> = ({ goals, completions, workouts }) => {
  const [view, setView] = useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  const getDayCompletionStats = (dateKey: string, dow: number) => {
    const goalsForDay = goals.filter(g => g.targetDays.includes(dow));
    if (goalsForDay.length === 0) return { rate: 1, isRest: true, total: 0, done: 0 };
    const completedIds = completions[dateKey] || [];
    const count = goalsForDay.filter(g => completedIds.includes(g.id)).length;
    return { rate: count / goalsForDay.length, isRest: false, total: goalsForDay.length, done: count };
  };

  const getHeatmapColor = (rate: number, isRest: boolean) => {
    if (isRest) return 'bg-gray-50 border-gray-100 text-gray-400';
    if (rate === 1) return 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-100';
    if (rate >= 0.75) return 'bg-indigo-400 border-indigo-400 text-white';
    if (rate >= 0.5) return 'bg-indigo-300 border-indigo-300 text-white';
    if (rate >= 0.25) return 'bg-indigo-200 border-indigo-200 text-indigo-800';
    if (rate > 0) return 'bg-indigo-100 border-indigo-100 text-indigo-700';
    return 'bg-red-50 border-red-100 text-red-500';
  };

  const monthDays = useMemo(() => {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const days = [];
    for (let i = 0; i < start.getDay(); i++) days.push(null);
    for (let i = 1; i <= end.getDate(); i++) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const key = getLocalDateKey(d); // 👈 使用本地 Key
      const dow = d.getDay();
      const stats = getDayCompletionStats(key, dow);
      days.push({ key, day: i, ...stats });
    }
    return days;
  }, [currentDate, goals, completions]);

  const weekSummary = useMemo(() => {
    const curr = new Date(currentDate);
    // 獲取週一的邏輯
    const day = curr.getDay();
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(curr.setDate(diff));
    
    const results = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      const key = getLocalDateKey(d); // 👈 使用本地 Key
      const dow = d.getDay();
      const dayGoals = goals.filter(g => g.targetDays.includes(dow));
      const doneIds = completions[key] || [];
      const stats = getDayCompletionStats(key, dow);
      results.push({ 
        key, 
        date: d, 
        stats, 
        items: dayGoals.map(g => ({ ...g, done: doneIds.includes(g.id) })) 
      });
    }
    return results;
  }, [currentDate, goals, completions]);

  const totalTypesSummary = useMemo(() => {
    const counts: Record<string, number> = {};
    weekSummary.forEach(day => {
      day.items.forEach(item => {
        if (item.done) {
          const workout = workouts.find(w => w.id === item.workoutId);
          const type = workout?.source || 'Custom';
          counts[type] = (counts[type] || 0) + 1;
        }
      });
    });
    return Object.entries(counts);
  }, [weekSummary, workouts]);

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  return (
    <div className="animate-in fade-in duration-500 pb-24">
      {/* Header 與 View 切換保持不變 */}
      <div className="p-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-800">Archive</h2>
          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="bg-gray-100 p-1 rounded-2xl flex border border-gray-200 shadow-inner">
          <button onClick={() => setView('month')} className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${view === 'month' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400'}`}>Month</button>
          <button onClick={() => setView('week')} className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${view === 'week' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400'}`}>Week</button>
        </div>
      </div>

      <div className="px-4">
        {view === 'month' ? (
          <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-black text-gray-800">Visual Timeline</span>
              <div className="flex gap-2">
                <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400"><ChevronLeft size={20} /></button>
                <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400"><ChevronRight size={20} /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {['S','M','T','W','T','F','S'].map(d => (<div key={d} className="text-center text-[10px] font-black text-gray-300 py-2 uppercase">{d}</div>))}
              {monthDays.map((d, i) => d ? (
                <button key={i} onClick={() => setSelectedDayKey(d.key)} className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative border transition-all active:scale-90 ${getHeatmapColor(d.rate, d.isRest)}`}>
                  {d.rate === 1 && !d.isRest ? <PawPrint size={14} /> : <span className="text-[10px] font-black">{d.day}</span>}
                </button>
              ) : <div key={i} />)}
            </div>
          </div>
        ) : (
          /* Week View 保持邏輯，使用修正後的 weekSummary */
          <div className="space-y-6">
            <section className="bg-indigo-600 rounded-[2.5rem] p-6 text-white shadow-xl">
               <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-indigo-100">Weekly Achievement</h3>
               <div className="grid grid-cols-2 gap-4">
                 {totalTypesSummary.map(([type, count]) => (
                   <div key={type} className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                     <p className="text-[9px] font-black text-indigo-100 uppercase">{type}</p>
                     <p className="text-lg font-black">{count} <span className="text-[10px] opacity-70">Done</span></p>
                   </div>
                 ))}
               </div>
            </section>
            <div className="space-y-4">
              {weekSummary.map((day, i) => (
                <div key={i} className="flex gap-4 group" onClick={() => setSelectedDayKey(day.key)}>
                  <div className="flex flex-col items-center">
                    <span className={`text-[10px] font-black w-8 text-right ${getLocalDateKey(new Date()) === day.key ? 'text-indigo-600' : 'text-gray-300'}`}>{day.date.getDate()}</span>
                    <div className="w-0.5 h-full bg-gray-100 my-1" />
                  </div>
                  <div className={`flex-1 p-5 rounded-[2rem] border ${day.stats.rate === 1 && !day.stats.isRest ? 'bg-indigo-50 border-indigo-100' : 'bg-white'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-xs font-black text-gray-800">{day.date.toLocaleDateString('en-US', { weekday: 'long' })}</h4>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">{day.stats.isRest ? 'Rest' : `${day.stats.done}/${day.stats.total}`}</span>
                    </div>
                    {day.items.map(item => (
                      <div key={item.id} className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
                        <div className={`w-1 h-1 rounded-full ${item.done ? 'bg-indigo-500' : 'bg-gray-200'}`} />
                        <span className={item.done ? 'text-indigo-700' : ''}>{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal 詳細視圖修復 */}
      {selectedDayKey && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setSelectedDayKey(null)} />
          <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 animate-in zoom-in-95">
            <button onClick={() => setSelectedDayKey(null)} className="absolute top-4 right-4 p-2 text-gray-400"><X size={18}/></button>
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-black text-gray-800">
                {parseDateKey(selectedDayKey).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </h3>
              <div className="flex justify-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white ${getHeatmapColor(getDayCompletionStats(selectedDayKey, parseDateKey(selectedDayKey).getDay()).rate, getDayCompletionStats(selectedDayKey, parseDateKey(selectedDayKey).getDay()).isRest)}`}>
                  <PawPrint size={24} />
                </div>
              </div>
              <div className="space-y-2 text-left pt-4">
                {goals.filter(g => g.targetDays.includes(parseDateKey(selectedDayKey).getDay())).map(g => (
                   <div key={g.id} className="flex justify-between p-3 bg-gray-50 rounded-xl">
                     <span className="text-xs font-bold">{g.name}</span>
                     {(completions[selectedDayKey] || []).includes(g.id) ? <CheckCircle2 size={16} className="text-green-500" /> : <X size={16} className="text-gray-300" />}
                   </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;