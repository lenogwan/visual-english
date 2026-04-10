'use client'

import React from 'react'

interface StreakBadgeProps {
  streak: number
  freezes?: number
}

export default function StreakBadge({ streak, freezes = 0 }: StreakBadgeProps) {
  if (streak === 0) return null

  const isHot = streak >= 7
  const isFrozen = streak >= 30

  return (
    <div className="flex items-center gap-1.5 bg-white/50 px-3 py-1.5 rounded-full border border-orange-100 shadow-sm">
      <span className={`text-lg ${isHot ? 'animate-pulse' : ''}`}>
        {isFrozen ? '💎' : isHot ? '🔥' : '🔥'}
      </span>
      <span className="text-xs font-black text-orange-600">{streak}</span>
      {freezes > 0 && (
        <span className="text-[10px] font-bold text-blue-500 ml-1" title={`${freezes} streak freezes available`}>
          ❄️{freezes}
        </span>
      )}
    </div>
  )
}
