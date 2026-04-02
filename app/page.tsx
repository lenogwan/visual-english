'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const { user } = useAuth()

  const handleVisualize = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
              Visual English
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-4">
            Stop translating. Start visualizing.
          </p>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Connect English directly to images and scenarios in your mind. No Chinese translation needed.
            Build native-speaker intuition through visual memory.
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleVisualize} className="max-w-xl mx-auto mb-8">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter a word to visualize..."
                className="flex-1 p-4 border-2 border-purple-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg"
              >
                Visualize
              </button>
            </div>
          </form>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/learn"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg"
            >
              Start Learning
            </Link>
            <Link
              href="/practice"
              className="px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors shadow-lg border-2 border-purple-200"
            >
              Practice
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
          The Visualization Method
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🔊</div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">Sound</h3>
            <p className="text-gray-600">
              Accurate pronunciation. Hear it, say it, own it.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">✍️</div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">Form</h3>
            <p className="text-gray-600">
              Word spelling. See it, write it, remember it.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🖼️</div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">Image</h3>
            <p className="text-gray-600">
              Mental picture. The key to instant reflex. No translation!
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
          How It Works
        </h2>
        <div className="space-y-8">
          <div className="flex items-start gap-6 bg-white rounded-2xl p-6 shadow-md">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-xl">
              1
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">See the Images</h3>
              <p className="text-gray-600">
                Search Google Images for each word. Build a rich visual impression instead of memorizing Chinese translations.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-6 bg-white rounded-2xl p-6 shadow-md">
            <div className="flex-shrink-0 w-12 h-12 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold text-xl">
              2
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Visualize the Scenario</h3>
              <p className="text-gray-600">
                For verbs and abstract words, create a vivid scene. Imagine the action happening. Feel the emotion.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-6 bg-white rounded-2xl p-6 shadow-md">
            <div className="flex-shrink-0 w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-xl">
              3
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Build Your Own Sentences</h3>
              <p className="text-gray-600">
                Create personal, emotional connections. The stronger the feeling, the deeper the memory.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to break the translation habit?</h2>
          <p className="text-lg opacity-90 mb-6">
            Start building direct English → Image connections today.
          </p>
          <Link
            href="/learn"
            className="inline-block px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors"
          >
            Start Now →
          </Link>
        </div>
      </section>
    </div>
  )
}
