interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export default function LoadingSpinner({ size = 'lg', text, className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }

  return (
    <div className={`min-h-screen bg-slate-50 flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center gap-6">
        <div className={`${sizeClasses[size]} border-4 border-indigo-400/20 border-t-indigo-600 rounded-full animate-spin`}></div>
        {text && (
          <div className="text-xl font-black text-indigo-200 tracking-widest animate-pulse">
            {text.toUpperCase()}
          </div>
        )}
      </div>
    </div>
  )
}
