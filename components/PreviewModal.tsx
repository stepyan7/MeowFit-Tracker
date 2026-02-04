
import React, { useEffect, useState } from 'react';
import { Workout, WorkoutSource } from '../types';
import { X, Flame, Calendar, Dumbbell, Play, Info } from 'lucide-react';
import { getMedia } from '../utils/db';

interface PreviewModalProps {
  workout: Workout;
  onClose: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ workout, onClose }) => {
  const [localMediaUrl, setLocalMediaUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocalMedia = async () => {
      if (workout.mediaId) {
        const blob = await getMedia(workout.mediaId);
        if (blob) {
          const url = URL.createObjectURL(blob);
          setLocalMediaUrl(url);
          return () => URL.revokeObjectURL(url);
        }
      }
    };
    fetchLocalMedia();
  }, [workout.mediaId]);

  const getEmbedUrl = (url: string) => {
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  };

  const isVideoFile = (url: string | null) => {
    // Basic check for video blob types or extensions if available
    return true; // Assume true for captured video file blobs
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-all"
        >
          <X size={20} />
        </button>

        {/* Media Section */}
        <div className="aspect-video bg-black flex items-center justify-center overflow-hidden">
          {workout.youtubeUrl ? (
            <iframe 
              src={getEmbedUrl(workout.youtubeUrl)} 
              className="w-full h-full" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              title={workout.name}
            />
          ) : localMediaUrl ? (
            <video 
              src={localMediaUrl} 
              controls 
              autoPlay 
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-white/50">
              <Play size={48} className="animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest">No Media Playback</span>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-100">
                {workout.bodyPart}
              </span>
              <h3 className="text-3xl font-black text-gray-800 tracking-tight leading-tight">
                {workout.name}
              </h3>
            </div>
            {workout.caloriesBurned > 0 && (
              <div className="flex flex-col items-center bg-orange-50 p-3 rounded-2xl border border-orange-100">
                <Flame className="text-orange-500 w-6 h-6 mb-1" fill="currentColor" />
                <span className="text-xs font-black text-gray-800">{workout.caloriesBurned}</span>
                <span className="text-[8px] font-bold text-orange-400 uppercase">kcal</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                <Calendar size={18} className="text-gray-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Added on</span>
                <span className="text-xs font-bold text-gray-700">
                  {new Date(workout.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                <Dumbbell size={18} className="text-gray-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Source</span>
                <span className="text-xs font-bold text-gray-700">
                  {workout.source}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-indigo-600/5 p-4 rounded-3xl border border-indigo-100 flex items-start gap-3">
            <Info className="text-indigo-600 w-4 h-4 mt-0.5" />
            <p className="text-[11px] font-medium text-indigo-900 leading-relaxed">
              Drill safely! Ensure proper form before increasing weights or intensity. Keep that Cat Dojo spirit!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
