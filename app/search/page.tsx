'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import TriadCard from '@/components/TriadCard'
import ImageSearch from '@/components/ImageSearch'
import ScenarioBuilder from '@/components/ScenarioBuilder'

interface Word {
  id: string
  word: string
  phonetic: string | null
  partOfSpeech: string // Matches TriadCard expectation
  meaning: string | null
  images: string[]
  scenario: string | null
  scenarioImages: string[]
  exampleSentence: string | null
  emotionalConnection: string | null
  tags: string[]
  level: string
}

function SearchContent() {
  const [words, setWords] = useState<Word[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<'card' | 'images' | 'scenario'>('card')
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()

  const doSearch = useCallback(async (query: string) => {
    if (!query.trim()) return
    setLoading(true)
    setHasSearched(true)
    try {
      const res = await fetch(`/api/words?search=${encodeURIComponent(query)}&limit=10`)
      const data = await res.json()
      if (data.words && data.words.length > 0) {
        // Normalize words data to match UI expectations
        const normalizedWords = data.words.map((w: any) => ({
          ...w,
          partOfSpeech: Array.isArray(w.partOfSpeech) ? (w.partOfSpeech[0] || 'word') : (w.partOfSpeech || 'word')
        }))
        setWords(normalizedWords)
        setCurrentIndex(0)
      } else {
        setWords([])
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const query = searchParams.get('q')
    if (query) {
      setSearchQuery(query)
      doSearch(query)
    }
  }, [searchParams, doSearch])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-2xl animate-spin"></div>
          <div className="text-xl font-black text-slate-300 tracking-[0.2em] uppercase animate-pulse">Searching...</div>
        </div>
      </div>
    )
  }

  // Initial State: No search yet
  if (!hasSearched) {
    return (
      <div className="min-h-[80vh] bg-slate-50 flex items-center justify-center px-6">
        <div className="max-w-xl w-full text-center">
          <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl shadow-indigo-100 flex items-center justify-center mx-auto mb-10 border border-indigo-50">
            <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Search Visual English</h1>
          <p className="text-slate-500 font-medium mb-10">Enter any word to see its visual representation, meaning, and scenario.</p>
          
          <form onSubmit={handleSearch} className="relative group">
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What word are you looking for?"
              className="w-full p-6 bg-white border-2 border-indigo-100 rounded-[2rem] focus:border-indigo-400 focus:outline-none focus:ring-8 focus:ring-indigo-400/5 text-slate-900 placeholder-slate-300 transition-all text-xl font-bold pr-36 shadow-2xl shadow-indigo-100/50"
            />
            <button
              type="submit"
              className="absolute right-3 top-3 bottom-3 px-8 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-[1.5rem] font-black text-xs tracking-widest hover:scale-105 transition-all active:scale-95 shadow-lg shadow-indigo-200"
            >
              SEARCH
            </button>
          </form>
        </div>
      </div>
    )
  }

  // No Results State
  if (words.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-black text-slate-900 mb-8 tracking-tighter">No Matches</h1>
            <form onSubmit={handleSearch} className="max-w-md mx-auto">
              <div className="relative group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Try another word..."
                  className="w-full p-6 bg-white border-2 border-indigo-100 rounded-[2rem] focus:border-indigo-400 focus:outline-none focus:ring-8 focus:ring-indigo-400/5 text-slate-900 placeholder-slate-300 transition-all text-xl font-bold pr-32 shadow-xl"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-3 bottom-3 px-8 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs tracking-widest hover:bg-indigo-700 transition-all active:scale-95"
                >
                  SEARCH
                </button>
              </div>
            </form>
          </div>
          <div className="bg-white rounded-[3rem] p-16 text-center border-2 border-dashed border-indigo-100 shadow-xl">
            <div className="text-6xl mb-6">🏜️</div>
            <p className="text-2xl text-slate-400 font-bold tracking-tight">
              We couldn't find <span className="text-indigo-600">"{searchQuery}"</span> in our database.
            </p>
            <p className="mt-4 text-slate-400">Try searching for common nouns, verbs or adjectives.</p>
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
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Search Header */}
        <div className="mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 w-full">
            <form onSubmit={handleSearch} className="relative group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search word..."
                className="w-full p-5 bg-white border-2 border-indigo-100 rounded-3xl focus:border-indigo-400 focus:outline-none focus:ring-8 focus:ring-indigo-400/5 text-slate-900 placeholder-slate-300 transition-all text-lg font-bold pr-32 shadow-lg"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 px-6 bg-indigo-600 text-white rounded-2xl font-black text-[10px] tracking-widest hover:bg-indigo-700 transition-all active:scale-95"
              >
                SEARCH
              </button>
            </form>
          </div>
          <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-3xl border border-indigo-50 shadow-sm">
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] leading-none mb-1">Results</p>
                <p className="text-sm font-black text-indigo-600 leading-none">{currentIndex + 1} <span className="text-slate-300 mx-0.5">/</span> {words.length}</p>
             </div>
             <div className="w-px h-8 bg-slate-100" />
             <div className="flex gap-1.5">
                <button onClick={handlePrev} className="p-2 bg-slate-50 rounded-xl hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={handleNext} className="p-2 bg-slate-50 rounded-xl hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </button>
             </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white/80 backdrop-blur-md rounded-3xl p-2 border border-indigo-50 shadow-xl overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('card')}
            className={`flex-1 min-w-[120px] py-4 rounded-2xl font-black text-[11px] tracking-widest uppercase transition-all duration-300 ${
              activeTab === 'card'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-[1.02]'
                : 'text-slate-400 hover:bg-slate-50 hover:text-indigo-600'
            }`}
          >
             Triad Card
          </button>
          {user && (
            <>
              <button
                onClick={() => setActiveTab('images')}
                className={`flex-1 min-w-[120px] py-4 rounded-2xl font-black text-[11px] tracking-widest uppercase transition-all duration-300 ${
                  activeTab === 'images'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 scale-[1.02]'
                    : 'text-slate-400 hover:bg-slate-50 hover:text-purple-600'
                }`}
              >
                 Images
              </button>
              <button
                onClick={() => setActiveTab('scenario')}
                className={`flex-1 min-w-[120px] py-4 rounded-2xl font-black text-[11px] tracking-widest uppercase transition-all duration-300 ${
                  activeTab === 'scenario'
                    ? 'bg-pink-600 text-white shadow-lg shadow-pink-200 scale-[1.02]'
                    : 'text-slate-400 hover:bg-slate-50 hover:text-pink-600'
                }`}
              >
                 Scenario
              </button>
            </>
          )}
        </div>

        {/* Content Area */}
        <div className="transition-all duration-500">
          {activeTab === 'card' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <TriadCard word={word} onNext={handleNext} onPrev={handlePrev} />
            </div>
          )}
          {activeTab === 'images' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ImageSearch word={word} />
            </div>
          )}
          {activeTab === 'scenario' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ScenarioBuilder word={word} />
            </div>
          )}
        </div>

        {/* Quick List Footer */}
        {words.length > 1 && (
          <div className="mt-16 bg-white/60 backdrop-blur-sm rounded-[2.5rem] p-10 border border-indigo-50 shadow-xl">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Related Results</h3>
            <div className="flex flex-wrap gap-3 max-h-48 overflow-y-auto custom-scrollbar p-1">
              {words.map((w, idx) => (
                <button
                  key={w.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 ${
                    idx === currentIndex
                      ? 'bg-indigo-600 text-white shadow-xl scale-105'
                      : 'bg-white border border-indigo-50 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  {w.word}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-indigo-400/20 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="text-xl font-bold text-slate-400 tracking-widest animate-pulse uppercase">Initializing Search...</div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
