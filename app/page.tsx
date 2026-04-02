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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative max-w-6xl mx-auto px-4 py-20 md:py-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-purple-400 rounded-full blur-[120px] animate-pulse-subtle" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-400 rounded-full blur-[150px] animate-pulse-subtle" style={{ animationDelay: '1s' }} />
        </div>

        <div className="text-center animate-fadeIn">
          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tight">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              Visual English
            </span>
          </h1>
          <p className="text-2xl md:text-3xl text-gray-600 font-medium mb-4">
            Stop translating. <span className="text-indigo-600">Start visualizing.</span>
          </p>
          <p className="text-gray-500 max-w-2xl mx-auto mb-12 text-lg leading-relaxed">
            Connect English directly to images and scenarios in your mind. 
            Build native-speaker intuition through visual memory—effortlessly.
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleVisualize} className="max-w-2xl mx-auto mb-12 transform hover:scale-[1.01] transition-transform">
            <div className="flex p-2 bg-white/50 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/50">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What word do you want to see?"
                className="flex-1 px-6 py-4 bg-transparent focus:outline-none text-xl font-medium text-gray-700 placeholder:text-gray-400"
              />
              <button
                type="submit"
                className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[1.6rem] font-bold text-xl hover:opacity-90 transition-all shadow-lg active:scale-95"
              >
                Visualize
              </button>
            </div>
          </form>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/learn"
              className="px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-3xl font-bold text-xl hover:shadow-2xl hover:shadow-indigo-200 transition-all hover:-translate-y-1"
            >
              Start Learning
            </Link>
            <Link
              href="/practice"
              className="px-10 py-5 bg-white/80 backdrop-blur-sm text-indigo-600 rounded-3xl font-bold text-xl hover:bg-white transition-all shadow-xl border border-indigo-50 hover:-translate-y-1"
            >
              Quick Practice
            </Link>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-10">
          {[
            { icon: '🔊', title: 'Perfect Sound', desc: 'Accurate pronunciation. Hear it, say it, own it with AI assistance.' },
            { icon: '✍️', title: 'Clear Form', desc: 'Word spelling integrated with usage context for long-term retention.' },
            { icon: '🖼️', title: 'Visual Reflex', desc: 'Direct brain-to-image connection. Eliminate the "Chinese hurdle" forever.' }
          ].map((feature, i) => (
            <div key={i} className="group bg-white/60 backdrop-blur-md rounded-[2.5rem] p-10 shadow-xl border border-white/40 hover:bg-white transition-all hover:scale-105 duration-300">
              <div className="text-6xl mb-8 group-hover:scale-110 transition-transform inline-block">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-black mb-4 text-gray-800">{feature.title}</h3>
              <p className="text-gray-500 text-lg leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Method Section */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-4xl md:text-5xl font-black text-center mb-16 tracking-tight text-gray-800">
          The <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">Visualization</span> Workflow
        </h2>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            {[
              { color: 'bg-indigo-500', title: 'See the Reality', desc: 'We skip translations. You see real-world images that define the word directly.' },
              { color: 'bg-purple-500', title: 'Feel the Scenario', desc: 'Verbs and abstract concepts come alive through AI-generated emotional stories.' },
              { color: 'bg-pink-500', title: 'Apply Naturally', desc: 'Build your own context. Your brain remembers feelings better than definitions.' }
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-8 group">
                <div className={`flex-shrink-0 w-16 h-16 ${step.color} text-white rounded-[1.5rem] flex items-center justify-center font-black text-2xl shadow-lg ring-8 ring-white group-hover:rotate-12 transition-transform`}>
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-2xl font-black mb-1 text-gray-800">{step.title}</h3>
                  <p className="text-gray-500 text-lg">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-indigo-100 to-purple-100 rounded-[3rem] flex items-center justify-center p-12 overflow-hidden shadow-inner">
               <div className="text-9xl animate-pulse-subtle">🔮</div>
               <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-3xl shadow-2xl border border-indigo-50">
               <p className="text-sm font-bold text-indigo-600">AI Powered Visualization →</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-[3rem] p-12 md:p-20 text-center text-white shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,1),transparent)]" />
          </div>
          
          <h2 className="text-4xl md:text-6xl font-black mb-8">Ready to think in English?</h2>
          <p className="text-xl md:text-2xl opacity-90 mb-12 max-w-2xl mx-auto font-medium">
            Join thousands of learners who have smashed the translation wall. 
            Your visual journey starts now.
          </p>
          <Link
            href="/learn"
            className="inline-block px-12 py-6 bg-white text-indigo-600 rounded-3xl font-black text-2xl hover:scale-105 transition-all shadow-2xl hover:shadow-white/20 active:scale-95"
          >
            Start Learning Now
          </Link>
        </div>
      </section>
    </div>
  )
}
