'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'

export default function PracticePage() {
  const { token } = useAuth()
  const [test, setTest] = useState<any>(null)
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function fetchTest() {
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch('/api/practice/test', { headers: { 'Authorization': `Bearer ${token}` } })
      const data = await res.json()
      setTest(data)
      setResult(null)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchTest() }, [token])

  const handleAnswer = async (answer: string) => {
    const isCorrect = answer === test.correctAnswer
    setResult(isCorrect ? 'correct' : 'wrong')

    // SRS Update: Correct=5 (Easy), Wrong=1 (Again)
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ wordId: test.wordId, quality: isCorrect ? 5 : 1 })
    })

    setTimeout(fetchTest, 1500)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black">Loading Challenge...</div>

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white p-12 rounded-[3rem] shadow-2xl border border-indigo-50">
        <h1 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-8 text-center">Active Recall Challenge</h1>
        <p className="text-6xl font-black text-slate-900 mb-12 text-center">{test?.question}</p>
        
        <div className="grid grid-cols-1 gap-4">
          {test?.options.map((opt: string, i: number) => (
            <button
              key={i}
              onClick={() => handleAnswer(opt)}
              disabled={!!result}
              className={`p-6 text-lg font-bold rounded-2xl border-2 transition-all ${
                result === 'correct' && opt === test.correctAnswer ? 'bg-green-100 border-green-500 text-green-700' :
                result === 'wrong' && opt !== test.correctAnswer ? 'opacity-50' : 'bg-slate-50 border-slate-100 hover:border-indigo-300'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
