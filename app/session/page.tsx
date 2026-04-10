'use client'

import { useAuth } from '@/lib/auth-context'
import { useRequireAuth } from '@/lib/use-require-auth'
import DailyProtocol from '@/components/DailyProtocol'

export default function SessionPage() {
  const { user, loading } = useRequireAuth()

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-16 h-16 border-4 border-indigo-400/20 border-t-indigo-600 rounded-full animate-spin"></div></div>
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <DailyProtocol />
    </div>
  )
}
