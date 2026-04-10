'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import Button from '@/components/ui/Button'

interface PracticeSessionProps {
  onComplete: (score: number, total: number, xp: number) => void
  mode?: string
}

interface Question {
  wordId: string
  word: string
  correctAnswer: string
  options: string[]
}

export default function PracticeSession({ onComplete, mode = 'meaning' }: PracticeSessionProps) {
  const { token } = useAuth()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {}
        const res = await fetch(`/api/practice/queue?mode=${mode}&count=10`, { headers })
        const data = await res.json()
        setQuestions(data.words || [])
      } catch (err) {
        console.error('Failed to fetch practice queue:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchQuestions()
  }, [token, mode])

  const handleSelect = (qIndex: number, option: string) => {
    setSelectedOptions(prev => ({ ...prev, [qIndex]: option }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const answers = questions.map((q, i) => ({
        wordId: q.wordId,
        isCorrect: selectedOptions[i] === q.correctAnswer,
      }))

      const res = await fetch('/api/practice/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mode, answers })
      })
      const data = await res.json()
      onComplete(data.correctCount, answers.length, data.xpEarned)
    } catch (err) {
      console.error('Submit failed:', err)
      onComplete(0, questions.length, 0)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>

  if (questions.length === 0) {
    onComplete(0, 0, 0)
    return null
  }

  const currentQ = questions[currentQIndex]
  const isLast = currentQIndex === questions.length - 1
  const canAdvance = !!selectedOptions[currentQIndex]

  // We show one question at a time for focus
  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-[2.5rem] shadow-xl border border-indigo-50">
      <div className="mb-8 flex justify-between items-center">
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Practice: {mode}</span>
        <span className="text-xs font-black text-indigo-500">{currentQIndex + 1} / {questions.length}</span>
      </div>

      <h3 className="text-2xl font-black text-slate-900 mb-8 text-center">What does "{currentQ.word}" mean?</h3>

      <div className="space-y-4 mb-8">
        {currentQ.options.map((opt, i) => {
          const isSelected = selectedOptions[currentQIndex] === opt
          return (
            <button
              key={i}
              onClick={() => handleSelect(currentQIndex, opt)}
              className={`w-full p-5 text-left rounded-2xl border-2 transition-all font-bold ${
                isSelected 
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-900' 
                  : 'border-slate-100 hover:border-indigo-200 text-slate-600'
              }`}
            >
              {opt}
            </button>
          )
        })}
      </div>

      <div className="flex gap-4">
        {currentQIndex > 0 && (
          <Button variant="secondary" onClick={() => setCurrentQIndex(p => p - 1)}>
            Back
          </Button>
        )}
        
        {isLast ? (
          <Button 
            className="flex-1" 
            onClick={handleSubmit} 
            disabled={!canAdvance || submitting}
            isLoading={submitting}
          >
            Finish Practice
          </Button>
        ) : (
          <Button 
            className="flex-1" 
            onClick={() => setCurrentQIndex(p => p + 1)}
            disabled={!canAdvance}
          >
            Next Question
          </Button>
        )}
      </div>
    </div>
  )
}
