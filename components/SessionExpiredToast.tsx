'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

export default function SessionExpiredToast() {
  const { sessionExpired, clearSessionExpired } = useAuth()
  const router = useRouter()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (sessionExpired) {
      setVisible(true)
      // Auto-redirect after 5 seconds
      const timer = setTimeout(() => {
        setVisible(false)
        clearSessionExpired()
        router.push('/login')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [sessionExpired, clearSessionExpired, router])

  if (!visible) return null

  return (
    <div className="fixed top-4 right-4 z-[100] bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-2xl shadow-xl max-w-sm animate-in slide-in-from-top-2 fade-in duration-300">
      <div className="flex items-center gap-3">
        <span className="text-xl">⚠️</span>
        <div>
          <p className="font-bold text-sm">Session Expired</p>
          <p className="text-xs text-red-600 mt-1">Your session has ended. Redirecting to login...</p>
        </div>
      </div>
    </div>
  )
}
