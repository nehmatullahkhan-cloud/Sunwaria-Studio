import React, { useEffect, useState } from 'react';
import { RamadanTiming, Translation } from '../types';
import { sendNotification, playAlarm } from '../services/notificationService';

interface CountdownProps {
  timings: RamadanTiming[];
  translation: Translation;
  notificationsEnabled: boolean;
}

const Countdown: React.FC<CountdownProps> = ({ timings, translation, notificationsEnabled }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [nextEventLabel, setNextEventLabel] = useState<string>('');
  const [activeTiming, setActiveTiming] = useState<RamadanTiming | null>(null);
  
  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      
      const todayTiming = timings.find(t => t.date === todayStr);
      let targetDate: Date | null = null;
      let label = '';
      let isSehri = false;

      if (todayTiming) {
        const sehriTime = new Date(`${todayStr}T${todayTiming.sehri}:00`);
        const iftarTime = new Date(`${todayStr}T${todayTiming.iftar}:00`);

        if (now < sehriTime) {
          targetDate = sehriTime;
          label = translation.sehri;
          isSehri = true;
          setActiveTiming(todayTiming);
        } else if (now < iftarTime) {
          targetDate = iftarTime;
          label = translation.iftar;
          isSehri = false;
          setActiveTiming(todayTiming);
        }
      }

      if (!targetDate) {
        const futureTimings = timings.filter(t => new Date(t.date) > now);
        if (futureTimings.length > 0) {
          const next = futureTimings[0];
          targetDate = new Date(`${next.date}T${next.sehri}:00`);
          label = `${translation.sehri} (${next.date})`;
          isSehri = true;
          setActiveTiming(next);
        } else {
          setNextEventLabel(translation.completed);
          setTimeLeft("00:00:00");
          return;
        }
      }

      setNextEventLabel(label);

      const diff = targetDate.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );

      if (notificationsEnabled) {
         if (isSehri && hours === 1 && minutes === 0 && seconds === 0) {
             sendNotification("Ramadan Alert", "1 Hour remaining for Sehri!");
             playAlarm('beep');
         }
         if (!isSehri && hours === 0 && minutes === 20 && seconds === 0) {
             sendNotification("Ramadan Alert", "20 Minutes to Iftar.");
             playAlarm('beep');
         }
         if (hours === 0 && minutes === 0 && seconds === 0) {
             const msg = isSehri ? "Sehri Time Ended!" : "Iftar Time!";
             sendNotification("Ramadan Alert", msg);
             playAlarm('alarm');
         }
      }
    };

    const timer = setInterval(calculateTime, 1000);
    calculateTime();
    return () => clearInterval(timer);
  }, [timings, translation, notificationsEnabled]);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-emerald-600 rounded-3xl shadow-xl text-white mb-6 relative overflow-hidden min-h-[220px]">
      {/* Decorative Elements */}
      <div className="absolute -top-12 -left-12 w-40 h-40 bg-emerald-500 rounded-full opacity-50 blur-2xl"></div>
      <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-emerald-400 rounded-full opacity-30 blur-2xl"></div>

      <p className="text-emerald-100 text-sm font-bold tracking-widest mb-2 uppercase z-10">{translation.next}</p>
      <h2 className="text-2xl font-bold mb-2 z-10 text-center">{nextEventLabel}</h2>
      
      <div className="text-6xl font-mono font-bold my-2 z-10 tracking-tighter tabular-nums drop-shadow-lg">
        {timeLeft}
      </div>

      {activeTiming && (
        <div className="flex space-x-3 z-10 text-emerald-100/90 text-sm mt-4 bg-emerald-700/30 px-4 py-1 rounded-full backdrop-blur-sm">
            <span>Hijri: {activeTiming.hijri_date}</span>
            <span>•</span>
            <span>{activeTiming.day_ur}</span>
        </div>
      )}
    </div>
  );
};

export default Countdown;