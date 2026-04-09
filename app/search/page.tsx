'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import TriadCard from '@/components/TriadCard'
import Link from 'next/link'

interface Word {
  id: string
  word: string
  phonetic: string | null
  partOfSpeech: string
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
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [isSuggestion, setIsSuggestion] = useState(false)
  
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
      setIsSuggestion(data.isSuggestion || false)
      if (data.words && data.words.length > 0) {
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

  if (!hasSearched) {
    return (
      <div className="min-h-[80vh] bg-slate-50 flex items-center justify-center px-6 text-center">
        <div className="max-w-xl w-full">
          <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl shadow-indigo-100 flex items-center justify-center mx-auto mb-10 border border-indigo-50">
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
              className="w-full p-6 bg-white border-2 border-indigo-100 rounded-[2rem] focus:border-indigo-400 focus:outline-none text-xl font-bold pr-36 shadow-2xl"
            />
            <button
              type="submit"
              className="absolute right-3 top-3 bottom-3 px-8 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs"
            >
              SEARCH
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (words.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-black text-slate-900 mb-12 tracking-tighter">No Matches</h1>
          <form onSubmit={handleSearch} className="max-w-md mx-auto mb-12">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Try another..."
                className="w-full p-6 bg-white border-2 border-indigo-100 rounded-[2rem] focus:border-indigo-400 focus:outline-none text-slate-900 shadow-xl"
              />
              <button type="submit" className="absolute right-3 top-3 bottom-3 px-8 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs">SEARCH</button>
            </div>
          </form>
          <div className="bg-white rounded-[3rem] p-16 border-2 border-dashed border-indigo-100">
            <p className="text-2xl text-slate-400 font-bold mb-8">Nothing found for "{searchQuery}".</p>
            <Link href="/learn" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all">Back to Learn</Link>
          </div>
        </div>
      </div>
    )
  }

  const word = words[currentIndex]

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
              <button type="submit" className="absolute right-2 top-2 bottom-2 px-6 bg-indigo-600 text-white rounded-2xl font-black text-[10px] tracking-widest">SEARCH</button>
            </form>
            {isSuggestion && <p className="px-4 text-[11px] font-bold text-slate-400 italic">Showing alphabetical dictionary suggestions:</p>}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-3xl border border-indigo-50 shadow-sm">
               <div className="text-right">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] leading-none mb-1">{isSuggestion ? 'Suggestions' : 'Results'}</p>
                  <p className="text-sm font-black text-indigo-600 leading-none">{currentIndex + 1} / {words.length}</p>
               </div>
               <div className="w-px h-8 bg-slate-100" />
               <div className="flex gap-1.5">
                  <button onClick={() => setCurrentIndex((p) => (p - 1 + words.length) % words.length)} className="p-2 bg-slate-50 rounded-xl hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg></button>
                  <button onClick={() => setCurrentIndex((p) => (p + 1) % words.length)} className="p-2 bg-slate-50 rounded-xl hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg></button>
               </div>
            </div>
          </div>
        </div>

        {/* THIS IS THE ONLY BANNER ALLOWED */}
        <div className="flex gap-2 mb-10 bg-indigo-50/50 rounded-[2.5rem] p-2 border border-indigo-100 max-w-sm mx-auto shadow-inner">
          <div className="flex-1 py-4 bg-indigo-600 text-white rounded-[2rem] font-black text-[11px] tracking-widest uppercase text-center shadow-lg">
             Triad Card
          </div>
          <Link 
            href={`/learn?word=${encodeURIComponent(word.word)}`}
            className="flex-1 py-4 text-indigo-400 hover:text-indigo-700 rounded-[2rem] font-black text-[11px] tracking-widest uppercase text-center transition-all flex items-center justify-center gap-2"
          >
             Study
          </Link>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <TriadCard 
            word={word} 
            onNext={() => setCurrentIndex((p) => (p + 1) % words.length)} 
            onPrev={() => setCurrentIndex((p) => (p - 1 + words.length) % words.length)} 
          />
        </div>

        {words.length > 1 && (
          <div className="mt-16 bg-white/60 rounded-[2.5rem] p-10 border border-indigo-50 shadow-xl text-center">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Related Results</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {words.map((w, idx) => (
                <button
                  key={w.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all ${idx === currentIndex ? 'bg-indigo-600 text-white shadow-xl' : 'bg-white border border-indigo-50 text-slate-500 hover:text-indigo-600'}`}
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
