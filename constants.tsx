
import React from 'react';
import { 
  Activity, 
  Dumbbell, 
  Calendar as CalendarIcon, 
  Settings,
  Flame,
  Footprints,
  Utensils
} from 'lucide-react';

export const NAVIGATION_TABS = [
  { id: 'tracker', label: 'Tracker', icon: Activity },
  { id: 'workout', label: 'Workout', icon: Dumbbell },
  { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const ACTIVITY_LEVELS = [
  { value: 1.2, label: 'Sedentary' },
  { value: 1.375, label: 'Lightly Active' },
  { value: 1.55, label: 'Moderately Active' },
  { value: 1.725, label: 'Very Active' },
  { value: 1.9, label: 'Extra Active' },
];
