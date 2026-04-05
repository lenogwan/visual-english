'use client'

import Dashboard from '@/components/Dashboard'
import { useAuth } from '@/lib/auth-context'

export default function DashboardPage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-[3rem] p-16 text-center border border-indigo-100 shadow-xl max-w-lg">
          <div className="text-6xl mb-6">📊</div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Dashboard</h2>
          <p className="text-slate-500 font-medium mb-8">Please log in to see your personalized learning dashboard.</p>
          <a href="/login" className="inline-block px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-lg tracking-widest">LOGIN</a>
        </div>
      </div>
    )
  }

  return <Dashboard />
}
