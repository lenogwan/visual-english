'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRequireAuth } from '@/lib/use-require-auth'
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
  createdById: string
  createdAt: string
  entryPassword: string
  attempts: any[]
  isAuthorized: boolean
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

  useRequireAuth()

  useEffect(() => {
    if (user && params.id) fetchQuiz()
  }, [user, params.id])

  async function fetchQuiz() {
    try {
      const res = await fetch(`/api/quiz/${params.id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      const data = await res.json()
      if (data.error) router.push('/quiz')
      else setQuiz(data)
    } catch { router.push('/quiz') }
    finally { setLoading(false) }
  }

  const [submitting, setSubmitting] = useState(false)

  const handleAnswer = (a: string) => { if (!submitted) setAnswers({ ...answers, [currentIndex]: a }) }
  const nextQuestion = () => { if (quiz && currentIndex < quiz.words.length - 1) { setCurrentIndex(c => c + 1); setSelectedImage(null) } }
  const prevQuestion = () => { if (currentIndex > 0) { setCurrentIndex(c => c - 1); setSelectedImage(null) } }
  const submitQuiz = async () => {
    if (!quiz || !token || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/quiz/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ quizId: quiz.id, answers: quiz.words.map((_, i) => answers[i] || '') })
      })
      const data = await res.json()
      if (res.ok) {
        setSubmitted(true)
        setResults(data)
      }
    } catch (error) {
      console.error('Failed to submit quiz:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure?')) return
    const res = await fetch(`/api/quiz?id=${quiz?.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token || ''}` } })
    if (res.ok) router.push('/quiz')
  }

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>
  if (!quiz) return null

  const isCreator = user && (user.id === quiz.createdBy.id || user.role?.toLowerCase() === 'admin')
  const currentWord = quiz.words[currentIndex]
  const attempts = quiz.attempts || []
  const avgScore = attempts.length > 0 ? (attempts.reduce((a, c) => a + c.score, 0) / attempts.length).toFixed(1) : 0

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{quiz.title}</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Quiz Engine • Code: {quiz.entryPassword}</p>
          </div>
          <div className="flex gap-2">
            {isCreator && (
              <>
                <button onClick={() => router.push(`/quiz/edit/${quiz.id}`)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all">Edit</button>
                <button onClick={handleDelete} className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all">Delete</button>
              </>
            )}
            <button onClick={() => router.push('/quiz')} className="px-4 py-2 bg-white border border-indigo-100 rounded-xl text-xs font-black uppercase tracking-widest">Quit</button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Main Card */}
          <div className="bg-white rounded-[2.5rem] p-10 border border-indigo-100 shadow-2xl relative mb-12">
            {submitted ? (
              <div className="text-center">
                <div className="text-6xl mb-6">🎉</div>
                <h2 className="text-3xl font-black text-slate-900 mb-4">Quiz Completed!</h2>
                <p className="text-2xl font-black text-indigo-600 mb-2">
                  Score: {results?.score || 0} / {results?.total || quiz.words.length}
                </p>
                <p className="text-slate-500 mb-8">
                  Accuracy: {results?.total ? Math.round((results.score / results.total) * 100) : 0}%
                </p>
                <button
                  onClick={() => router.push('/quiz')}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700"
                >
                  Back to Quizzes
                </button>
              </div>
            ) : (
              <>
                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                    <span>Question {currentIndex + 1} of {quiz.words.length}</span>
                    <span>{Object.keys(answers).length} Answered</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-300"
                      style={{ width: `${((currentIndex + 1) / quiz.words.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Word Display */}
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-black text-slate-900 mb-2">{currentWord.word}</h2>
                  {currentWord.phonetic && (
                    <p className="text-slate-500 font-bold">{currentWord.phonetic}</p>
                  )}
                  {currentWord.meaning && (
                    <p className="text-slate-600 mt-4">{currentWord.meaning}</p>
                  )}
                </div>

                {/* Image Display */}
                {currentWord.images && currentWord.images.length > 0 && (
                  <div className="mb-8">
                    <div className="aspect-video rounded-2xl overflow-hidden bg-slate-100">
                      <img
                        src={currentWord.images[selectedImage ?? 0]}
                        alt={currentWord.word}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {currentWord.images.length > 1 && (
                      <div className="flex gap-2 mt-4 justify-center">
                        {currentWord.images.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedImage(idx)}
                            className={`w-3 h-3 rounded-full transition-all ${
                              (selectedImage ?? 0) === idx ? 'bg-indigo-600' : 'bg-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Answer Options (Multiple Choice Example) */}
                {quiz.type === 'MultipleChoice' && (
                  <div className="grid gap-4 mb-8">
                    {['Option A', 'Option B', 'Option C', 'Option D'].map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(option)}
                        className={`p-4 rounded-2xl border-2 font-bold transition-all ${
                          answers[currentIndex] === option
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                            : 'border-slate-100 hover:border-indigo-300'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                {/* Navigation */}
                <div className="flex gap-4">
                  <button
                    onClick={prevQuestion}
                    disabled={currentIndex === 0}
                    className="flex-1 p-4 bg-slate-100 text-slate-600 rounded-2xl font-black disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Previous
                  </button>
                  {currentIndex < quiz.words.length - 1 ? (
                    <button
                      onClick={nextQuestion}
                      className="flex-1 p-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700"
                    >
                      Next →
                    </button>
                  ) : (
                    <button
                      onClick={submitQuiz}
                      disabled={submitting || Object.keys(answers).length === 0}
                      className="flex-1 p-4 bg-slate-900 text-white rounded-2xl font-black disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
