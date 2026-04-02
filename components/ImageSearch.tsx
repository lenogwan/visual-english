'use client'

import { useState } from 'react'
import { WordData } from '@/lib/data'

interface ImageSearchProps {
  word: WordData
}

export default function ImageSearch({ word }: ImageSearchProps) {
  const [activeTab, setActiveTab] = useState<'word' | 'scenario'>('word')

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-400 to-red-500 p-6 text-white">
          <h3 className="text-2xl font-bold mb-2">Visual Memory Builder</h3>
          <p className="opacity-90">
            Build direct English → Image connections, no Chinese translation needed
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('word')}
            className={`flex-1 py-4 font-medium transition-colors ${
              activeTab === 'word'
                ? 'text-orange-600 border-b-2 border-orange-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📸 {word.word} Images
          </button>
          <button
            onClick={() => setActiveTab('scenario')}
            className={`flex-1 py-4 font-medium transition-colors ${
              activeTab === 'scenario'
                ? 'text-orange-600 border-b-2 border-orange-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🎬 Scenario Scene
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {word.meaning && (
            <div className="mb-6 bg-purple-50 rounded-xl p-4">
              <h4 className="text-lg font-bold text-purple-800 mb-2">📖 Meaning</h4>
              <p className="text-gray-700">{word.meaning}</p>
            </div>
          )}

          {activeTab === 'word' ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-bold text-gray-800">{word.word}</h4>
                <a
                  href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(word.word)}&safe=active`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                >
                  Search More on Google Images
                </a>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {word.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
                  >
                    <img
                      src={img}
                      alt={`${word.word} visual ${idx + 1}`}
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://placehold.co/400x160/f97316/ffffff?text=${encodeURIComponent(word.word)}`
                      }}
                    />
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-gray-500 text-center">
                Look at these images and think: "{word.word}" → [the picture in your mind]
              </p>
            </div>
          ) : (
            <div>
              <h4 className="text-xl font-bold text-gray-800 mb-4">Scenario: {word.scenario}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {word.scenarioImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
                  >
                    <img
                      src={img}
                      alt={`scenario ${idx + 1}`}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://placehold.co/400x192/f97316/ffffff?text=Scenario`
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-gray-700">{word.scenario}</p>
              </div>
              <p className="mt-4 text-sm text-gray-500 text-center">
                Visualize this entire scene when you hear "{word.word}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
