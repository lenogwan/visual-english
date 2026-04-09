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

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black mb-12">System Overview</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-indigo-50">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Mastery Health</h3>
            <div className="text-center">
                <div className="text-6xl font-black text-indigo-600 mb-2">{stats.masteryScore}%</div>
                <p className="text-sm font-bold text-slate-500">Total System Retention</p>
            </div>
            <div className="mt-8 space-y-4">
                <Link href="/learn" className="block w-full py-4 bg-indigo-600 text-white text-center font-black rounded-2xl">Start Daily Stream</Link>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-xl border border-indigo-50">
            <h3 className="text-xs font-black text-red-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" /> Refinement Zone
            </h3>
            {stats.refinementWords.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {stats.refinementWords.map((w: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-red-50 rounded-2xl">
                            <span className="font-bold text-red-800 uppercase">{w.word}</span>
                            <span className="text-xs font-black bg-red-200 px-3 py-1 rounded-full text-red-800">{w.count} mistakes</span>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-slate-400 font-medium">No recent mistakes. Your memory is sharp!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
