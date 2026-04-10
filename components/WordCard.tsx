'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useFavorites } from '@/lib/favorites-context'
import UnsplashImage from '@/components/UnsplashImage'

interface WordCardProps {
  id: string
  word: string
  phonetic?: string | null
  meaning?: string | null
  scenario?: string | null
  examples?: string[]
  images?: string[]
  tags?: string[]
  partOfSpeech?: string | string[]
  emotionalConnection?: string | null
}

export default function WordCard({ id, word, phonetic, meaning, scenario, examples = [], images = [], tags = [], partOfSpeech, emotionalConnection }: WordCardProps) {
  const { token } = useAuth()
  const { isFavorited, refresh: refreshFavorites } = useFavorites()
  const [exampleIndex, setExampleIndex] = useState(0)
  const isFav = isFavorited(id)

  const toggleFav = async () => {
    if(!id) return
    const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ wordId: id })
    })
    if(res.ok) await refreshFavorites()
  }

  const playSound = (text: string) => {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text)
      window.speechSynthesis.speak(u)
    }
  }

  // Ensure examples are correctly parsed if they arrive as JSON strings
  const parsedExamples = typeof examples === 'string' ? JSON.parse(examples) : (Array.isArray(examples) ? examples : [])

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-indigo-50 p-12 max-w-5xl mx-auto flex flex-col md:flex-row gap-12">
      <div className="md:w-1/2 space-y-8">
        <div className="rounded-[2.5rem] overflow-hidden aspect-square shadow-xl">
            <UnsplashImage word={word} alt={word} className="w-full h-full object-cover" fallbackUrl={images[0]} />
        </div>
      </div>

      <div className="md:w-1/2 flex flex-col">
        <div className="flex items-center justify-between mb-6">
            <span className="px-6 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">{Array.isArray(partOfSpeech) ? partOfSpeech[0] : partOfSpeech}</span>
            <button onClick={toggleFav} className={`text-2xl transition-colors ${isFav ? 'text-red-500' : 'text-slate-300 hover:text-red-500'}`}>♥</button>
        </div>
        
        <div className="flex items-center gap-4 mb-2">
            <h1 className="text-6xl font-black tracking-tighter text-slate-900">{word}</h1>
            <button onClick={() => playSound(word)} className="p-3 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828 2.828a9 9 0 001.414 1.414M12 6v12m-3-9H7a1 1 0 00-1 1v4a1 1 0 001 1h2l3 3V5L9 8z" />
              </svg>
            </button>
        </div>
        <p className="text-2xl text-slate-400 font-medium mb-10">{phonetic}</p>
        
        <div className="space-y-8">
          <section>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">DEFINITION</h4>
            <p className="text-lg text-slate-700 leading-relaxed">{meaning}</p>
          </section>

          <section>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">SCENARIO</h4>
            <div className="bg-slate-50 p-6 rounded-2xl italic text-slate-600 border border-slate-100/50 shadow-sm">{scenario}</div>
          </section>

          {parsedExamples.length > 0 && (
            <section className="relative group">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">EXAMPLES</h4>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
                    {exampleIndex + 1} / {parsedExamples.length}
                  </span>
                  {parsedExamples.length > 1 && (
                    <div className="flex gap-1">
                      <button 
                        onClick={() => setExampleIndex((prev) => (prev - 1 + parsedExamples.length) % parsedExamples.length)}
                        className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                      </button>
                      <button 
                        onClick={() => setExampleIndex((prev) => (prev + 1) % parsedExamples.length)}
                        className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100/50 shadow-sm relative overflow-hidden flex items-start gap-4">
                <p className="flex-grow text-lg font-bold text-slate-800 leading-snug">
                  {parsedExamples[exampleIndex]}
                </p>
                <button 
                  onClick={() => playSound(parsedExamples[exampleIndex])}
                  className="p-2.5 bg-white text-indigo-600 rounded-xl shadow-sm hover:shadow-md hover:scale-110 transition-all border border-indigo-50"
                  title="Speak example"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828 2.828a9 9 0 001.414 1.414M12 6v12m-3-9H7a1 1 0 00-1 1v4a1 1 0 001 1h2l3 3V5L9 8z" />
                  </svg>
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
