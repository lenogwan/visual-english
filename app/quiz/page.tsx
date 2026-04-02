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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Quizzes</h1>
          {canCreate && (
            <button
              onClick={() => router.push('/quiz/create')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
            >
              + Create Quiz
            </button>
          )}
        </div>

        {quizzes.length === 0 ? (
          <div className="text-center text-gray-600 py-12">
            No quizzes available yet.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/quiz/${quiz.id}`)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-bold text-gray-800">{quiz.title}</h2>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    quiz.type === 'image-to-word' ? 'bg-orange-100 text-orange-700' :
                    quiz.type === 'word-to-image' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {quiz.type === 'image-to-word' ? 'Image→Word' :
                     quiz.type === 'word-to-image' ? 'Word→Image' : 'Fill Blank'}
                  </span>
                </div>
                {quiz.description && (
                  <p className="text-gray-600 mb-3">{quiz.description}</p>
                )}
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{quiz.wordIds.length} words</span>
                  <span>By {quiz.createdBy.name || quiz.createdBy.email}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
