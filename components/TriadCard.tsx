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
  
  // State for current sense
  const [currentSense, setCurrentSense] = useState<any>(initialWord)
  const [flipped, setFlipped] = useState(false)
  const [exampleIndex, setExampleIndex] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)
  const [favLoading, setFavLoading] = useState(false)

  // Sync with prop if it changes (from parent)
  useEffect(() => {
    setCurrentSense(initialWord)
    setFlipped(false)
    setExampleIndex(0)
  }, [initialWord])

  // Check if current sense is favorited
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

  const switchSense = (sense: any) => {
    setCurrentSense({
      ...sense,
      partOfSpeech: sense.partOfSpeech || (typeof sense.tags === 'string' ? JSON.parse(sense.tags)[0] : sense.tags?.[0]) || 'word'
    })
    setExampleIndex(0)
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

  const examples = currentSense.examples && currentSense.examples.length > 0 ? currentSense.examples : ['No examples available.']

  const playPronunciation = (e: React.MouseEvent) => {
    e.stopPropagation()
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentSense.word)
      utterance.lang = 'en-US'
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  const playExample = (e: React.MouseEvent) => {
    e.stopPropagation()
    if ('speechSynthesis' in window && examples[exampleIndex]) {
      const utterance = new SpeechSynthesisUtterance(examples[exampleIndex])
      utterance.lang = 'en-US'
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  const prevExample = (e: React.MouseEvent) => {
    e.stopPropagation()
    setExampleIndex(exampleIndex === 0 ? examples.length - 1 : exampleIndex - 1)
  }

  const nextExample = (e: React.MouseEvent) => {
    e.stopPropagation()
    setExampleIndex(exampleIndex >= examples.length - 1 ? 0 : exampleIndex + 1)
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

  const pos = currentSense.partOfSpeech || (currentSense.tags?.[0]) || 'word'
  const category = currentSense.tags?.[1] || ''

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
          {/* Front - Image + Definition */}
          <div className="backface-hidden absolute inset-0">
            <div className="bg-white rounded-[3.5rem] shadow-2xl overflow-hidden h-full border border-indigo-50 flex flex-col">
              <div className="p-6 pb-2 flex gap-3 items-center justify-center">
                {category && (
                  <span className="px-4 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black tracking-widest border border-slate-200/50">
                    {category.toUpperCase()}
                  </span>
                )}
                <span className="px-4 py-1 bg-indigo-50 text-indigo-400 rounded-full text-[10px] font-black tracking-widest border border-indigo-100/50">
                  {pos.toUpperCase()}
                </span>
                {user && currentSense.id && (
                  <button
                    onClick={toggleFavorite}
                    disabled={favLoading}
                    className={`p-2 rounded-full transition-all active:scale-90 ${
                      isFavorited
                        ? 'text-red-500 bg-red-50 hover:bg-red-100'
                        : 'text-slate-300 hover:text-red-400 hover:bg-red-50'
                    }`}
                  >
                    <svg className="w-5 h-5" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                )}
              </div>

              <div className="px-10 pt-6 pb-4 text-center">
                <div className="flex items-center justify-center gap-6 mb-2">
                  <h1 className="text-5xl font-serif italic text-slate-800 tracking-tight font-[family-name:var(--font-playfair)]">
                    {currentSense.word}
                  </h1>
                  <button
                    onClick={playPronunciation}
                    className="p-3 bg-slate-50 rounded-full text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all duration-300 border border-slate-100"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" />
                    </svg>
                  </button>
                </div>
                <p className="text-lg text-slate-400 font-medium tracking-[0.2em]">{currentSense.phonetic}</p>
              </div>

              <div className="px-12 py-2 flex items-center justify-center">
                <div className="w-full max-h-[280px] aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl border border-white transform hover:scale-[1.01] transition-transform duration-700">
                  <UnsplashImage
                    word={currentSense.word}
                    alt={currentSense.word}
                    className="w-full h-full object-cover"
                    fallbackUrl={currentSense.images[0]}
                  />
                </div>
              </div>

              <div className="px-14 pb-8 pt-4 text-center mt-auto">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.5em] mb-4 inline-block px-5 py-1.5 bg-slate-100/80 rounded-full border border-slate-200">ESSENTIAL MEANING</p>
                <div className="max-h-[140px] overflow-y-auto no-scrollbar">
                  <p className="text-lg md:text-xl font-medium text-slate-600 leading-[1.6] tracking-wide max-w-[90%] mx-auto font-serif">
                    {currentSense.meaning}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Back - Scenario Example + Feel It */}
          <div className="backface-hidden rotate-y-180 absolute inset-0">
            <div className="bg-white rounded-[3.5rem] shadow-2xl overflow-hidden h-full border border-indigo-50 flex flex-col">
              <div className="p-10 flex-1 flex flex-col">
                {/* Header with Word and Speaker Button */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">CONTEXTUAL SCENARIO</h2>
                  <div className="flex items-center gap-2">
                    <span className="px-5 py-2 bg-indigo-50/50 rounded-full text-xs font-serif italic text-indigo-500 border border-indigo-100/30 font-[family-name:var(--font-playfair)]">
                      {currentSense.word}
                    </span>
                    <button
                      onClick={playFeelIt}
                      className="p-2.5 bg-indigo-50 text-indigo-400 rounded-full hover:text-indigo-600 hover:bg-indigo-100 transition-all border border-indigo-100/30 shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Scenario Images snapshot - Theater Mode - Height Increased */}
                {currentSense.scenarioImages && currentSense.scenarioImages.length > 0 ? (
                  <div className="mb-8 rounded-[2.5rem] overflow-hidden border border-white shadow-2xl relative group h-[300px] bg-slate-50">
                    <div className="flex w-full h-full overflow-x-auto snap-x snap-mandatory no-scrollbar text-[0]">
                      {currentSense.scenarioImages.map((img: string, idx: number) => (
                        <div key={idx} className="flex-shrink-0 w-full h-full snap-center relative">
                          <img
                            src={img}
                            alt={`Scenario ${idx + 1}`}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                          />
                          {currentSense.scenarioImages.length > 1 && (
                            <div className="absolute bottom-6 right-6 px-4 py-2 bg-black/20 backdrop-blur-md rounded-full text-[9px] font-black text-white uppercase tracking-widest border border-white/10 shadow-lg">
                              {idx + 1} / {currentSense.scenarioImages.length}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mb-8 rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50/50 h-[240px] flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-indigo-200 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Visualizing Scenario...</p>
                  </div>
                )}

                {/* Scenario Text Area - Expanded */}
                <div className="flex-1 flex flex-col justify-center py-4">
                  <p className="text-xl md:text-2xl text-slate-600 italic leading-[1.8] font-medium text-center tracking-wide font-serif font-[family-name:var(--font-playfair)] px-6">
                    "{currentSense.emotionalConnection || `A vivid mental picture of ${currentSense.word} in action.`}"
                  </p>
                </div>
              </div>

              <div className="pb-10 flex justify-center opacity-30">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] select-none">Tap to flip back</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8 px-6">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPrev?.()
          }}
          className="px-8 py-4 bg-white/50 backdrop-blur-md text-slate-500 rounded-[2rem] font-black text-[10px] tracking-widest hover:bg-white hover:text-slate-800 transition-all border border-slate-200/50 shadow-sm flex items-center gap-3 uppercase"
        >
          <span>←</span> Prev
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNext?.()
          }}
          className="px-8 py-4 bg-indigo-600 text-white rounded-[2rem] font-black text-[10px] tracking-widest hover:bg-indigo-500 hover:shadow-2xl hover:-translate-y-1 transition-all shadow-xl flex items-center gap-3 uppercase"
        >
          Next <span>→</span>
        </button>
      </div>
    </div>
  )
}
