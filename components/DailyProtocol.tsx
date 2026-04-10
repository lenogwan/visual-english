'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import ProgressRing from '@/components/ui/ProgressRing'
import ReviewSession from '@/components/ReviewSession'
import PracticeSession from '@/components/PracticeSession'

type Phase = 'idle' | 'reviewing' | 'practicing' | 'completed'

export default function DailyProtocol() {
  const { token } = useAuth()
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('idle')
  const [reviewCount, setReviewCount] = useState(0)
  
  // Stats
  const [wordsReviewed, setWordsReviewed] = useState(0)
  const [practiceScore, setPracticeScore] = useState(0)
  const [practiceTotal, setPracticeTotal] = useState(0)
  const [xpEarned, setXpEarned] = useState(0)

  // Fetch initial queue size for briefing
  useEffect(() => {
    if (token && phase === 'idle') {
      fetch('/api/learn/queue', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => setReviewCount(d.queue?.length || 0))
        .catch(() => {})
    }
  }, [token, phase])

  const startSession = () => {
    if (reviewCount > 0) {
      setPhase('reviewing')
    } else {
      // No reviews needed, go straight to practice
      setPhase('practicing')
    }
  }

  const handleReviewComplete = (count: number) => {
    setWordsReviewed(count)
    setPhase('practicing')
  }

  const handlePracticeComplete = (score: number, total: number, xp: number) => {
    setPracticeScore(score)
    setPracticeTotal(total)
    setXpEarned(xp)
    setPhase('completed')
  }

  const totalTasks = reviewCount + 10 // 10 practice questions
  const currentProgress = phase === 'reviewing' 
    ? 0 // Progress ring inside ReviewSession handles visual
    : phase === 'practicing'
      ? 0.3 + 0.7 * (wordsReviewed / reviewCount) // Approximate
      : 1

  // --- Renders ---

  if (phase === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="mb-8">
          <ProgressRing progress={0} size={100} color="#4F46E5">
            <span className="text-2xl">🧠</span>
          </ProgressRing>
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2">Today's Session</h2>
        <p className="text-slate-500 mb-8 max-w-md">
          {reviewCount > 0 
            ? `You have ${reviewCount} words waiting for review.` 
            : "All caught up! Time for some practice."}
        </p>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 w-full max-w-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-slate-500">Review</span>
            <span className="text-sm font-black text-indigo-600">{reviewCount} words</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-slate-500">Practice</span>
            <span className="text-sm font-black text-indigo-600">10 questions</span>
          </div>
        </div>

        <Button size="lg" onClick={startSession} className="w-full max-w-xs">
          Start Session
        </Button>
      </div>
    )
  }

  if (phase === 'reviewing') {
    return (
      <div className="py-8 px-4">
        <div className="flex items-center justify-between mb-8 max-w-xl mx-auto">
          <h3 className="text-lg font-black text-slate-700">Phase 1: Review</h3>
          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
            {/* We can't easily track internal progress of ReviewSession without props drilling, 
                but we can show a generic "active" indicator */}
            <div className="h-full bg-indigo-500 animate-pulse w-full"></div>
          </div>
        </div>
        <ReviewSession onComplete={handleReviewComplete} />
      </div>
    )
  }

  if (phase === 'practicing') {
    return (
      <div className="py-8 px-4">
        <div className="flex items-center justify-between mb-8 max-w-2xl mx-auto">
          <h3 className="text-lg font-black text-slate-700">Phase 2: Practice</h3>
          <div className="text-xs font-bold text-indigo-500">Targeting weak spots</div>
        </div>
        <PracticeSession onComplete={handlePracticeComplete} />
      </div>
    )
  }

  if (phase === 'completed') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in slide-in-from-bottom-4">
        <div className="mb-6">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">Session Complete!</h2>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-indigo-50 w-full max-w-md mb-8">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="text-center">
              <p className="text-3xl font-black text-indigo-600">{wordsReviewed}</p>
              <p className="text-xs font-bold text-slate-400 uppercase">Words Reviewed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-indigo-600">{practiceTotal > 0 ? Math.round((practiceScore / practiceTotal) * 100) : 0}%</p>
              <p className="text-xs font-bold text-slate-400 uppercase">Practice Accuracy</p>
            </div>
          </div>
          <div className="pt-6 border-t border-slate-50 text-center">
            <p className="text-sm font-bold text-slate-500 mb-1">XP Earned</p>
            <p className="text-4xl font-black text-amber-500">+{xpEarned}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Button variant="secondary" onClick={() => router.push('/')}>
            Back to Dashboard
          </Button>
          <Button onClick={startSession}>
            Train More
          </Button>
        </div>
      </div>
    )
  }

  return null
}
