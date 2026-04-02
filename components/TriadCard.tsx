'use client'

import { useState } from 'react'
import { WordData } from '@/lib/data'
import UnsplashImage from '@/components/UnsplashImage'

interface TriadCardProps {
  word: WordData
  onNext?: () => void
  onPrev?: () => void
}

export default function TriadCard({ word, onNext, onPrev }: TriadCardProps) {
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
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* Tags */}
              <div className="flex gap-2 p-4 pb-2">
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
              <div className="px-6 pb-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-black text-gray-900 tracking-tight">{word.word}</h1>
                  <button
                    onClick={playPronunciation}
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" />
                    </svg>
                  </button>
                </div>
                <p className="text-lg text-gray-500 font-light mt-1">{word.phonetic}</p>
              </div>

              {/* Image */}
              <div className="px-6 py-3">
                <div className="aspect-square rounded-2xl overflow-hidden shadow-lg bg-gray-100">
                  <UnsplashImage
                    word={word.word}
                    alt={word.word}
                    className="w-full h-full object-cover"
                    fallbackUrl={word.images[0]}
                  />
                </div>
              </div>

              {/* Definition */}
              <div className="px-6 pb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">DEFINITION</p>
                <p className="text-base text-gray-800 leading-relaxed">{word.meaning}</p>
              </div>

              <p className="text-center pb-4 text-sm text-gray-400">
                Tap to flip
              </p>
            </div>
          </div>

          {/* Back - Scenario Example + Feel It */}
          <div className="backface-hidden rotate-y-180 absolute inset-0">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800">🎬 Scenario</h2>
                  <span className="text-sm text-gray-500">{word.word}</span>
                </div>

                {/* Example with navigation */}
                <div className="bg-gray-50 rounded-xl p-5 mb-5 border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        EXAMPLE {exampleIndex + 1} / {examples.length}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({pos.toUpperCase()})
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={playExample}
                        className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" />
                        </svg>
                      </button>
                      <button
                        onClick={prevExample}
                        className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={nextExample}
                        className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-base text-orange-500 italic leading-relaxed">
                    "{examples[exampleIndex]}"
                  </p>
                </div>

                {/* Feel It */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-orange-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-bold text-orange-600">💡 FEEL IT</span>
                  </div>
                  <p className="text-sm text-gray-700 italic leading-relaxed">
                    "{word.emotionalConnection || `A vivid mental picture of ${word.word} in action.`}"
                  </p>
                </div>
              </div>

              <p className="text-center pb-4 text-sm text-gray-400">
                Tap to flip back
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPrev?.()
          }}
          className="px-6 py-3 bg-gray-200 rounded-xl font-medium hover:bg-gray-300 transition-colors"
        >
          ← Previous
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNext?.()
          }}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
