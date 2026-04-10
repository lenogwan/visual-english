'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function EditQuizPage() {
  const { id } = useParams()
  const router = useRouter()
  const { token, user } = useAuth()
  
  const [quiz, setQuiz] = useState<any>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token || !id) return
    fetch(`/api/quiz/${id}`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data.error || !data.isAuthorized) {
          router.push('/quiz')
        } else {
          setQuiz(data)
          setTitle(data.title)
          setDescription(data.description || '')
        }
      })
      .finally(() => setLoading(false))
  }, [id, token, router])

  const handleSave = async () => {
    if (!token || !id) return
    setSaving(true)
    try {
      const res = await fetch(`/api/quiz/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description })
      })
      if (res.ok) {
        router.push(`/quiz/${id}`)
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to update quiz')
      }
    } catch (err) {
      console.error(err)
      alert('An error occurred while saving')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-6">
      <div className="max-w-xl mx-auto bg-white p-10 rounded-[2.5rem] shadow-xl border border-indigo-50">
        <h1 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">Edit Quiz</h1>
        
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Title</label>
            <input 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              rows={4}
              className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div className="flex gap-4 pt-6">
            <button 
              onClick={() => router.push(`/quiz/${id}`)}
              className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-200"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
