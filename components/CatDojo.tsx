
import React from 'react';
import { Workout, BodyPart } from '../types';

interface CatDojoProps {
  workouts: Workout[];
}

const CatDojo: React.FC<CatDojoProps> = ({ workouts }) => {
  const getEvolution = () => {
    if (workouts.length === 0) return { emoji: '🐱', name: 'Rookie Kit', color: 'bg-gray-100' };

    const counts: Record<string, number> = {};
    workouts.forEach(w => counts[w.bodyPart] = (counts[w.bodyPart] || 0) + 1);
    
    const topPart = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as BodyPart;

    switch (topPart) {
      case BodyPart.LEGS: return { emoji: '🐆', name: 'Turbo Paws', color: 'bg-orange-100', text: 'Speed of a Cheetah!' };
      case BodyPart.CHEST: return { emoji: '🦍', name: 'Tank Meow', color: 'bg-blue-100', text: 'Unbreakable Guard!' };
      case BodyPart.CORE: return { emoji: '🐍', name: 'Zen Master', color: 'bg-emerald-100', text: 'Perfect Balance!' };
      case BodyPart.ARMS: return { emoji: '🦾', name: 'Power Claw', color: 'bg-purple-100', text: 'Titan Grip!' };
      default: return { emoji: '😼', name: 'All-Star Cat', color: 'bg-indigo-100', text: 'Jack of all trades!' };
    }
  };

  const evo = getEvolution();

  return (
    <div className={`p-8 rounded-[3rem] ${evo.color} border-4 border-white shadow-xl relative overflow-hidden group transition-all duration-700`}>
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform">
        <span className="text-9xl font-black">DOJO</span>
      </div>
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="text-8xl mb-6 animate-bounce-slow filter drop-shadow-2xl">
          {evo.emoji}
        </div>
        <div className="bg-white/90 backdrop-blur px-4 py-1 rounded-full shadow-sm mb-2">
          <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest">{evo.name}</h2>
        </div>
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-tighter opacity-70">
          {evo.text || 'Keep training to evolve!'}
        </p>
        
        <div className="mt-6 flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`w-8 h-1 rounded-full ${i < (workouts.length % 5 || 5) ? 'bg-indigo-600' : 'bg-white/50'}`} />
          ))}
        </div>
        <p className="text-[9px] font-black text-indigo-400 mt-2 uppercase">Rank {Math.floor(workouts.length / 5) + 1}</p>
      </div>
    </div>
  );
};

export default CatDojo;
