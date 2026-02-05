
import React, { useEffect, useState } from 'react';
import { Workout, WorkoutSource } from '../types';
import { X, Play, ExternalLink, Dumbbell } from 'lucide-react';
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

  const isYouTube = (url: string) => url.includes('youtube.com') || url.includes('youtu.be');

  const getEmbedUrl = (url: string) => {
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col h-[85vh] sm:h-auto">
        {/* Close Button - Floating */}
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 z-20 p-2.5 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-all active:scale-90"
        >
          <X size={20} />
        </button>

        {/* 1. Media Preview Area (Major portion) */}
        <div className="flex-grow bg-black flex items-center justify-center overflow-hidden relative">
          {workout.youtubeUrl ? (
            isYouTube(workout.youtubeUrl) ? (
              <iframe 
                src={getEmbedUrl(workout.youtubeUrl)} 
                className="w-full h-full border-none" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                title={workout.name}
              />
            ) : (
              <div className="flex flex-col items-center gap-6 p-10 text-center animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-indigo-600/20 rounded-[2rem] flex items-center justify-center text-indigo-400">
                  <ExternalLink size={40} />
                </div>
                <div className="space-y-4">
                  <h4 className="text-xl font-black text-white">External Resource</h4>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Web article or external guide</p>
                  <a 
                    href={workout.youtubeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
                  >
                    Open Source Site <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            )
          ) : localMediaUrl ? (
            mediaType === 'video' ? (
              <video 
                src={localMediaUrl} 
                controls 
                autoPlay 
                className="w-full h-full object-contain"
              />
            ) : (
              <img 
                src={localMediaUrl} 
                className="w-full h-full object-contain animate-in fade-in duration-500" 
                alt={workout.name}
              />
            )
          ) : (
            <div className="flex flex-col items-center gap-3 text-white/20">
              <Dumbbell size={64} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">No Visual Preview</span>
            </div>
          )}
        </div>

        {/* 2. Info Layout (Single row below media) */}
        <div className="px-8 py-6 bg-white shrink-0">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-xl font-black text-gray-800 tracking-tight truncate flex-1">
              {workout.name}
            </h3>
            <div className="flex items-center gap-2 text-right shrink-0">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {workout.bodyPart}
              </span>
              <div className="w-1 h-1 bg-gray-200 rounded-full" />
              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-tighter">
                {workout.source}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
