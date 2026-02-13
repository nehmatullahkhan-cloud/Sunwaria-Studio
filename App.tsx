import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { TRANSLATIONS, INITIAL_RAMADAN_DATA, ADMIN_ROUTE } from './constants';
import { getStoredData, saveStoredData, getSettings, saveSettings } from './services/storageService';
import { RamadanTiming, Language, AppSettings } from './types';
import { requestNotificationPermission, playAlarm } from './services/notificationService';

// Components
import Countdown from './components/Countdown';
import AdminPanel from './components/AdminPanel';
import Calendar from './components/Calendar';
import DuaSlider from './components/DuaSlider';

// Icons
const MoonIcon = () => <i className="fas fa-moon"></i>;

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
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  
  const t = TRANSLATIONS[settings.language];
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setData(getStoredData());

    // Check if app is running in standalone mode (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;

    // Show install modal if not installed
    if (!isStandalone) {
        setShowInstallModal(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Ensure modal is shown when installation is possible
      setShowInstallModal(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    if (location.pathname === ADMIN_ROUTE) setIsAdminOpen(true);
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

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallModal(false);
      }
    } else {
        // Fallback for browsers that don't support beforeinstallprompt (like iOS)
        // logic handled in UI now
    }
  };

  const handleDataUpdate = (newData: RamadanTiming[]) => {
    setData(newData);
    saveStoredData(newData);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayData = data.find(d => d.date === todayStr);

  return (
    <div className={`min-h-screen font-sans text-gray-800 bg-slate-100 ${settings.language === 'ur' ? 'font-urdu' : ''}`} dir={settings.language === 'ur' ? 'rtl' : 'ltr'}>
      
      {/* Curved Dark Header */}
      <div className="bg-emerald-700 pb-20 pt-8 px-6 rounded-b-[2.5rem] shadow-lg text-white relative z-10">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-xl font-bold flex items-center gap-2 text-emerald-50">
                    <MoonIcon /> 
                    <span className={settings.language === 'ur' ? 'font-urdu-heading pt-1' : ''}>{t.title}</span>
                </h1>
                <p className="text-xs text-emerald-200 mt-1 opacity-90"><i className="fas fa-map-marker-alt mr-1"></i> {settings.location}</p>
            </div>
            <button onClick={toggleLanguage} className="bg-emerald-600/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold border border-emerald-400/30">
                {settings.language === 'en' ? 'اردو' : 'English'}
            </button>
        </div>
      </div>

      {/* Main Content Area - Overlaps Header */}
      <main className="max-w-md mx-auto -mt-16 px-4 relative z-20 pb-24">
        
        <Routes>
            <Route path="/" element={
                <>
                    {/* 1. NEXT EVENT (Countdown) - Large Card */}
                    <Countdown timings={data} translation={t} notificationsEnabled={settings.notificationsEnabled} />

                    {/* 2. Dua Slider (New) */}
                    <DuaSlider language={settings.language} timings={data} />

                    {/* 3. TODAY'S TIMES - Two Small Cards */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        {/* Sehri Card */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                             <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                                <i className="fas fa-cloud-moon text-lg"></i>
                             </div>
                             <p className="text-xs text-gray-500 font-bold uppercase">{t.sehri}</p>
                             <p className="text-2xl font-bold text-gray-800 font-mono mt-1">
                                {todayData ? todayData.sehri : '--:--'}
                             </p>
                        </div>

                        {/* Iftar Card */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                             <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-2">
                                <i className="fas fa-sun text-lg"></i>
                             </div>
                             <p className="text-xs text-gray-500 font-bold uppercase">{t.iftar}</p>
                             <p className="text-2xl font-bold text-gray-800 font-mono mt-1">
                                {todayData ? todayData.iftar : '--:--'}
                             </p>
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-sm text-gray-500 leading-relaxed">
                        <div className="flex items-center gap-2 mb-2">
                             <i className="fas fa-info-circle text-emerald-500"></i>
                             <span>{t.sehriInfo}</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <i className="fas fa-info-circle text-orange-500"></i>
                             <span>{t.iftarInfo}</span>
                        </div>
                    </div>
                </>
            } />
            
            <Route path="/calendar" element={
               <Calendar data={data} translation={t} language={settings.language} />
            } />

            <Route path="/settings" element={
                <div className="space-y-4 mt-4">
                    {/* Notification Toggle */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center" onClick={toggleNotifications}>
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${settings.notificationsEnabled ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                                <i className="fas fa-bell"></i>
                            </div>
                            <div>
                                <p className={`font-bold text-gray-800 text-lg ${settings.language === 'ur' ? 'font-urdu-heading' : ''}`}>{t.notifications}</p>
                                <p className="text-xs text-gray-500">{settings.notificationsEnabled ? 'On' : 'Off'}</p>
                            </div>
                        </div>
                        <div className={`w-12 h-7 rounded-full transition-colors relative ${settings.notificationsEnabled ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                            <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full transition-transform shadow-sm ${settings.notificationsEnabled ? 'translate-x-5' : ''}`}></div>
                        </div>
                    </div>

                    {/* Test Alarm */}
                    <button onClick={() => playAlarm('alarm')} className="w-full bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center text-gray-700 active:bg-gray-50">
                        <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xl">
                                <i className="fas fa-volume-up"></i>
                            </div>
                            <span className={`font-bold text-lg ${settings.language === 'ur' ? 'font-urdu-heading' : ''}`}>{t.testAlarm}</span>
                        </div>
                        <i className={`fas fa-chevron-right text-gray-300 ${settings.language === 'ur' ? 'rotate-180' : ''}`}></i>
                    </button>

                     {/* Install App */}
                     <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <h4 className="font-bold text-emerald-800 mb-2 flex items-center gap-2">
                            <i className="fas fa-mobile-alt"></i> {t.installGuide}
                        </h4>
                        {deferredPrompt ? (
                            <button onClick={handleInstallClick} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-md active:scale-95 transition-all mt-2">
                                Install Now
                            </button>
                        ) : (
                            <p className="text-sm text-gray-500 leading-relaxed mt-1">
                                {settings.language === 'ur' 
                                 ? 'براؤزر مینو (•••) پر ٹیپ کریں اور "Install App" یا "Add to Home Screen" منتخب کریں۔' 
                                 : 'Tap browser menu (•••) and select "Install App" or "Add to Home Screen".'}
                            </p>
                        )}
                     </div>
                     
                     {/* Admin Link */}
                     <div className="pt-4 text-center">
                         <Link 
                            to={ADMIN_ROUTE} 
                            className="inline-flex items-center gap-2 text-gray-400 text-xs py-2 px-6 rounded-full border border-gray-200 hover:text-emerald-600 hover:border-emerald-200 transition-all"
                         >
                            <i className="fas fa-lock"></i>
                            {t.adminLogin}
                        </Link>
                     </div>
                </div>
            } />
        </Routes>
      </main>

      {/* Floating Bottom Navigation */}
      <nav className="fixed bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md border border-white/50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-2 z-50 flex justify-around items-center">
        <Link to="/" className={`flex flex-col items-center justify-center w-full py-2 rounded-xl transition-all ${location.pathname === '/' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400'}`}>
            <i className={`fas fa-home text-xl mb-1`}></i>
            <span className={`text-[10px] font-bold ${settings.language === 'ur' ? 'font-urdu-heading' : ''}`}>{t.dashboard}</span>
        </Link>
        <Link to="/calendar" className={`flex flex-col items-center justify-center w-full py-2 rounded-xl transition-all ${location.pathname === '/calendar' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400'}`}>
            <i className={`fas fa-calendar-alt text-xl mb-1`}></i>
            <span className={`text-[10px] font-bold ${settings.language === 'ur' ? 'font-urdu-heading' : ''}`}>{t.calendar}</span>
        </Link>
        <Link to="/settings" className={`flex flex-col items-center justify-center w-full py-2 rounded-xl transition-all ${location.pathname === '/settings' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400'}`}>
            <i className={`fas fa-cog text-xl mb-1`}></i>
            <span className={`text-[10px] font-bold ${settings.language === 'ur' ? 'font-urdu-heading' : ''}`}>{t.settings}</span>
        </Link>
      </nav>
      
      {/* Install Popup Modal - Appears Automatically */}
      {showInstallModal && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={() => setShowInstallModal(false)} />
          <div className="bg-white w-full max-w-sm m-4 rounded-3xl p-6 shadow-2xl pointer-events-auto relative transform transition-all animate-bounce-in">
             <button onClick={() => setShowInstallModal(false)} className="absolute top-4 right-4 text-gray-400 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
               <i className="fas fa-times"></i>
             </button>
             <div className="flex flex-col items-center text-center pt-2">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-2xl mb-4 shadow-inner">
                  <i className="fas fa-download"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {settings.language === 'ur' ? 'ایپ انسٹال کریں' : 'Install App'}
                </h3>
                <p className="text-gray-500 text-sm mb-6 px-2 leading-relaxed">
                  {settings.language === 'ur' 
                    ? 'انٹرنیٹ کے بغیر اوقات اور درست الارم کے لیے ایپ ابھی انسٹال کریں۔' 
                    : 'Install now for offline access and accurate Sehri/Iftar alarms.'}
                </p>
                
                {deferredPrompt ? (
                    <button 
                      onClick={handleInstallClick}
                      className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-download text-sm"></i>
                      {settings.language === 'ur' ? 'انسٹال کریں' : 'Install Now'}
                    </button>
                ) : (
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-sm text-gray-600 w-full">
                         <p>
                           {settings.language === 'ur' 
                             ? 'براؤزر مینو (•••) پر ٹیپ کریں اور "Install App" یا "Add to Home Screen" منتخب کریں۔' 
                             : 'Tap browser menu (•••) and select "Install App" or "Add to Home Screen".'}
                         </p>
                         <button onClick={() => setShowInstallModal(false)} className="mt-3 text-emerald-600 font-bold text-xs uppercase tracking-wide">
                            {settings.language === 'ur' ? 'ٹھیک ہے' : 'Got it'}
                         </button>
                    </div>
                )}
             </div>
          </div>
        </div>
      )}

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