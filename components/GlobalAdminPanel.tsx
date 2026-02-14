import React, { useState } from 'react';
import { LocationData, Translation, RamadanTiming } from '../types';

interface GlobalAdminPanelProps {
  data: LocationData[];
  onUpdate: (newData: LocationData[]) => void;
  translation: Translation;
  onClose: () => void;
}

const GlobalAdminPanel: React.FC<GlobalAdminPanelProps> = ({ data, onUpdate, translation, onClose }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editingLocId, setEditingLocId] = useState<string | null>(null);
  const [locNameEn, setLocNameEn] = useState('');
  const [locNameUr, setLocNameUr] = useState('');
  const [timingsJson, setTimingsJson] = useState('');

  const handleLogin = () => {
    if (password === 'AhsaanGlobal786') setIsAuthenticated(true);
    else alert(translation.adminErrorAuth);
  };

  const startAddLocation = () => {
    setEditingLocId('new');
    setLocNameEn('');
    setLocNameUr('');
    setTimingsJson('[]');
  };

  const startEditLocation = (loc: LocationData) => {
    setEditingLocId(loc.id);
    setLocNameEn(loc.name_en);
    setLocNameUr(loc.name_ur);
    setTimingsJson(JSON.stringify(loc.timings, null, 2));
  };

  const saveLocation = () => {
    try {
      const parsedTimings: RamadanTiming[] = JSON.parse(timingsJson);
      let newData: LocationData[];
      
      if (editingLocId === 'new') {
        const newLoc: LocationData = {
          id: locNameEn.toLowerCase().replace(/\s+/g, '-'),
          name_en: locNameEn,
          name_ur: locNameUr,
          timings: parsedTimings
        };
        newData = [...data, newLoc];
      } else {
        newData = data.map(l => l.id === editingLocId ? { ...l, name_en: locNameEn, name_ur: locNameUr, timings: parsedTimings } : l);
      }
      
      onUpdate(newData);
      setEditingLocId(null);
    } catch (e) {
      alert("Invalid Timings JSON");
    }
  };

  const deleteLocation = (id: string) => {
    if (window.confirm("Delete this location?")) {
        onUpdate(data.filter(l => l.id !== id));
    }
  };

  const downloadMaster = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "master.json";
    a.click();
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-[100]">
        <div className="bg-white p-6 rounded-2xl w-80 shadow-2xl">
          <div className="text-center mb-6">
             <i className="fas fa-globe-asia text-4xl text-blue-600 mb-2"></i>
             <h2 className="text-xl font-bold text-slate-800">{translation.globalAdminTitle}</h2>
          </div>
          <input
            type="password"
            placeholder={translation.password}
            className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex space-x-2">
            <button onClick={onClose} className="flex-1 bg-gray-200 py-2 rounded-lg font-bold">{translation.cancel}</button>
            <button onClick={handleLogin} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700">{translation.login}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-100 z-[100] overflow-y-auto font-sans p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold text-slate-800">{translation.globalAdminTitle}</h2>
            <div className="flex gap-2">
                <button onClick={downloadMaster} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-xs font-bold"><i className="fas fa-download mr-1"></i> {translation.downloadJson}</button>
                <button onClick={onClose} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold">{translation.close}</button>
            </div>
        </div>

        {editingLocId ? (
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="text-xs font-bold text-gray-400 block mb-1">Name (EN)</label>
                        <input value={locNameEn} onChange={e => setLocNameEn(e.target.value)} className="w-full border p-3 rounded-xl focus:ring-2 ring-blue-500" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 block mb-1">Name (UR)</label>
                        <input value={locNameUr} onChange={e => setLocNameUr(e.target.value)} className="w-full border p-3 rounded-xl focus:ring-2 ring-blue-500 font-urdu" dir="rtl" />
                    </div>
                </div>
                <label className="text-xs font-bold text-gray-400 block mb-1">Timings JSON</label>
                <textarea value={timingsJson} onChange={e => setTimingsJson(e.target.value)} className="w-full h-80 font-mono text-[10px] p-4 bg-slate-50 border rounded-xl" />
                <div className="flex gap-2 mt-4">
                    <button onClick={() => setEditingLocId(null)} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold">{translation.cancel}</button>
                    <button onClick={saveLocation} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold">{translation.save}</button>
                </div>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.map(loc => (
                    <div key={loc.id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center border border-gray-100">
                        <div>
                            <h3 className="font-bold text-gray-800">{loc.name_en}</h3>
                            <p className="text-xs text-gray-400">{loc.timings.length} Days</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => startEditLocation(loc)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><i className="fas fa-edit"></i></button>
                            <button onClick={() => deleteLocation(loc.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><i className="fas fa-trash"></i></button>
                        </div>
                    </div>
                ))}
                <button onClick={startAddLocation} className="border-2 border-dashed border-gray-300 p-6 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-all bg-white/50">
                    <i className="fas fa-plus text-2xl mb-2"></i>
                    <span className="font-bold">{translation.addLocation}</span>
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default GlobalAdminPanel;