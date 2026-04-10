'use client'

import Dashboard from '@/components/Dashboard'
import { useRequireAuth } from '@/lib/use-require-auth'

export default function DashboardPage() {
  const { user, loading } = useRequireAuth()

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-400/20 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return <Dashboard />
}
