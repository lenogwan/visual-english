'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-[family-name:var(--font-geist-sans)]">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center">
            <div className="inline-block px-6 py-2 bg-indigo-50 text-indigo-600 rounded-full text-sm font-bold tracking-widest uppercase mb-8 border border-indigo-100 shadow-sm animate-fade-in">
              Experience the Future of Language Learning
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-8 tracking-tighter leading-[0.9]">
              Think in <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent italic">English</span>,<br /> 
              Not Translation.
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
              Skip the dictionary. Connect your brain directly to visual reality with our AI-powered visual triad method.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <Link
                href="/learn"
                className="px-12 py-6 bg-slate-900 text-white rounded-[2rem] font-black text-2xl hover:scale-105 transition-all shadow-2xl hover:shadow-indigo-500/20 active:scale-95"
              >
                Get Started Free
              </Link>
              <Link
                href="/search"
                className="px-12 py-6 bg-white text-slate-900 border-2 border-slate-100 rounded-[2rem] font-black text-2xl hover:bg-slate-50 transition-all active:scale-95 flex items-center gap-3"
              >
                <span>🔍</span> Try Search
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none -z-10 opacity-40">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-purple-200 rounded-full blur-[120px]" />
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-10">
          {[
            { icon: '🎨', title: 'Mental Images', desc: 'Convert abstract words into vivid mental cinema that sticks forever.' },
            { icon: '✍️', title: 'Clear Form', desc: 'Word spelling integrated with usage context for long-term retention.' },
            { icon: '🖼️', title: 'Visual Reflex', desc: 'Direct brain-to-image connection. Eliminate the "Chinese hurdle" forever.' }
          ].map((feature, i) => (
            <div key={i} className="group bg-white/60 backdrop-blur-md rounded-[2.5rem] p-10 shadow-xl border border-white/40 hover:bg-white transition-all hover:scale-105 duration-300">
              <div className="text-6xl mb-8 group-hover:scale-110 transition-transform inline-block">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-black mb-4 text-slate-800">{feature.title}</h3>
              <p className="text-slate-500 text-lg leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Method Section - REDESIGNED VISUALIZATION CORE */}
      <section className="max-w-6xl mx-auto px-4 py-24">
        <h2 className="text-4xl md:text-5xl font-black text-center mb-20 tracking-tight text-slate-900">
          The <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">Visualization</span> Workflow
        </h2>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10 order-2 lg:order-1">
            {[
              { color: 'bg-indigo-500', title: 'See the Reality', desc: 'We skip translations. You see real-world images that define the word directly.' },
              { color: 'bg-purple-500', title: 'Feel the Scenario', desc: 'Verbs and abstract concepts come alive through AI-generated emotional stories.' },
              { color: 'bg-pink-500', title: 'Apply Naturally', desc: 'Build your own context. Your brain remembers feelings better than definitions.' }
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-8 group">
                <div className={`flex-shrink-0 w-14 h-14 ${step.color} text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg ring-8 ring-indigo-50 group-hover:rotate-12 transition-transform`}>
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-2xl font-black mb-2 text-slate-800 tracking-tight">{step.title}</h3>
                  <p className="text-slate-500 text-lg leading-snug">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="relative order-1 lg:order-2">
            <div className="aspect-square bg-slate-900 rounded-[4rem] flex items-center justify-center overflow-hidden shadow-2xl relative group border-[12px] border-white ring-1 ring-slate-200">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.3)_0%,transparent_70%)] animate-pulse" />
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-48 h-48 relative">
                    <div className="absolute inset-0 border-4 border-dashed border-indigo-400/30 rounded-full animate-[spin_20s_linear_infinite]" />
                    <div className="absolute inset-4 border-2 border-purple-400/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                    
                    <div className="absolute inset-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse" />
                    <div className="absolute inset-12 bg-white rounded-full shadow-[0_0_50px_rgba(168,85,247,0.5)] flex items-center justify-center">
                      <div className="text-6xl animate-bounce">🧠</div>
                    </div>
                    
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-2xl animate-[float_4s_ease-in-out_infinite]">🖼️</div>
                    <div className="absolute top-1/2 -right-4 -translate-y-1/2 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-2xl animate-[float_5s_ease-in-out_infinite_1s]">✨</div>
                    <div className="absolute bottom-0 -left-4 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-2xl animate-[float_6s_ease-in-out_infinite_0.5s]">🎬</div>
                  </div>
                  
                  <div className="mt-12 text-center">
                    <p className="text-white font-black text-3xl tracking-tighter mb-2">Neural Visual Engine</p>
                    <p className="text-indigo-200/60 font-mono text-xs tracking-widest uppercase">Processing Visual Triads...</p>
                  </div>
                </div>

                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
            </div>

            <div className="absolute -bottom-8 -right-4 bg-white px-8 py-5 rounded-[2rem] shadow-2xl border border-indigo-50 z-20 flex items-center gap-4 hover:scale-105 transition-transform cursor-default text-left">
              <div className="flex -space-x-3">
                {[1,2,3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600 shadow-sm">AI</div>
                ))}
              </div>
              <div>
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-0.5">Visualization</p>
                <p className="text-[10px] font-bold text-indigo-500">Live AI Rendering Enabled</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 mb-20">
        <div className="relative overflow-hidden bg-slate-900 rounded-[4rem] p-12 md:p-24 text-center text-white shadow-2xl border border-white/5">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.4),transparent)]" />
          </div>

          <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-tight relative z-10">
            Ready to smash the <br />
            <span className="text-indigo-400">translation wall?</span>
          </h2>
          <p className="text-xl md:text-2xl text-slate-400 mb-14 max-w-2xl mx-auto font-medium leading-relaxed relative z-10">
            Join thousands of learners who have transformed their English acquisition with visual logic.
          </p>
          <div className="relative z-10">
            <Link
              href="/learn"
              className="inline-block px-16 py-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[2.5rem] font-black text-2xl hover:scale-105 transition-all shadow-2xl shadow-indigo-500/40 active:scale-95"
            >
              Start Your Visual Journey
            </Link>
          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
