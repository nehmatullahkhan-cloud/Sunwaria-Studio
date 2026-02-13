import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { TRANSLATIONS, INITIAL_RAMADAN_DATA, ADMIN_ROUTE } from './constants';
import { getStoredData, saveStoredData, getSettings, saveSettings } from './services/storageService';
import { RamadanTiming, Language, AppSettings } from './types';
import { requestNotificationPermission, playAlarm } from './services/notificationService';

// Components
import Countdown from './components/Countdown';
import AdminPanel from './components/AdminPanel';

// Icons
const MoonIcon = () => <i className="fas fa-moon"></i>;
const CalendarIcon = () => <i className="fas fa-calendar-alt"></i>;
const CogIcon = () => <i className="fas fa-cog"></i>;

const App = () => {
  return (
    <HashRouter>
      <MainApp />
    </HashRouter>
  );
};

const MainApp = () => {
  const [data, setData] = useState<RamadanTiming[]>(INITIAL_RAMADAN_DATA);
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  
  const t = TRANSLATIONS[settings.language];
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Load data on mount
    setData(getStoredData());
  }, []);

  // Check for admin route match
  useEffect(() => {
    if (location.pathname === ADMIN_ROUTE) {
        setIsAdminOpen(true);
    }
  }, [location]);

  const toggleLanguage = () => {
    const newLang: Language = settings.language === 'en' ? 'ur' : 'en';
    const newSettings: AppSettings = { ...settings, language: newLang };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const toggleNotifications = async () => {
    if (!settings.notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (!granted) return;
    }
    const newSettings = { ...settings, notificationsEnabled: !settings.notificationsEnabled };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleDataUpdate = (newData: RamadanTiming[]) => {
    setData(newData);
    saveStoredData(newData);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayData = data.find(d => d.date === todayStr);

  return (
    <div className={`min-h-screen pb-20 font-sans text-gray-800 ${settings.language === 'ur' ? 'font-urdu' : ''}`} dir={settings.language === 'ur' ? 'rtl' : 'ltr'}>
      
      {/* Header */}
      <header className="px-6 pt-8 pb-4 flex justify-between items-center bg-white sticky top-0 z-40 shadow-sm border-b border-gray-100">
        <div>
          <h1 className="text-xl font-bold text-emerald-800 flex items-center gap-2">
            <MoonIcon /> {t.title}
          </h1>
          <p className="text-xs text-emerald-600 mt-1"><i className="fas fa-map-marker-alt mr-1"></i> {settings.location}</p>
        </div>
        <button onClick={toggleLanguage} className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
          {settings.language === 'en' ? 'اردو' : 'ENG'}
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto pt-6">
        
        {/* Today's Summary */}
        <div className="px-4 mb-4">
             {todayData ? (
                 <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-emerald-50">
                    <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase font-bold">{t.sehri}</p>
                        <p className="text-2xl font-bold text-emerald-700">{todayData.sehri}</p>
                    </div>
                    <div className="h-10 w-px bg-gray-200"></div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase font-bold">{t.iftar}</p>
                        <p className="text-2xl font-bold text-emerald-700">{todayData.iftar}</p>
                    </div>
                 </div>
             ) : (
                 <div className="text-center p-4 text-gray-400 italic">No Data for Today</div>
             )}
        </div>

        {/* Countdown */}
        <Countdown timings={data} translation={t} notificationsEnabled={settings.notificationsEnabled} />

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-6">
          <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 inline-flex">
            <Link to="/" className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${location.pathname === '/' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-500'}`}>
                {t.dashboard}
            </Link>
            <Link to="/calendar" className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${location.pathname === '/calendar' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-500'}`}>
                {t.calendar}
            </Link>
            <Link to="/settings" className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${location.pathname === '/settings' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-500'}`}>
                {t.settings}
            </Link>
          </div>
        </div>

        <Routes>
            <Route path="/" element={
                <div className="px-4 text-center">
                    <h3 className="text-lg font-bold text-emerald-800 mb-2">{t.today}</h3>
                    <p className="text-gray-600 text-sm mb-4">
                        {todayData ? `${todayData.day_en} / ${todayData.day_ur} - ${todayData.hijri_date} Ramadan` : "Loading..."}
                    </p>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-left text-sm text-gray-500">
                        <p className="mb-2"><i className="fas fa-info-circle mr-2 text-emerald-500"></i> Sehri ends 10 mins before Fajr start in Sunwarian.</p>
                        <p><i className="fas fa-info-circle mr-2 text-emerald-500"></i> Iftar is per sunset calculation.</p>
                    </div>
                </div>
            } />
            
            <Route path="/calendar" element={
                <div className="px-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-emerald-50 text-emerald-800">
                                <tr>
                                    <th className="p-3 text-left">Ramadan</th>
                                    <th className="p-3">Sehri</th>
                                    <th className="p-3 text-right">Iftar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((row) => (
                                    <tr key={row.id} className={`border-b border-gray-50 ${row.date === todayStr ? 'bg-emerald-50/50' : ''}`}>
                                        <td className="p-3">
                                            <span className="font-bold">{row.hijri_date}</span>
                                            <span className="text-gray-400 text-xs block">{row.day_ur}</span>
                                        </td>
                                        <td className="p-3 font-mono text-center">{row.sehri}</td>
                                        <td className="p-3 font-mono text-right font-bold text-emerald-700">{row.iftar}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            } />

            <Route path="/settings" element={
                <div className="px-4 space-y-4">
                    
                    {/* Notification Toggle */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${settings.notificationsEnabled ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                                <i className="fas fa-bell"></i>
                            </div>
                            <div>
                                <p className="font-bold text-gray-800">{t.notifications}</p>
                                <p className="text-xs text-gray-500">{settings.notificationsEnabled ? 'Active' : 'Disabled'}</p>
                            </div>
                        </div>
                        <button 
                            onClick={toggleNotifications}
                            className={`w-12 h-6 rounded-full transition-colors relative ${settings.notificationsEnabled ? 'bg-emerald-500' : 'bg-gray-300'}`}
                        >
                            <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.notificationsEnabled ? 'translate-x-6' : ''}`}></div>
                        </button>
                    </div>

                    {/* Test Alarm */}
                    <button 
                        onClick={() => playAlarm('alarm')}
                        className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center text-gray-700 active:bg-gray-50"
                    >
                        <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                                <i className="fas fa-volume-up"></i>
                            </div>
                            <span className="font-bold">{t.testAlarm}</span>
                        </div>
                        <i className="fas fa-chevron-right text-gray-300"></i>
                    </button>

                     {/* Install Guide */}
                     <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                        <h4 className="font-bold text-emerald-800 mb-2">{t.installGuide}</h4>
                        <ol className="list-decimal list-inside text-sm text-emerald-700 space-y-1">
                            <li>Tap browser menu (•••)</li>
                            <li>Select "Add to Home Screen" / "Install App"</li>
                            <li>Open from home screen for fullscreen</li>
                        </ol>
                     </div>

                    {/* Admin Link (Subtle) */}
                    <div className="pt-10 text-center">
                         <Link to={ADMIN_ROUTE} className="text-gray-300 text-xs hover:text-gray-500">
                            Ahsaan Admin Access
                         </Link>
                    </div>
                </div>
            } />
            
            {/* Hidden Admin Route */}
            <Route path={ADMIN_ROUTE} element={<div />} /> 
        </Routes>

      </main>

      {/* Admin Modal */}
      {isAdminOpen && (
        <AdminPanel 
            data={data} 
            onUpdate={handleDataUpdate} 
            translation={t} 
            onClose={() => {
                setIsAdminOpen(false);
                navigate('/settings');
            }} 
        />
      )}
    </div>
  );
};

export default App;