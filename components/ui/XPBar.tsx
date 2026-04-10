'use client'

import React from 'react'
import { getLevelProgress, calculateLevel } from '@/lib/gamification'

interface XPBarProps {
  xp: number
  level: number
}

export default function XPBar({ xp, level }: XPBarProps) {
  const { title, nextLevelXp, currentLevelXp } = calculateLevel(xp)
  const progress = getLevelProgress(xp)

  return (
    <div className="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-full border border-indigo-100 shadow-sm">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md">
          Lv.{level}
        </span>
        <span className="text-[10px] font-bold text-slate-500 hidden sm:inline">{title}</span>
      </div>
      <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
