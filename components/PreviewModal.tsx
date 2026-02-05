
import React, { useEffect, useState } from 'react';
import { Workout, WorkoutSource } from '../types';
import { X, Play, ExternalLink, Dumbbell, Calendar } from 'lucide-react';
import { getMedia } from '../utils/db';

interface PreviewModalProps {
  workout: Workout;
  onClose: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ workout, onClose }) => {
  const [localMediaUrl, setLocalMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);

  useEffect(() => {
    const fetchLocalMedia = async () => {
      if (workout.mediaId) {
        const blob = await getMedia(workout.mediaId);
        if (blob) {
          setMediaType(blob.type.startsWith('video/') ? 'video' : 'image');
          const url = URL.createObjectURL(blob);
          setLocalMediaUrl(url);
          return () => URL.revokeObjectURL(url);
        }
      }
    };
    fetchLocalMedia();
  }, [workout.mediaId]);

  const isYouTube = (url: string) => url ? (url.includes('youtube.com') || url.includes('youtu.be')) : false;

  const getEmbedUrl = (url: string) => {
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`;
  };

  const formattedDate = new Date(workout.createdAt).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-500" 
        onClick={onClose} 
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        
        {/* Floating Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 z-20 p-2.5 bg-black/30 hover:bg-black/50 backdrop-blur-xl rounded-full text-white transition-all active:scale-90"
        >
          <X size={20} />
        </button>

        {/* 1. Media Focus Area (70%+ of the modal) */}
        <div className="relative flex-grow min-h-[50vh] bg-black flex items-center justify-center overflow-hidden">
          {workout.youtubeUrl ? (
            isYouTube(workout.youtubeUrl) ? (
              <iframe 
                src={getEmbedUrl(workout.youtubeUrl)} 
                className="w-full h-full border-none aspect-video" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                title={workout.name}
              />
            ) : (
              <div className="flex flex-col items-center gap-8 p-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="w-24 h-24 bg-indigo-600/10 rounded-[2.5rem] flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                  <ExternalLink size={44} strokeWidth={2.5} />
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-2xl font-black text-white tracking-tight">External Resource</h4>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Outside the Dojo Walls</p>
                  </div>
                  <a 
                    href={workout.youtubeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl shadow-indigo-600/40 active:scale-95 group"
                  >
                    Visit Source Site 
                    <ExternalLink size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            )
          ) : localMediaUrl ? (
            mediaType === 'video' ? (
              <video 
                src={localMediaUrl} 
                muted 
                autoPlay 
                loop 
                playsInline 
                className="w-full h-full object-contain"
              />
            ) : (
              <img 
                src={localMediaUrl} 
                className="w-full h-full object-contain animate-in fade-in duration-700" 
                alt={workout.name}
              />
            )
          ) : (
            <div className="flex flex-col items-center gap-4 text-white/10">
              <Dumbbell size={80} className="animate-pulse" strokeWidth={1} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">No Visual Data</span>
            </div>
          )}
        </div>

        {/* 2. Simplified Info Layout (Single row below media) */}
        <div className="px-8 py-7 bg-white shrink-0 border-t border-gray-50">
          <div className="flex items-center justify-between gap-6">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight truncate flex-1 leading-none">
              {workout.name}
            </h3>
            <div className="flex items-center gap-3 text-right shrink-0 whitespace-nowrap">
              <div className="flex flex-col items-end">
                <span className="text-[11px] font-black text-indigo-600 uppercase tracking-widest leading-none mb-1">
                  {workout.bodyPart}
                </span>
                <div className="flex items-center gap-1.5 text-gray-400 font-bold text-[10px] uppercase tracking-tighter leading-none">
                  <Calendar size={10} className="opacity-60" />
                  {formattedDate}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
