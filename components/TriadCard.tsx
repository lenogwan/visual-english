'use client'

import { useState, useEffect } from 'react'
import { WordData } from '@/lib/data'
import { useAuth } from '@/lib/auth-context'
import UnsplashImage from '@/components/UnsplashImage'
import SenseSwitcher from '@/components/SenseSwitcher'

interface TriadCardProps {
  word: WordData
  onNext?: () => void
  onPrev?: () => void
}

export default function TriadCard({ word: initialWord, onNext, onPrev }: TriadCardProps) {
  const { user, token } = useAuth()
  
  const [currentSense, setCurrentSense] = useState<any>(initialWord)
  const [flipped, setFlipped] = useState(false)
  const [exampleIndex, setExampleIndex] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)
  const [favLoading, setFavLoading] = useState(false)

  useEffect(() => {
    setCurrentSense(initialWord)
    setFlipped(false)
    setExampleIndex(0)
  }, [initialWord])

  useEffect(() => {
    if (!user || !token || !currentSense.id) return
    fetch('/api/favorites', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        const favIds = (data.favorites || []).map((f: any) => f.wordId)
        setIsFavorited(favIds.includes(currentSense.id))
      })
      .catch(() => {})
  }, [user, token, currentSense.id])

  function safeJsonParse(data: any, fallback: any = []) {
    if (typeof data !== 'string') return data || fallback
    try { return JSON.parse(data) } catch (e) { return fallback }
  }

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user || !token || !currentSense.id || favLoading) return
    setFavLoading(true)
    const prev = isFavorited
    setIsFavorited(!prev)
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ wordId: currentSense.id }),
      })
      const data = await res.json()
      setIsFavorited(data.favorited)
    } catch {
      setIsFavorited(prev)
    } finally {
      setFavLoading(false)
    }
  }

  const playPronunciation = (e: React.MouseEvent) => {
    e.stopPropagation()
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentSense.word)
      utterance.lang = 'en-US'
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  const playFeelIt = (e: React.MouseEvent) => {
    e.stopPropagation()
    const text = currentSense.emotionalConnection || `A vivid mental picture of ${currentSense.word} in action.`
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.85
      speechSynthesis.speak(utterance)
    }
  }

  const rawPos = Array.isArray(currentSense.partOfSpeech) ? currentSense.partOfSpeech[0] : currentSense.partOfSpeech;
  const pos = (rawPos || 'word').toLowerCase();
  const tagList = Array.isArray(currentSense.tags) ? currentSense.tags : safeJsonParse(currentSense.tags, []);
  const category = tagList.find((t: string) => t.toLowerCase() !== pos) || (tagList.length > 0 && tagList[0] !== pos ? tagList[0] : '') || '';

  return (
    <div className="max-w-xl mx-auto">
      <div
        className="relative cursor-pointer perspective-1000 h-[680px]"
        onClick={() => setFlipped(!flipped)}
      >
        <div
          className={`transition-transform duration-500 transform-style-3d h-full ${
            flipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front */}
          <div className="backface-hidden absolute inset-0">
            <div className="bg-white rounded-[3.5rem] shadow-2xl overflow-hidden h-full border border-indigo-50 flex flex-col">
              <div className="p-6 pb-2 flex gap-3 items-center justify-center">
                {category && <span className="px-4 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black tracking-widest border border-slate-200/50">{category.toUpperCase()}</span>}
                <span className="px-4 py-1 bg-indigo-50 text-indigo-400 rounded-full text-[10px] font-black tracking-widest border border-indigo-100/50">{rawPos?.toUpperCase() || 'WORD'}</span>
              </div>
              <div className="px-10 pt-6 pb-4 text-center">
                <h1 className="text-5xl font-serif italic text-slate-800 tracking-tight mb-2">{currentSense.word}</h1>
                <p className="text-lg text-slate-400 font-medium tracking-[0.2em]">{currentSense.phonetic}</p>
              </div>
              <div className="px-12 py-2 flex items-center justify-center">
                <div className="w-full aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl">
                    <UnsplashImage word={currentSense.word} alt={currentSense.word} className="w-full h-full object-cover" fallbackUrl={currentSense.images[0]} />
                </div>
              </div>
              <div className="px-14 pb-8 pt-4 text-center mt-auto">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.5em] mb-4">ESSENTIAL MEANING</p>
                <p className="text-lg text-slate-600 leading-[1.6] font-serif">{currentSense.meaning}</p>
              </div>
            </div>
          </div>

          {/* Back */}
          <div className="backface-hidden rotate-y-180 absolute inset-0">
             <div className="bg-white rounded-[3.5rem] shadow-2xl overflow-hidden h-full border border-indigo-50 flex flex-col p-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">CONTEXTUAL SCENARIO</h2>
                  <button onClick={playFeelIt} className="p-2.5 bg-indigo-50 text-indigo-400 rounded-full hover:text-indigo-600 transition-all"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" /></svg></button>
                </div>
                
                {/* Images restored */}
                {currentSense.scenarioImages && safeJsonParse(currentSense.scenarioImages, []).length > 0 ? (
                  <div className="mb-6 rounded-[2rem] overflow-hidden h-[240px] bg-slate-100">
                    <img src={safeJsonParse(currentSense.scenarioImages, [])[0]} alt="Scenario" className="w-full h-full object-cover" />
                  </div>
                ) : null}

                <div className="flex-1 overflow-y-auto no-scrollbar">
                   <p className="text-xl text-slate-600 italic leading-[1.8] font-medium text-center font-serif">"{currentSense.emotionalConnection || currentSense.meaning}"</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
