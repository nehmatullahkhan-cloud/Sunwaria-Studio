import React, { useState } from 'react';
import { RamadanTiming, Translation } from '../types';

interface AdminPanelProps {
  data: RamadanTiming[];
  onUpdate: (newData: RamadanTiming[]) => void;
  translation: Translation;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ data, onUpdate, translation, onClose }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [jsonInput, setJsonInput] = useState(JSON.stringify(data, null, 2));

  const handleLogin = () => {
    // Hardcoded simple password for the village admin
    if (password === 'Sunwarian786') {
      setIsAuthenticated(true);
    } else {
      alert(translation.adminErrorAuth);
    }
  };

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (Array.isArray(parsed)) {
        onUpdate(parsed);
        alert(translation.adminSuccess);
        onClose();
      } else {
        alert(translation.adminErrorJson);
      }
    } catch (e) {
      alert(translation.adminErrorJson);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="bg-white p-6 rounded-2xl w-80 shadow-2xl">
          <h2 className="text-xl font-bold text-emerald-800 mb-4">{translation.adminLogin}</h2>
          <input
            type="password"
            placeholder={translation.password}
            className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:ring-2 focus:ring-emerald-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex space-x-2">
            <button 
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-bold"
            >
                {translation.cancel}
            </button>
            <button 
                onClick={handleLogin}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-bold hover:bg-emerald-700"
            >
                {translation.login}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-emerald-800">{translation.adminPanelTitle}</h2>
            <button onClick={onClose} className="text-red-500 font-bold">{translation.close}</button>
        </div>
        
        <p className="mb-2 text-gray-600 text-sm">
            {translation.pasteJson}
        </p>
        
        <textarea
          className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-xs bg-gray-50 mb-4"
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
        />
        
        <button 
            onClick={handleSave}
            className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-emerald-700 transition-colors"
        >
          {translation.save}
        </button>

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-bold text-yellow-800 mb-2">Instructions</h3>
            <ul className="list-disc list-inside text-sm text-yellow-700">
                <li>{translation.adminInstr}</li>
                <li>Dates must be YYYY-MM-DD.</li>
            </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;