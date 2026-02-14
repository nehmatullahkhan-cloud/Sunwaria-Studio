import { STORAGE_KEY_DATA, STORAGE_KEY_SETTINGS, INITIAL_MASTER_DATA, DEFAULT_SETTINGS } from '../constants';
import { LocationData, AppSettings } from '../types';

export const getStoredData = (): LocationData[] => {
  const stored = localStorage.getItem(STORAGE_KEY_DATA);
  if (stored) {
    try {
        return JSON.parse(stored);
    } catch (e) {
        return INITIAL_MASTER_DATA;
    }
  }
  return INITIAL_MASTER_DATA;
};

export const saveStoredData = (data: LocationData[]) => {
  localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(data));
};

export const getSettings = (): AppSettings => {
  const stored = localStorage.getItem(STORAGE_KEY_SETTINGS);
  if (stored) {
    const parsed = JSON.parse(stored);
    return { ...DEFAULT_SETTINGS, ...parsed };
  }
  return DEFAULT_SETTINGS;
};

export const saveSettings = (settings: AppSettings) => {
  localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
};