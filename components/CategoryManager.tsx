
import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Check } from 'lucide-react';

interface CategoryManagerProps {
  title: string;
  items: string[];
  setItems: (items: string[]) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ title, items, setItems }) => {
  const [inputValue, setInputValue] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const addItem = () => {
    if (inputValue.trim() && !items.includes(inputValue.trim())) {
      setItems([...items, inputValue.trim()]);
      setInputValue('');
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditValue(items[index]);
  };

  const saveEdit = () => {
    if (editingIndex !== null && editValue.trim()) {
      const newItems = [...items];
      newItems[editingIndex] = editValue.trim();
      setItems(newItems);
      setEditingIndex(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">{title}</h4>
        <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">{items.length} Tags</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <div 
            key={index} 
            className="group flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl transition-all hover:border-indigo-200"
          >
            {editingIndex === index ? (
              <div className="flex items-center gap-1">
                <input 
                  autoFocus
                  className="bg-transparent text-xs font-bold outline-none w-20"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                />
                <button onClick={saveEdit} className="text-emerald-500"><Check size={14}/></button>
              </div>
            ) : (
              <>
                <span className="text-xs font-bold text-gray-700">{item}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEditing(index)} className="text-gray-400 hover:text-indigo-500"><Edit2 size={12}/></button>
                  <button onClick={() => removeItem(index)} className="text-gray-400 hover:text-red-500"><Trash2 size={12}/></button>
                </div>
              </>
            )}
          </div>
        ))}
        
        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-xl">
          <input 
            placeholder="Add new..."
            className="bg-transparent text-xs font-bold outline-none w-20 placeholder-indigo-300 text-indigo-700"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
          />
          <button 
            onClick={addItem}
            className="p-1 bg-indigo-600 text-white rounded-lg active:scale-90 transition-all"
          >
            <Plus size={12} strokeWidth={3}/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
