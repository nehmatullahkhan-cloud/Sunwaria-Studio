import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { TRANSLATIONS, INITIAL_MASTER_DATA, ADMIN_ROUTE, GLOBAL_ADMIN_ROUTE, REMOTE_DATA_URL, WHATSAPP_NUMBER } from './constants';
import { getStoredData, saveStoredData, getSettings, saveSettings } from './services/storageService';
import { RamadanTiming, Language, AppSettings, LocationData } from './types';
import { requestNotificationPermission, playAlarm } from './services/notificationService';
import { syncTimeWithNetwork, getTrueDate, isTimeSynced } from './services/timeService';

// Components
import Countdown from './components/Countdown';
import AdminPanel from './components/AdminPanel';
import GlobalAdminPanel from './components/GlobalAdminPanel';
import Calendar from './components/Calendar';
import DuaSlider from './components/DuaSlider';

const MoonIcon = () => <i className="fas fa-moon"></i>;

/**
 * Helper to convert 24h string "HH:MM" to 12h format "hh:mm AM/PM"
 */
export const formatTo12h = (time24: string | undefined): string => {
  if (!time24 || time24 === '--:--') return '--:--';
  const [h, m] = time24.split(':');
  const hours = parseInt(h);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  return `${h12.toString().padStart(2, '0')}:${m} ${suffix}`;
};

const App = () => {
  return (
    <HashRouter>
      <MainApp />
    </HashRouter>
  );
};

