'use client'

import { useState } from 'react'
import { WordData } from '@/lib/data'
import { useAuth } from '@/lib/auth-context'
import UnsplashImage from '@/components/UnsplashImage'

interface TriadCardProps {
  word: WordData
  onNext?: () => void
  onPrev?: () => void
}

export default function TriadCard({ word, onNext, onPrev }: TriadCardProps) {
  const { user } = useAuth()
  const [flipped, setFlipped] = useState(false)
  const [exampleIndex, setExampleIndex] = useState(0)

  const examples = word.examples && word.examples.length > 0 ? word.examples : ['No examples available.']

  const playPronunciation = (e: React.MouseEvent) => {
    e.stopPropagation()
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word.word)
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

  const pos = word.tags[0] || 'word'
  const category = word.tags[1] || ''

  return (
    <div className="max-w-md mx-auto">
      <div
        className="relative cursor-pointer perspective-1000"
        onClick={() => setFlipped(!flipped)}
        style={{ minHeight: '520px' }}
      >
        <div
          className={`transition-transform duration-500 transform-style-3d ${
            flipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front - Image + Definition */}
          <div className="backface-hidden">
            <div className="glass-card bg-white/80 rounded-3xl shadow-xl overflow-hidden border border-indigo-100">
              {/* Tags */}
              <div className="flex gap-2 p-4 pb-2">
                {category && (
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold border border-indigo-200">
                    {category.toUpperCase()}
                  </span>
                )}
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold border border-purple-200">
                  {pos.toUpperCase()}
                </span>
              </div>

              {/* Word & Phonetic */}
              <div className="px-6 pb-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-black text-slate-900 tracking-tight">{word.word}</h1>
                  <button
                    onClick={playPronunciation}
                    className="p-2.5 bg-indigo-50 rounded-full hover:bg-indigo-100 transition-all duration-300 text-indigo-600 border border-indigo-100"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" />
                    </svg>
                  </button>
                </div>
                <p className="text-lg text-slate-500 font-medium mt-1">{word.phonetic}</p>
              </div>

              {/* Image */}
              <div className="px-6 py-3">
                <div className="aspect-square rounded-2xl overflow-hidden shadow-lg bg-gray-100 flex items-center justify-center relative">
                  <UnsplashImage
                    word={word.word}
                    alt={word.word}
                    className="w-full h-full object-cover"
                    fallbackUrl={word.images[0]}
                  />
                </div>
              </div>

              {/* Definition */}
              <div className="px-6 pb-6 mt-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">DEFINITION</p>
                <p className="text-lg text-slate-800 leading-relaxed font-medium">{word.meaning}</p>
              </div>

              <div className="flex items-center justify-center gap-2 pb-6 opacity-60">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
                <p className="text-sm text-slate-500 font-medium select-none">
                  Tap to flip
                </p>
              </div>
            </div>
          </div>

          {/* Back - Scenario Example + Feel It */}
          <div className="backface-hidden rotate-y-180 absolute inset-0">
            <div className="glass-card bg-white/80 rounded-3xl shadow-xl overflow-hidden h-full border border-indigo-100 flex flex-col">
              <div className="p-8 flex-1">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">🎬 Scenario</h2>
                  <span className="px-4 py-1.5 bg-indigo-50 rounded-full text-sm font-bold text-indigo-600 border border-indigo-100">
                    {word.word}
                  </span>
                </div>

                {/* Example with navigation */}
                <div className="bg-indigo-50/50 rounded-2xl p-6 mb-6 border border-indigo-100 shadow-inner">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">
                         EXAMPLE {exampleIndex + 1} / {examples.length}
                       </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={playExample}
                        className="p-2 bg-white hover:bg-slate-50 text-indigo-600 rounded-xl transition-all border border-indigo-100 shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" />
                        </svg>
                      </button>
                      <button
                        onClick={prevExample}
                        className="p-2 bg-white hover:bg-slate-50 text-indigo-600 rounded-xl transition-all border border-indigo-100 shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={nextExample}
                        className="p-2 bg-white hover:bg-slate-50 text-indigo-600 rounded-xl transition-all border border-indigo-100 shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-xl text-slate-700 italic leading-relaxed font-medium">
                    "{examples[exampleIndex]}"
                  </p>
                </div>

                {/* Feel It */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 shadow-md">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-indigo-100 rounded-lg">
                      <span className="text-xs">💡</span>
                    </div>
                    <span className="text-sm font-black text-indigo-600 uppercase tracking-wider">FEEL IT</span>
                  </div>
                  <p className="text-base text-slate-600 italic leading-relaxed font-medium">
                    "{word.emotionalConnection || `A vivid mental picture of ${word.word} in action.`}"
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 pb-8 opacity-60">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
                <p className="text-sm text-slate-500 font-medium select-none">
                  Tap to flip back
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-10">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPrev?.()
          }}
          className="px-8 py-4 bg-white text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all border border-indigo-100 shadow-md flex items-center gap-2"
        >
          <span>←</span> Previous
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNext?.()
          }}
          className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:shadow-lg hover:bg-indigo-500 transition-all shadow-md flex items-center gap-2"
        >
          Next <span>→</span>
        </button>
      </div>
    </div>
  )
}
