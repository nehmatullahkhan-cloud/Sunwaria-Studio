import React, { useRef, useEffect, useState } from 'react';
import { DUAS, TRANSLATIONS } from '../constants';
import { Language, RamadanTiming } from '../types';

interface DuaSliderProps {
  language: Language;
  timings: RamadanTiming[];
}

const DuaSlider: React.FC<DuaSliderProps> = ({ language, timings }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const t = TRANSLATIONS[language];

  useEffect(() => {
    // Determine which Dua to show first
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const todayTiming = timings.find(t => t.date === todayStr);

    let showIftar = false;

    if (todayTiming) {
      const sehriTime = new Date(`${todayStr}T${todayTiming.sehri}:00`);
      const iftarTime = new Date(`${todayStr}T${todayTiming.iftar}:00`);

      // If it's after Sehri but before Iftar, show Iftar Dua. Otherwise Sehri Dua.
      if (now > sehriTime && now < iftarTime) {
        showIftar = true;
      }
    }

    if (showIftar && scrollContainerRef.current) {
      setTimeout(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                left: scrollContainerRef.current.scrollWidth, // Scroll to end (Iftar)
                behavior: 'smooth'
            });
            setActiveIndex(1);
        }
      }, 500); 
    }
  }, [timings]);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
        const scrollLeft = scrollContainerRef.current.scrollLeft;
        const width = scrollContainerRef.current.offsetWidth;
        const index = Math.round(scrollLeft / width);
        setActiveIndex(index);
    }
  };

  const speakDua = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any current speech
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA'; // Arabic Saudi Arabia for better accent
      utterance.rate = 0.85; // Slightly slower for recitation style
      utterance.pitch = 1.0;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-Speech not supported in this browser.");
    }
  };

  const DuaCard = ({ data, colorClass }: { data: typeof DUAS.sehri, colorClass: string }) => (
    <div className={`min-w-full snap-center p-1`}>
      <div className={`bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center h-full relative overflow-hidden group`}>
        {/* Decorative background element */}
        <div className={`absolute top-0 left-0 w-full h-1.5 ${colorClass}`}></div>
        
        <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${colorClass.replace('bg-', 'text-')}`}>
            {language === 'ur' ? data.title.ur : data.title.en}
        </h3>
        
        <p className="font-urdu-heading text-2xl sm:text-3xl text-gray-800 leading-relaxed mb-4 dir-rtl px-2">
            {data.arabic}
        </p>

        {/* Play Button */}
        <button 
          onClick={() => speakDua(data.arabic)}
          className={`mb-4 w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-all active:scale-95 shadow-sm ${isSpeaking ? 'animate-pulse text-emerald-600 ring-2 ring-emerald-100' : ''}`}
          aria-label={t.playAudio}
          title={t.playAudio}
        >
          <i className={`fas ${isSpeaking ? 'fa-volume-up' : 'fa-play'} text-sm`}></i>
        </button>
        
        <p className="font-urdu text-sm sm:text-base text-gray-600 leading-loose mb-2 dir-rtl">
            {data.urdu}
        </p>

        {language === 'en' && (
             <p className="text-xs text-gray-400 italic mt-2">
                "{data.english}"
             </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="mb-6 relative group">
       {/* Scroll Container */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <DuaCard data={DUAS.sehri} colorClass="bg-blue-500" />
        <DuaCard data={DUAS.iftar} colorClass="bg-orange-500" />
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-3">
        <div className={`w-2 h-2 rounded-full transition-all duration-300 ${activeIndex === 0 ? 'bg-blue-500 w-4' : 'bg-gray-300'}`}></div>
        <div className={`w-2 h-2 rounded-full transition-all duration-300 ${activeIndex === 1 ? 'bg-orange-500 w-4' : 'bg-gray-300'}`}></div>
      </div>
    </div>
  );
};

export default DuaSlider;