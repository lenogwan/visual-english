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
  images: string[]
  scenario: string | null
  scenarioImages: string[]
  exampleSentence: string | null
  emotionalConnection: string | null
  tags: string[]
}

function SearchContent() {
  const [words, setWords] = useState<Word[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<'card' | 'images' | 'scenario'>('card')
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, token } = useAuth()

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-indigo-400/20 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="text-xl font-bold text-slate-400 tracking-widest animate-pulse uppercase">Searching...</div>
        </div>
      </div>
    )
  }

  if (words.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-black text-slate-900 mb-8 tracking-tighter">Search Word</h1>
            <form onSubmit={handleSearch} className="max-w-md mx-auto">
              <div className="relative group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter a word..."
                  className="w-full p-6 bg-white border-2 border-indigo-100 rounded-[2rem] focus:border-indigo-400 focus:outline-none focus:ring-8 focus:ring-indigo-400/5 text-slate-900 placeholder-slate-300 transition-all text-xl font-medium pr-32 shadow-xl"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-3 bottom-3 px-8 bg-indigo-600 text-white rounded-[1.5rem] font-black text-sm hover:bg-indigo-700 transition-all active:scale-95"
                >
                  SEARCH
                </button>
              </div>
            </form>
          </div>
          <div className="bg-white/60 rounded-3xl p-12 text-center border border-indigo-100 shadow-xl">
            <p className="text-2xl text-slate-400 font-medium italic">
              No matches found for <span className="text-indigo-600">"{searchQuery}"</span>
            </p>
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
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-slate-900 mb-8 tracking-tighter">Search Results</h1>
          <form onSubmit={handleSearch} className="max-w-md mx-auto mb-6">
            <div className="relative group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search word..."
                className="w-full p-6 bg-white border-2 border-indigo-100 rounded-[2rem] focus:border-indigo-400 focus:outline-none focus:ring-8 focus:ring-indigo-400/5 text-slate-900 placeholder-slate-300 transition-all text-xl font-medium pr-32 shadow-xl"
              />
              <button
                type="submit"
                className="absolute right-3 top-3 bottom-3 px-8 bg-indigo-600 text-white rounded-[1.5rem] font-black text-sm hover:bg-indigo-700 transition-all active:scale-95"
              >
                SEARCH
              </button>
            </div>
          </form>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
             Match {currentIndex + 1} of {words.length} for <span className="text-indigo-600">"{searchQuery}"</span>
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-10 bg-white/60 rounded-[2rem] p-2 border border-indigo-100 shadow-md">
          <button
            onClick={() => setActiveTab('card')}
            className={`flex-1 py-4 rounded-[1.5rem] font-bold text-sm transition-all duration-300 ${
              activeTab === 'card'
                ? 'bg-indigo-600 text-white shadow-lg translate-y-[-2px]'
                : 'text-slate-500 hover:bg-white/50 hover:text-indigo-600'
            }`}
          >
             Triad Card
          </button>
          {user && (
            <>
              <button
                onClick={() => setActiveTab('images')}
                className={`flex-1 py-4 rounded-[1.5rem] font-bold text-sm transition-all duration-300 ${
                  activeTab === 'images'
                    ? 'bg-purple-600 text-white shadow-lg translate-y-[-2px]'
                    : 'text-slate-500 hover:bg-white/50 hover:text-purple-600'
                }`}
              >
                 Images
              </button>
              <button
                onClick={() => setActiveTab('scenario')}
                className={`flex-1 py-4 rounded-[1.5rem] font-bold text-sm transition-all duration-300 ${
                  activeTab === 'scenario'
                    ? 'bg-pink-600 text-white shadow-lg translate-y-[-2px]'
                    : 'text-slate-500 hover:bg-white/50 hover:text-pink-600'
                }`}
              >
                 Scenario
              </button>
            </>
          )}
        </div>

        {/* Content */}
        <div className="animate-fadeIn">
          {activeTab === 'card' && (
            <TriadCard word={word} onNext={handleNext} onPrev={handlePrev} />
          )}
          {activeTab === 'images' && (
            <>
              <ImageSearch word={word} />
              <div className="flex justify-between mt-10">
                <button
                  onClick={handlePrev}
                  className="px-8 py-4 bg-white/5 border border-white/10 text-indigo-100 rounded-2xl font-black text-sm hover:bg-white/10 transition-all active:scale-95 tracking-widest"
                >
                  ← PREVIOUS
                </button>
                <button
                  onClick={handleNext}
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 transition-all active:scale-95 tracking-widest"
                >
                  NEXT →
                </button>
              </div>
            </>
          )}
          {activeTab === 'scenario' && (
            <>
              <ScenarioBuilder word={word} />
              <div className="flex justify-between mt-10">
                <button
                  onClick={handlePrev}
                  className="px-8 py-4 bg-white/5 border border-white/10 text-indigo-100 rounded-2xl font-black text-sm hover:bg-white/10 transition-all active:scale-95 tracking-widest"
                >
                  ← PREVIOUS
                </button>
                <button
                  onClick={handleNext}
                  className="px-8 py-4 bg-gradient-to-r from-pink-500 to-pink-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-pink-500/20 hover:shadow-pink-500/40 transition-all active:scale-95 tracking-widest"
                >
                  NEXT →
                </button>
              </div>
            </>
          )}
        </div>

        {/* Result List */}
        <div className="mt-20 bg-white/60 rounded-[2.5rem] p-10 border border-indigo-100 shadow-xl">
          <h3 className="text-xl font-bold text-slate-900 mb-6 font-black uppercase tracking-widest">Search Results ({words.length})</h3>
          <div className="flex flex-wrap gap-3 max-h-48 overflow-y-auto custom-scrollbar p-1">
            {words.map((w, idx) => (
              <button
                key={w.id}
                onClick={() => setCurrentIndex(idx)}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                  idx === currentIndex
                    ? 'bg-indigo-600 text-white shadow-xl translate-y-[-2px]'
                    : 'bg-white border border-indigo-100 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'
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
