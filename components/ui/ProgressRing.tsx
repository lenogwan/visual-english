'use client'

import React from 'react'

interface ProgressRingProps {
  progress: number // 0 to 1
  size?: number
  strokeWidth?: number
  color?: string
  bgColor?: string
  children?: React.ReactNode
}

export default function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  color = '#4F46E5', // indigo-600
  bgColor = '#E2E8F0', // slate-200
  children,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - progress * circumference

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {children && <div className="absolute inset-0 flex items-center justify-center">{children}</div>}
    </div>
  )
}
