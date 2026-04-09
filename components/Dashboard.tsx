'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'

export default function Dashboard() {
  const { user, token } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [words, setWords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    const fetchData = async () => {
        try {
            const [statsRes, wordsRes] = await Promise.all([
                fetch('/api/user/stats', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/words/learned', { headers: { 'Authorization': `Bearer ${token}` } })
            ])
            setStats(await statsRes.json())
            const wordsData = await wordsRes.json()
            setWords(wordsData.words || [])
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }
    fetchData()
  }, [token])

  if (!user || loading || !stats) return <div className="min-h-screen flex items-center justify-center animate-pulse">Initializing Brain...</div>

  // Calculate SVG Path for Trend
  const points = stats.trend.map((t: any, i: number) => {
      const x = (i / 29) * 100
      const y = t.accuracy < 0 ? 80 : 80 - (t.accuracy * 0.8)
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
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">30-Day Accuracy Trend (%)</h3>
             <div className="relative w-full h-48">
                {/* Y-axis Labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[9px] font-bold text-slate-300">
                    <span>100%</span><span>50%</span><span>0%</span>
                </div>
                <svg className="w-full h-full ml-8" viewBox="0 0 100 80" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{stopColor:'#6366f1', stopOpacity:0.3}} />
                            <stop offset="100%" style={{stopColor:'#6366f1', stopOpacity:0}} />
                        </linearGradient>
                    </defs>
                    <polyline fill="none" stroke="#6366f1" strokeWidth="2" points={points} />
                    <polygon fill="url(#grad1)" points={`${points} 100,80 0,80`} />
                </svg>
                {/* X-axis simplified dates */}
                <div className="flex justify-between mt-2 ml-8 text-[9px] font-bold text-slate-300">
                    <span>{stats.trend[0].day}</span>
                    <span>{stats.trend[15].day}</span>
                    <span>{stats.trend[29].day}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Quick Library Access */}
        <div className="mt-8 bg-white p-10 rounded-[3rem] shadow-xl border border-indigo-50">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Knowledge Library</h3>
                <Link href="/library" className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline">View All Library →</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {words.slice(0, 6).map((w) => (
                    <Link key={w.id} href={`/learn?wordId=${w.id}`} className="p-4 bg-slate-50 rounded-2xl hover:bg-indigo-50 transition-all text-center">
                        <p className="font-black text-slate-800 text-sm">{w.word}</p>
                    </Link>
                ))}
            </div>
        </div>
      </div>
    </div>
  )
}
