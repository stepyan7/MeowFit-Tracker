
import React, { useState, useRef, useEffect } from 'react';
import { BodyPart, WorkoutSource, Workout } from '../types';
import WorkoutCard from './WorkoutCard';
import PreviewModal from './PreviewModal';
import { 
  Plus, Search, X, Link as LinkIcon, Upload, Check, 
  Loader2, SlidersHorizontal, Flame, Info, Heart
} from 'lucide-react';
import { resizeImage, captureVideoThumbnail } from '../utils/mediaProcessing';
import { saveMedia } from '../utils/db';

interface WorkoutGuideProps {
  workouts: Workout[];
  onAddWorkout: (w: Workout) => void;
  onUpdateWorkout: (w: Workout) => void;
  onDeleteWorkout: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  bodyParts: BodyPart[];
  sources: WorkoutSource[];
}

const WorkoutGuide: React.FC<WorkoutGuideProps> = ({ 
  workouts, onAddWorkout, onUpdateWorkout, onDeleteWorkout, onToggleFavorite, bodyParts, sources 
}) => {
  const [muscleFilters, setMuscleFilters] = useState<BodyPart[]>([]);
  const [sourceFilters, setSourceFilters] = useState<WorkoutSource[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal Mode
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [previewWorkout, setPreviewWorkout] = useState<Workout | null>(null);

  // Form State
  const [newName, setNewName] = useState('');
  const [newSource, setNewSource] = useState<WorkoutSource>(sources[0] || WorkoutSource.EQUIPMENT);
  const [newPart, setNewPart] = useState<BodyPart>(bodyParts[0] || BodyPart.CHEST);
  const [newUrl, setNewUrl] = useState('');
  const [newCals, setNewCals] = useState<string>('');
  const [uploadMode, setUploadMode] = useState<'link' | 'file'>('link');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill form if editing
  useEffect(() => {
    if (editingWorkout) {
      setNewName(editingWorkout.name);
      setNewPart(editingWorkout.bodyPart);
      setNewSource(editingWorkout.source);
      setNewCals(editingWorkout.caloriesBurned?.toString() || '');
      setNewUrl(editingWorkout.youtubeUrl || '');
      setPreviewMedia(editingWorkout.thumbnailUrl || null);
      setUploadMode(editingWorkout.source === WorkoutSource.YOUTUBE ? 'link' : 'file');
      setIsModalOpen(true);
    }
  }, [editingWorkout]);

  const resetForm = () => {
    setNewName('');
    setNewUrl('');
    setNewCals('');
    setPreviewMedia(null);
    setSelectedFile(null);
    setIsProcessing(false);
    setIsModalOpen(false);
    setEditingWorkout(null);
    setUploadMode('link');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert("File too large! Please pick a file under 50MB.");
      return;
    }

    setIsProcessing(true);
    try {
      if (file.type.startsWith('video/')) {
        const thumb = await captureVideoThumbnail(file);
        setPreviewMedia(thumb);
        setSelectedFile(file);
      } else if (file.type.startsWith('image/')) {
        const resized = await resizeImage(file);
        setPreviewMedia(resized);
        const res = await fetch(resized);
        setSelectedFile(await res.blob());
      }
    } catch (err) {
      console.error("Media processing failed", err);
      alert("Could not process media.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    let mediaId = editingWorkout?.mediaId;
    
    if (uploadMode === 'file' && selectedFile) {
      mediaId = Math.random().toString(36).substr(2, 12);
      setIsProcessing(true);
      await saveMedia(mediaId, selectedFile);
      setIsProcessing(false);
    }

    const updatedWorkout: Workout = {
      id: editingWorkout?.id || Math.random().toString(36).substr(2, 9),
      name: newName,
      bodyPart: newPart,
      source: uploadMode === 'link' ? WorkoutSource.YOUTUBE : WorkoutSource.UPLOAD,
      caloriesBurned: parseInt(newCals) || 0,
      youtubeUrl: uploadMode === 'link' ? newUrl : undefined,
      thumbnailUrl: previewMedia || undefined,
      mediaId: mediaId,
      isFavorite: editingWorkout?.isFavorite || false,
      createdAt: editingWorkout?.createdAt || Date.now(),
    };

    if (editingWorkout) {
      onUpdateWorkout(updatedWorkout);
    } else {
      onAddWorkout(updatedWorkout);
    }
    
    resetForm();
  };

  const toggleMuscle = (part: BodyPart) => {
    setMuscleFilters(prev => 
      prev.includes(part) ? prev.filter(x => x !== part) : [...prev, part]
    );
  };

  const toggleSource = (source: WorkoutSource) => {
    setSourceFilters(prev => 
      prev.includes(source) ? prev.filter(x => x !== source) : [...prev, source]
    );
  };

  const filtered = workouts.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(search.toLowerCase());
    const matchesMuscle = muscleFilters.length === 0 || muscleFilters.includes(w.bodyPart);
    const matchesSource = sourceFilters.length === 0 || sourceFilters.includes(w.source);
    const matchesFavorite = !favoritesOnly || w.isFavorite;
    return matchesSearch && matchesMuscle && matchesSource && matchesFavorite;
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="p-4 space-y-6">
        <header className="flex justify-between items-center px-2">
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">Dojo</h2>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg active:scale-95 transition-all hover:bg-indigo-700"
          >
            <Plus className="w-6 h-6" />
          </button>
        </header>

        {/* Search & Filter Toggle */}
        <div className="flex gap-3 px-2">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search drills..." 
              className="w-full bg-white border border-gray-100 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
          <button 
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            className={`p-3 rounded-2xl border transition-all ${favoritesOnly ? 'bg-rose-50 border-rose-100 text-rose-500' : 'bg-white border-gray-100 text-gray-400'}`}
          >
            <Heart size={20} fill={favoritesOnly ? "currentColor" : "none"} />
          </button>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-2xl border transition-all ${showFilters ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-white border-gray-100 text-gray-400'}`}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Collapsible Filters */}
        {showFilters && (
          <div className="space-y-4 px-2 animate-in slide-in-from-top-2 duration-300">
            <div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Body Focus</span>
              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                {bodyParts.map(part => (
                  <button 
                    key={part} 
                    onClick={() => toggleMuscle(part)} 
                    className={`px-4 py-2 rounded-full text-[10px] font-black whitespace-nowrap border ${
                      muscleFilters.includes(part) 
                      ? 'bg-indigo-600 border-indigo-600 text-white' 
                      : 'bg-white border-gray-100 text-gray-400'
                    }`}
                  >
                    {part}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Source Type</span>
              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                {sources.map(source => (
                  <button 
                    key={source} 
                    onClick={() => toggleSource(source)} 
                    className={`px-4 py-2 rounded-full text-[10px] font-black whitespace-nowrap border ${
                      sourceFilters.includes(source) 
                      ? 'bg-indigo-800 border-indigo-800 text-white' 
                      : 'bg-white border-gray-100 text-gray-400'
                    }`}
                  >
                    {source}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Grid Section - Exactly 3 columns */}
        <div className="grid grid-cols-3 gap-3 px-2">
          {filtered.length > 0 ? (
            filtered.map(w => (
              <WorkoutCard 
                key={w.id} 
                workout={w} 
                onPreview={setPreviewWorkout} 
                onEdit={setEditingWorkout}
                onDelete={onDeleteWorkout}
                onToggleFavorite={onToggleFavorite}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white/50 rounded-3xl border border-dashed border-gray-200">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No drills found</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Preview Modal */}
      {previewWorkout && (
        <PreviewModal 
          workout={previewWorkout} 
          onClose={() => setPreviewWorkout(null)} 
        />
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={resetForm} />
          
          <div className="relative w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-20 duration-500 p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-gray-800">
                {editingWorkout ? 'Update Drill' : 'New Drill'}
              </h3>
              <button onClick={resetForm} className="p-2 bg-gray-50 rounded-full text-gray-400"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto hide-scrollbar px-1">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Drill Name</label>
                <input required type="text" className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none" value={newName} onChange={(e) => setNewName(e.target.value)} />
              </div>

              <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                <button type="button" onClick={() => setUploadMode('link')} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${uploadMode === 'link' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400'}`}>Web Link</button>
                <button type="button" onClick={() => setUploadMode('file')} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${uploadMode === 'file' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400'}`}>Upload File</button>
              </div>

              {uploadMode === 'link' ? (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Source Link</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input type="text" placeholder="Enter URL (YouTube, Instagram, Blog, etc.)" className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-11 pr-4 text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Media Upload</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`h-28 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${previewMedia ? 'border-indigo-200 bg-indigo-50/30' : 'border-gray-200 bg-gray-50'}`}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                    ) : previewMedia ? (
                      <img src={previewMedia} className="w-full h-full object-cover rounded-xl p-1" alt="Preview" />
                    ) : (
                      <Upload className="w-6 h-6 text-gray-300" />
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="video/*,image/*" className="hidden" onChange={handleFileChange} />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Muscle Group</label>
                  <select className="w-full bg-gray-50 border-none rounded-2xl py-3 px-3 text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none appearance-none" value={newPart} onChange={(e) => setNewPart(e.target.value as BodyPart)}>
                    {bodyParts.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Calories (kcal)</label>
                  <div className="relative">
                    <Flame className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-orange-400" />
                    <input type="number" placeholder="Optional" className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-9 pr-3 text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none" value={newCals} onChange={(e) => setNewCals(e.target.value)} />
                  </div>
                </div>
              </div>

              <button disabled={isProcessing} type="submit" className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 active:scale-95 transition-all flex items-center justify-center gap-2">
                {isProcessing ? <Loader2 className="animate-spin" /> : <><Check size={16} strokeWidth={3} /> {editingWorkout ? 'Update' : 'Save'} Drill</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutGuide;
