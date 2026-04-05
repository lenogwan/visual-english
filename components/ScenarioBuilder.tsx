'use client'

import { useState } from 'react'
import { WordData } from '@/lib/data'

interface ScenarioBuilderProps {
  word: WordData
}

export default function ScenarioBuilder({ word }: ScenarioBuilderProps) {
  const [userSentence, setUserSentence] = useState('')
  const [savedScenarios, setSavedScenarios] = useState<string[]>([])
  const [showHint, setShowHint] = useState(false)

  const handleSave = () => {
    if (userSentence.trim()) {
      setSavedScenarios([...savedScenarios, userSentence])
      setUserSentence('')
    }
  }

  const hintSentences = [
    `Imagine ${word.word} happening right now in your room...`,
    `Think of the last time you experienced something related to ${word.word}`,
    `Picture a movie scene where ${word.word} is the main action`,
  ]

  return (
    <div className="max-w-2xl mx-auto glass-card bg-white/80 rounded-[2.5rem] shadow-xl p-10 border border-indigo-100">
      <div className="mb-8">
        <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">
          Scenario Builder: <span className="text-indigo-600">"{word.word}"</span>
        </h3>
        <p className="text-slate-500 font-medium">
          Forge a lasting mental link by describing a vivid, emotional memory.
        </p>
      </div>

      {/* Example scenario */}
      {word.meaning && (
        <div className="bg-indigo-50/50 rounded-2xl p-6 mb-6 border border-indigo-100 shadow-inner">
          <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-2">📖 Meaning</p>
          <p className="text-lg text-slate-700 font-medium italic">"{word.meaning}"</p>
        </div>
      )}

      <div className="bg-purple-50/50 rounded-2xl p-6 mb-8 border border-purple-100 shadow-inner">
        <p className="text-xs font-black text-purple-600 uppercase tracking-widest mb-2">Example</p>
        <p className="text-lg text-slate-700 font-medium italic">"{word.exampleSentence}"</p>
      </div>

      {/* Scenario Images Gallery */}
      {word.scenarioImages && word.scenarioImages.length > 0 && (
        <div className="mb-8">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">🎬 Scenario Context</p>
          <div className="grid grid-cols-2 gap-4">
            {word.scenarioImages.map((img, idx) => (
              <div key={idx} className="rounded-3xl overflow-hidden aspect-video border-2 border-indigo-50 shadow-sm relative group">
                <img
                  src={img}
                  alt={`Scenario ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emotional connection hint */}
      {word.emotionalConnection && (
        <div className="bg-indigo-50 border-l-4 border-indigo-400 p-6 mb-8 rounded-r-2xl">
          <p className="text-slate-700 font-medium leading-relaxed">
            <span className="text-xl mr-2">💡</span> {word.emotionalConnection}
          </p>
        </div>
      )}

      {/* Input area */}
      <div className="mb-6">
        <textarea
          value={userSentence}
          onChange={(e) => setUserSentence(e.target.value)}
          placeholder="Describe your mental scene... Make it vivid and personal."
          className="w-full p-6 bg-white border-2 border-indigo-100 rounded-[1.5rem] focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 text-slate-800 placeholder-slate-400 transition-all resize-none text-lg"
          rows={3}
        />
      </div>

      {/* Hint button */}
      <div className="mb-6">
        <button
          onClick={() => setShowHint(!showHint)}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-bold tracking-wide uppercase transition-colors"
        >
          {showHint ? 'Hide hints' : 'Need inspiration?'}
        </button>
        {showHint && (
          <ul className="mt-4 space-y-3">
            {hintSentences.map((hint, idx) => (
              <li key={idx} className="text-slate-500 italic flex items-center gap-3 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/50"></span>
                {hint}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={!userSentence.trim()}
        className="group relative w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:shadow-lg transition-all duration-300 disabled:opacity-30 disabled:hover:shadow-none disabled:cursor-not-allowed overflow-hidden"
      >
        <span className="relative z-10">SAVE SCENARIO</span>
        <div className="absolute inset-0 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </button>

      {/* Saved scenarios */}
      {savedScenarios.length > 0 && (
        <div className="mt-10">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">My Saved Scenarios</h4>
          <div className="space-y-4">
            {savedScenarios.map((scenario, idx) => (
              <div
                key={idx}
                className="bg-slate-50 rounded-2xl p-5 text-slate-700 border border-slate-200 font-medium shadow-inner"
              >
                {scenario}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
