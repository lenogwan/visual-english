'use client'

import { useState } from 'react'
import UnsplashImage from '@/components/UnsplashImage'

interface WordCardProps {
  wordId?: string
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

export default function WordCard({ word, phonetic, meaning, scenario, examples = [], images = [], tags = [], partOfSpeech, emotionalConnection }: WordCardProps) {
  const [exampleIndex, setExampleIndex] = useState(0)
  const displayExamples = examples.length > 0 ? examples : ['No examples available.']
  const displayPOS = (Array.isArray(partOfSpeech) ? partOfSpeech[0] : partOfSpeech) || 'word'

  const playSound = (text: string) => {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'en-US'
      window.speechSynthesis.speak(u)
    }
  }

  return (
    <div className="bg-white rounded-[3rem] shadow-2xl border border-indigo-50 p-12 max-w-5xl mx-auto flex flex-col md:flex-row gap-12">
      {/* Left: Image & Visual Essence */}
      <div className="md:w-1/2 space-y-8">
        <div className="rounded-[2.5rem] overflow-hidden aspect-square shadow-xl">
            <UnsplashImage word={word} alt={word} className="w-full h-full object-cover" fallbackUrl={images[0]} />
        </div>
        <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="text-lg">💡</span> VISUAL ESSENCE
            </h4>
            <p className="text-lg font-serif italic text-slate-600 leading-relaxed">
                "{emotionalConnection || meaning}"
            </p>
        </div>
      </div>

      {/* Right: Info */}
      <div className="md:w-1/2 flex flex-col">
        <div className="flex items-center justify-between mb-6">
            <span className="px-6 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">{displayPOS}</span>
            <button className="text-slate-300 hover:text-red-500 text-2xl">♥</button>
        </div>
        
        <div className="flex items-center gap-4 mb-2">
            <h1 className="text-6xl font-black tracking-tighter text-slate-900">{word}</h1>
            <button onClick={() => playSound(word)} className="p-3 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100">🔊</button>
        </div>
        <p className="text-2xl text-slate-400 font-medium mb-10">{phonetic}</p>

        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">DEFINITION</h4>
        <p className="text-lg text-slate-700 leading-relaxed mb-10">{meaning}</p>

        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">SCENARIO</h4>
        <div className="bg-slate-50 p-6 rounded-2xl mb-10 text-slate-600 font-medium">
            {scenario}
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">EXAMPLE {exampleIndex + 1} / {displayExamples.length}</h4>
                <div className="flex gap-2">
                    <button onClick={() => setExampleIndex(prev => prev === 0 ? displayExamples.length - 1 : prev - 1)} className="p-2 bg-white rounded-lg shadow-sm border">←</button>
                    <button onClick={() => setExampleIndex(prev => (prev + 1) % displayExamples.length)} className="p-2 bg-white rounded-lg shadow-sm border">→</button>
                </div>
            </div>
            <p className="text-lg italic font-serif text-slate-700">"{displayExamples[exampleIndex]}"</p>
        </div>
      </div>
    </div>
  )
}
