'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

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
  wordIds: string[]
  createdBy: { id: string; name: string | null; email: string }
  createdAt: string
}

export default function QuizListPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [entryPassword, setEntryPassword] = useState('')
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')
  const { user, token } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading])

  useEffect(() => {
    if (user) {
      fetchQuizzes()
    }
  }, [user])

  async function fetchQuizzes() {
    try {
      // Teachers only see their own quizzes here, Admins see all
      const res = await fetch('/api/quiz?creatorOnly=true', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      const data = await res.json()
      setQuizzes(data.quizzes || [])
    } catch (error) {
      console.error('Failed to fetch quizzes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (entryPassword.length !== 6) {
      setError('Please enter a valid 6-digit code.')
      return
    }

    setJoining(true)
    setError('')
    try {
      const res = await fetch('/api/quiz/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryPassword })
      })
      const data = await res.json()
      if (data.success) {
        router.push(`/quiz/${data.quizId}`)
      } else {
        setError(data.error || 'Invalid access code.')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setJoining(false)
    }
  }

  const canCreate = user && (user.role === 'Admin' || user.role === 'Teacher' || user.role === 'admin' || user.role === 'teacher')

  if (loading) {
    return (
      <div className="min-h-screen relaxed-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-indigo-400/20 border-t-indigo-400 rounded-full animate-spin"></div>
          <div className="text-xl font-black text-indigo-200 tracking-widest animate-pulse">PREPARING QUIZZES...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <h1 className="text-6xl font-black text-slate-900 mb-3 tracking-tighter leading-none">Quizzes</h1>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-[0.3em] ml-1">Test your neural mastery</p>
          </div>
          {canCreate && (
            <button
              onClick={() => router.push('/quiz/create')}
              className="px-8 py-5 bg-slate-900 text-white rounded-3xl font-black text-xs hover:bg-indigo-600 transition-all active:scale-95 tracking-[0.2em] shadow-xl shadow-slate-200 uppercase"
            >
              + Create New Quiz
            </button>
          )}
        </div>

        {/* Student Entry Section */}
        <section className="bg-white p-12 rounded-[3.5rem] border border-indigo-50 shadow-2xl shadow-indigo-500/5 mb-16 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-full -z-0 group-hover:scale-110 transition-transform" />
          
          <div className="relative z-10 max-w-lg">
            <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Enter Access Code</h3>
            <p className="text-slate-400 font-bold text-sm mb-8 uppercase tracking-widest">Received a code from your teacher?</p>
            
            <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                maxLength={6}
                value={entryPassword}
                onChange={(e) => setEntryPassword(e.target.value.replace(/\D/g, ''))}
                placeholder="6-DIGIT CODE"
                className="flex-grow px-8 py-5 bg-slate-50 border-2 border-transparent rounded-3xl font-black text-xl tracking-[0.5em] text-center focus:border-indigo-500 focus:bg-white transition-all outline-none placeholder:text-slate-200"
              />
              <button
                type="submit"
                disabled={joining || entryPassword.length !== 6}
                className="px-10 py-5 bg-indigo-600 text-white rounded-3xl font-black text-sm tracking-widest hover:bg-indigo-700 disabled:bg-slate-200 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-100 uppercase"
              >
                {joining ? 'JOINING...' : 'JOIN QUIZ'}
              </button>
            </form>
            {error && <p className="mt-4 text-red-500 font-bold text-sm ml-2 animate-bounce">⚠️ {error}</p>}
          </div>
        </section>

        {/* Admin/Teacher Quizzes List */}
        {canCreate && (
          <section>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8 ml-2">Managed Quizzes</h3>
            {quizzes.length === 0 ? (
              <div className="bg-slate-100/50 rounded-[3rem] p-16 text-center border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold italic uppercase tracking-widest text-xs">
                  You haven't created any quizzes yet.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    onClick={() => router.push(`/quiz/${quiz.id}`)}
                    className="bg-white group rounded-[3rem] p-10 border border-slate-100 shadow-xl hover:shadow-2xl hover:translate-y-[-6px] transition-all duration-500 cursor-pointer relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Entry Code: <span className="text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">{(quiz as any).entryPassword}</span></span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-200"></span>
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight mb-4">{quiz.title}</h4>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-8">{quiz.wordIds.length} Neural Patterns</p>
                    
                    <div className="flex justify-between items-center pt-8 border-t border-slate-50">
                      <div className="flex gap-2">
                         <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white text-[10px] font-black">
                           {(quiz as any).type?.[0].toUpperCase()}
                         </div>
                      </div>
                      <span className="text-indigo-600 font-bold text-xs group-hover:translate-x-2 transition-transform">Manage →</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
