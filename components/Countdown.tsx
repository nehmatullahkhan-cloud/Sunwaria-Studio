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
  
  // Calculate Time Logic
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

      // If no event today or passed both, find next day's Sehri
      if (!targetDate) {
        // Find next available date in array
        const futureTimings = timings.filter(t => new Date(t.date) > now);
        if (futureTimings.length > 0) {
          const next = futureTimings[0];
          targetDate = new Date(`${next.date}T${next.sehri}:00`);
          label = `${translation.sehri} (${next.date})`; // "Sehri Ends (Date)"
          isSehri = true;
          setActiveTiming(next);
        } else {
          setNextEventLabel(translation.completed);
          setTimeLeft("00:00:00");
          return;
        }
      }

      setNextEventLabel(label);

      // Diff calculation
      const diff = targetDate.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );

      // Trigger Alerts logic
      if (notificationsEnabled) {
         // 1 Hour Warning (Sehri Only)
         if (isSehri && hours === 1 && minutes === 0 && seconds === 0) {
             sendNotification("Ramadan Alert", "1 Hour remaining for Sehri!");
             playAlarm('beep');
         }
         // 20 Min Warning (Iftar Only)
         if (!isSehri && hours === 0 && minutes === 20 && seconds === 0) {
             sendNotification("Ramadan Alert", "20 Minutes to Iftar. Prepare your Dua.");
             playAlarm('beep');
         }
         // EXACT TIME
         if (hours === 0 && minutes === 0 && seconds === 0) {
             const msg = isSehri ? "Sehri Time Ended! Stop eating." : "Iftar Time! You may break your fast.";
             sendNotification("Ramadan Alert", msg);
             playAlarm('alarm');
         }
      }
    };

    const timer = setInterval(calculateTime, 1000);
    calculateTime(); // Initial call
    return () => clearInterval(timer);
  }, [timings, translation, notificationsEnabled]);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-emerald-600 rounded-3xl shadow-lg text-white mb-6 mx-4 relative overflow-hidden">
      {/* Decorative Circles */}
      <div className="absolute -top-10 -left-10 w-32 h-32 bg-emerald-500 rounded-full opacity-50 blur-xl"></div>
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-400 rounded-full opacity-30 blur-xl"></div>

      <p className="text-emerald-100 text-sm font-medium tracking-wider mb-2 uppercase z-10">{translation.next}</p>
      <h2 className="text-2xl font-bold mb-1 z-10">{nextEventLabel}</h2>
      
      <div className="text-6xl font-mono font-bold my-4 z-10 tracking-tighter tabular-nums drop-shadow-md">
        {timeLeft}
      </div>

      {activeTiming && (
        <div className="flex space-x-4 z-10 text-emerald-100 text-sm mt-2">
            <span>Hijri: {activeTiming.hijri_date}</span>
            <span>•</span>
            <span>{activeTiming.day_ur}</span>
        </div>
      )}
    </div>
  );
};

export default Countdown;