'use client'

import { useState, useEffect } from 'react'

interface Sense {
  id: string
  word: string
  partOfSpeech: string
  meaning: string
  phonetic: string
  images: string[]
  tags: string[]
  scenario: string
  examples: string[]
  emotionalConnection: string
}

interface SenseSwitcherProps {
  word: string
  currentId: string
  onSenseSelect: (sense: Sense) => void
  theme?: 'indigo' | 'purple' | 'slate'
}

export default function SenseSwitcher({ word, currentId, onSenseSelect, theme = 'indigo' }: SenseSwitcherProps) {
  const [senses, setSenses] = useState<Sense[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!word) return
    setLoading(true)
    fetch(`/api/words/senses?word=${encodeURIComponent(word)}`)
      .then(r => r.json())
      .then(data => {
        if (data.senses && data.senses.length > 1) {
          setSenses(data.senses)
        } else {
          setSenses([])
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [word])

  if (loading || senses.length <= 1) return null

  const themeClasses = {
      indigo: 'bg-indigo-600 text-white',
      purple: 'bg-purple-600 text-white',
      slate: 'bg-slate-700 text-white',
  }

  return (
    <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100/30 rounded-xl">
      {senses.map((s) => (
        <button
          key={s.id}
          onClick={() => onSenseSelect(s)}
          className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
            currentId === s.id
              ? `${themeClasses[theme]} shadow-sm`
              : 'text-slate-400 hover:text-slate-500 hover:bg-white/40'
          }`}
        >
          {s.partOfSpeech || (s.tags?.[0]) || 'Sense'}
        </button>
      ))}
    </div>
  )
}
