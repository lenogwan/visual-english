'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'

export default function PracticePage() {
  const { token } = useAuth()
  const [test, setTest] = useState<any>(null)
  const [mode, setMode] = useState<'meaning' | 'scenario' | 'spelling' | null>(null)
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)

  async function fetchTest(selectedMode: string) {
    if (!token) return
    setLoading(true)
    setMode(selectedMode as any)
    try {
      const res = await fetch(`/api/practice/test?mode=${selectedMode}`, { headers: { 'Authorization': `Bearer ${token}` } })
      const data = await res.json()
      setTest(data)
      setResult(null)
      setInputValue('')
    } finally { setLoading(false) }
  }

  const handleAnswer = async (answer: string) => {
    if (result) return
    const isCorrect = answer.trim().toLowerCase() === test.correctAnswer.trim().toLowerCase()
    setResult(isCorrect ? 'correct' : 'wrong')

    // SRS Update: Correct=5 (Easy), Wrong=1 (Again)
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ wordId: test.wordId, quality: isCorrect ? 5 : 1 })
    })
  }

  const playPronunciation = () => {
    if ('speechSynthesis' in window && test?.correctAnswer) {
      const utterance = new SpeechSynthesisUtterance(test.correctAnswer)
      utterance.lang = 'en-US'
      window.speechSynthesis.speak(utterance)
    }
  }

  if (!mode) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-black mb-12">Choose Your Arena</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        {[{m: 'meaning', l: 'Meaning Recall'}, {m: 'scenario', l: 'Scenario Match'}, {m: 'spelling', l: 'Phonetic Spelling'}].map(opt => (
          <button key={opt.m} onClick={() => fetchTest(opt.m)} className="p-10 bg-white rounded-[2.5rem] shadow-xl border border-indigo-50 hover:scale-105 transition-all">
            <h3 className="text-xl font-black text-indigo-600 mb-2">{opt.l}</h3>
          </button>
        ))}
      </div>
    </div>
  )

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black">Charging Neural Engine...</div>

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white p-12 rounded-[3rem] shadow-2xl border border-indigo-50">
        <button onClick={() => setMode(null)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 hover:text-indigo-600">← Change Mode</button>
        <p className="text-xl font-bold text-slate-400 mb-8">{test?.question}</p>
        
        {mode === 'spelling' ? (
          <div className="space-y-6">
            <button onClick={playPronunciation} className="w-full p-4 bg-indigo-50 rounded-2xl font-bold text-indigo-700 hover:bg-indigo-100">Click to Hear Word</button>
            <input 
                type="text" 
                value={inputValue} 
                onChange={e => setInputValue(e.target.value)} 
                className="w-full p-6 text-2xl font-black border-2 rounded-2xl" 
                placeholder="Type spelling..." 
                disabled={!!result}
            />
            {!result ? (
                <button onClick={() => handleAnswer(inputValue)} className="w-full p-6 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700">Submit</button>
            ) : (
                <div className={`p-6 rounded-2xl font-black text-center ${result === 'correct' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {result === 'correct' ? 'CORRECT!' : `WRONG! Answer was: ${test.correctAnswer}`}
                </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {test?.options.map((opt: string, i: number) => (
              <button
                key={i}
                onClick={() => handleAnswer(opt)}
                disabled={!!result}
                className={`p-6 text-lg font-bold rounded-2xl border-2 transition-all ${
                  result === 'correct' && opt === test.correctAnswer ? 'bg-green-100 border-green-500 text-green-700' :
                  result === 'wrong' && opt !== test.correctAnswer ? 'opacity-40' : 
                  result === 'wrong' && opt === test.correctAnswer ? 'bg-green-100 border-green-500 text-green-700' : 'bg-slate-50 border-slate-100 hover:border-indigo-300'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {result && (
          <button 
            onClick={() => fetchTest(mode)} 
            className="w-full mt-8 p-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all"
          >
            Next Word →
          </button>
        )}
      </div>
    </div>
  )
}
