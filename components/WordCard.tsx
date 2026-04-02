'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import UnsplashImage from '@/components/UnsplashImage'

interface WordCardProps {
  word: string
  phonetic?: string | null
  meaning?: string | null
  scenario?: string | null
  examples?: string[]
  images?: string[]
  tags?: string[]
  emotionalConnection?: string | null
}

export default function WordCard({
  word,
  phonetic,
  meaning,
  scenario,
  examples = [],
  images = [],
  tags = [],
  emotionalConnection,
}: WordCardProps) {
  const { user } = useAuth()
  const [exampleIndex, setExampleIndex] = useState(0)
  const [score, setScore] = useState(3)

  const displayExamples = examples.length > 0 ? examples : ['No examples available.']

  const playPronunciation = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = 'en-US'
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  const playExample = () => {
    if ('speechSynthesis' in window && displayExamples[exampleIndex]) {
      const utterance = new SpeechSynthesisUtterance(displayExamples[exampleIndex])
      utterance.lang = 'en-US'
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  const prevExample = () => setExampleIndex(exampleIndex === 0 ? displayExamples.length - 1 : exampleIndex - 1)
  const nextExample = () => setExampleIndex(exampleIndex >= displayExamples.length - 1 ? 0 : exampleIndex + 1)

  const pos = tags[0] || 'word'
  const category = tags[1] || ''

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="glass-card bg-white/80 rounded-[2.5rem] shadow-xl overflow-hidden border border-indigo-100">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Left Side - Image & Visual Essence */}
          <div className="p-8">
            <div className="rounded-3xl overflow-hidden mb-8 shadow-md border border-indigo-50 aspect-video lg:aspect-square relative group">
              <UnsplashImage
                word={word}
                alt={word}
                className="w-full h-full object-cover"
                fallbackUrl={images[0]}
              />
            </div>

            <div className="bg-indigo-50/50 rounded-3xl p-8 border border-indigo-100 shadow-inner">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="text-lg">💡</span> VISUAL ESSENCE
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`w-2.5 h-2.5 rounded-full ${
                            i <= score ? 'bg-indigo-400' : 'bg-indigo-100'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-lg text-slate-600 italic leading-relaxed font-medium">
                  "{emotionalConnection || `A vivid mental picture of ${word} in action.`}"
                </p>
              </div>
          </div>

          {/* Right Side - Word Info */}
          <div className="p-10 bg-white/60 backdrop-blur-sm border-l border-indigo-100 flex flex-col justify-center">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {category && (
                <span className="px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold border border-indigo-200 tracking-wider">
                  {category.toUpperCase()}
                </span>
              )}
              <span className="px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-bold border border-purple-200 tracking-wider">
                {pos.toUpperCase()}
              </span>
            </div>

            {/* Word & Phonetic */}
            <div className="mb-10">
              <div className="flex items-center gap-5 mb-3">
                <h1 className="text-6xl font-black text-slate-900 tracking-tighter">{word}</h1>
                <button
                  onClick={playPronunciation}
                  className="p-3.5 bg-indigo-50 text-indigo-600 rounded-full shadow-md hover:bg-indigo-100 hover:scale-110 transition-all border border-indigo-100"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" />
                  </svg>
                </button>
              </div>
              <p className="text-2xl text-slate-500 font-medium tracking-wide">{phonetic}</p>
            </div>

            {/* Definition */}
            <div className="mb-8">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">DEFINITION</p>
              <p className="text-xl text-slate-800 leading-relaxed font-medium">{meaning}</p>
            </div>

            {/* Scenario */}
            {scenario && (
              <div className="mb-8">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">SCENARIO</p>
                <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100 shadow-inner">
                  <p className="text-slate-600 leading-relaxed font-medium">{scenario}</p>
                </div>
              </div>
            )}

            {/* Example */}
            {/* Example */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 shadow-md">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">
                    EXAMPLE {exampleIndex + 1} / {displayExamples.length}
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
              <p className="text-2xl text-slate-700 italic leading-relaxed font-medium">
                "{displayExamples[exampleIndex]}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
