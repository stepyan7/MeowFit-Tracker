
import { Workout } from '../types';

const STORAGE_KEY = 'meowfit_workouts';

export const saveWorkouts = (workouts: Workout[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
};

export const loadWorkouts = (): Workout[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};
