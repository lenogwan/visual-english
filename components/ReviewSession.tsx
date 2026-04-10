'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import TriadCard from '@/components/TriadCard'
import SRSController from '@/components/SRSController'

interface ReviewSessionProps {
  onComplete: (wordsReviewed: number) => void
}

export default function ReviewSession({ onComplete }: ReviewSessionProps) {
  const { token } = useAuth()
  const [queue, setQueue] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  async function fetchQueue() {
    try {
      const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {}
      const res = await fetch('/api/learn/queue', { headers })
      const data = await res.json()
      setQueue(data.queue || [])
    } catch (err) {
      console.error('Failed to fetch queue:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchQueue() }, [token])

  const handleGrade = async (quality: number) => {
    if (!queue[currentIndex]) return
    if (token) {
      try {
        await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ wordId: queue[currentIndex].id, quality })
        })
      } catch (err) { console.error('Progress save failed:', err) }
    }
    
    const nextIndex = currentIndex + 1
    if (nextIndex >= queue.length) {
      // Session complete
      onComplete(queue.length)
    } else {
      setCurrentIndex(nextIndex)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>

  if (queue.length === 0) {
    onComplete(0)
    return null
  }

  if (currentIndex >= queue.length) return null

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="mb-6 text-center">
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Word {currentIndex + 1} of {queue.length}</p>
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
  )
}
