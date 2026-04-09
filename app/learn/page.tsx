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

  async function fetchQueue() {
    if (!token) return
    try {
      setLoading(true)
      const res = await fetch('/api/learn/queue', { headers: { 'Authorization': `Bearer ${token}` } })
      const data = await res.json()
      setQueue(data.queue || [])
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  useEffect(() => { fetchQueue() }, [token])

  const handleGrade = async (quality: number) => {
    if (!token || !queue[currentIndex]) return
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ wordId: queue[currentIndex].id, quality })
      })
      setCurrentIndex(prev => prev + 1)
    } catch (err) { console.error(err) }
  }

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>
  
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
           onNext={() => setCurrentIndex(p => p + 1)}
        />
        
        <SRSController 
           wordId={queue[currentIndex].id} 
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
