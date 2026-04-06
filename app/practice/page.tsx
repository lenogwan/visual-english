'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import SenseSwitcher from '@/components/SenseSwitcher'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Practice Arena',
  description: 'Test your visual English skills with image-to-word and word-to-image challenges.',
}

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

const LEVELS = ['ANY', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const TOPICS = ['ANY', 'General', 'food', 'travel', 'animals', 'technology', 'business', 'health', 'sports', 'education', 'entertainment']

export default function PracticePage() {
  const router = useRouter()
  const { user, token } = useAuth()

  // Parse user settings
  const userSettings = (() => {
    try {
      return user?.settings ? JSON.parse(user.settings) : {}
    } catch { return {} }
  })()
  const dailyGoal = user ? parseInt(userSettings.dailyGoal || '20') : 10
  const profileLevel = userSettings.englishLevel || ''

  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [lives, setLives] = useState(3)
  const [mode, setMode] = useState<'image-to-word' | 'word-to-image'>('image-to-word')
  const [options, setOptions] = useState<string[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [level, setLevel] = useState(profileLevel && LEVELS.includes(profileLevel) ? profileLevel : 'ANY')
  const [topic, setTopic] = useState('ANY')
  const [isShaking, setIsShaking] = useState(false)
  const [showPulse, setShowPulse] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [sessionSaved, setSessionSaved] = useState(false)
  
  // State for previewing different senses in results
  const [previewSense, setPreviewSense] = useState<Word | null>(null)

  const fetchWords = useCallback(async () => {
    setLoading(true)
    setScore({ correct: 0, total: 0 })
    setLives(3)
    setIsComplete(false)
    setSessionSaved(false)
    setCurrentIndex(0)
    try {
      const apiLevel = level === 'ANY' ? 'All' : level
      const apiTopic = topic === 'ANY' ? 'All' : topic
      const url = `/api/words?level=${apiLevel}&topic=${apiTopic}&limit=${dailyGoal}&excludeLearned=${user ? 'true' : 'false'}`
      
      const res = await fetch(url, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
      const data = await res.json()
      const allWords = data.words || []
      // Shuffle and limit to dailyGoal
      const shuffled = [...allWords].sort(() => 0.5 - Math.random()).slice(0, dailyGoal)
      setWords(shuffled)
      setCurrentIndex(0)
      setShowAnswer(false)
      setSelectedAnswer(null)
      setIsCorrect(null)
    } catch (err) {
      console.error('Failed to fetch words:', err)
    } finally {
      setLoading(false)
    }
  }, [level, topic, dailyGoal, user, token])

  useEffect(() => {
    fetchWords()
  }, [fetchWords])

  const currentWord = words[currentIndex]

  // Update previewSense when currentWord changes
  useEffect(() => {
    if (currentWord) setPreviewSense(currentWord)
  }, [currentWord])

  const handleSenseSelect = (sense: any) => {
    setPreviewSense({
      ...sense,
      tags: typeof sense.tags === 'string' ? JSON.parse(sense.tags) : sense.tags,
      examples: typeof sense.examples === 'string' ? JSON.parse(sense.examples) : (sense.examples || [])
    })
  }

  const generateOptions = useCallback((correctWord: Word) => {
    // Get all words except the current one (by word string to remove all senses of the correct word)
    const otherWordStrings = Array.from(new Set(
      words
        .filter((w) => w.word.toLowerCase() !== correctWord.word.toLowerCase())
        .map((w) => w.word)
    ))
    
    // Pick 3 random distractors
    const distractors = otherWordStrings
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)

    const allOptions = [...distractors, correctWord.word].sort(() => Math.random() - 0.5)
    setOptions(allOptions)
  }, [words])

  useEffect(() => {
    if (currentWord) {
      generateOptions(currentWord)
      setShowAnswer(false)
      setSelectedAnswer(null)
      setIsCorrect(null)
    }
  }, [currentWord, mode, generateOptions])

  const handleAnswer = (answer: string) => {
    if (showAnswer || !currentWord || lives <= 0) return
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
      setScore((prev) => ({
        correct: prev.correct + 1,
        total: prev.total + 1,
      }))
    } else {
      setStreak(0)
      setIsShaking(true)
      setLives(prev => Math.max(0, prev - 1))
      setTimeout(() => setIsShaking(false), 500)
      setScore((prev) => ({
        ...prev,
        total: prev.total + 1,
      }))
    }

    // Track mastery progress
    if (user && token) {
      fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          wordId: currentWord.id,
          masteryLevel: correct ? undefined : undefined // The API increments by default
        })
      }).catch(err => console.error('Failed to track progress:', err))
    }
  }

  const nextWord = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setIsComplete(true)
    }
  }

  // Handle game over by lives
  useEffect(() => {
    if (lives <= 0 && !isComplete) {
      setIsComplete(true)
    }
  }, [lives, isComplete])

  // Save practice session results
  useEffect(() => {
    if (isComplete && !sessionSaved && user && token && score.total > 0) {
      const saveSession = async () => {
        try {
          const res = await fetch('/api/practice/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              score: score.correct,
              total: score.total
            })
          })
          if (res.ok) setSessionSaved(true)
        } catch (err) {
          console.error('Failed to save practice session:', err)
        }
      }
      saveSession()
    }
  }, [isComplete, sessionSaved, user, token, score])

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="text-xl font-bold text-slate-500 tracking-wide animate-pulse uppercase">Loading Practice Arena...</div>
        </div>
      </div>
    )
  }

  if (words.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="glass-card rounded-[3rem] p-16 text-center shadow-xl max-w-xl border border-indigo-100 bg-white/60">
          <div className="text-8xl mb-8">📚</div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4 uppercase">No Words Found</h1>
          <p className="text-slate-500 mb-10 text-lg font-medium leading-relaxed">No words match your current filters. Adjust your level and topic or add more words to your library.</p>
          <button 
             onClick={() => { setLevel('ANY'); setTopic('ANY'); }}
             className="px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl font-bold text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all"
          >
            Reset Filters
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-12 overflow-x-hidden">
      <div className="max-w-4xl w-full relative z-10 animate-scaleIn">
        {isComplete ? (
          <div className="glass-card bg-white/90 rounded-[3rem] p-12 text-center border border-indigo-100 shadow-2xl animate-fadeIn">
            <div className="text-8xl mb-8">
              {lives <= 0 ? '🦾' : score.correct / score.total >= 0.8 ? '🏆' : '🔥'}
            </div>
            <h2 className="text-5xl font-black text-slate-900 mb-2 tracking-tight">
              {lives <= 0 ? 'Session Over!' : 'Excellent Work!'}
            </h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest mb-10">
              {lives <= 0 ? 'You ran out of lives.' : 'You have completed the daily challenge!'}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              <div className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100 shadow-sm">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Score</p>
                <p className="text-3xl font-black text-indigo-600 tracking-tighter">{score.correct}/{score.total}</p>
              </div>
              <div className="bg-purple-50 rounded-3xl p-6 border border-purple-100 shadow-sm">
                <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Accuracy</p>
                <p className="text-3xl font-black text-purple-600 tracking-tighter">
                  {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%
                </p>
              </div>
              <div className="bg-pink-50 rounded-3xl p-6 border border-pink-100 shadow-sm">
                <p className="text-[10px] font-black text-pink-400 uppercase tracking-widest mb-1">Max Streak</p>
                <p className="text-3xl font-black text-pink-600 tracking-tighter">{maxStreak}</p>
              </div>
              <div className="bg-green-50 rounded-3xl p-6 border border-green-100 shadow-sm">
                <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">Saved</p>
                <p className="text-3xl font-black text-green-600 tracking-tighter">{sessionSaved ? '✓' : '...'}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={fetchWords}
                className="px-10 py-5 bg-indigo-600 text-white rounded-3xl font-black text-xl hover:bg-indigo-700 transition-all shadow-xl hover:-translate-y-1 active:scale-95"
              >
                Practice Again
              </button>
              <Link
                href="/dashboard"
                className="px-10 py-5 bg-white text-slate-600 border border-slate-200 rounded-3xl font-black text-xl hover:bg-slate-50 transition-all shadow-xl hover:-translate-y-1 active:scale-95"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="glass-card bg-white/80 rounded-[3rem] p-8 mb-8 border border-indigo-100 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 bg-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600 shadow-md">
                    <span className="text-3xl">🎯</span>
                 </div>
                 <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none mb-1">Practice Arena</h1>
                    <div className="flex items-center gap-3">
                      <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Question {currentIndex + 1} of {words.length}</p>
                      <span className="text-slate-300">•</span>
                      <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 tracking-wider">
                        🎯 GOAL: {dailyGoal}
                      </span>
                      {profileLevel && (
                        <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-100 tracking-wider">
                          📊 {profileLevel}
                        </span>
                      )}
                    </div>
                 </div>
              </div>
              
              <div className="flex items-center gap-10">
                 <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Accuracy</p>
                    <p className="text-3xl font-black text-slate-800 tracking-widest">{score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%</p>
                 </div>
                 <div className="h-12 w-px bg-slate-200" />
                 <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Streak</p>
                    <div className="flex flex-col items-center">
                      <p className="text-3xl font-black text-pink-500 tracking-widest">{streak}</p>
                      {streak >= 3 && <span className="text-[8px] font-bold text-pink-500 animate-pulse tracking-tighter">ON FIRE!</span>}
                    </div>
                 </div>
                 <div className="h-12 w-px bg-slate-200" />
                 <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Lives</p>
                    <div className="flex gap-1.5 mt-1">
                      {[...Array(3)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-6 h-2 rounded-full transition-all duration-500 ${i < lives ? 'bg-red-500 shadow-sm' : 'bg-slate-200'}`}
                        />
                      ))}
                    </div>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="glass-card bg-white/60 p-3 rounded-3xl border border-indigo-100 flex gap-2">
                {LEVELS.map(l => (
                  <button
                    key={l}
                    onClick={() => setLevel(l)}
                    className={`flex-1 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all ${
                      level === l ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-white/50'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <div className="glass-card bg-white/60 p-3 rounded-3xl border border-indigo-100 overflow-x-auto custom-scrollbar">
                <div className="flex gap-2 min-w-max">
                  {TOPICS.map(t => (
                    <button
                      key={t}
                      onClick={() => setTopic(t)}
                      className={`px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all ${
                        topic === t ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-white/50'
                      }`}
                    >
                      {t === 'ANY' ? 'ALL TOPICS' : t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 mb-8 p-2 glass-card bg-white/80 rounded-[2rem] border border-indigo-100">
              <button
                onClick={() => setMode('image-to-word')}
                className={`flex-1 py-4 rounded-[1.5rem] font-bold text-sm uppercase tracking-wider transition-all ${
                  mode === 'image-to-word'
                    ? 'bg-indigo-600 text-white shadow-lg translate-y-[-2px]'
                    : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                Image → Word
              </button>
              <button
                onClick={() => setMode('word-to-image')}
                className={`flex-1 py-4 rounded-[1.5rem] font-bold text-sm uppercase tracking-wider transition-all ${
                  mode === 'word-to-image'
                    ? 'bg-indigo-600 text-white shadow-lg translate-y-[-2px]'
                    : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                Word → Image
              </button>
            </div>

            <div className={`glass-card bg-white/90 rounded-[4rem] p-8 md:p-12 border border-indigo-100 shadow-2xl relative transition-all duration-700 ${
              lives <= 0 ? 'opacity-50 grayscale pointer-events-none' : ''
            } ${isShaking ? 'animate-shake' : ''}`}>
              
              {mode === 'image-to-word' ? (
                <div className="space-y-10 animate-fadeIn">
                  <div className="aspect-[16/9] rounded-[3.5rem] overflow-hidden bg-slate-100 border-8 border-white group relative shadow-lg">
                    <img
                      src={currentWord.images[0]}
                      alt="Word Visual"
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none" />
                    <button
                      onClick={() => playSound("What is this?")}
                      className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-md border border-slate-200 text-indigo-600 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-white transition-all active:scale-95 shadow-md"
                    >
                      🔊 Listen
                    </button>
                  </div>

                  {!showAnswer ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {options.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleAnswer(option)}
                          className="py-8 rounded-[2.5rem] font-black text-2xl uppercase tracking-widest bg-white border-2 border-slate-100 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 hover:-translate-y-1 active:translate-y-0 transition-all shadow-md group overflow-hidden"
                        >
                          <span className="relative z-10">{option}</span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (
                 <div className="space-y-12 py-10 animate-fadeIn text-center">
                  <div>
                    <div className="inline-block px-5 py-2 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold mb-6 tracking-wider uppercase border border-indigo-200">
                       Find the matching image
                    </div>
                    <h2 className="text-8xl font-black text-slate-900 tracking-tighter mb-4">{currentWord.word}</h2>
                    <div className="flex justify-center items-center gap-6">
                       <p className="text-2xl text-slate-500 font-medium tracking-wide">{currentWord.phonetic}</p>
                       <button 
                        onClick={() => playSound(currentWord.word)} 
                        className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 hover:bg-indigo-100 transition-all active:scale-90 text-xl shadow-sm"
                       >
                        🔊
                       </button>
                    </div>
                  </div>

                  {!showAnswer ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                      {[currentWord, ...words.filter((w) => w.word !== currentWord.word).slice(0, 3)]
                        .sort(() => Math.random() - 0.5)
                        .map((word, idx) => (
                          <button
                             key={idx}
                             onClick={() => handleAnswer(word.word)}
                             className="aspect-square rounded-[3rem] overflow-hidden bg-slate-100 border-4 border-white shadow-xl hover:border-indigo-400 hover:scale-105 transition-all group relative"
                          >
                             <img
                               src={word.images[0]}
                               alt=""
                               className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-2"
                             />
                          </button>
                        ))}
                    </div>
                  ) : null}
                </div>
              )}

              {showAnswer && (
                 <div className="mt-12 pt-12 border-t border-slate-100 animate-fadeIn">
                   <div className="text-center mb-12">
                      <p className={`text-6xl font-black tracking-tighter mb-3 leading-none italic ${isCorrect ? 'text-emerald-500' : 'text-red-500'}`}>
                        {isCorrect ? 'Correct!' : 'Incorrect'}
                      </p>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                         {isCorrect ? 'Great job, keep it up!' : 'Review the meaning below'}
                      </p>
                   </div>

                   <div className="bg-white rounded-[3.5rem] p-10 border border-slate-100 mb-10 shadow-lg">
                      {/* Sense Switcher (Practice Discovery) */}
                      {previewSense && (
                        <SenseSwitcher 
                          word={previewSense.word} 
                          currentId={previewSense.id} 
                          onSenseSelect={handleSenseSelect} 
                          theme="indigo"
                        />
                      )}

                      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                        <div>
                           <h3 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">{previewSense?.word}</h3>
                           <div className="flex flex-wrap gap-2 mb-4">
                             {previewSense?.tags.map((t: string) => (
                               <span key={t} className="px-3 py-1 bg-indigo-50 rounded-full text-[10px] font-bold uppercase tracking-wider text-indigo-600 border border-indigo-100">{t}</span>
                             ))}
                           </div>
                           <p className="text-slate-600 font-medium text-2xl tracking-wide line-clamp-2">{previewSense?.meaning}</p>
                        </div>
                        <button 
                          onClick={() => playSound(previewSense?.word || '')}
                          className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center hover:bg-indigo-100 transition-all text-2xl shadow-sm cursor-pointer"
                        >
                          🔊
                        </button>
                      </div>
                      
                      <div className="grid gap-4">
                        {previewSense?.exampleSentence && (
                          <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 relative group overflow-hidden">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-400 group-hover:w-full transition-all duration-700 opacity-10" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 relative z-10">Example Sentence</p>
                            <p className="text-slate-700 italic font-medium text-lg relative z-10 leading-relaxed">"{previewSense.exampleSentence}"</p>
                          </div>
                        )}

                        {(previewSense?.scenario || previewSense?.emotionalConnection) && (
                          <div className="p-6 bg-indigo-50/50 rounded-[2rem] border border-indigo-100/50 relative group overflow-hidden">
                             <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-400 group-hover:w-full transition-all duration-700 opacity-10" />
                            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2 relative z-10">Context & Emotion</p>
                            <p className="text-slate-700 text-sm font-medium leading-relaxed relative z-10">
                              {previewSense.scenario || previewSense.emotionalConnection}
                            </p>
                          </div>
                        )}
                      </div>
                   </div>

                   <button
                      onClick={nextWord}
                      className="w-full py-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[3rem] font-bold text-2xl uppercase tracking-wider shadow-xl active:scale-95 transition-all"
                   >
                      Next Question
                   </button>
                 </div>
              )}
            </div>

            <div className="mt-12 px-10">
               <div className="flex justify-between items-end mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Practice Progress</span>
                  <span className="text-xs font-bold text-indigo-600 tracking-widest">{Math.round(((currentIndex + 1) / words.length) * 100)}%</span>
               </div>
               <div className="h-3 bg-white rounded-full overflow-hidden p-1 border border-slate-200 shadow-inner">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                    style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
                  />
               </div>
            </div>
          </>
        )}

        <style jsx global>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-15px); }
            50% { transform: translateX(15px); }
            75% { transform: translateX(-15px); }
          }
          .animate-fadeIn { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .animate-scaleIn { animation: scaleIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
        `}</style>
      </div>
    </div>
  )
}
