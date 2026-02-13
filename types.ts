export interface RamadanTiming {
  id: number;
  date: string; // YYYY-MM-DD
  day_en: string;
  day_ur: string;
  sehri: string; // HH:MM 24h format
  iftar: string; // HH:MM 24h format
  hijri_date: number;
}

export type Language = 'en' | 'ur';

export interface AppSettings {
  notificationsEnabled: boolean;
  language: Language;
  location: string;
}

export interface Translation {
  title: string;
  sehri: string;
  iftar: string;
  next: string;
  timeLeft: string;
  settings: string;
  notifications: string;
  enableNotifications: string;
  testAlarm: string;
  language: string;
  installGuide: string;
  adminLogin: string;
  password: string;
  login: string;
  updateTimings: string;
  save: string;
  dashboard: string;
  calendar: string;
  today: string;
  fasting: string;
  completed: string;
  sehriInfo: string;
  iftarInfo: string;
  date: string;
  day: string;
  ashra1: string;
  ashra2: string;
  ashra3: string;
}