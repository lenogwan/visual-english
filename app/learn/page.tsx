'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useSearchParams } from 'next/navigation'
import TriadCard from '@/components/TriadCard'
import ImageSearch from '@/components/ImageSearch'
import WordCard from '@/components/WordCard'
import SenseSwitcher from '@/components/SenseSwitcher'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Learn',
  description: 'Explore new English words through visual cards and interactive study modes.',
}

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
  partOfSpeech: string
  level: string
}

function LearnContent() {
  const [words, setWords] = useState<Word[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<'card' | 'study' | 'images'>('card')
  const [loading, setLoading] = useState(true)
  const [currentSense, setCurrentSense] = useState<Word | null>(null)
  const { user, token } = useAuth()
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode')
  const isFavoritesMode = mode === 'favorites'
  
  // Reset tab if in favorites mode and currently on a hidden tab
  useEffect(() => {
    if (isFavoritesMode && (activeTab === 'images')) {
      setActiveTab('card')
    }
  }, [isFavoritesMode, activeTab])

  // Parse user settings
  const userSettings = (() => {
    try {
      return user?.settings ? JSON.parse(user.settings) : {}
    } catch { return {} }
  })()
  const dailyGoal = user ? parseInt(userSettings.dailyGoal || '20') : 10
  const targetLevel = userSettings.englishLevel || ''

  async function fetchWords() {
    try {
      setLoading(true)
      let allWords: any[] = []

      if (isFavoritesMode) {
        // Fetch from favorites API
        const res = await fetch('/api/favorites', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        })
        const data = await res.json()
        allWords = (data.favorites || []).map((f: any) => f.word)
      } else {
        // Standard learning fetch
        const apiLevel = targetLevel || 'All'
        const url = `/api/words?level=${apiLevel}&limit=${dailyGoal}&excludeLearned=${user ? 'true' : 'false'}`
        const res = await fetch(url, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        })
        const data = await res.json()
        allWords = data.words || []
      }
      
      // Group by word string to ensure each word appears only once
      const uniqueWordsMap = new Map()
      allWords.forEach((item: any) => {
        if (!item.word) return // Safety check
        if (!uniqueWordsMap.has(item.word.toLowerCase())) {
          uniqueWordsMap.set(item.word.toLowerCase(), item)
        }
      })
      
      const uniqueWords = Array.from(uniqueWordsMap.values())
      
      // For favorites mode, show ALL. For standard mode, shuffle and limit to goal.
      if (isFavoritesMode) {
        setWords(uniqueWords)
      } else {
        const shuffled = [...uniqueWords].sort(() => 0.5 - Math.random()).slice(0, dailyGoal)
        setWords(shuffled)
      }
    } catch (error) {
      console.error('Failed to fetch words:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWords()
  }, [user])

  // Track progress when word changes
  useEffect(() => {
    if (!token || !words[currentIndex]) return
    
    const trackProgress = async () => {
      try {
        await fetch('/api/progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            wordId: words[currentIndex].id,
            learned: true
          })
        })
      } catch (err) {
        console.error('Failed to track progress:', err)
      }
    }

    trackProgress()
  }, [currentIndex, words, token])

  useEffect(() => {
    if (words[currentIndex]) {
      const w = words[currentIndex]
      setCurrentSense({
        ...w,
        partOfSpeech: w.partOfSpeech || 'word'
      } as Word)
    }
  }, [currentIndex, words])

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

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % words.length)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + words.length) % words.length)
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Removed for Compact Design */}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 glass-card bg-white/60 rounded-3xl p-1.5 shadow-md border border-indigo-100">
          <button
            onClick={() => setActiveTab('card')}
            className={`flex-1 py-3 rounded-[1.25rem] font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === 'card'
                ? 'bg-indigo-600 text-white shadow-lg translate-y-[-1px]'
                : 'text-slate-500 hover:bg-white/50 hover:text-indigo-600'
            }`}
          >
            <span className="text-xl">🎴</span> Triad Card
          </button>
          <button
            onClick={() => setActiveTab('study')}
            className={`flex-1 py-3 rounded-[1.25rem] font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === 'study'
                ? 'bg-purple-600 text-white shadow-lg translate-y-[-1px]'
                : 'text-slate-500 hover:bg-white/50 hover:text-purple-600'
            }`}
          >
            <span className="text-xl">📚</span> Study
          </button>
          {user && !isFavoritesMode && (
            <>
              <button
                onClick={() => setActiveTab('images')}
                className={`flex-1 py-3 rounded-[1.25rem] font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                  activeTab === 'images'
                    ? 'bg-pink-600 text-white shadow-lg translate-y-[-1px]'
                    : 'text-slate-500 hover:bg-white/50 hover:text-pink-600'
                }`}
              >
                <span className="text-xl">📸</span> Images
              </button>
            </>
          )}
        </div>

        {/* Compact Dashboard Bar: Metadata + Senses */}
        <div className="relative flex items-center justify-center mb-10 p-2 glass-card bg-white/40 rounded-full border border-indigo-50/50 min-h-[56px]">
          {/* Centered Session Context */}
          <div className="flex items-center gap-3 px-6">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-200 pr-3">
              Word {currentIndex + 1} / {words.length}
            </span>
            <span className="text-[10px] font-black text-indigo-500 tracking-wider">
              🎯 GOAL: {dailyGoal}
            </span>
            {targetLevel && !isFavoritesMode && (
              <span className="text-[10px] font-black text-purple-500 tracking-wider flex items-center gap-1">
                <span className="text-slate-300">•</span>
                <span>{targetLevel}</span>
              </span>
            )}
            {isFavoritesMode && (
              <span className="text-[10px] font-black text-pink-600 bg-pink-50 px-3 py-1 rounded-full border border-pink-100 tracking-wider flex items-center gap-1 ml-1 animate-pulse">
                💖 My Favorites
              </span>
            )}
          </div>

          {/* Right-aligned SenseSwitcher (only if multiple senses exist) */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {currentSense && (
              <SenseSwitcher 
                word={currentSense.word} 
                currentId={currentSense.id} 
                onSenseSelect={(sense: any) => setCurrentSense(sense)} 
                theme="indigo"
              />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="animate-fadeIn">
          {activeTab === 'card' && currentSense && (
            <TriadCard word={currentSense} onNext={handleNext} onPrev={handlePrev} />
          )}
          {activeTab === 'study' && currentSense && (
            <>
              <WordCard
                wordId={currentSense.id}
                word={currentSense.word}
                phonetic={currentSense.phonetic}
                meaning={currentSense.meaning}
                scenario={currentSense.scenario}
                examples={currentSense.examples}
                images={currentSense.images}
                tags={currentSense.tags}
                emotionalConnection={currentSense.emotionalConnection}
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
          {activeTab === 'images' && currentSense && (
            <>
              <ImageSearch word={currentSense} />
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

export default function LearnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-400/20 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    }>
      <LearnContent />
    </Suspense>
  )
}
