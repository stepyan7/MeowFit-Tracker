
import React from 'react';
import { Workout, WorkoutSource } from '../types';
import { Play, Youtube, Dumbbell, Home as HomeIcon, Video, Trash2, Edit3, Flame, Heart } from 'lucide-react';

interface WorkoutCardProps {
  workout: Workout;
  onPreview: (workout: Workout) => void;
  onEdit: (workout: Workout) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, onPreview, onEdit, onDelete, onToggleFavorite }) => {
  const getYouTubeThumbnail = (url: string) => {
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  };

  const SourceIcon = {
    [WorkoutSource.EQUIPMENT]: Dumbbell,
    [WorkoutSource.HOME]: HomeIcon,
    [WorkoutSource.YOUTUBE]: Youtube,
    [WorkoutSource.UPLOAD]: Video,
  }[workout.source] || Video;

  const displayThumb = workout.thumbnailUrl || (workout.youtubeUrl ? getYouTubeThumbnail(workout.youtubeUrl) : null);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this drill? This cannot be undone.')) {
      onDelete(workout.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(workout);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(workout.id);
  };

  return (
    <div 
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all active:scale-95 cursor-pointer flex flex-col h-full" 
      onClick={() => onPreview(workout)}
    >
      {/* Thumbnail Container */}
      <div className="aspect-square relative overflow-hidden bg-gray-900 shrink-0">
        {displayThumb ? (
          <img 
            src={displayThumb} 
            className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
            alt={workout.name}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
            <SourceIcon className="w-8 h-8 text-white/20" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40" />

        {/* Favorite Button - Top Left */}
        <button 
          onClick={handleToggleFavorite}
          className={`absolute top-1 left-1 z-10 p-1.5 rounded-lg transition-all ${workout.isFavorite ? 'bg-rose-500 text-white shadow-lg' : 'bg-white/80 backdrop-blur-sm text-gray-400 opacity-0 group-hover:opacity-100'}`}
        >
          <Heart size={14} fill={workout.isFavorite ? "currentColor" : "none"} strokeWidth={workout.isFavorite ? 0 : 2} />
        </button>

        {/* Action Overlays - Top Right */}
        <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button 
            onClick={handleEdit}
            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-indigo-600 shadow-sm hover:bg-white active:scale-90"
          >
            <Edit3 size={14} />
          </button>
          <button 
            onClick={handleDelete}
            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-red-500 shadow-sm hover:bg-white active:scale-90"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Play Icon */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-8 h-8 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
          </div>
        </div>

        {/* Calorie Badge */}
        {workout.caloriesBurned > 0 && (
          <div className="absolute bottom-1 left-1 bg-orange-500/90 backdrop-blur-sm text-white text-[8px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
            <Flame size={8} fill="currentColor" />
            {workout.caloriesBurned}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2 flex-1 flex flex-col justify-between">
        <h3 className="font-bold text-gray-800 text-[10px] leading-tight line-clamp-2 min-h-[2.4em]">
          {workout.name}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[8px] font-black text-indigo-500 uppercase tracking-tighter truncate max-w-[70%]">
            {workout.bodyPart}
          </span>
          <SourceIcon className="w-2.5 h-2.5 text-gray-300" />
        </div>
      </div>
    </div>
  );
};

export default WorkoutCard;
