'use client'

import { useState, useEffect, useCallback } from 'react'

interface Word {
  id: string
  word: string
  phonetic: string | null
  meaning: string | null
  images: string[]
  tags: string[]
  examples: string[]
}

const LEVELS = ['All', 'A1', 'A2', 'B1']
const TOPICS = ['All', 'General', 'food', 'travel', 'animals', 'technology', 'business', 'health', 'sports', 'education', 'entertainment']

interface Word {
  id: string
  word: string
  phonetic: string | null
  meaning: string | null
  images: string[]
  tags: string[]
  examples: string[]
  exampleSentence?: string | null
  scenario?: string | null
  emotionalConnection?: string | null
}

export default function PracticePage() {
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [mode, setMode] = useState<'image-to-word' | 'word-to-image'>('image-to-word')
  const [options, setOptions] = useState<string[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [level, setLevel] = useState('All')
  const [topic, setTopic] = useState('All')
  const [isShaking, setIsShaking] = useState(false)
  const [showPulse, setShowPulse] = useState(false)

  const fetchWords = useCallback(async () => {
    setLoading(true)
    setScore({ correct: 0, total: 0 })
    try {
      const res = await fetch(`/api/words?level=${level}&topic=${topic}&limit=50`)
      const data = await res.json()
      setWords(data.words || [])
      setCurrentIndex(0)
      setShowAnswer(false)
      setSelectedAnswer(null)
      setIsCorrect(null)
    } catch (err) {
      console.error('Failed to fetch words:', err)
    } finally {
      setLoading(false)
    }
  }, [level, topic])

  useEffect(() => {
    fetchWords()
  }, [fetchWords])

  const currentWord = words[currentIndex]

  const generateOptions = (correctWord: Word) => {
    const wrongWords = words
      .filter((w) => w.word !== correctWord.word)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((w) => w.word)
    const allOptions = [...wrongWords, correctWord.word].sort(() => Math.random() - 0.5)
    setOptions(allOptions)
  }

  useEffect(() => {
    if (currentWord) {
      generateOptions(currentWord)
      setShowAnswer(false)
      setSelectedAnswer(null)
      setIsCorrect(null)
    }
  }, [currentWord, mode])

  const handleAnswer = (answer: string) => {
    if (showAnswer || !currentWord) return
    setSelectedAnswer(answer)
    const correct = answer === currentWord.word
    
    setIsCorrect(correct)
    setShowAnswer(true)
    
    if (correct) {
      setStreak(prev => {
        const next = prev + 1
        if (next > maxStreak) setMaxStreak(next)
        return next
      })
      setShowPulse(true)
      setTimeout(() => setShowPulse(false), 1000)
    } else {
      setStreak(0)
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 500)
    }

    setScore((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }))
  }

  const nextWord = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setCurrentIndex(0)
    }
  }

  const handleFilterChange = (newLevel: string, newTopic: string) => {
    setLevel(newLevel)
    setTopic(newTopic)
  }

  const playSound = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🎮</div>
          <p className="text-xl text-orange-600 font-bold">Loading your game...</p>
        </div>
      </div>
    )
  }

  if (words.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Practice Mode</h1>
          <p className="text-gray-600 mb-8">No words found. Try a different level or topic!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 py-4 px-2">
      <div className="max-w-lg mx-auto">
        {/* Header with Score & Streaks */}
        <div className="bg-white rounded-3xl shadow-xl p-4 mb-4 relative overflow-hidden">
          {/* Streak Badge */}
          {streak >= 3 && (
            <div className="absolute top-0 right-0 bg-gradient-to-l from-orange-500 to-yellow-400 text-white px-4 py-1 rounded-bl-2xl font-black italic animate-pulse shadow-lg">
              {streak} COMBO! 🔥
            </div>
          )}
          
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-black text-orange-600">🎯 Practice</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="text-xl">⭐</span>
                <span className="text-xl font-bold text-orange-500">{score.correct}</span>
              </div>
              <div className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
                MAX: {maxStreak}
              </div>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex gap-2 mb-3">
            <select
              value={level}
              onChange={(e) => handleFilterChange(e.target.value, topic)}
              className="flex-1 px-3 py-2 rounded-xl border-2 border-orange-200 bg-orange-50 text-orange-700 font-bold focus:outline-none focus:border-orange-400 transition-all cursor-pointer hover:bg-orange-100"
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>{l === 'All' ? 'Any Level' : `${l} Level`}</option>
              ))}
            </select>
            <select
              value={topic}
              onChange={(e) => handleFilterChange(level, e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border-2 border-pink-200 bg-pink-50 text-pink-700 font-bold focus:outline-none focus:border-pink-400 transition-all cursor-pointer hover:bg-pink-100"
            >
              {TOPICS.map((t) => (
                <option key={t} value={t}>{t === 'All' ? 'Any Topic' : t}</option>
              ))}
            </select>
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 transition-all duration-500 rounded-full"
              style={{ width: `${score.total > 0 ? (score.correct / score.total) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode('image-to-word')}
            className={`flex-1 py-3 rounded-2xl font-bold text-lg transition-all shadow-lg ${
              mode === 'image-to-word'
                ? 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white transform scale-105'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            🖼️ Pick Word
          </button>
          <button
            onClick={() => setMode('word-to-image')}
            className={`flex-1 py-3 rounded-2xl font-bold text-lg transition-all shadow-lg ${
              mode === 'word-to-image'
                ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white transform scale-105'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            📝 Pick Image
          </button>
        </div>

        {/* Quiz Card */}
        <div className={`bg-white rounded-3xl shadow-2xl overflow-hidden mb-4 transition-all duration-300 ${
          showAnswer 
            ? (isCorrect ? 'ring-8 ring-green-400 scale-[1.02]' : 'ring-8 ring-red-400 scale-[0.98]') 
            : 'hover:shadow-orange-100'
        } ${isShaking ? 'animate-[shake_0.5s_ease-in-out]' : ''} ${showPulse ? 'animate-[pulse_0.4s_ease-in-out]' : ''}`}>
          {/* Image or Word Display */}
          {mode === 'image-to-word' ? (
            <div className="p-4">
              <div className="aspect-video rounded-2xl overflow-hidden bg-gray-100 mb-4">
                <img
                  src={currentWord.images[0]}
                  alt="What word is this?"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://placehold.co/400x256/22c55e/ffffff?text=${encodeURIComponent(currentWord.word)}`
                  }}
                />
              </div>
              <p className="text-center text-gray-600 font-medium mb-4">
                What English word matches this image?
              </p>
              <button
                onClick={() => playSound('What word is this?')}
                className="mx-auto block mb-3 px-4 py-2 bg-blue-100 rounded-full text-blue-600 text-sm"
              >
                🔊 Listen
              </button>
            </div>
          ) : (
            <div className="p-4">
              <div className="text-center mb-4">
                <button
                  onClick={() => playSound(currentWord.word)}
                  className="mb-2 px-3 py-1 bg-purple-100 rounded-full text-purple-600 text-sm"
                >
                  🔊 Listen
                </button>
                <h2 className="text-5xl font-black text-gray-800 mb-2">{currentWord.word}</h2>
                {currentWord.phonetic && (
                  <p className="text-xl text-gray-500">{currentWord.phonetic}</p>
                )}
              </div>
              <p className="text-center text-gray-600 font-medium">
                Which image matches this word?
              </p>
            </div>
          )}

          {/* Options */}
          <div className="p-4 pt-0">
            {mode === 'image-to-word' ? (
              <div className="grid grid-cols-2 gap-3">
                {options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    disabled={showAnswer}
                    className={`py-4 rounded-2xl font-bold text-xl transition-all ${
                      showAnswer
                        ? option === currentWord.word
                          ? 'bg-green-500 text-white'
                          : option === selectedAnswer
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-400'
                        : 'bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-cyan-50 text-gray-800 shadow-md'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {[currentWord, ...words.filter((w) => w.word !== currentWord.word).slice(0, 3)]
                  .sort(() => Math.random() - 0.5)
                  .map((word, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(word.word)}
                      disabled={showAnswer}
                      className={`rounded-2xl overflow-hidden transition-all shadow-md ${
                        showAnswer
                          ? word.word === currentWord.word
                            ? 'ring-4 ring-green-500'
                            : 'opacity-50'
                          : 'hover:ring-4 hover:ring-purple-300'
                      }`}
                    >
                      <img
                        src={word.images[0]}
                        alt=""
                        className="w-full h-28 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://placehold.co/400x112/22c55e/ffffff?text=${encodeURIComponent(word.word)}`
                        }}
                      />
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Feedback & Reinforcement */}
          {showAnswer && (
            <div className={`p-6 border-t-2 ${isCorrect ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
              <div className="text-center">
                <div className="mb-4">
                  <p className={`text-3xl font-black mb-1 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {isCorrect ? '✨ GREAT JOB! ✨' : '💔 OH NO! 💔'}
                  </p>
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
                    {isCorrect ? `${streak} Streak` : 'Keep practicing!'}
                  </p>
                </div>

                {/* Vocabulary Card Detail */}
                <div className="bg-white rounded-2xl p-4 shadow-inner mb-6 text-left border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-bold text-gray-800">{currentWord.word}</h3>
                    <button 
                      onClick={() => playSound(currentWord.word)}
                      className="p-2 bg-blue-50 text-blue-500 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      🔊
                    </button>
                  </div>
                  <p className="text-orange-600 font-bold mb-3">{currentWord.meaning}</p>
                  
                  {currentWord.exampleSentence && (
                    <div className="mb-3 p-3 bg-gray-50 rounded-xl">
                      <p className="text-sm font-bold text-gray-400 mb-1">EXAMPLE</p>
                      <p className="text-gray-700 italic">"{currentWord.exampleSentence}"</p>
                    </div>
                  )}

                  {currentWord.scenario && (
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <p className="text-sm font-bold text-blue-300 mb-1">MEMORY HOOK</p>
                      <p className="text-gray-700 leading-relaxed text-sm">{currentWord.scenario}</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => nextWord()}
                  className="w-full py-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-2xl font-black text-xl shadow-xl hover:translate-y-[-2px] active:translate-y-[1px] transition-all flex items-center justify-center gap-3"
                >
                  NEXT ADVENTURE 🚀
                </button>
              </div>
            </div>
          )}
        </div>


        <style jsx global>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            50% { transform: translateX(10px); }
            75% { transform: translateX(-10px); }
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
        `}</style>
      </div>
    </div>
  )
}
