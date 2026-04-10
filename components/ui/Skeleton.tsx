'use client'

import React from 'react'

interface SkeletonProps {
  variant?: 'circle' | 'line' | 'card' | 'rect'
  className?: string
  width?: string | number
  height?: string | number
  count?: number
}

export default function Skeleton({
  variant = 'line',
  className = '',
  width,
  height,
  count = 1,
}: SkeletonProps) {
  const base = 'bg-slate-100 animate-pulse rounded-xl'

  const style: React.CSSProperties = {
    width: variant === 'circle' ? '100%' : width,
    height: height,
    borderRadius: variant === 'circle' ? '50%' : undefined,
  }

  if (variant === 'card') {
    return (
      <div className={`bg-white rounded-[2.5rem] p-8 border border-indigo-50 ${className}`}>
        <div className="flex gap-3 mb-4">
          <div className={`${base} h-4 w-16`} />
          <div className={`${base} h-4 w-12`} />
        </div>
        <div className={`${base} h-8 w-32 mb-6`} />
        <div className={`${base} h-48 w-full rounded-3xl mb-6`} />
        <div className="space-y-2">
          <div className={`${base} h-4 w-full`} />
          <div className={`${base} h-4 w-3/4`} />
        </div>
      </div>
    )
  }

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${base} ${className}`} style={style} />
      ))}
    </>
  )
}
