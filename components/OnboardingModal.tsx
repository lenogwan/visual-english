'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'

export default function OnboardingModal({ onComplete }: { onComplete: () => void }) {
  const { token } = useAuth()
  const [level, setLevel] = useState('A1')
  const [goal, setGoal] = useState(10)
  const [saving, setSaving] = useState(false)

  const saveSettings = async () => {
    setSaving(true)
    try {
      await fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ level, dailyGoal: goal, initialized: true })
      })
      onComplete()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xl flex items-center justify-center z-[100] p-6">
      <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl max-w-lg w-full text-center">
        <h2 className="text-4xl font-black text-slate-900 mb-6">Welcome to Visual English</h2>
        <p className="text-slate-500 mb-10">Let's set your learning baseline.</p>
        
        <div className="space-y-6 text-left mb-10">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400">Target Level</label>
            <select value={level} onChange={e => setLevel(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl font-bold">
              {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400">Daily Goal (Words)</label>
            <input type="number" value={goal} onChange={e => setGoal(Number(e.target.value))} className="w-full p-4 bg-slate-50 rounded-2xl font-bold" />
          </div>
        </div>

        <button onClick={saveSettings} disabled={saving} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700">
          {saving ? 'Saving...' : 'Start Learning'}
        </button>
      </div>
    </div>
  )
}
