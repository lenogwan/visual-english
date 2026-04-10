'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import TriadCard from '@/components/TriadCard'
import WordCard from '@/components/WordCard'
import SenseSwitcher from '@/components/SenseSwitcher'
import Link from 'next/link'
import { useDebounce } from '@/hooks/use-debounce'

interface Word {
  id: string
  word: string
  phonetic: string | null
  partOfSpeech: string
  meaning: string | null
  examples: string[]
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
  const [activeTab, setActiveTab] = useState<'card' | 'study'>('card')
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [isSuggestion, setIsSuggestion] = useState(false)
  const [currentSense, setCurrentSense] = useState<Word | null>(null)
  const [error, setError] = useState<string | null>(null)

  const debouncedQuery = useDebounce(searchQuery, 300)

  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()

  const handleSenseSelect = (sense: any) => {
    setCurrentSense({
      ...sense,
      partOfSpeech: Array.isArray(sense.partOfSpeech) ? (sense.partOfSpeech[0] || 'word') : (sense.partOfSpeech || 'word')
    } as Word)
  }

  const doSearch = useCallback(async (query: string) => {
    if (!query.trim()) return
    setLoading(true)
    setHasSearched(true)
    try {
      const res = await fetch(`/api/words?search=${encodeURIComponent(query)}&limit=20`)
      const data = await res.json()
      setIsSuggestion(data.isSuggestion || false)
      
      if (data.words && data.words.length > 0) {
        const userSettings = (() => {
          try {
            return user?.settings ? JSON.parse(user.settings) : {}
          } catch { return {} }
        })()
        const targetLevel = userSettings.englishLevel || ''

        const sortedResults = [...data.words].sort((a, b) => {
          if (targetLevel) {
            if (a.level === targetLevel && b.level !== targetLevel) return -1
            if (a.level !== targetLevel && b.level === targetLevel) return 1
          }
          return 0
        })

        const uniqueWordsMap = new Map()
        sortedResults.forEach((w: any) => {
          const key = w.word.toLowerCase()
          if (!uniqueWordsMap.has(key)) {
            uniqueWordsMap.set(key, {
              ...w,
              partOfSpeech: Array.isArray(w.partOfSpeech) ? (w.partOfSpeech[0] || 'word') : (w.partOfSpeech || 'word')
            })
          }
        })

        const normalizedWords = Array.from(uniqueWordsMap.values())
        setWords(normalizedWords as Word[])
        setCurrentIndex(0)
        setCurrentSense(normalizedWords[0] as Word)
        setActiveTab('card')
      } else {
        setWords([])
        setCurrentSense(null)
      }
    } catch (error) {
      console.error('Search failed:', error)
      setError('Search failed. Please check your connection and try again.')
      setWords([])
      setCurrentSense(null)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (debouncedQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(debouncedQuery.trim())}`)
    }
  }, [debouncedQuery, router])

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

  if (!hasSearched) {
    return (
      <div className="min-h-[80vh] bg-slate-50 flex items-center justify-center px-6 text-center">
        <div className="max-w-xl w-full">
          <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-xl shadow-indigo-100 flex items-center justify-center mx-auto mb-10 border border-indigo-50">
            <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Word Search</h1>
          <form onSubmit={handleSearch} className="relative group">
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search visual english..."
              className="w-full p-6 bg-white border-2 border-indigo-100 rounded-[2.5rem] focus:border-indigo-400 focus:outline-none text-xl font-bold pr-36 shadow-2xl"
            />
            <button type="submit" className="absolute right-3 top-3 bottom-3 px-8 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs hover:bg-indigo-700 transition-all">SEARCH</button>
          </form>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="text-6xl mb-6">⚠️</div>
        <h2 className="text-3xl font-black text-slate-900 mb-3">Search Error</h2>
        <p className="text-lg text-slate-500 mb-8 max-w-md">{error}</p>
        <button onClick={() => { setError(null); doSearch(searchQuery) }} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors">Try Again</button>
      </div>
    )
  }

  if (words.length === 0 || !currentSense) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-black text-slate-900 mb-12 tracking-tighter">No Matches</h1>
          <div className="bg-white rounded-[3rem] p-16 border-2 border-dashed border-indigo-100 shadow-sm">
            <p className="text-2xl text-slate-400 font-bold mb-8">Nothing found for "{searchQuery}".</p>
            <Link href="/learn" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all">Back to Learn</Link>
          </div>
        </div>
      </div>
    )
  }

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % words.length;
    setCurrentIndex(nextIdx);
    setCurrentSense(words[nextIdx]);
  }

  const handlePrev = () => {
    const prevIdx = (currentIndex - 1 + words.length) % words.length;
    setCurrentIndex(prevIdx);
    setCurrentSense(words[prevIdx]);
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6" id="search-page-container">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 w-full">
            <form onSubmit={handleSearch} className="relative mb-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full p-5 bg-white border-2 border-indigo-100 rounded-3xl focus:border-indigo-400 focus:outline-none text-lg font-bold pr-32 shadow-lg"
              />
              <button type="submit" className="absolute right-2 top-2 bottom-2 px-6 bg-indigo-600 text-white rounded-2xl font-black text-[10px] tracking-widest hover:bg-indigo-700 transition-all">SEARCH</button>
            </form>
            {isSuggestion && <p className="px-4 text-[11px] font-bold text-slate-400 italic">Showing alphabetical suggestions:</p>}
          </div>
          
          <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-3xl border border-indigo-50 shadow-sm relative min-h-[64px]">
             <div className="text-right border-r border-slate-100 pr-4 mr-2">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] leading-none mb-1">{isSuggestion ? 'Suggestions' : 'Results'}</p>
                <p className="text-sm font-black text-indigo-600 leading-none">{currentIndex + 1} / {words.length}</p>
             </div>
             
             <div className="mr-2">
                <SenseSwitcher 
                  word={currentSense.word}
                  currentId={currentSense.id}
                  onSenseSelect={handleSenseSelect}
                  theme="indigo"
                />
             </div>

             <div className="flex gap-1.5 ml-auto">
                <button onClick={handlePrev} className="p-2 bg-slate-50 rounded-xl hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg></button>
                <button onClick={handleNext} className="p-2 bg-slate-50 rounded-xl hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg></button>
             </div>
          </div>
        </div>

        <div className="flex gap-2 mb-10 bg-indigo-50/50 rounded-[2.5rem] p-2 border border-indigo-100 max-w-sm mx-auto shadow-inner">
          <button 
            onClick={() => setActiveTab('card')}
            className={`flex-1 py-4 rounded-[2.5rem] font-black text-[11px] tracking-widest uppercase text-center transition-all ${
              activeTab === 'card' ? 'bg-indigo-600 text-white shadow-lg' : 'text-indigo-400 hover:text-indigo-600'
            }`}
          >
             Triad Card
          </button>
          <button 
            onClick={() => setActiveTab('study')}
            className={`flex-1 py-4 rounded-[2.5rem] font-black text-[11px] tracking-widest uppercase text-center transition-all ${
              activeTab === 'study' ? 'bg-indigo-600 text-white shadow-lg' : 'text-indigo-400 hover:text-indigo-600'
            }`}
          >
             Study
          </button>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'card' ? (
            <TriadCard word={currentSense} onNext={handleNext} onPrev={handlePrev} />
          ) : (
            <div className="w-full">
              <WordCard
                id={currentSense.id}
                word={currentSense.word}
                phonetic={currentSense.phonetic}
                meaning={currentSense.meaning}
                scenario={currentSense.scenario}
                examples={currentSense.examples}
                images={currentSense.images}
                tags={currentSense.tags}
                partOfSpeech={currentSense.partOfSpeech}
                emotionalConnection={currentSense.emotionalConnection}
              />
              <div className="flex justify-between mt-6 px-6">
                <button onClick={handlePrev} className="px-8 py-4 bg-white/50 backdrop-blur-md text-slate-500 rounded-[2.5rem] font-black text-[10px] tracking-widest hover:bg-white hover:text-slate-800 transition-all border border-slate-200/50 shadow-sm uppercase flex items-center gap-2">← Prev</button>
                <button onClick={handleNext} className="px-8 py-4 bg-indigo-600 text-white rounded-[2.5rem] font-black text-[10px] tracking-widest hover:bg-indigo-500 hover:shadow-2xl transition-all shadow-xl uppercase flex items-center gap-2">Next →</button>
              </div>
            </div>
          )}
        </div>

        {words.length > 1 && (
          <div className="mt-16 bg-white/60 rounded-[2.5rem] p-10 border border-indigo-50 shadow-xl text-center">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">
              {isSuggestion ? 'Browse dictionary' : 'Related Results'}
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {words.map((w, idx) => (
                <button
                  key={w.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setCurrentSense(w);
                  }}
                  className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all ${w.word.toLowerCase() === currentSense.word.toLowerCase() ? 'bg-indigo-600 text-white shadow-xl scale-105' : 'bg-white border border-indigo-50 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'}`}
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
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>}>
      <SearchContent />
    </Suspense>
  )
}
