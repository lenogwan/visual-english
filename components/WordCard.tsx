'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import UnsplashImage from '@/components/UnsplashImage'

interface WordCardProps {
  id?: string
  wordId?: string
  word: string
  phonetic?: string | null
  meaning?: string | null
  scenario?: string | null
  examples?: string[]
  images?: string[]
  partOfSpeech?: string | string[]
  emotionalConnection?: string | null
}

export default function WordCard({ id, wordId, word, phonetic, meaning, scenario, examples = [], images = [], partOfSpeech, emotionalConnection }: WordCardProps) {
  const { token } = useAuth()
  const [isFav, setIsFav] = useState(false)
  const actualId = id || wordId || ''

  useEffect(() => {
    if(!token || !actualId) return
    fetch('/api/favorites', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setIsFav(data.favorites.some((w: any) => w.id === actualId)))
  }, [token, actualId])

  const toggleFav = async () => {
    if(!actualId) return
    const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ wordId: actualId })
    })
    if(res.ok) setIsFav(!isFav)
  }

  const playSound = (text: string) => {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text)
      window.speechSynthesis.speak(u)
    }
  }

  return (
    <div className="bg-white rounded-[3rem] shadow-2xl border border-indigo-50 p-12 max-w-5xl mx-auto flex flex-col md:flex-row gap-12">
      <div className="md:w-1/2 space-y-8">
        <div className="rounded-[2.5rem] overflow-hidden aspect-square shadow-xl">
            <UnsplashImage word={word} alt={word} className="w-full h-full object-cover" fallbackUrl={images[0]} />
        </div>
      </div>

      <div className="md:w-1/2 flex flex-col">
        <div className="flex items-center justify-between mb-6">
            <span className="px-6 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">{partOfSpeech}</span>
            <button onClick={toggleFav} className={`text-2xl transition-colors ${isFav ? 'text-red-500' : 'text-slate-300 hover:text-red-500'}`}>♥</button>
        </div>
        
        <div className="flex items-center gap-4 mb-2">
            <h1 className="text-6xl font-black tracking-tighter text-slate-900">{word}</h1>
            <button onClick={() => playSound(word)} className="p-3 bg-indigo-50 text-indigo-600 rounded-full">🔊</button>
        </div>
        <p className="text-2xl text-slate-400 font-medium mb-10">{phonetic}</p>
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">DEFINITION</h4>
        <p className="text-lg text-slate-700 leading-relaxed mb-10">{meaning}</p>
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">SCENARIO</h4>
        <div className="bg-slate-50 p-6 rounded-2xl mb-10">{scenario}</div>
      </div>
    </div>
  )
}
