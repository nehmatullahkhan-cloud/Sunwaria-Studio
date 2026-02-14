export interface RamadanTiming {
  id: number;
  date: string; // YYYY-MM-DD
  day_en: string;
  day_ur: string;
  sehri: string; // HH:MM 24h format
  iftar: string; // HH:MM 24h format
  hijri_date: number;
}

export interface LocationData {
  id: string;
  name_en: string;
  name_ur: string;
  timings: RamadanTiming[];
  whatsapp_number?: string;
  custom_message?: string;
}

export type Language = 'en' | 'ur';

export interface AppSettings {
  notificationsEnabled: boolean;
  language: Language;
  selectedLocationId: string;
  autoSync: boolean;
  lastSyncTime?: string;
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
  
  // Audio
  playAudio: string;

  // Notifications
  ramadanAlert: string;
  sehriAlert1Hour: string;
  iftarAlert20Min: string;
  sehriEnded: string;
  iftarTime: string;

  // Admin Panel
  adminPanelTitle: string;
  close: string;
  cancel: string;
  adminInstr: string;
  adminSuccess: string;
  adminErrorJson: string;
  adminErrorAuth: string;
  pasteJson: string;
  
  // Sync & Locations
  autoSync: string;
  autoSyncDesc: string;
  globalAdminTitle: string;
  downloadJson: string;
  refLabel: string;
  eventTimeLabel: string;
  selectLocation: string;
  whatsappSupport: string;
  online: string;
  offline: string;
  addLocation: string;
  locationName: string;
  deleteLocation: string;
  
  // Search
  searchPlaceholder: string;
  noResults: string;
}