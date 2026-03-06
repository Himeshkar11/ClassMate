import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const STORAGE_KEYS = {
  USER: 'classmate_user',
  ATTENDANCE: 'classmate_attendance',
  SCHEDULE: 'classmate_schedule',
  TASKS: 'classmate_tasks',
  PRODUCTIVITY: 'classmate_productivity',
  SUBJECTS: 'classmate_subjects',
  QR_SESSIONS: 'classmate_qr_sessions',
};

export const loadData = <T,>(key: string, defaultValue: T): T => {
  const saved = localStorage.getItem(key);
  if (!saved) return defaultValue;
  try {
    return JSON.parse(saved) as T;
  } catch (e) {
    console.error(`Error loading ${key}`, e);
    return defaultValue;
  }
};

export const saveData = <T,>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const clearAllData = () => {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
};
