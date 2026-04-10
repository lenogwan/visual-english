'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { speak } from '@/lib/speech'

export default function PracticePage() {
  const { token } = useAuth()
  const [test, setTest] = useState<any>(null)
  const [sessionCount, setSessionCount] = useState(0)
  const [sessionScore, setSessionScore] = useState(0)
  const [sessionDetails, setSessionDetails] = useState<any[]>([])
  const [mode, setMode] = useState<'meaning' | 'scenario' | 'spelling' | null>(null)
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const MAX_SESSION = 10

  async function loadNextQuestion(selectedMode: string) {
    try {
      setError(null)
      const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {}
      const res = await fetch(`/api/practice/test?mode=${selectedMode}`, { headers })
      if (!res.ok) throw new Error('Failed to fetch practice question')
      const data = await res.json()
      setTest(data)
      setResult(null)
      setInputValue('')
      return data
    } catch (err) {
      console.error('Practice load failed:', err)
      setError('Failed to load practice question. Please try again.')
      return null
    }
  }

  async function fetchTest(selectedMode: string) {
    setLoading(true)
    setError(null)
    setMode(selectedMode as any)
    setSessionCount(0)
    setSessionScore(0)
    setSessionDetails([])
    await loadNextQuestion(selectedMode)
    setLoading(false)
  }

  const handleAnswer = async (answer: string) => {
    if (result || !test?.correctAnswer) return
    const isCorrect = answer.trim().toLowerCase() === test.correctAnswer.trim().toLowerCase()
    setResult(isCorrect ? 'correct' : 'wrong')
    if (isCorrect) setSessionScore(s => s + 1)

    setSessionDetails(prev => [...prev, { word: test.correctAnswer, isCorrect, wordId: test.wordId }])
    setSessionCount(c => c + 1)

    if (token) {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ wordId: test.wordId, quality: isCorrect ? 5 : 1 })
      }).catch(err => console.error('Failed to save progress:', err))
    }
  }

  const playPronunciation = () => {
    if (test?.correctAnswer) {
      speak(test.correctAnswer)
    }
  }

  if (!mode) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
      <h1 className="text-5xl font-black text-slate-900 mb-16 tracking-tighter">Choose Your Arena</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
        {[{m: 'meaning', l: 'Meaning Recall', d: 'Connect concepts'}, 
          {m: 'scenario', l: 'Scenario Match', d: 'Apply in context'}, 
          {m: 'spelling', l: 'Phonetic Spelling', d: 'Perfect your ear'}].map(opt => (
          <button key={opt.m} onClick={() => fetchTest(opt.m)} className="p-12 bg-white rounded-[2.5rem] shadow-xl border border-indigo-50 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-2 transition-all text-left group">
            <div className="text-4xl mb-6">🎯</div>
            <h3 className="text-xl font-black text-slate-900 mb-1 tracking-tight">{opt.l}</h3>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{opt.d}</p>
          </button>
        ))}
      </div>
    </div>
  )

  if (sessionCount >= MAX_SESSION) return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 animate-fadeIn">
        <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl border border-indigo-50 max-w-2xl w-full">
            <h2 className="text-4xl font-black text-slate-900 mb-2">Session Complete!</h2>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mb-10">Accuracy: {Math.round((sessionScore / MAX_SESSION) * 100)}%</p>
            
            <div className="space-y-3 mb-10 max-h-60 overflow-y-auto">
                {sessionDetails.map((d, i) => (
                    <div key={i} className={`flex justify-between p-4 rounded-xl font-bold ${d.isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        <span>{d.word}</span>
                        <span>{d.isCorrect ? '✓' : '✗'}</span>
                    </div>
                ))}
            </div>

            <div className="flex gap-4">
                <button onClick={() => fetchTest(mode)} className="flex-1 p-5 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700">Continue Next Practice</button>
                <button onClick={() => setMode(null)} className="flex-1 p-5 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200">Return to Arena</button>
            </div>
        </div>
      </div>
  )

  if (error) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="text-6xl mb-6">⚠️</div>
      <h2 className="text-3xl font-black text-slate-900 mb-3">Practice Error</h2>
      <p className="text-lg text-slate-500 mb-8 max-w-md">{error}</p>
      <div className="flex gap-4">
        <button onClick={() => { setError(null); loadNextQuestion(mode!) }} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors">Try Again</button>
        <button onClick={() => { setMode(null); setError(null) }} className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200">Back to Arena</button>
      </div>
    </div>
  )

  if (loading || !test) return <div className="min-h-screen flex items-center justify-center font-black">Charging Neural Engine...</div>

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white p-12 rounded-[2.5rem] shadow-2xl border border-indigo-50 animate-fadeIn">
        <div className="flex justify-between items-center mb-10">
            <button onClick={() => setMode(null)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">← Quit Arena</button>
            <div className="flex-1 ml-8 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${(sessionCount / MAX_SESSION) * 100}%` }} />
            </div>
        </div>
        
        <p className="text-xl font-bold text-slate-400 mb-8">{test?.question || 'Loading question...'}</p>
        
        {mode === 'spelling' ? (
          <div className="space-y-6">
            <button onClick={playPronunciation} className="w-full p-4 bg-indigo-50 rounded-2xl font-bold text-indigo-700 hover:bg-indigo-100">Click to Hear Word</button>
            <input 
                type="text" 
                value={inputValue} 
                onChange={e => setInputValue(e.target.value)} 
                className="w-full p-6 text-2xl font-black border-2 border-slate-100 rounded-2xl focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100" 
                placeholder="Type spelling..." 
                disabled={!!result}
            />
            {!result ? (
                <button onClick={() => handleAnswer(inputValue)} className="w-full p-6 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all">Submit</button>
            ) : (
                <div className={`p-6 rounded-2xl font-black text-center ${result === 'correct' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {result === 'correct' ? 'CORRECT!' : `WRONG! Answer was: ${test?.correctAnswer || 'N/A'}`}
                </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {test?.options?.map((opt: string, i: number) => (
              <button
                key={i}
                onClick={() => handleAnswer(opt)}
                disabled={!!result}
                className={`p-6 text-lg font-bold rounded-2xl border-2 transition-all ${
                  result === 'correct' && opt === test.correctAnswer ? 'bg-green-100 border-green-500 text-green-700 shadow-lg' :
                  result === 'wrong' && opt !== test.correctAnswer ? 'opacity-40 grayscale' : 
                  result === 'wrong' && opt === test.correctAnswer ? 'bg-green-50 border-green-500 text-green-700' : 'bg-slate-50 border-slate-100 hover:border-indigo-300'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {result && (
          <button 
            onClick={() => loadNextQuestion(mode!)} 
            className="w-full mt-8 p-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all active:scale-[0.98]"
          >
            Next Word →
          </button>
        )}
      </div>
    </div>
  )
}
