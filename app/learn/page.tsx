'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import TriadCard from '@/components/TriadCard'
import ImageSearch from '@/components/ImageSearch'
import ScenarioBuilder from '@/components/ScenarioBuilder'
import WordCard from '@/components/WordCard'

interface Word {
  id: string
  word: string
  phonetic: string | null
  meaning: string | null
  examples: string[]
  images: string[]
  scenario: string | null
  scenarioImages: string[]
  exampleSentence: string | null
  emotionalConnection: string | null
  tags: string[]
}

export default function LearnPage() {
  const [words, setWords] = useState<Word[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<'card' | 'study' | 'images' | 'scenario'>('card')
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()

  async function fetchWords() {
    try {
      const res = await fetch('/api/words?limit=1000')
      const data = await res.json()
      const allWords = data.words || []
      const shuffled = [...allWords].sort(() => 0.5 - Math.random()).slice(0, 10)
      setWords(shuffled)
    } catch (error) {
      console.error('Failed to fetch words:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWords()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading words...</div>
      </div>
    )
  }

  if (words.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">No words found. Import word bank first.</div>
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Learn Words Visually</h1>
          <p className="text-gray-600">
            Word {currentIndex + 1} of {words.length}
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
            onClick={() => setActiveTab('study')}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'study'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📚 Study
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
          {activeTab === 'study' && (
            <>
              <WordCard
                word={word.word}
                phonetic={word.phonetic}
                meaning={word.meaning}
                scenario={word.scenario}
                examples={word.examples}
                images={word.images}
                tags={word.tags}
                emotionalConnection={word.emotionalConnection}
              />
              <div className="flex justify-between mt-6">
                <button
                  onClick={handlePrev}
                  className="px-6 py-3 bg-gray-200 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                >
                  ← Previous
                </button>
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                >
                  Next →
                </button>
              </div>
            </>
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

        {/* Word List */}
        <div className="mt-12 bg-white rounded-2xl p-6 shadow-md">
          <h3 className="font-bold text-gray-800 mb-4">Random pick ({words.length})</h3>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
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
