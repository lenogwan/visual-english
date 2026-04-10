'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'

export default function Dashboard() {
  const { user, token } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [words, setWords] = useState<any[]>([])
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    const fetchData = async () => {
        try {
            const [statsRes, wordsRes, favRes] = await Promise.all([
                fetch('/api/user/stats', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/words/learned', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/favorites', { headers: { Authorization: `Bearer ${token}` } })
            ])
            setStats(await statsRes.json())
            const wordsData = await wordsRes.json()
            setWords(wordsData.words || [])
            const favData = await favRes.json()
            setFavorites(favData.favorites || [])
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

  const trendPoints = stats.trend.map((t: any, i: number) => `${(i / 29) * 100},${t.accuracy < 0 ? 80 : 80 - (t.accuracy * 0.8)}`).join(' ')

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Top: Header with Stats Summary */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-2">
                    {getGreeting()}, <span className="text-indigo-600">{user.name || 'Learner'}</span>
                </h1>
                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">
                    Ready to transcend your neural boundaries today?
                </p>
            </div>
            
            <div className="flex gap-4">
                <div className="px-6 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center min-w-[120px]">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Daily Goal</span>
                    <span className="text-2xl font-black text-indigo-600">{stats.totalLearned % stats.dailyGoal}/{stats.dailyGoal}</span>
                    <div className="w-full h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                        <div 
                            className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                            style={{ width: `${Math.min(100, ((stats.totalLearned % stats.dailyGoal) / stats.dailyGoal) * 100)}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* Achievements Section - New Card Style */}
        <div className="flex flex-wrap gap-4 mb-12">
            {stats.achievements.map((a: any) => (
                <div key={a.slug} className="group flex items-center gap-3 px-5 py-3 bg-white border border-indigo-50 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-100 transition-all cursor-default">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">🏆</div>
                    <div>
                        <p className="text-[9px] font-black text-amber-500 uppercase tracking-tighter">Achievement Unlocked</p>
                        <p className="text-sm font-black text-slate-800 tracking-tight">{a.title}</p>
                    </div>
                </div>
            ))}
            <div className="flex items-center gap-3 px-5 py-3 bg-slate-100/50 border border-dashed border-slate-200 rounded-2xl opacity-60">
                <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center text-xl">🔒</div>
                <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Next Milestone</p>
                    <p className="text-sm font-black text-slate-500 tracking-tight">Level 2 Mastery</p>
                </div>
            </div>
        </div>

        {/* Mid Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-[4rem] -z-10 group-hover:scale-110 transition-transform" />
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Mastery Health</h3>
                <div className="text-6xl font-black text-indigo-600 mb-2">{stats.masteryScore}%</div>
                <p className="text-sm font-bold text-slate-400 mb-6">Global Retention</p>
                <Link href="/learn" className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-indigo-600 transition-all text-center shadow-lg shadow-slate-200">
                    Start Stream
                </Link>
            </div>

            <div className="md:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">30-Day Activity Trend</h3>
                        <p className="text-xs font-bold text-slate-400">Accuracy stability over time</p>
                    </div>
                    <div className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase">
                        Stable Performance
                    </div>
                </div>
                <div className="relative flex-grow h-32 w-full mt-4">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 80" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <path 
                            d={`M 0 80 L ${trendPoints} L 100 80 Z`} 
                            fill="url(#gradient)" 
                            className="transition-all duration-1000"
                        />
                        <polyline 
                            fill="none" 
                            stroke="#6366f1" 
                            strokeWidth="2.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            points={trendPoints} 
                            className="drop-shadow-[0_4px_8px_rgba(99,102,241,0.3)]"
                        />
                    </svg>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <h3 className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-6">● Refinement Zone</h3>
                {stats.refinementWords.map((w: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-red-50 rounded-2xl mb-2">
                        <span className="font-bold text-red-900">{w.word.toUpperCase()}</span>
                        <span className="text-[10px] font-black text-red-600 bg-white px-2 py-1 rounded-lg">{w.count} mistakes</span>
                    </div>
                ))}
            </div>
            
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6">♥ My Favorites</h3>
                <div className="flex flex-wrap gap-2">
                    {favorites.map((w) => (
                        <Link key={w.id} href={`/study/${w.id}`} className="px-4 py-2 bg-pink-50 text-pink-700 rounded-xl font-bold text-sm">{w.word}</Link>
                    ))}
                </div>
            </div>
        </div>

        <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden relative group">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Knowledge Library</h3>
                    <p className="text-xl font-extrabold text-slate-900 tracking-tight">Your Neural Collection</p>
                </div>
                <Link href="/library" className="px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-600 hover:text-white transition-all shadow-sm shadow-indigo-100">
                    View Full Library
                </Link>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {words.slice(0, 10).map((w) => (
                    <Link 
                        key={w.id} 
                        href={`/study/${w.id}`} 
                        className="px-4 py-4 bg-slate-50 border border-transparent text-slate-700 rounded-2xl font-bold text-sm hover:bg-white hover:border-indigo-100 hover:shadow-md hover:shadow-indigo-500/5 transition-all text-center group/item"
                    >
                        <span className="block mb-1 text-slate-400 font-medium text-[10px] uppercase tracking-tighter group-hover/item:text-indigo-400">Word</span>
                        {w.word}
                    </Link>
                ))}
                {words.length > 10 && (
                    <Link 
                        href="/library" 
                        className="flex flex-col items-center justify-center px-4 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all text-center"
                    >
                        <span className="text-lg mb-1">+ {words.length - 10}</span>
                        <span>More</span>
                    </Link>
                )}
            </div>
        </section>
      </div>
    </div>
  )
}
