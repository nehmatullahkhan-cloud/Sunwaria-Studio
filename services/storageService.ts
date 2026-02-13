import { STORAGE_KEY_DATA, STORAGE_KEY_SETTINGS, INITIAL_RAMADAN_DATA, DEFAULT_SETTINGS } from '../constants';
import { RamadanTiming, AppSettings } from '../types';

export const getStoredData = (): RamadanTiming[] => {
  const stored = localStorage.getItem(STORAGE_KEY_DATA);
  if (stored) {
    return JSON.parse(stored);
  }
  return INITIAL_RAMADAN_DATA;
};

export const saveStoredData = (data: RamadanTiming[]) => {
  localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(data));
};

export const getSettings = (): AppSettings => {
  const stored = localStorage.getItem(STORAGE_KEY_SETTINGS);
  if (stored) {
    return JSON.parse(stored);
  }
  return DEFAULT_SETTINGS;
};

export const saveSettings = (settings: AppSettings) => {
  localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
};