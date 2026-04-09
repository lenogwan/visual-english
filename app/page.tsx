'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import Dashboard from '@/components/Dashboard'

export default function Home() {
  const { user } = useAuth()

  if (user) {
    return <Dashboard />
  }

  return (
    <div className="min-h-screen bg-[#fafbff] font-[family-name:var(--font-geist-sans)] selection:bg-indigo-100 selection:text-indigo-900 text-slate-900">
      
      {/* Hero Section - The "Hook" */}
      <section className="relative overflow-hidden pt-24 pb-40 px-4">
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-[11px] font-black tracking-[0.2em] uppercase mb-10 border border-slate-100 shadow-xl shadow-indigo-500/5 animate-fade-in text-indigo-600">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Neural Learning Protocol 2.0
          </div>
          
          <h1 className="text-7xl md:text-[10rem] font-black tracking-tighter leading-[0.85] mb-12">
            SHATTER THE<br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent italic px-4">BARRIER</span>
          </h1>
          
          <p className="text-xl md:text-3xl text-slate-400 mb-16 max-w-3xl mx-auto font-medium leading-tight">
            Stop translating in your head. Our AI-driven <span className="text-slate-900 underline decoration-indigo-500 underline-offset-4">Visual Triad</span> method hardwires English directly to your subconscious.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <Link
              href="/learn"
              className="group relative px-12 py-7 bg-slate-900 text-white rounded-[2.5rem] font-black text-2xl hover:scale-105 transition-all shadow-2xl active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative z-10">Start Transcending</span>
            </Link>
            <Link
              href="/search"
              className="px-12 py-7 bg-white text-slate-900 border-2 border-slate-100 rounded-[2.5rem] font-black text-2xl hover:bg-slate-50 transition-all active:scale-95 flex items-center gap-4"
            >
              <svg className="w-7 h-7 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              Quick Search
            </Link>
          </div>
        </div>

        {/* Dynamic Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none -z-10">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-100/50 rounded-full blur-[160px] animate-pulse" />
          <div className="absolute bottom-[0%] right-[-10%] w-[50%] h-[50%] bg-purple-100/50 rounded-full blur-[160px]" />
        </div>
      </section>

      {/* Stats - Social Proof */}
      <section className="max-w-6xl mx-auto px-4 -mt-20 mb-32">
        <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-12 border border-slate-100 shadow-2xl grid md:grid-cols-3 gap-12 text-center">
          <div>
            <p className="text-5xl font-black text-slate-900 mb-2">3.5x</p>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Faster Retention</p>
          </div>
          <div className="border-x border-slate-100">
            <p className="text-5xl font-black text-slate-900 mb-2">0</p>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Translation Overhead</p>
          </div>
          <div>
            <p className="text-5xl font-black text-slate-900 mb-2">100%</p>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Visual Logic</p>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-12 gap-6">
          <div className="md:col-span-8 group bg-white rounded-[3rem] p-12 shadow-xl border border-slate-100 hover:border-indigo-200 transition-all text-left">
            <div className="text-7xl mb-8">🧠</div>
            <h3 className="text-4xl font-black mb-4 tracking-tight text-left">Neuro-Visual Linking</h3>
            <p className="text-slate-500 text-xl leading-relaxed max-w-xl text-left">We replace text definitions with high-fidelity mental triggers. Your brain processes images 60,000x faster than text.</p>
          </div>
          <div className="md:col-span-4 bg-indigo-600 rounded-[3rem] p-12 shadow-xl text-white flex flex-col justify-end group hover:scale-[1.02] transition-transform text-left">
            <div className="text-5xl mb-10 group-hover:rotate-12 transition-transform">✨</div>
            <h3 className="text-3xl font-black mb-2 text-left">Pure Clarity</h3>
            <p className="text-indigo-100/80 leading-snug text-left">No more foggy meanings. See exactly what the word represents.</p>
          </div>
          <div className="md:col-span-4 bg-slate-900 rounded-[3rem] p-12 shadow-xl text-white text-left">
            <h3 className="text-3xl font-black mb-4 text-left">Reflex Mode</h3>
            <p className="text-slate-400 leading-relaxed text-left">Speak without hesitating. Thinking in images removes the "lookup" delay.</p>
          </div>
          <div className="md:col-span-8 bg-white rounded-[3rem] p-12 shadow-xl border border-slate-100 flex items-center justify-between group overflow-hidden text-left">
            <div className="max-w-sm text-left">
              <h3 className="text-4xl font-black mb-4 tracking-tight text-left">Contextual Cinema</h3>
              <p className="text-slate-500 text-lg text-left">Every word is a story. Every story is a permanent memory.</p>
            </div>
            <div className="text-9xl opacity-10 group-hover:scale-110 transition-transform group-hover:rotate-6">🎬</div>
          </div>
        </div>
      </section>

      {/* Re-designed Visualization Section */}
      <section className="max-w-6xl mx-auto px-4 py-32">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-12 text-left">
            <h2 className="text-6xl font-black tracking-tight text-slate-900 leading-none text-left">
              The Engine of <br/>
              <span className="text-indigo-600 underline decoration-indigo-100 underline-offset-[12px]">Intuition</span>
            </h2>
            <div className="space-y-10 text-left">
              {[
                { title: 'Bypass Logic', desc: 'Jump from Sound to Vision instantly. Skip the middle-man of translation.' },
                { title: 'Emotional Anchoring', desc: 'Our AI generates scenarios that trigger real feelings, making memory permanent.' },
                { title: 'Infinite Context', desc: 'Search any word and see it live through the eyes of the AI Neural Engine.' }
              ].map((step, i) => (
                <div key={i} className="flex gap-8 group text-left">
                  <div className="text-indigo-200 font-black text-5xl opacity-50 group-hover:opacity-100 transition-opacity">0{i+1}</div>
                  <div>
                    <h3 className="text-2xl font-black mb-2 text-slate-800 text-left">{step.title}</h3>
                    <p className="text-slate-500 text-lg text-left">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square bg-[#0a0c1a] rounded-[5rem] flex items-center justify-center overflow-hidden shadow-[0_0_80px_rgba(79,70,229,0.15)] relative group border-[16px] border-white ring-1 ring-slate-100">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.25)_0%,transparent_70%)]" />
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-56 h-56 relative">
                    <div className="absolute inset-0 border-4 border-dashed border-indigo-500/20 rounded-full animate-[spin_30s_linear_infinite]" />
                    <div className="absolute inset-6 border border-purple-500/10 rounded-full animate-[spin_20s_linear_infinite_reverse]" />
                    
                    <div className="absolute inset-14 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full blur-3xl opacity-40 animate-pulse" />
                    <div className="absolute inset-16 bg-white rounded-full shadow-[0_0_60px_rgba(168,85,247,0.4)] flex items-center justify-center">
                      <div className="text-7xl animate-bounce">🧠</div>
                    </div>
                    
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-2xl shadow-2xl flex items-center justify-center text-3xl animate-[float_4s_ease-in-out_infinite]">🖼️</div>
                    <div className="absolute top-1/2 -right-6 -translate-y-1/2 w-16 h-16 bg-white rounded-2xl shadow-2xl flex items-center justify-center text-3xl animate-[float_5s_ease-in-out_infinite_1s]">✨</div>
                    <div className="absolute bottom-0 -left-6 w-16 h-16 bg-white rounded-2xl shadow-2xl flex items-center justify-center text-3xl animate-[float_6s_ease-in-out_infinite_0.5s]">🎬</div>
                  </div>
                  
                  <div className="mt-16 text-center">
                    <p className="text-white font-black text-4xl tracking-tighter mb-2">Neural Visual Engine</p>
                    <p className="text-indigo-300/50 font-mono text-[10px] tracking-[0.3em] uppercase">Status: Core Active</p>
                  </div>
                </div>
            </div>

            <div className="absolute -bottom-10 -right-6 bg-white px-10 py-6 rounded-[2.5rem] shadow-2xl border border-indigo-50 z-20 flex items-center gap-5">
              <div className="flex -space-x-4">
                {[1,2,3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white">AI</div>
                ))}
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Real-time Rendering</p>
                <p className="text-xs font-bold text-indigo-600">Visual Triads Engaged</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-6xl mx-auto px-4 py-24 mb-24">
        <div className="relative overflow-hidden bg-[#0a0c1a] rounded-[5rem] p-16 md:p-32 text-center text-white shadow-2xl border border-white/5">
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.5),transparent)] animate-pulse" />
          </div>

          <h2 className="text-6xl md:text-[7rem] font-black mb-12 tracking-tighter leading-none relative z-10">
            OWN YOUR<br/>
            <span className="text-indigo-400 italic underline decoration-white/10 underline-offset-8">INSTINCT</span>
          </h2>
          
          <div className="relative z-10">
            <Link
              href="/learn"
              className="inline-block px-20 py-10 bg-white text-slate-950 rounded-[3rem] font-black text-3xl hover:scale-105 hover:bg-indigo-50 transition-all shadow-2xl active:scale-95"
            >
              Begin Evolution
            </Link>
            <p className="mt-10 text-slate-500 font-bold uppercase tracking-[0.4em] text-xs">No CC required • Instant Access</p>
          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(5deg); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
