'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'

interface Word {
  id: string
  word: string
  tags: string[]
  masteryLevel?: number
}

export default function LibraryPage() {
  const { token } = useAuth()
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    fetch('/api/words/learned', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch words')
        return r.json()
      })
      .then(data => {
        setWords(data.words || [])
        setError(null)
      })
      .catch(err => {
        console.error('Failed to fetch words:', err)
        setError('Failed to load your word library. Please try again.')
        setWords([])
      })
      .finally(() => setLoading(false))
  }, [token])

  const filteredWords = useMemo(() => {
    return words.filter(w =>
      w.word.toLowerCase().includes(search.toLowerCase()) ||
      (Array.isArray(w.tags) && w.tags.some((t: string) => t.toLowerCase().includes(search.toLowerCase())))
    ).sort((a, b) => a.word.localeCompare(b.word))
  }, [words, search])

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black">Indexing Knowledge...</div>

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-12 rounded-3xl shadow-lg text-center max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Loading Failed</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <h1 className="text-4xl font-black">Knowledge Library ({words.length})</h1>
          <input 
            type="text" 
            placeholder="Filter words or tags..." 
            className="px-6 py-4 rounded-2xl border-2 border-indigo-100 w-full md:w-80 shadow-sm focus:border-indigo-500 focus:outline-none font-bold"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredWords.map((w) => (
            <Link 
              key={w.id} 
              href={`/study/${w.id}`} 
              className="block bg-white p-6 rounded-3xl shadow-sm border border-indigo-50 hover:shadow-lg hover:border-indigo-200 transition-all text-center group"
            >
              <p className="text-lg font-black text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors">{w.word}</p>
              <div className="flex justify-center gap-1">
                 {[...Array(5)].map((_, i) => (
                    <div key={i} className={`h-1.5 w-full max-w-[20px] rounded ${i < (w.masteryLevel || 0) ? 'bg-indigo-500' : 'bg-slate-100'}`} />
                 ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
