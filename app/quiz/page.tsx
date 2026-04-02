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
      const res = await fetch('/api/quiz', {
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

  const canCreate = user && (user.role === 'Admin' || user.role === 'Teacher')

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
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-5xl font-black text-slate-900 mb-2 tracking-tighter">Quizzes</h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest ml-1">Test your cosmic vocabulary</p>
          </div>
          {canCreate && (
            <button
              onClick={() => router.push('/quiz/create')}
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all active:scale-95 tracking-widest shadow-lg shadow-indigo-100"
            >
              + CREATE QUIZ
            </button>
          )}
        </div>

        {quizzes.length === 0 ? (
          <div className="bg-white/60 rounded-3xl p-20 text-center border border-indigo-100 shadow-xl">
            <p className="text-2xl text-slate-400 font-medium italic">
              There are no quizzes available yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white group rounded-[2.5rem] p-8 border border-indigo-50 shadow-xl hover:shadow-2xl hover:translate-y-[-4px] transition-all duration-500 cursor-pointer relative overflow-hidden"
                onClick={() => router.push(`/quiz/${quiz.id}`)}
              >
                {/* Background glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 via-purple-50/0 to-pink-50/0 group-hover:from-indigo-50/10 group-hover:via-purple-50/10 group-hover:to-pink-50/10 transition-all duration-500" />
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{quiz.title}</h2>
                  </div>
                  <div className="mb-6 flex gap-2">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-md ${
                      quiz.type === 'image-to-word' ? 'bg-indigo-600' :
                      quiz.type === 'word-to-image' ? 'bg-purple-600' :
                      'bg-pink-600'
                    }`}>
                      {quiz.type === 'image-to-word' ? 'Image→Word' :
                       quiz.type === 'word-to-image' ? 'Word→Image' : 'Fill Blank'}
                    </span>
                  </div>
                  {quiz.description && (
                    <p className="text-slate-500 font-medium mb-8 line-clamp-2 leading-relaxed text-sm">{quiz.description}</p>
                  )}
                  <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest pt-6 border-t border-indigo-50">
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-sm"></span>
                      {quiz.wordIds.length} words
                    </span>
                    <span className="flex items-center gap-2 text-indigo-600">
                      {quiz.createdBy.name || quiz.createdBy.email.split('@')[0]}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
