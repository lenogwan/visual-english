'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useSearchParams } from 'next/navigation'
import TriadCard from '@/components/TriadCard'
import ImageSearch from '@/components/ImageSearch'
import WordCard from '@/components/WordCard'
import SenseSwitcher from '@/components/SenseSwitcher'
import SRSController from '@/components/SRSController'

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
    try { return user?.settings ? JSON.parse(user.settings) : {} } catch { return {} }
  })()
  const dailyGoal = user ? parseInt(userSettings.dailyGoal || '20') : 10
  const targetLevel = userSettings.englishLevel || ''

  async function fetchWords() {
    try {
      setLoading(true)
      const url = isFavoritesMode ? '/api/favorites' : `/api/words?level=${targetLevel || 'All'}&limit=${dailyGoal}&excludeLearned=${user ? 'true' : 'false'}`
      const res = await fetch(url, { headers: token ? { 'Authorization': `Bearer ${token}` } : {} })
      const data = await res.json()
      
      const allWords = isFavoritesMode ? (data.favorites || []).map((f: any) => f.word) : (data.words || [])
      
      const uniqueWordsMap = new Map()
      const sortedAllWords = [...allWords].sort((a, b) => {
        if (targetLevel) {
          if (a.level === targetLevel && b.level !== targetLevel) return -1
          if (a.level !== targetLevel && b.level === targetLevel) return 1
        }
        return 0
      })

      sortedAllWords.forEach((item: any) => {
        if (!item.word) return
        const key = item.word.toLowerCase()
        if (!uniqueWordsMap.has(key)) {
          uniqueWordsMap.set(key, item)
        }
      })

      const uniqueWords = Array.from(uniqueWordsMap.values())
      setWords(isFavoritesMode ? uniqueWords : [...uniqueWords].sort(() => 0.5 - Math.random()).slice(0, dailyGoal))
    } catch (error) {
      console.error('Failed to fetch words:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchWords() }, [user])

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
        partOfSpeech: Array.isArray(w.partOfSpeech) ? (w.partOfSpeech[0] || 'word') : (w.partOfSpeech || 'word')
      } as Word)
    }
  }, [currentIndex, words])

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % words.length)
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + words.length) % words.length)

  const handleGrade = async (quality: number) => {
    if (!token || !currentSense) return
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ wordId: currentSense.id, quality })
      })
      handleNext()
    } catch (err) { console.error('Failed to update progress:', err) }
  }

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>
  if (words.length === 0) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 font-bold">No words found.</div>

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-2 mb-6 glass-card bg-white/60 rounded-3xl p-1.5 shadow-md border border-indigo-100">
          {['card', 'study', 'images'].map((tab) => (
             <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 py-3 rounded-[1.25rem] font-bold text-sm transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white/50'}`}>
               {tab.toUpperCase()}
             </button>
          ))}
        </div>

        <div className="relative flex items-center justify-center mb-10 p-2 glass-card bg-white/40 rounded-full border border-indigo-50/50 min-h-[56px]">
          <div className="flex items-center gap-3 px-6">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-200 pr-3">Word {currentIndex + 1} / {words.length}</span>
            <span className="text-[10px] font-black text-indigo-500 tracking-wider">🎯 GOAL: {dailyGoal}</span>
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {currentSense && <SenseSwitcher word={currentSense.word} currentId={currentSense.id} onSenseSelect={(sense: any) => setCurrentSense({ ...sense, partOfSpeech: Array.isArray(sense.partOfSpeech) ? (sense.partOfSpeech[0] || 'word') : (sense.partOfSpeech || 'word') })} theme="indigo" />}
          </div>
        </div>

        {currentSense && (
          <div className="animate-fadeIn">
            {activeTab === 'card' && <TriadCard word={currentSense} onNext={handleNext} onPrev={handlePrev} />}
            {activeTab === 'study' && (
              <div className="w-full">
                <WordCard {...currentSense} />
                <div className="mt-8">
                  <SRSController wordId={currentSense.id} onGrade={handleGrade} />
                </div>
                <div className="flex justify-between mt-8 px-6">
                  <button onClick={handlePrev} className="px-8 py-4 bg-white/50 backdrop-blur-md text-slate-500 rounded-[2rem] font-black text-[10px] tracking-widest hover:bg-white hover:text-slate-800 transition-all border border-slate-200/50 shadow-sm uppercase flex items-center gap-2">← Prev</button>
                  <button onClick={handleNext} className="px-8 py-4 bg-indigo-600 text-white rounded-[2rem] font-black text-[10px] tracking-widest hover:bg-indigo-500 hover:shadow-2xl transition-all shadow-xl uppercase flex items-center gap-2">Next →</button>
                </div>
              </div>
            )}
            {activeTab === 'images' && <ImageSearch word={currentSense} />}
          </div>
        )}
      </div>
    </div>
  )
}

export default function LearnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-16 h-16 border-4 border-indigo-400/20 border-t-indigo-600 rounded-full animate-spin"></div></div>
    }>
      <LearnContent />
    </Suspense>
  )
}
