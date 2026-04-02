'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import TriadCard from '@/components/TriadCard'
import ImageSearch from '@/components/ImageSearch'
import ScenarioBuilder from '@/components/ScenarioBuilder'

interface Word {
  id: string
  word: string
  phonetic: string | null
  images: string[]
  scenario: string | null
  scenarioImages: string[]
  exampleSentence: string | null
  emotionalConnection: string | null
  tags: string[]
}

export default function SearchPage() {
  const [words, setWords] = useState<Word[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<'card' | 'images' | 'scenario'>('card')
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()
  const { token } = useAuth()

  const doSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      router.push('/learn')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/words?search=${encodeURIComponent(query)}&limit=10`)
      const data = await res.json()
      if (data.words && data.words.length > 0) {
        setWords(data.words)
        setCurrentIndex(0)
      } else {
        setWords([])
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    const query = searchParams.get('q')
    if (query) {
      setSearchQuery(query)
      doSearch(query)
    } else {
      router.push('/learn')
    }
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Searching...</div>
      </div>
    )
  }

  if (words.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Search Word</h1>
            <form onSubmit={handleSearch} className="max-w-md mx-auto">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for a word..."
                  className="flex-1 p-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  className="px-4 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
          <div className="text-center text-gray-600">
            No words found for "{searchQuery}"
          </div>
        </div>
      </div>
    )
  }

  const word = words[currentIndex]

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % words.length)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + words.length) % words.length)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Search Result</h1>
          <form onSubmit={handleSearch} className="max-w-md mx-auto mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a word..."
                className="flex-1 p-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                className="px-4 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700"
              >
                Search
              </button>
            </div>
          </form>
          <p className="text-gray-600">
            Result {currentIndex + 1} of {words.length} for "{searchQuery}"
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white rounded-2xl p-2 shadow-md">
          <button
            onClick={() => setActiveTab('card')}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'card'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            🎴 Triad Card
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'images'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📸 Images
          </button>
          <button
            onClick={() => setActiveTab('scenario')}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'scenario'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ✍️ Build Scenario
          </button>
        </div>

        {/* Content */}
        <div className="animate-fadeIn">
          {activeTab === 'card' && (
            <TriadCard word={word} onNext={handleNext} onPrev={handlePrev} />
          )}
          {activeTab === 'images' && (
            <>
              <ImageSearch word={word} />
              <div className="flex justify-between mt-6">
                <button
                  onClick={handlePrev}
                  className="px-6 py-3 bg-gray-200 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                >
                  ← Previous
                </button>
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                >
                  Next →
                </button>
              </div>
            </>
          )}
          {activeTab === 'scenario' && (
            <>
              <ScenarioBuilder word={word} />
              <div className="flex justify-between mt-6">
                <button
                  onClick={handlePrev}
                  className="px-6 py-3 bg-gray-200 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                >
                  ← Previous
                </button>
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                >
                  Next →
                </button>
              </div>
            </>
          )}
        </div>

        {/* Result List */}
        <div className="mt-12 bg-white rounded-2xl p-6 shadow-md">
          <h3 className="font-bold text-gray-800 mb-4">Results ({words.length})</h3>
          <div className="flex flex-wrap gap-2">
            {words.map((w, idx) => (
              <button
                key={w.id}
                onClick={() => setCurrentIndex(idx)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  idx === currentIndex
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {w.word}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
