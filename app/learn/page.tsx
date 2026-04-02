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
  const { user, token } = useAuth()

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading words...</div>
      </div>
    )
  }

  if (words.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">
            Learn Words Visually
          </h1>
          <div className="inline-block px-4 py-1.5 glass-card bg-white/80 rounded-full border border-indigo-100">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              Word {currentIndex + 1} of {words.length}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-10 glass-card bg-white/60 rounded-[2rem] p-2 shadow-md border border-indigo-100">
          <button
            onClick={() => setActiveTab('card')}
            className={`flex-1 py-4 rounded-[1.5rem] font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === 'card'
                ? 'bg-indigo-600 text-white shadow-lg translate-y-[-2px]'
                : 'text-slate-500 hover:bg-white/50 hover:text-indigo-600'
            }`}
          >
            <span className="text-xl">🎴</span> Triad Card
          </button>
          <button
            onClick={() => setActiveTab('study')}
            className={`flex-1 py-4 rounded-[1.5rem] font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === 'study'
                ? 'bg-purple-600 text-white shadow-lg translate-y-[-2px]'
                : 'text-slate-500 hover:bg-white/50 hover:text-purple-600'
            }`}
          >
            <span className="text-xl">📚</span> Study
          </button>
          {user && (
            <>
              <button
                onClick={() => setActiveTab('images')}
                className={`flex-1 py-4 rounded-[1.5rem] font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                  activeTab === 'images'
                    ? 'bg-pink-600 text-white shadow-lg translate-y-[-2px]'
                    : 'text-slate-500 hover:bg-white/50 hover:text-pink-600'
                }`}
              >
                <span className="text-xl">📸</span> Images
              </button>
              <button
                onClick={() => setActiveTab('scenario')}
                className={`flex-1 py-4 rounded-[1.5rem] font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                  activeTab === 'scenario'
                    ? 'bg-blue-600 text-white shadow-lg translate-y-[-2px]'
                    : 'text-slate-500 hover:bg-white/50 hover:text-blue-600'
                }`}
              >
                <span className="text-xl">✍️</span> Scenario
              </button>
            </>
          )}
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
        <div className="mt-16 glass-card bg-white/80 rounded-3xl p-8 shadow-xl border border-indigo-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">Quick Select</h3>
            <span className="text-slate-500 font-medium text-sm">{words.length} words available</span>
          </div>
          <div className="flex flex-wrap gap-3 max-h-48 overflow-y-auto custom-scrollbar p-1">
            {words.map((w, idx) => (
              <button
                key={w.id}
                onClick={() => setCurrentIndex(idx)}
                className={`px-5 py-2 rounded-xl font-bold text-sm transition-all duration-300 ${
                  idx === currentIndex
                    ? 'bg-indigo-600 text-white shadow-lg scale-105'
                    : 'bg-white border text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 border-indigo-100'
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
