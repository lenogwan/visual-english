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
      <div className="glass-card bg-white/80 rounded-[2rem] shadow-xl overflow-hidden border border-indigo-100">
        {/* Header */}
        <div className="bg-indigo-50 p-8 border-b border-indigo-100">
          <h3 className="text-3xl font-black mb-2 tracking-tight text-slate-900">Visual Memory Builder</h3>
          <p className="text-slate-500 font-medium">
            Build direct English → Image connections through visual immersion.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-white border-b border-indigo-100 px-4">
          <button
            onClick={() => setActiveTab('word')}
            className={`flex-1 py-5 font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === 'word'
                ? 'text-indigo-600 border-b-4 border-indigo-600 bg-indigo-50/50'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            📸 {word.word} Images
          </button>
          <button
            onClick={() => setActiveTab('scenario')}
            className={`flex-1 py-5 font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === 'scenario'
                ? 'text-indigo-600 border-b-4 border-indigo-600 bg-indigo-50/50'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            🎬 Scenario Scene
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {word.meaning && (
            <div className="mb-8 bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100 shadow-inner">
              <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-3">📖 Meaning</h4>
              <p className="text-xl text-slate-800 font-medium leading-relaxed">{word.meaning}</p>
            </div>
          )}

          {activeTab === 'word' ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-2xl font-black text-slate-900">{word.word}</h4>
                <a
                  href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(word.word)}&safe=active`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-md"
                >
                  Explore More Images
                </a>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {word.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="rounded-[1.5rem] overflow-hidden shadow-md border border-slate-200 hover:scale-[1.02] transition-all duration-300 aspect-square"
                  >
                    <img
                      src={img}
                      alt={`${word.word} visual ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://placehold.co/400x400/4f46e5/ffffff?text=${encodeURIComponent(word.word)}`
                      }}
                    />
                  </div>
                ))}
              </div>
              <p className="mt-8 text-sm text-slate-400 text-center font-medium">
                Internalize the visual: let "{word.word}" trigger these mental images
              </p>
            </div>
          ) : (
            <div>
              <h4 className="text-2xl font-black text-slate-900 mb-6">Scenario: {word.word}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {word.scenarioImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="rounded-3xl overflow-hidden shadow-md border border-slate-200 hover:scale-[1.02] transition-all duration-300 aspect-video"
                  >
                    <img
                      src={img}
                      alt={`scenario ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://placehold.co/400x192/4f46e5/ffffff?text=Scenario`
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 shadow-inner">
                <p className="text-slate-700 text-lg leading-relaxed font-medium">{word.scenario}</p>
              </div>
              <p className="mt-8 text-sm text-slate-400 text-center font-medium">
                Immerse yourself in this scene whenever you use "{word.word}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
