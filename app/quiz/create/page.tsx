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
  tags: string[]
  level: string
}

export default function CreateQuizPage() {
  const [words, setWords] = useState<Word[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [quizType, setQuizType] = useState('image-to-word')
  const [selectedWords, setSelectedWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const { user, token } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (user && user.role === 'User') {
      router.push('/')
    }
  }, [user, loading])

  useEffect(() => {
    fetchWords()
  }, [])

  async function fetchWords() {
    try {
      const res = await fetch('/api/words?limit=5000')
      const data = await res.json()
      setWords(data.words || [])
    } catch (error) {
      console.error('Failed to fetch words:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredWords = words.filter((w) => {
    const matchesSearch = w.word.toLowerCase().includes(search.toLowerCase())
    const matchesLevel = !levelFilter || w.level === levelFilter
    return matchesSearch && matchesLevel
  })

  const toggleWord = (word: Word) => {
    if (selectedWords.find((w) => w.id === word.id)) {
      setSelectedWords(selectedWords.filter((w) => w.id !== word.id))
    } else {
      setSelectedWords([...selectedWords, word])
    }
  }

  async function createQuiz() {
    if (!title.trim() || !selectedWords.length || !token) return

    setSaving(true)
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          type: quizType,
          wordIds: selectedWords.map((w) => w.id),
        }),
      })

      if (res.ok) {
        router.push('/quiz')
      } else {
        alert('Failed to create quiz')
      }
    } catch (error) {
      console.error('Failed to create quiz:', error)
      alert('Failed to create quiz')
    } finally {
      setSaving(false)
    }
  }

  const levels = [...new Set(words.map((w) => w.level).filter(Boolean))]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Create Quiz</h1>
          <button
            onClick={() => router.push('/quiz')}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Back
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Quiz title"
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Type *</label>
              <select
                value={quizType}
                onChange={(e) => setQuizType(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="image-to-word">Image → Word (see image, type word)</option>
                <option value="word-to-image">Word → Image (see word, pick image)</option>
                <option value="fill-blank">Fill in the Blanks</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Select Words ({selectedWords.length})</h2>
          </div>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Search words..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 p-2 border rounded-lg"
            />
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="p-2 border rounded-lg"
            >
              <option value="">All Levels</option>
              {levels.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
            {filteredWords.map((word) => (
              <button
                key={word.id}
                onClick={() => toggleWord(word)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  selectedWords.find((w) => w.id === word.id)
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {word.word}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={createQuiz}
          disabled={saving || !title.trim() || !selectedWords.length}
          className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
        >
          {saving ? 'Creating...' : 'Create Quiz'}
        </button>
      </div>
    </div>
  )
}
