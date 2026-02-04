
import React, { useState, useMemo } from 'react';
import { PlannerGoal, DailyCompletion, Workout } from '../types';
import { 
  Plus, Check, Trash2, Settings2, CalendarDays, PawPrint, 
  Circle, ChevronRight, X, Search, Dumbbell, PlayCircle, History
} from 'lucide-react';
import HistoryModal from './HistoryModal';

interface WorkoutPlannerProps {
  goals: PlannerGoal[];
  completions: DailyCompletion;
  onToggle: (id: string) => void;
  onAdd: (goal: PlannerGoal) => void;
  onDelete: (id: string) => void;
  workouts: Workout[];
  onPreviewWorkout: (workout: Workout) => void;
}

const WorkoutPlanner: React.FC<WorkoutPlannerProps> = ({ 
  goals, completions, onToggle, onAdd, onDelete, workouts, onPreviewWorkout 
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  const today = new Date();
  const todayKey = today.toISOString().split('T')[0];
  const dayOfWeek = today.getDay(); 
  
  const getWeekDates = () => {
    const dates = [];
    const curr = new Date();
    const first = curr.getDate() - curr.getDay() + (curr.getDay() === 0 ? -6 : 1); 
    for (let i = 0; i < 7; i++) {
      const d = new Date(curr.setDate(first + i));
      dates.push(d);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const getDayCompletionStats = (date: Date) => {
    const key = date.toISOString().split('T')[0];
    const dow = date.getDay();
    const dayGoals = goals.filter(g => g.targetDays.includes(dow));
    if (dayGoals.length === 0) return { rate: 0, isRest: true };
    
    const dayCompletions = completions[key] || [];
    const count = dayGoals.filter(g => dayCompletions.includes(g.id)).length;
    return { rate: count / dayGoals.length, isRest: false };
  };

  const getHeatmapColor = (rate: number, isRest: boolean) => {
    if (isRest) return 'bg-gray-50 border-gray-100 text-gray-300';
    // 100% Completion: Deep Theme Purple (Indigo)
    if (rate === 1) return 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-100 text-white';
    // 1-99% Completion: Indigo gradient scaling with depth
    if (rate >= 0.75) return 'bg-indigo-400 border-indigo-400 text-white';
    if (rate >= 0.5) return 'bg-indigo-300 border-indigo-300 text-white';
    if (rate >= 0.25) return 'bg-indigo-200 border-indigo-200 text-indigo-800';
    if (rate > 0) return 'bg-indigo-100 border-indigo-100 text-indigo-700';
    // 0% Completion: Light Red (Missed Day)
    return 'bg-red-50 border-red-100 text-red-500';
  };

  const todayGoals = goals.filter(g => g.targetDays.includes(dayOfWeek));
  const completedToday = completions[todayKey] || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <section className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <CalendarDays size={14} className="text-indigo-600" /> Weekly Effort
          </h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsHistoryOpen(true)}
              className="p-1.5 bg-gray-50 text-gray-400 rounded-lg hover:text-indigo-600 hover:bg-indigo-50 transition-all"
            >
              <History size={16} />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date, idx) => {
            const isToday = date.toDateString() === today.toDateString();
            const { rate, isRest } = getDayCompletionStats(date);
            const colorClass = getHeatmapColor(rate, isRest);
            
            return (
              <div key={idx} className="flex flex-col items-center gap-2">
                <span className={`text-[8px] font-black uppercase tracking-tighter ${isToday ? 'text-indigo-600' : 'text-gray-300'}`}>
                  {['M','T','W','T','F','S','S'][idx]}
                </span>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border-2 ${colorClass} ${
                  isToday && rate === 0 && !isRest ? 'border-red-200' : ''
                }`}>
                  {rate === 1 && !isRest ? (
                    <PawPrint size={18} className="text-white animate-in zoom-in-50" />
                  ) : (
                    <span className={`text-[10px] font-black`}>
                      {date.getDate()}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-gray-800">Today's Drills</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all"
          >
            <Settings2 size={18} />
          </button>
        </div>

        <div className="space-y-2">
          {todayGoals.length > 0 ? todayGoals.map(goal => {
            const linkedWorkout = workouts.find(w => 
              w.id === goal.workoutId || w.name.toLowerCase() === goal.name.toLowerCase()
            );

            return (
              <div 
                key={goal.id}
                className={`group flex items-center justify-between p-4 rounded-2xl transition-all border ${
                  completedToday.includes(goal.id) 
                  ? 'bg-green-50/50 border-green-100' 
                  : 'bg-gray-50 border-gray-100 hover:border-indigo-100'
                }`}
              >
                <div 
                  className="flex items-center gap-4 flex-1 cursor-pointer"
                  onClick={() => onToggle(goal.id)}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                    completedToday.includes(goal.id) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-2 border-gray-200'
                  }`}>
                    {completedToday.includes(goal.id) && <Check size={14} strokeWidth={4} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-xs font-black truncate ${completedToday.includes(goal.id) ? 'text-green-700 line-through opacity-60' : 'text-gray-800'}`}>
                        {goal.name}
                      </h4>
                    </div>
                    {(goal.sets || goal.reps || goal.duration) && (
                      <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                        {goal.sets && `${goal.sets} sets`} {goal.reps && `• ${goal.reps} reps`} {goal.duration && `• ${goal.duration}`}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 ml-2">
                  {linkedWorkout && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onPreviewWorkout(linkedWorkout);
                      }}
                      className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all active:scale-90"
                      title="Quick Preview"
                    >
                      <PlayCircle size={18} />
                    </button>
                  )}
                  <ChevronRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            );
          }) : (
            <div className="py-10 text-center space-y-2">
              <Circle className="mx-auto text-gray-100" size={32} />
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Rest day or no goals set</p>
            </div>
          )}
        </div>
      </section>

      {isSettingsOpen && (
        <GoalSettingsModal 
          goals={goals} 
          onAdd={onAdd} 
          onDelete={onDelete} 
          onClose={() => setIsSettingsOpen(false)} 
          workouts={workouts}
        />
      )}

      {isHistoryOpen && (
        <HistoryModal 
          goals={goals}
          completions={completions}
          workouts={workouts}
          onClose={() => setIsHistoryOpen(false)}
        />
      )}
    </div>
  );
};

interface GoalSettingsModalProps {
  goals: PlannerGoal[];
  onAdd: (g: PlannerGoal) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  workouts: Workout[];
}

const GoalSettingsModal: React.FC<GoalSettingsModalProps> = ({ goals, onAdd, onDelete, onClose, workouts }) => {
  const [name, setName] = useState('');
  const [selectedWorkoutId, setSelectedWorkoutId] = useState('');
  const [targetDays, setTargetDays] = useState<number[]>([]);
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [duration, setDuration] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const days = ['S','M','T','W','T','F','S'];

  const filteredWorkouts = useMemo(() => {
    if (!searchQuery) return workouts.slice(0, 10);
    return workouts.filter(w => 
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.bodyPart.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [workouts, searchQuery]);

  const toggleDay = (idx: number) => {
    setTargetDays(prev => prev.includes(idx) ? prev.filter(d => d !== idx) : [...prev, idx]);
  };

  const handleAdd = () => {
    const finalName = selectedWorkoutId 
      ? workouts.find(w => w.id === selectedWorkoutId)?.name 
      : name.trim();

    if (finalName && targetDays.length > 0) {
      onAdd({
        id: Math.random().toString(36).substr(2, 9),
        name: finalName,
        workoutId: selectedWorkoutId || undefined,
        targetDays,
        sets: sets || undefined,
        reps: reps || undefined,
        duration: duration || undefined
      });
      setName('');
      setSelectedWorkoutId('');
      setTargetDays([]);
      setSets('');
      setReps('');
      setDuration('');
      setSearchQuery('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-20 p-8 space-y-6 max-h-[90vh] overflow-y-auto hide-scrollbar">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-black text-gray-800">Plan Routine</h3>
          <button onClick={onClose} className="p-2 bg-gray-50 rounded-full text-gray-400"><X size={20}/></button>
        </div>

        {goals.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Active Routine</h4>
            <div className="space-y-2">
              {goals.map(goal => (
                <div key={goal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100/50">
                  <div>
                    <p className="text-xs font-black text-gray-700">{goal.name}</p>
                    <div className="flex gap-1 mt-1">
                      {goal.targetDays.map(d => (
                        <span key={d} className="text-[8px] font-black text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">{days[d]}</span>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => onDelete(goal.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="h-px bg-gray-100" />

        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Select From Dojo</h4>
            {selectedWorkoutId && (
              <button 
                onClick={() => setSelectedWorkoutId('')}
                className="text-[9px] font-black text-gray-400 uppercase hover:text-red-500 transition-colors"
              >
                Clear Selection
              </button>
            )}
          </div>

          {!selectedWorkoutId ? (
            <div className="space-y-3">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search drills (e.g. Chest)..." 
                  className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="max-h-40 overflow-y-auto pr-1 space-y-1.5 hide-scrollbar">
                {filteredWorkouts.map(w => (
                  <button 
                    key={w.id}
                    onClick={() => {
                      setSelectedWorkoutId(w.id);
                      setSearchQuery('');
                      setName('');
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50/50 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-indigo-500">
                        <Dumbbell size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-700">{w.name}</p>
                        <p className="text-[9px] font-medium text-gray-400 uppercase tracking-tighter">{w.bodyPart}</p>
                      </div>
                    </div>
                    <Plus size={14} className="text-gray-300 group-hover:text-indigo-500" />
                  </button>
                ))}
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-[9px] uppercase font-black tracking-[0.3em]">
                  <span className="bg-white px-2 text-gray-300">or manual entry</span>
                </div>
              </div>

              <input 
                type="text" 
                placeholder="Custom Goal Name" 
                className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-4 text-xs font-bold focus:ring-4 focus:ring-indigo-100 outline-none"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSelectedWorkoutId('');
                }}
              />
            </div>
          ) : (
            <div className="p-4 bg-indigo-600 rounded-3xl shadow-lg shadow-indigo-100 animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                  <Check size={24} strokeWidth={3} />
                </div>
                <div>
                  <h5 className="text-white font-black text-sm leading-tight">
                    {workouts.find(w => w.id === selectedWorkoutId)?.name}
                  </h5>
                  <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest">Selected Drill</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Target Days</p>
            <div className="flex justify-between gap-1">
              {days.map((d, i) => (
                <button 
                  key={i}
                  onClick={() => toggleDay(i)}
                  className={`flex-1 h-10 rounded-xl text-[10px] font-black transition-all ${
                    targetDays.includes(i) 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                    : 'bg-gray-50 text-gray-300 border border-gray-100/50 hover:border-indigo-100'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Sets</label>
              <input type="text" placeholder="3" className="w-full bg-gray-50 border-none rounded-xl py-3 px-3 text-xs font-bold focus:ring-4 focus:ring-indigo-100 outline-none" value={sets} onChange={(e)=>setSets(e.target.value)}/>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Reps</label>
              <input type="text" placeholder="12" className="w-full bg-gray-50 border-none rounded-xl py-3 px-3 text-xs font-bold focus:ring-4 focus:ring-indigo-100 outline-none" value={reps} onChange={(e)=>setReps(e.target.value)}/>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Time</label>
              <input type="text" placeholder="5m" className="w-full bg-gray-50 border-none rounded-xl py-3 px-3 text-xs font-bold focus:ring-4 focus:ring-indigo-100 outline-none" value={duration} onChange={(e)=>setDuration(e.target.value)}/>
            </div>
          </div>

          <button 
            onClick={handleAdd}
            disabled={(!name.trim() && !selectedWorkoutId) || targetDays.length === 0}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:shadow-none"
          >
            <Plus size={16} strokeWidth={3} /> Add to Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutPlanner;
