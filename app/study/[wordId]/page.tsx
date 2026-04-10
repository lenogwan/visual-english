'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useRequireAuth } from '@/lib/use-require-auth'
import WordCard from '@/components/WordCard'
import Link from 'next/link'

export default function StudyPage() {
  const { wordId } = useParams()
  const { token } = useAuth()
  const { loading: authLoading } = useRequireAuth()
  const [word, setWord] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading || !token || !wordId) {
      if (!authLoading) setLoading(false)
      return
    }
    fetch(`/api/words/${wordId}`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(setWord)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [token, wordId, authLoading])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Study Room...</div>
  if (!word) return <div className="min-h-screen flex items-center justify-center">Word not found.</div>

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/library" className="text-indigo-600 font-bold mb-8 block hover:underline">← Back to Library</Link>
        <WordCard {...word} />
      </div>
    </div>
  )
}
