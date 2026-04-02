'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter, useParams } from 'next/navigation'

interface Word {
  id: string
  word: string
  phonetic: string | null
  meaning: string | null
  images: string[]
  scenario: string | null
}

interface Quiz {
  id: string
  title: string
  description: string | null
  type: string
  words: Word[]
  createdBy: { id: string; name: string | null; email: string }
}

export default function QuizPage() {
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const { user, token } = useAuth()
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading])

  useEffect(() => {
    if (user && params.id) {
      fetchQuiz()
    }
  }, [user, params.id])

  async function fetchQuiz() {
    try {
      const res = await fetch(`/api/quiz/${params.id}`)
      const data = await res.json()
      if (data.error) {
        router.push('/quiz')
      } else {
        setQuiz(data)
      }
    } catch (error) {
      console.error('Failed to fetch quiz:', error)
      router.push('/quiz')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (answer: string) => {
    if (submitted) return
    setAnswers({ ...answers, [currentIndex]: answer })
  }

  const handleImageSelect = (idx: number) => {
    if (submitted) return
    setSelectedImage(idx)
    handleAnswer(quiz?.words[idx]?.images[0] || '')
  }

  const submitQuiz = () => {
    if (!quiz || !token) return

    const answerList = quiz.words.map((_, idx) => answers[idx] || '')
    
    fetch('/api/quiz/attempt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        quizId: quiz.id,
        answers: answerList,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setSubmitted(true)
        setResults(data)
      })
  }

  const nextQuestion = () => {
    if (quiz && currentIndex < quiz.words.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedImage(null)
    }
  }

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setSelectedImage(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen relaxed-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-indigo-400/20 border-t-indigo-400 rounded-full animate-spin"></div>
          <div className="text-xl font-black text-indigo-200 tracking-widest animate-pulse">SYNCING COSMIC DATA...</div>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen relaxed-bg flex items-center justify-center">
        <div className="glass-card p-10 rounded-3xl border border-white/10 text-center">
          <p className="text-2xl text-indigo-200 font-bold italic">Quiz lost in the nebula</p>
          <button onClick={() => router.push('/quiz')} className="mt-6 px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-sm uppercase tracking-widest">Return to Base</button>
        </div>
      </div>
    )
  }

  const currentWord = quiz.words[currentIndex]

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{quiz?.title}</h1>
          <button 
            onClick={() => router.push('/quiz')} 
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest border border-indigo-100 transition-all font-bold"
          >
            ← QUIT
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 border border-indigo-100 shadow-2xl relative overflow-hidden">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100">
            <div 
              className="h-full bg-indigo-600 transition-all duration-500"
              style={{ width: `${((currentIndex + 1) / (quiz?.words.length || 1)) * 100}%` }}
            />
          </div>

          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex justify-between items-center">
            <span>QUESTION {currentIndex + 1} OF {quiz?.words.length}</span>
            <span className="text-indigo-600">{Math.round(((currentIndex + 1) / (quiz?.words.length || 1)) * 100)}% COMPLETE</span>
          </div>

          {quiz?.type === 'image-to-word' && (
            <div className="mb-10">
              <div className="aspect-video bg-indigo-50 rounded-3xl overflow-hidden mb-8 border border-indigo-100 shadow-inner flex items-center justify-center">
                {currentWord.images[0] ? (
                  <img
                    src={currentWord.images[0]}
                    alt="Quiz"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-slate-400 font-bold italic">Visual Data Missing</div>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={answers[currentIndex] || ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  placeholder="IDENTIFY WORD..."
                  disabled={submitted}
                  className="w-full p-6 bg-slate-50 border-2 border-indigo-50 rounded-2xl focus:border-indigo-400 focus:outline-none focus:ring-8 focus:ring-indigo-400/5 text-slate-900 placeholder-slate-300 transition-all text-2xl font-black text-center tracking-widest uppercase"
                />
              </div>
            </div>
          )}

          {quiz?.type === 'word-to-image' && (
            <div className="mb-10">
              <div className="text-center mb-10">
                <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter uppercase">{currentWord.word}</h2>
                <p className="text-xl text-slate-500 font-medium tracking-wide">[{currentWord.phonetic || '...'}]</p>
              </div>
              <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Select Visual Match:</p>
              <div className="grid grid-cols-2 gap-6">
                {quiz.words.slice(0, 4).map((w, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                        setSelectedImage(idx);
                        handleAnswer(w.word);
                    }}
                    disabled={submitted}
                    className={`aspect-video rounded-3xl overflow-hidden border-4 transition-all duration-500 shadow-xl ${
                      selectedImage === idx 
                        ? 'border-indigo-500 scale-[1.02] shadow-indigo-500/20 shadow-lg' 
                        : 'border-slate-100 hover:border-indigo-200 grayscale hover:grayscale-0'
                    }`}
                  >
                    {w.images[0] ? (
                      <img src={w.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300 font-bold italic">No Image</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {quiz.type === 'fill-blank' && (
            <div className="mb-10">
              <div className="text-center mb-8">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Complete the Context:</h2>
                <div className="bg-indigo-50 rounded-3xl p-8 border border-indigo-100 mb-8">
                  <p className="text-2xl text-slate-800 font-medium leading-relaxed italic">
                      "{currentWord.scenario || currentWord.word}"
                  </p>
                </div>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={answers[currentIndex] || ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  placeholder="IDENTIFY WORD..."
                  disabled={submitted}
                  className="w-full p-6 bg-slate-50 border-2 border-indigo-50 rounded-2xl focus:border-indigo-400 focus:outline-none focus:ring-8 focus:ring-indigo-400/5 text-slate-900 placeholder-slate-300 transition-all text-2xl font-black text-center tracking-widest uppercase"
                />
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-8 border-t border-slate-100">
            <button
              onClick={prevQuestion}
              disabled={currentIndex === 0}
              className="px-8 py-4 bg-white border border-indigo-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            >
              ← BACK
            </button>
            {currentIndex < quiz.words.length - 1 ? (
              <button
                onClick={nextQuestion}
                className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
              >
                NEXT →
              </button>
            ) : (
              <button
                onClick={submitQuiz}
                disabled={submitted}
                className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                SUBMIT ATTEMPT
              </button>
            )}
          </div>
        </div>

        {submitted && results && (
          <div className="mt-10 bg-white rounded-[2.5rem] p-12 border border-indigo-100 shadow-2xl text-center relative overflow-hidden animate-fadeIn">
            <div className="relative z-10">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Simulation Complete</h2>
              <div className="relative inline-block mb-8">
                <p className="text-8xl font-black text-slate-900 relative">
                  {results.score}<span className="text-3xl text-slate-300 font-bold -ml-2">/{results.total}</span>
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 mb-10">
                 {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-2xl ${i < Math.round((results.percentage / 100) * 5) ? 'text-yellow-400' : 'text-slate-100'}`}>★</span>
                 ))}
              </div>
              <p className="text-xl text-slate-500 font-medium mb-12 italic leading-relaxed">
                "{results.percentage}% accuracy achieved in cosmic simulation."
              </p>
              <button
                onClick={() => router.push('/quiz')}
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-indigo-100"
              >
                BACK TO QUIZZES
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
