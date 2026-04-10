'use client'

import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
}

export default function Input({
  label,
  error,
  helper,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full p-4 bg-white border-2 rounded-xl focus:outline-none focus:ring-4 transition-all font-medium shadow-sm text-slate-900 ${
          error
            ? 'border-red-200 focus:border-red-400 focus:ring-red-400/10'
            : 'border-indigo-50 focus:border-indigo-400 focus:ring-indigo-400/10'
        } ${className}`}
        aria-invalid={!!error}
        {...props}
      />
      {error && <p className="text-xs font-bold text-red-500">{error}</p>}
      {helper && !error && <p className="text-[10px] text-slate-400 italic">{helper}</p>}
    </div>
  )
}
