
import { UserData } from '../types';

/**
 * Mifflin-St Jeor Formula
 * Men: BMR = (10 * weight) + (6.25 * height) - (5 * age) + 5
 * Women: BMR = (10 * weight) + (6.25 * height) - (5 * age) - 161
 */
export const calculateBMR = (user: UserData): number => {
  const { weight, height, age, gender } = user;
  const base = (10 * weight) + (6.25 * height) - (5 * age);
  return gender === 'male' ? base + 5 : base - 161;
};

export const calculateTDEE = (user: UserData): number => {
  const bmr = calculateBMR(user);
  return Math.round(bmr * user.activityLevel);
};

export const calculateMacros = (tdee: number) => {
  // Common 40/30/30 split (Carbs/Protein/Fat)
  return {
    carbs: Math.round((tdee * 0.4) / 4),
    protein: Math.round((tdee * 0.3) / 4),
    fat: Math.round((tdee * 0.3) / 9),
  };
};
