
import React, { useState } from 'react';
import { UserData, BodyPart, WorkoutSource } from '../types';
import { ACTIVITY_LEVELS } from '../constants';
import CategoryManager from './CategoryManager';
import { Tag, User, LayoutGrid, ChevronRight } from 'lucide-react';

interface SettingsViewProps {
  userData: UserData;
  setUserData: (data: UserData) => void;
  bodyParts: BodyPart[];
  setBodyParts: (items: BodyPart[]) => void;
  sources: WorkoutSource[];
  setSources: (items: WorkoutSource[]) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
  userData, setUserData, 
  bodyParts, setBodyParts, 
  sources, setSources 
}) => {
  const [showTagManager, setShowTagManager] = useState(false);

  return (
    <div className="p-4 space-y-6 pb-24 animate-in fade-in duration-500">
      <header className="flex justify-between items-end px-2">
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">Settings</h2>
          <p className="text-sm font-medium text-gray-400">Manage your library & data.</p>
        </div>
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
          <LayoutGrid className="text-indigo-600 w-6 h-6" />
        </div>
      </header>
      
      <section className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2">
            <LayoutGrid size={14} strokeWidth={3}/> Category Management
          </h3>
          <button 
            onClick={() => setShowTagManager(!showTagManager)}
            className="text-[10px] font-black text-indigo-500 uppercase flex items-center gap-1 hover:underline"
          >
            {showTagManager ? 'Hide Manager' : 'Manage Tags'} <ChevronRight size={12} className={`transition-transform ${showTagManager ? 'rotate-90' : ''}`}/>
          </button>
        </div>

        {showTagManager ? (
          <div className="space-y-8 animate-in slide-in-from-top-4 duration-300">
            <CategoryManager 
              title="Body Focus List" 
              items={bodyParts} 
              setItems={setBodyParts} 
            />
            <div className="h-px bg-gray-50" />
            <CategoryManager 
              title="Sources List" 
              items={sources} 
              setItems={setSources} 
            />
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
            {bodyParts.slice(0, 4).map(part => (
              <span key={part} className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full whitespace-nowrap">{part}</span>
            ))}
            {bodyParts.length > 4 && (
              <span className="text-[10px] font-black text-gray-300 px-3 py-1">+ {bodyParts.length - 4} more</span>
            )}
          </div>
        )}
      </section>

      <section className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Mock Activity</h3>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setUserData({...userData, workoutsDone: userData.workoutsDone + 1})}
            className="bg-indigo-600 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-indigo-100"
          >
            Log 1 Workout
          </button>
          <button 
            onClick={() => setUserData({...userData, workoutsDone: 0, dailySteps: 500, caloriesConsumed: 800})}
            className="bg-gray-50 text-gray-500 py-4 rounded-2xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all"
          >
            Reset Day
          </button>
        </div>
      </section>

      <div className="text-center pt-4">
        <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest">MeowFit v1.1.2 • Refined Settings</p>
      </div>
    </div>
  );
};

export default SettingsView;
