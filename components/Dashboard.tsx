'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'

export default function Dashboard() {
  const { user, token } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    fetch('/api/user/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [token])

  if (!user || loading || !stats) return <div className="min-h-screen flex items-center justify-center animate-pulse">Initializing Brain...</div>

  // Calculate SVG Path for Trend
  const points = stats.trend.map((t: any, i: number) => {
      const x = (i / 29) * 100
      const y = t.accuracy < 0 ? 80 : 80 - (t.accuracy * 0.7)
      return `${x},${y}`
  }).join(' ')

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black mb-12">System Overview</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-indigo-50">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Mastery Health</h3>
            <div className="text-center">
                <div className="text-6xl font-black text-indigo-600 mb-2">{stats.masteryScore}%</div>
                <p className="text-sm font-bold text-slate-500">Retention Rate</p>
            </div>
            <div className="mt-8">
                <Link href="/learn" className="block w-full py-4 bg-indigo-600 text-white text-center font-black rounded-2xl">Start Daily Stream</Link>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-xl border border-indigo-50">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">30-Day Accuracy Trend</h3>
             <svg className="w-full h-40" viewBox="0 0 100 80" preserveAspectRatio="none">
                <polyline fill="none" stroke="#6366f1" strokeWidth="2" points={points} />
             </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
