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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Quiz not found</div>
      </div>
    )
  }

  const currentWord = quiz.words[currentIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{quiz.title}</h1>
          <button onClick={() => router.push('/quiz')} className="text-gray-600">
            ← Quit
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md">
          <div className="text-sm text-gray-500 mb-4">
            Question {currentIndex + 1} of {quiz.words.length}
          </div>

          {quiz.type === 'image-to-word' && (
            <div className="mb-6">
              <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden mb-4 flex items-center justify-center">
                {currentWord.images[0] ? (
                  <img
                    src={currentWord.images[0]}
                    alt="Quiz"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400">No image available</div>
                )}
              </div>
              <input
                type="text"
                value={answers[currentIndex] || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder="Type the word..."
                disabled={submitted}
                className="w-full p-3 border rounded-xl text-lg text-center"
              />
            </div>
          )}

          {quiz.type === 'word-to-image' && (
            <div className="mb-6">
              <div className="text-center mb-4">
                <h2 className="text-3xl font-bold text-gray-800">{currentWord.word}</h2>
                <p className="text-gray-500">{currentWord.phonetic}</p>
              </div>
              <p className="text-center text-gray-600 mb-4">Select the correct image:</p>
              <div className="grid grid-cols-2 gap-4">
                {quiz.words.slice(0, 4).map((w, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(w.word)}
                    disabled={submitted}
                    className={`aspect-video rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === idx ? 'border-purple-500' : 'border-transparent'
                    }`}
                  >
                    {w.images[0] ? (
                      <img src={w.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">No image</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {quiz.type === 'fill-blank' && (
            <div className="mb-6">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Translate or fill in:</h2>
                <p className="text-lg text-gray-600">{currentWord.scenario || currentWord.word}</p>
              </div>
              <input
                type="text"
                value={answers[currentIndex] || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder="Type your answer..."
                disabled={submitted}
                className="w-full p-3 border rounded-xl text-lg text-center"
              />
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={prevQuestion}
              disabled={currentIndex === 0}
              className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
            >
              ← Previous
            </button>
            {currentIndex < quiz.words.length - 1 ? (
              <button
                onClick={nextQuestion}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={submitQuiz}
                disabled={submitted}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium"
              >
                Submit Quiz
              </button>
            )}
          </div>
        </div>

        {submitted && results && (
          <div className="mt-6 bg-white rounded-2xl p-6 shadow-md text-center">
            <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
            <p className="text-4xl font-bold text-purple-600 mb-2">
              {results.score}/{results.total}
            </p>
            <p className="text-gray-600 mb-4">{results.percentage}% correct</p>
            <button
              onClick={() => router.push('/quiz')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg"
            >
              Back to Quizzes
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
