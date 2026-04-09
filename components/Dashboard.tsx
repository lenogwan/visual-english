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
                fetch('/api/words/learned', { headers: { Authorization: `Bearer ${token}` } })
            ])
            setStats(await statsRes.json())
            const wordsData = await wordsRes.json()
            setWords(wordsData.words || [])
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }
    fetchData()
  }, [token])

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  if (!user || loading || !stats) return <div className="min-h-screen flex items-center justify-center animate-pulse">Initializing Brain...</div>

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 font-sans">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-10">
            {getGreeting()}, {user.name || 'Learner'}
        </h1>

        <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 mb-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Achievement Wall</h3>
            <div className="flex gap-4">
                {stats.achievements.map((a: any) => (
                    <div key={a.slug} className="px-6 py-3 bg-amber-100 text-amber-700 rounded-full font-black text-xs">🏆 {a.title}</div>
                ))}
                {stats.achievements.length === 0 && <p className="text-slate-400 text-sm font-medium">Keep learning to unlock achievements!</p>}
            </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 text-center">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Mastery Health</h3>
                <div className="text-5xl font-extrabold text-indigo-600 mb-2">{stats.masteryScore}%</div>
                <p className="text-sm font-bold text-slate-400 mb-6">Retention Rate</p>
                <Link href="/learn" className="block w-full py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all">Start Daily Stream</Link>
            </div>

            <div className="md:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                <h3 className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-6">● Refinement Zone</h3>
                <div className="grid grid-cols-2 gap-4">
                    {stats.refinementWords.map((w: any, i: number) => (
                        <div key={i} className="flex justify-between items-center p-4 bg-red-50 rounded-2xl">
                            <span className="font-bold text-red-900">{w.word.toUpperCase()}</span>
                            <span className="text-[10px] font-black text-red-600 bg-white px-2 py-1 rounded-lg">{w.count} mistakes</span>
                        </div>
                    ))}
                    {stats.refinementWords.length === 0 && <p className="text-slate-400 text-sm font-medium">Your memory is sharp!</p>}
                </div>
            </div>
        </div>

        <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex justify-between mb-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Knowledge Library</h3>
                <Link href="/library" className="text-indigo-600 font-bold text-[10px] uppercase">View All Library →</Link>
            </div>
            <div className="flex flex-wrap gap-3">
                {words.slice(0, 10).map((w) => (
                    <Link key={w.id} href={`/study/${w.id}`} className="px-6 py-3 bg-slate-50 text-slate-700 rounded-2xl font-bold text-sm hover:bg-indigo-50 transition-colors">
                        {w.word}
                    </Link>
                ))}
            </div>
        </section>
      </div>
    </div>
  )
}
