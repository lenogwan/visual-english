'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'

export default function LibraryPage() {
  const { token } = useAuth()
  const [words, setWords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    fetch('/api/words/learned', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setWords(data.words || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black">Opening Library...</div>

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black mb-12">My Knowledge Library</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {words.map((w) => (
            <div key={w.id} className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-50 hover:shadow-lg transition-all text-center">
              <p className="text-xl font-black text-slate-900 mb-2">{w.word}</p>
              <div className="flex justify-center gap-1">
                 {[...Array(5)].map((_, i) => (
                    <div key={i} className={`h-1 w-4 rounded ${i < w.masteryLevel ? 'bg-indigo-500' : 'bg-slate-100'}`} />
                 ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
