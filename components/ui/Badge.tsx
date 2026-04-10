'use client'

import React from 'react'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'indigo' | 'slate' | 'green' | 'red' | 'yellow'
  size?: 'sm' | 'md'
}

export default function Badge({
  children,
  variant = 'indigo',
  size = 'sm',
  className = '',
  ...props
}: BadgeProps) {
  const variants = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    slate: 'bg-slate-100 text-slate-600 border-slate-200',
    green: 'bg-green-50 text-green-700 border-green-100',
    red: 'bg-red-50 text-red-700 border-red-100',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-100',
  }

  const sizes = {
    sm: 'px-3 py-1 text-[10px]',
    md: 'px-4 py-1.5 text-xs',
  }

  return (
    <span
      className={`inline-flex items-center font-black tracking-widest uppercase border rounded-full ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
