'use client'

import { useState } from 'react'
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
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Left Side - Image & Visual Essence */}
          <div className="p-6">
            <div className="rounded-2xl overflow-hidden mb-4 shadow-lg">
              <UnsplashImage
                word={word}
                alt={word}
                className="w-full h-80 object-cover"
                fallbackUrl={images[0]}
              />
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-orange-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-orange-600 flex items-center gap-2">
                  <span className="text-lg">💡</span> VISUAL ESSENCE
                </h4>
                <div className="flex items-center gap-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`w-2.5 h-2.5 rounded-full ${
                          i <= score ? 'bg-orange-500' : 'bg-orange-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-orange-600 font-medium ml-1">SCORE: {score}</span>
                </div>
              </div>
              <p className="text-sm text-gray-700 italic leading-relaxed">
                "{emotionalConnection || `A vivid mental picture of ${word} in action.`}"
              </p>
            </div>
          </div>

          {/* Right Side - Word Info */}
          <div className="p-6 bg-gray-50/50">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {category && (
                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                  {category.toUpperCase()}
                </span>
              )}
              <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-semibold">
                {pos.toUpperCase()}
              </span>
            </div>

            {/* Word & Phonetic */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-5xl font-black text-gray-900 tracking-tight">{word}</h1>
                <button
                  onClick={playPronunciation}
                  className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                >
                  <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" />
                  </svg>
                </button>
              </div>
              <p className="text-xl text-gray-500 font-light">{phonetic}</p>
            </div>

            {/* Definition */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">DEFINITION</p>
              <p className="text-lg text-gray-800 leading-relaxed">{meaning}</p>
            </div>

            {/* Scenario */}
            {scenario && (
              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">SCENARIO</p>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <p className="text-gray-700 leading-relaxed">{scenario}</p>
                </div>
              </div>
            )}

            {/* Example */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    EXAMPLE {exampleIndex + 1} / {displayExamples.length}
                  </span>
                  <span className="text-xs text-gray-400">
                    ({pos.toUpperCase()})
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={playExample}
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" />
                    </svg>
                  </button>
                  <button
                    onClick={prevExample}
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextExample}
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-lg text-orange-500 italic leading-relaxed">
                "{displayExamples[exampleIndex]}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
