'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/lib/auth-context'
import TriadCard from '@/components/TriadCard'
import SRSController from '@/components/SRSController'

function LearnContent() {
  const { token } = useAuth()
  const [queue, setQueue] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchQueue() {
    try {
      setLoading(true)
      setError(null)
      const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {}
      const res = await fetch('/api/learn/queue', { headers })
      if (!res.ok) throw new Error('Failed to fetch learning queue')
      const data = await res.json()
      setQueue(data.queue || [])
    } catch (err) {
      console.error(err)
      setError('Failed to load your learning queue. Please try again.')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchQueue() }, [token])

  const handleGrade = async (quality: number) => {
    if (!queue[currentIndex]) return
    if (token) {
        try {
          const res = await fetch('/api/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ wordId: queue[currentIndex].id, quality })
          })
          if (!res.ok) throw new Error('Failed to save progress')
        } catch (err) { console.error('Progress save failed:', err) }
    }
    setCurrentIndex(prev => prev + 1)
  }

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>

  if (error) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="text-6xl mb-6">⚠️</div>
      <h2 className="text-3xl font-black text-slate-900 mb-3">Queue Load Failed</h2>
      <p className="text-lg text-slate-500 mb-8 max-w-md">{error}</p>
      <button onClick={fetchQueue} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors">Try Again</button>
    </div>
  )

  if (currentIndex >= queue.length) return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-4xl font-black mb-6">🎉 Daily Goal Completed!</h2>
        <p className="text-xl text-slate-500 mb-8">You have mastered your scheduled words for today.</p>
        <button onClick={() => window.location.reload()} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold">Refresh Queue</button>
      </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="mb-8 text-center">
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] bg-indigo-50 px-4 py-2 rounded-full">Daily Training Stream</span>
            <p className="mt-4 text-slate-400 font-bold">Word {currentIndex + 1} of {queue.length}</p>
        </div>
        
        <TriadCard
           word={queue[currentIndex]}
           onNext={handleGrade}
        />

        <SRSController
           wordId={queue[currentIndex].id}
           currentState={queue[currentIndex].progress ? {
             interval: queue[currentIndex].progress.interval,
             easeFactor: queue[currentIndex].progress.easeFactor,
             masteryLevel: queue[currentIndex].progress.masteryLevel,
             timesReviewed: queue[currentIndex].progress.timesReviewed
           } : undefined}
           onGrade={handleGrade}
        />
      </div>
    </div>
  )
}

export default function LearnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-16 h-16 border-4 border-indigo-400/20 border-t-indigo-600 rounded-full animate-spin"></div></div>
    }>
      <LearnContent />
    </Suspense>
  )
}
