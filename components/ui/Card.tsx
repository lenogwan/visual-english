'use client'

import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}

export default function Card({
  children,
  padding = 'md',
  hover = false,
  className = '',
  ...props
}: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-6',
    md: 'p-8',
    lg: 'p-12',
  }

  return (
    <div
      className={`bg-white rounded-[2.5rem] shadow-xl border border-indigo-50/50 ${paddings[padding]} ${
        hover ? 'hover:shadow-2xl hover:border-indigo-100 transition-all' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