const MainApp = () => {
  const [masterData, setMasterData] = useState<LocationData[]>(INITIAL_MASTER_DATA);
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLocalAdminOpen, setIsLocalAdminOpen] = useState(false);
  const [isGlobalAdminOpen, setIsGlobalAdminOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(getTrueDate());
  const [timeIsVerified, setTimeIsVerified] = useState(isTimeSynced());
  
  const t = TRANSLATIONS[settings.language];
  const location = useLocation();
  const navigate = useNavigate();

  const activeLocation = masterData.find(l => l.id === settings.selectedLocationId) || masterData[0];
  const activeTimings = activeLocation.timings;
  
  // Dynamic settings from Location Data
  const activeWhatsApp = activeLocation.whatsapp_number || WHATSAPP_NUMBER;
  const activeMessage = activeLocation.custom_message;

  const performTimeSync = async () => {
    const res = await syncTimeWithNetwork();
    if (res) {
      setCurrentTime(getTrueDate());
      setTimeIsVerified(true);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      performTimeSync();
    };
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    setMasterData(getStoredData());

    if (navigator.onLine) {
      performTimeSync();
    }

    const clockTimer = setInterval(() => {
      setCurrentTime(getTrueDate());
    }, 1000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(clockTimer);
    };
  }, []);

  useEffect(() => {
    if (settings.autoSync && isOnline) {
        fetch(REMOTE_DATA_URL)
            .then(res => res.ok ? res.json() : null)
            .then((remoteMaster: LocationData[]) => {
                if (Array.isArray(remoteMaster) && remoteMaster.length > 0) {
                    if (JSON.stringify(remoteMaster) !== JSON.stringify(masterData)) {
                        setMasterData(remoteMaster);
                        saveStoredData(remoteMaster);
                        
                        const now = getTrueDate();
                        const syncRef = `${now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} ${now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' })}`;
                        handleSettingsUpdate({ ...settings, lastSyncTime: syncRef });
                    }
                }
            })
            .catch(err => console.log('Auto Sync failed:', err));
    }
  }, [settings.autoSync, isOnline]);

  useEffect(() => {
    if (location.pathname === ADMIN_ROUTE) setIsLocalAdminOpen(true);
    else if (location.pathname === GLOBAL_ADMIN_ROUTE) setIsGlobalAdminOpen(true);
  }, [location]);

  const toggleLanguage = () => {
    const newLang: Language = settings.language === 'en' ? 'ur' : 'en';
    const newSettings = { ...settings, language: newLang };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const toggleNotifications = async () => {
    if (!settings.notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (!granted) return;
    }
    handleSettingsUpdate({ ...settings, notificationsEnabled: !settings.notificationsEnabled });
  };

  const handleSettingsUpdate = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleSettingsUpdate({ ...settings, selectedLocationId: e.target.value });
  };

  // Derived state that updates every second with currentTime
  const todayStr = currentTime.toISOString().split('T')[0];
  const todayData = activeTimings.find(d => d.date === todayStr);

  return (
    <div className={`min-h-screen font-sans text-gray-800 bg-slate-100 ${settings.language === 'ur' ? 'font-urdu' : ''}`} dir={settings.language === 'ur' ? 'rtl' : 'ltr'}>
      
      {/* Header */}
      <div className="bg-emerald-700 pb-20 pt-8 px-6 rounded-b-[2.5rem] shadow-lg text-white relative z-10">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-xl font-bold flex items-center gap-2 text-emerald-50">
                    <MoonIcon /> 
                    <span className={settings.language === 'ur' ? 'font-urdu-heading pt-1' : ''}>{t.title}</span>
                </h1>
                <div className="flex flex-col mt-1 opacity-90">
                    <p className="text-[10px] text-emerald-200 flex items-center gap-1">
                        <i className="fas fa-map-marker-alt"></i> {settings.language === 'ur' ? activeLocation.name_ur : activeLocation.name_en}
                    </p>
                    
                    {/* Clock with Sync Status Badge */}
                    <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[10px] text-emerald-50 font-mono flex items-center gap-1">
                            <i className={`fas fa-clock ${timeIsVerified ? 'text-emerald-300' : 'text-yellow-400'}`}></i> 
                            {currentTime.toLocaleTimeString('en-US', { 
                                timeZone: 'Asia/Karachi', 
                                hour12: true, 
                                hour: '2-digit', 
                                minute: '2-digit', 
                                second: '2-digit' 
                            })}
                        </p>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase ${timeIsVerified ? 'bg-emerald-500/30 text-emerald-100' : 'bg-yellow-500/30 text-yellow-100'}`}>
                            {timeIsVerified ? 'Network' : 'Device'}
                        </span>
                    </div>

                    {settings.lastSyncTime && (
                        <p className="text-[9px] text-emerald-300 font-mono mt-0.5">
                            {t.refLabel} {settings.lastSyncTime}
                        </p>
                    )}
                </div>
            </div>
            <button onClick={toggleLanguage} className="bg-emerald-600/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold border border-emerald-400/30">
                {settings.language === 'en' ? 'اردو' : 'English'}
            </button>
        </div>
      </div>

      <main className="max-w-md mx-auto -mt-16 px-4 relative z-20 pb-40">
        <Routes>
            <Route path="/" element={
                <>
                    <Countdown timings={activeTimings} translation={t} notificationsEnabled={settings.notificationsEnabled} />
                    <DuaSlider language={settings.language} timings={activeTimings} currentTime={currentTime} />
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                             <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                                <i className="fas fa-cloud-moon text-lg"></i>
                             </div>
                             <p className="text-xs text-gray-500 font-bold uppercase">{t.sehri}</p>
                             <p className="text-lg font-bold text-gray-800 font-mono mt-1">{formatTo12h(todayData?.sehri)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                             <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-2">
                                <i className="fas fa-sun text-lg"></i>
                             </div>
                             <p className="text-xs text-gray-500 font-bold uppercase">{t.iftar}</p>
                             <p className="text-lg font-bold text-gray-800 font-mono mt-1">{formatTo12h(todayData?.iftar)}</p>
                        </div>
                    </div>
                    
                    {/* Custom Announcement Message from Admin */}
                    {activeMessage && (
                        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl shadow-sm mb-6 text-center animate-pulse-slow">
                            <div className="flex items-center justify-center gap-2 mb-2 text-emerald-800">
                                <i className="fas fa-bullhorn text-sm"></i>
                                <h3 className="font-bold text-sm uppercase tracking-wider">Announcement</h3>
                            </div>
                            <p className="text-sm text-emerald-700 font-medium whitespace-pre-line leading-relaxed">
                                {activeMessage}
                            </p>
                        </div>
                    )}
                </>
            } />
            <Route path="/calendar" element={<Calendar data={activeTimings} translation={t} language={settings.language} />} />
            <Route path="/settings" element={
                <div className="space-y-4 mt-4">
                    <div className="flex justify-end mb-2">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold shadow-sm border transition-all ${isOnline ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                            {isOnline ? t.online : t.offline}
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <p className={`font-bold text-gray-800 mb-3 ${settings.language === 'ur' ? 'font-urdu-heading' : ''}`}>{t.selectLocation}</p>
                        <select 
                            value={settings.selectedLocationId} 
                            onChange={handleLocationChange}
                            className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none appearance-none font-bold"
                        >
                            {masterData.map(loc => (
                                <option key={loc.id} value={loc.id}>
                                    {settings.language === 'ur' ? loc.name_ur : loc.name_en}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center" onClick={toggleNotifications}>
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${settings.notificationsEnabled ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}><i className="fas fa-bell"></i></div>
                            <div>
                                <p className={`font-bold text-gray-800 text-lg ${settings.language === 'ur' ? 'font-urdu-heading' : ''}`}>{t.notifications}</p>
                            </div>
                        </div>
                        <div className={`w-12 h-7 rounded-full relative ${settings.notificationsEnabled ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                            <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full transition-transform ${settings.notificationsEnabled ? 'translate-x-5' : ''}`}></div>
                        </div>
                    </div>

                    <a href={`https://wa.me/${activeWhatsApp}`} target="_blank" rel="noopener noreferrer" className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center text-gray-700">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xl"><i className="fab fa-whatsapp"></i></div>
                            <span className={`font-bold text-lg ${settings.language === 'ur' ? 'font-urdu-heading' : ''}`}>{t.whatsappSupport}</span>
                        </div>
                        <i className="fas fa-external-link-alt text-gray-300 text-xs"></i>
                    </a>

                    <div className="pt-4 text-center">
                        <Link to={ADMIN_ROUTE} className="text-gray-400 text-xs py-2 px-6 rounded-full border border-gray-200">
                            <i className="fas fa-lock mr-2"></i>{t.adminLogin}
                        </Link>
                    </div>
                </div>
            } />
        </Routes>
      </main>

      <nav className="fixed bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg p-2 z-50 flex justify-around">
        <Link to="/" className={`flex flex-col items-center w-full py-2 rounded-xl ${location.pathname === '/' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400'}`}>
            <i className="fas fa-home text-xl mb-1"></i>
            <span className="text-[10px] font-bold">{t.dashboard}</span>
        </Link>
        <Link to="/calendar" className={`flex flex-col items-center w-full py-2 rounded-xl ${location.pathname === '/calendar' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400'}`}>
            <i className="fas fa-calendar-alt text-xl mb-1"></i>
            <span className="text-[10px] font-bold">{t.calendar}</span>
        </Link>
        <Link to="/settings" className={`flex flex-col items-center w-full py-2 rounded-xl ${location.pathname === '/settings' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400'}`}>
            <i className="fas fa-cog text-xl mb-1"></i>
            <span className="text-[10px] font-bold">{t.settings}</span>
        </Link>
      </nav>

      {isLocalAdminOpen && (
        <AdminPanel 
            data={activeTimings} 
            onUpdate={(newData) => {
                const newMaster = masterData.map(l => l.id === settings.selectedLocationId ? { ...l, timings: newData } : l);
                setMasterData(newMaster);
                saveStoredData(newMaster);
            }} 
            translation={t} settings={settings} onUpdateSettings={handleSettingsUpdate}
            onClose={() => { setIsLocalAdminOpen(false); navigate('/settings'); }} 
        />
      )}

      {isGlobalAdminOpen && (
        <GlobalAdminPanel data={masterData} onUpdate={(m) => { setMasterData(m); saveStoredData(m); }} translation={t} onClose={() => { setIsGlobalAdminOpen(false); navigate('/'); }} />
      )}
    </div>
  );
};

export default App;