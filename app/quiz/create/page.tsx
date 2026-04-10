'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRequireStaff } from '@/lib/use-require-auth'
import { useRouter } from 'next/navigation'

interface Word {
  id: string
  word: string
  phonetic: string | null
  meaning: string | null
  images: string[]
  tags: string[]
  level: string
}

export default function CreateQuizPage() {
  const [words, setWords] = useState<Word[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [quizType, setQuizType] = useState('image-to-word')
  const [selectedWords, setSelectedWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [createdQuiz, setCreatedQuiz] = useState<{ id: string, entryPassword: string } | null>(null)
  const { user, token } = useAuth()
  const router = useRouter()

  useRequireStaff()

  useEffect(() => {
    fetchWords()
  }, [])

  async function fetchWords() {
    try {
      const res = await fetch('/api/words?limit=5000')
      const data = await res.json()
      setWords(data.words || [])
    } catch (error) {
      console.error('Failed to fetch words:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredWords = words.filter((w) => {
    const matchesSearch = w.word.toLowerCase().includes(search.toLowerCase())
    const matchesLevel = !levelFilter || w.level === levelFilter
    return matchesSearch && matchesLevel
  })

  const toggleWord = (word: Word) => {
    if (selectedWords.find((w) => w.id === word.id)) {
      setSelectedWords(selectedWords.filter((w) => w.id !== word.id))
    } else {
      setSelectedWords([...selectedWords, word])
    }
  }

  async function createQuiz() {
    if (!title.trim() || !selectedWords.length || !token) return

    setSaving(true)
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          type: quizType,
          wordIds: selectedWords.map((w) => w.id),
        }),
      })

      const data = await res.json()
      if (data.success) {
        setCreatedQuiz({ id: data.quiz.id, entryPassword: data.quiz.entryPassword })
      } else {
        alert(data.error || 'Failed to create quiz')
      }
    } catch (error) {
      console.error('Failed to create quiz:', error)
      alert('Failed to create quiz')
    } finally {
      setSaving(false)
    }
  }

  const levels = [...new Set(words.map((w) => w.level).filter(Boolean))]

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (createdQuiz) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-[2.5rem] p-12 shadow-2xl border border-indigo-100 max-w-lg w-full text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-indigo-600"></div>
          <div className="text-6xl mb-8">🎉</div>
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight uppercase">Quiz Ready</h2>
          <p className="text-slate-500 font-bold mb-10 text-sm uppercase tracking-widest leading-relaxed">
            Your simulation is live. Share this access code with your students:
          </p>
          
          <div className="bg-slate-50 rounded-[2.5rem] p-10 mb-10 border-2 border-dashed border-indigo-200">
            <span className="text-6xl font-black text-indigo-600 tracking-[0.3em] ml-4">{createdQuiz.entryPassword}</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => {
                navigator.clipboard.writeText(createdQuiz.entryPassword)
                alert('Access code copied to clipboard!')
              }}
              className="py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
            >
              Copy Access Code
            </button>
            <button
              onClick={() => router.push('/quiz')}
              className="py-5 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h1 className="text-5xl font-black text-slate-900 mb-3 tracking-tighter">Create Quiz</h1>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-[0.3em] ml-1">Architect a neural challenge</p>
          </div>
          <button
            onClick={() => router.push('/quiz')}
            className="px-6 py-3 bg-white text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest border border-slate-100 hover:bg-slate-50 transition-all"
          >
            ← BACK
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Settings */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 border border-indigo-50 shadow-xl relative overflow-hidden">
              <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                CORE SETTINGS
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Quiz Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Weekly Mastery"
                    className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl font-bold text-slate-700 focus:bg-white focus:border-indigo-200 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What should they focus on?"
                    rows={3}
                    className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl font-bold text-slate-700 focus:bg-white focus:border-indigo-200 transition-all outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Question Type</label>
                  <select
                    value={quizType}
                    onChange={(e) => setQuizType(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl font-bold text-slate-700 focus:bg-white focus:border-indigo-200 transition-all outline-none appearance-none"
                  >
                    <option value="image-to-word">Image → Word</option>
                    <option value="word-to-image">Word → Image</option>
                    <option value="fill-blank">Fill in Blanks</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Word Selection */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-10 border border-indigo-50 shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Select Words</h3>
                  <p className="text-indigo-600 font-bold text-[10px] uppercase tracking-widest mt-1">
                    {selectedWords.length} patterns chosen
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                    className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 focus:outline-none"
                  >
                    <option value="">All Levels</option>
                    {levels.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-8 relative">
                <input
                  type="text"
                  placeholder="FILTER BY KEYWORD..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-10 py-5 bg-slate-50 border border-transparent rounded-2xl font-black text-xs tracking-widest focus:bg-white focus:border-indigo-100 transition-all outline-none"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-black">🔍</span>
              </div>

              <div className="flex flex-wrap gap-2 max-h-96 overflow-y-auto p-4 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 custom-scrollbar">
                {filteredWords.map((word) => (
                  <button
                    key={word.id}
                    onClick={() => toggleWord(word)}
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      selectedWords.find((w) => w.id === word.id)
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                        : 'bg-white text-slate-400 border border-slate-100 hover:border-indigo-200 hover:text-indigo-600'
                    }`}
                  >
                    {word.word}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={createQuiz}
              disabled={saving || !title.trim() || !selectedWords.length}
              className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-indigo-600 disabled:opacity-50 transition-all active:scale-95"
            >
              {saving ? 'INITIATING...' : 'GENERATE QUIZ CODE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
