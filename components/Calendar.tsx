import React, { useEffect } from 'react';
import { RamadanTiming, Translation, Language } from '../types';

interface CalendarProps {
  data: RamadanTiming[];
  translation: Translation;
  language: Language;
}

const Calendar: React.FC<CalendarProps> = ({ data, translation, language }) => {
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Auto-scroll to current day
    setTimeout(() => {
        const element = document.getElementById('current-day-row');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 300);
  }, []);

  const formatEngDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const renderAshraSection = (timings: RamadanTiming[], title: string, themeColor: string, textColor: string, borderColor: string) => (
    <div className={`mb-6 rounded-2xl overflow-hidden border ${borderColor} shadow-sm bg-white`}>
      <div className={`${themeColor} p-3 text-center border-b ${borderColor}`}>
        <h3 className={`font-bold ${textColor} ${language === 'ur' ? 'font-urdu-heading text-xl' : 'text-lg'}`}>{title}</h3>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
            <tr>
                <th className="p-3 text-left font-bold w-1/3">{translation.date}</th>
                <th className="p-3 font-bold text-center w-1/3">{translation.sehri}</th>
                <th className="p-3 text-right font-bold w-1/3">{translation.iftar}</th>
            </tr>
        </thead>
        <tbody>
          {timings.map((row) => {
            const isToday = row.date === todayStr;
            return (
              <tr 
                key={row.id} 
                id={isToday ? 'current-day-row' : undefined}
                className={`border-b border-gray-50 last:border-0 transition-colors duration-300
                    ${isToday ? `bg-${themeColor.split('-')[1]}-50/80 border-l-4 ${borderColor.replace('border', 'border-l')}` : ''}
                `}
              >
                <td className="p-3 relative">
                    {isToday && (
                        <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-emerald-500 animate-pulse"></span>
                    )}
                    <div className="flex flex-col">
                        <span className={`font-bold text-base ${isToday ? 'text-emerald-800' : 'text-gray-800'}`}>
                            {row.hijri_date} <span className="text-[10px] font-normal text-gray-500">Ramadan</span>
                        </span>
                        <span className="text-gray-400 text-xs">
                            {language === 'ur' ? row.day_ur : row.day_en} 
                            <span className="mx-1">•</span> 
                            {formatEngDate(row.date)}
                        </span>
                    </div>
                </td>
                <td className={`p-3 font-mono text-center text-base font-medium ${isToday ? 'text-gray-900 font-bold' : 'text-gray-600'}`}>
                    {row.sehri}
                </td>
                <td className={`p-3 font-mono text-right font-bold text-base ${isToday ? 'text-emerald-700 scale-110 origin-right' : 'text-emerald-700'}`}>
                    {row.iftar}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const ashra1 = data.filter(d => d.hijri_date <= 10);
  const ashra2 = data.filter(d => d.hijri_date > 10 && d.hijri_date <= 20);
  const ashra3 = data.filter(d => d.hijri_date > 20);

  return (
    <div className="mt-2 pb-8">
      {renderAshraSection(ashra1, translation.ashra1, "bg-emerald-50", "text-emerald-900", "border-emerald-100")}
      {renderAshraSection(ashra2, translation.ashra2, "bg-cyan-50", "text-cyan-900", "border-cyan-100")}
      {renderAshraSection(ashra3, translation.ashra3, "bg-indigo-50", "text-indigo-900", "border-indigo-100")}
    </div>
  );
};

export default Calendar;