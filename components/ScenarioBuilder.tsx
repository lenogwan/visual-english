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
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-8">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          Build Your Scenario for "{word.word}"
        </h3>
        <p className="text-gray-600">
          Create a vivid mental image by writing a sentence with strong visual elements
        </p>
      </div>

      {/* Example scenario */}
      {word.meaning && (
        <div className="bg-blue-50 rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-blue-700 mb-1">📖 Meaning:</p>
          <p className="text-gray-800">{word.meaning}</p>
        </div>
      )}

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6">
        <p className="text-sm font-semibold text-purple-700 mb-1">Example:</p>
        <p className="text-gray-800 italic">"{word.exampleSentence}"</p>
      </div>

      {/* Emotional connection hint */}
      {word.emotionalConnection && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-sm text-yellow-800">
            💡 {word.emotionalConnection}
          </p>
        </div>
      )}

      {/* Input area */}
      <div className="mb-4">
        <textarea
          value={userSentence}
          onChange={(e) => setUserSentence(e.target.value)}
          placeholder="Write a vivid sentence using this word... Make it visual and emotional!"
          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none resize-none"
          rows={3}
        />
      </div>

      {/* Hint button */}
      <div className="mb-4">
        <button
          onClick={() => setShowHint(!showHint)}
          className="text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          {showHint ? 'Hide hints' : 'Need inspiration?'}
        </button>
        {showHint && (
          <ul className="mt-2 space-y-1">
            {hintSentences.map((hint, idx) => (
              <li key={idx} className="text-sm text-gray-600 italic">
                • {hint}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={!userSentence.trim()}
        className="w-full py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Save to My Scenarios
      </button>

      {/* Saved scenarios */}
      {savedScenarios.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold text-gray-800 mb-3">My Scenarios:</h4>
          <div className="space-y-2">
            {savedScenarios.map((scenario, idx) => (
              <div
                key={idx}
                className="bg-gray-50 rounded-lg p-3 text-gray-700"
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
