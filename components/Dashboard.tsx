'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'

interface DashboardStats {
  dailyGoal: number
  todayProgress: number
  totalLearned: number
  totalReviewed: number
  totalWords: number
  streak: number
  favoritesCount: number
  accuracy: number
  dueForReview: number
  weeklyTrend: { day: string; accuracy: number }[]
}

export default function Dashboard() {
  const { user, token } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    fetch('/api/user/stats', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [token])

  if (!user) return null

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-400/20 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  const progressPercent = stats.dailyGoal > 0 ? Math.min(100, Math.round((stats.todayProgress / stats.dailyGoal) * 100)) : 0
  const circumference = 2 * Math.PI * 54
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10 animate-fadeIn">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1">
            Welcome back, <span className="text-indigo-600">{user.name || user.email.split('@')[0]}</span>
          </h1>
          <p className="text-slate-500 font-medium">Here's your learning summary for today.</p>
        </div>

        {/* Top Row: Progress Ring + Streak + Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Daily Progress Ring */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-indigo-100 shadow-xl flex flex-col items-center justify-center relative overflow-hidden animate-scaleIn">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Today's Goal</p>
            <div className="relative w-32 h-32 mb-4">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" stroke="#e0e7ff" strokeWidth="8" fill="none" />
                <circle
                  cx="60" cy="60" r="54"
                  stroke={progressPercent >= 100 ? '#22c55e' : '#6366f1'}
                  strokeWidth="8" fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-900">{stats.todayProgress}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">/ {stats.dailyGoal}</span>
              </div>
            </div>
            <p className="text-xs font-bold text-slate-500">
              {progressPercent >= 100 ? '🎉 Goal Complete!' : `${progressPercent}% of daily goal`}
            </p>
          </div>

          {/* Streak */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-indigo-100 shadow-xl flex flex-col items-center justify-center animate-scaleIn" style={{ animationDelay: '0.1s' }}>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Learning Streak</p>
            <div className="text-7xl mb-3">{stats.streak > 0 ? '🔥' : '❄️'}</div>
            <p className="text-5xl font-black text-slate-900 mb-1">{stats.streak}</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {stats.streak === 1 ? 'Day' : 'Days'} in a row
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-indigo-100 shadow-xl animate-scaleIn" style={{ animationDelay: '0.2s' }}>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Quick Stats</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-indigo-50 rounded-2xl p-4 text-center hover:scale-105 transition-transform cursor-pointer">
                <p className="text-2xl font-black text-indigo-600">{stats.totalLearned}</p>
                <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">Mastered</p>
              </div>
              <div className="bg-purple-50 rounded-2xl p-4 text-center hover:scale-105 transition-transform cursor-pointer">
                <p className="text-2xl font-black text-purple-600">{stats.totalReviewed}</p>
                <p className="text-[9px] font-bold text-purple-400 uppercase tracking-wider">Reviewed</p>
              </div>
              <div className="bg-pink-50 rounded-2xl p-4 text-center hover:scale-105 transition-transform cursor-pointer">
                <p className="text-2xl font-black text-pink-600">{stats.favoritesCount}</p>
                <p className="text-[9px] font-bold text-pink-400 uppercase tracking-wider">Favorites</p>
              </div>
              <div className="bg-green-50 rounded-2xl p-4 text-center hover:scale-105 transition-transform cursor-pointer">
                <p className="text-2xl font-black text-green-600">{stats.accuracy}%</p>
                <p className="text-[9px] font-bold text-green-400 uppercase tracking-wider">Accuracy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Row: Weekly Trend + Due for Review */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Weekly Accuracy Trend */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-indigo-100 shadow-xl animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Weekly Accuracy Trend</p>
            <div className="flex items-end justify-between gap-3 h-40 px-2">
              {stats.weeklyTrend.map((d, i) => {
                const barHeight = d.accuracy >= 0 ? Math.max(8, (d.accuracy / 100) * 140) : 8
                const isToday = i === stats.weeklyTrend.length - 1
                return (
                  <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                    {d.accuracy >= 0 && (
                      <span className="text-[9px] font-black text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">{d.accuracy}%</span>
                    )}
                    <div
                      className={`w-full rounded-xl transition-all duration-700 ${
                        d.accuracy < 0
                          ? 'bg-slate-100'
                          : isToday
                          ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-lg shadow-indigo-100'
                          : 'bg-indigo-100 hover:bg-indigo-200'
                      }`}
                      style={{ height: `${barHeight}px` }}
                    />
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${
                      isToday ? 'text-indigo-600' : 'text-slate-400'
                    }`}>
                      {d.day}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Action Cards */}
          <div className="space-y-4 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            {stats.dueForReview > 0 && (
              <Link href="/practice" className="block bg-gradient-to-r from-amber-50 to-orange-50 rounded-[2rem] p-6 border border-amber-100 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform">🔄</div>
                    <div>
                      <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Words Due for Review</p>
                      <p className="text-xs text-slate-500 font-medium">{stats.dueForReview} words need refreshing</p>
                    </div>
                  </div>
                  <span className="text-3xl font-black text-amber-600">{stats.dueForReview}</span>
                </div>
              </Link>
            )}
            <Link href="/learn" className="block bg-gradient-to-r from-indigo-50 to-purple-50 rounded-[2rem] p-6 border border-indigo-100 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] group">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform">📚</div>
                <div>
                  <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Continue Learning</p>
                  <p className="text-xs text-slate-500 font-medium">{stats.totalLearned} of {stats.totalWords} words mastered</p>
                </div>
              </div>
            </Link>
            <Link href="/practice" className="block bg-gradient-to-r from-green-50 to-emerald-50 rounded-[2rem] p-6 border border-green-100 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] group">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform">🎯</div>
                <div>
                  <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Quick Practice</p>
                  <p className="text-xs text-slate-500 font-medium">Test your knowledge with a quiz</p>
                </div>
              </div>
            </Link>
            {stats.favoritesCount > 0 && (
              <Link href="/learn?mode=favorites" className="block bg-gradient-to-r from-pink-50 to-red-50 rounded-[2rem] p-6 border border-pink-100 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] group">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform">❤️</div>
                  <div>
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">My Favorites</p>
                    <p className="text-xs text-slate-500 font-medium">{stats.favoritesCount} saved words to review</p>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Bottom Overview */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-indigo-100 shadow-xl animate-fadeIn" style={{ animationDelay: '0.5s' }}>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Word Bank Overview</p>
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
                  style={{ width: `${stats.totalWords > 0 ? Math.round((stats.totalLearned / stats.totalWords) * 100) : 0}%` }}
                />
              </div>
            </div>
            <span className="text-sm font-black text-slate-600 whitespace-nowrap">
              {stats.totalLearned} / {stats.totalWords} words
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
