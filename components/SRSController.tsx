'use client'

import { calculateSRS, SRSQuality, SRSState } from '@/lib/srs'

interface SRSControllerProps {
  wordId: string;
  currentState?: SRSState;
  onGrade: (quality: number) => void;
}

export default function SRSController({ wordId, currentState, onGrade }: SRSControllerProps) {
  // Use a default state if none provided to calculate intervals
  const baseState = currentState || { interval: 0, easeFactor: 2.5, masteryLevel: 0, timesReviewed: 0 };

  const grades = [
    { label: 'Again', val: 1 as SRSQuality, color: 'bg-red-500', hoverColor: 'hover:bg-red-600', textColor: 'text-red-600', bgColor: 'bg-red-50', icon: '🔄' },
    { label: 'Hard', val: 3 as SRSQuality, color: 'bg-orange-500', hoverColor: 'hover:bg-orange-600', textColor: 'text-orange-600', bgColor: 'bg-orange-50', icon: '😓' },
    { label: 'Good', val: 4 as SRSQuality, color: 'bg-indigo-500', hoverColor: 'hover:bg-indigo-600', textColor: 'text-indigo-600', bgColor: 'bg-indigo-50', icon: '👍' },
    { label: 'Easy', val: 5 as SRSQuality, color: 'bg-emerald-500', hoverColor: 'hover:bg-emerald-600', textColor: 'text-emerald-600', bgColor: 'bg-emerald-50', icon: '✨' }
  ];

  const formatInterval = (days: number) => {
    if (days === 0) return '< 10m';
    if (days < 30) return `${days}d`;
    if (days < 365) return `${Math.round(days / 30)}mo`;
    return '1y';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-2xl mx-auto">
      {grades.map((grade) => {
        const prediction = calculateSRS(grade.val, baseState);
        return (
          <button
            key={grade.val}
            onClick={(e) => {
              e.stopPropagation();
              onGrade(grade.val);
            }}
            className={`group relative flex flex-col items-center gap-2 p-5 rounded-[2rem] border border-transparent transition-all hover:scale-105 active:scale-95 ${grade.bgColor} hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/10`}
          >
            <span className="text-2xl mb-1 group-hover:scale-125 transition-transform">{grade.icon}</span>
            <span className={`font-black text-xs uppercase tracking-[0.2em] ${grade.textColor}`}>
              {grade.label}
            </span>
            
            <div className={`mt-2 px-3 py-1 rounded-full text-[10px] font-black ${grade.color} text-white shadow-sm`}>
              {formatInterval(prediction.interval)}
            </div>
            
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity animate-ping" />
          </button>
        );
      })}
    </div>
  );
}
