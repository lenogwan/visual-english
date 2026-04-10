'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'

export default function ProfilePage() {
  const { user, token } = useAuth()
  
  // Profile state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  
  // Settings state
  const [englishLevel, setEnglishLevel] = useState('B1')
  const [dailyGoal, setDailyGoal] = useState('20')
  const [nativeLanguage, setNativeLanguage] = useState('Traditional Chinese')

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // UI state
  const [loading, setLoading] = useState(true)
  const [savingSettings, setSavingSettings] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [passwordMessage, setPasswordMessage] = useState({ text: '', type: '' })

  useEffect(() => {
    async function loadProfile() {
      if (!token) return
      try {
        const res = await fetch('/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.user) {
          setName(data.user.name || '')
          setEmail(data.user.email || '')
          
          if (data.user.settings) {
            try {
              const parsedSettings = JSON.parse(data.user.settings)
              if (parsedSettings.englishLevel) setEnglishLevel(parsedSettings.englishLevel)
              if (parsedSettings.dailyGoal) setDailyGoal(Number(parsedSettings.dailyGoal))
              if (parsedSettings.nativeLanguage) setNativeLanguage(parsedSettings.nativeLanguage)
            } catch (e) {
              console.error('Failed to parse settings')
            }
          }
        }
      } catch (err) {
        console.error('Failed to load profile', err)
      } finally {
        setLoading(false)
      }
    }
    
    if (token) loadProfile()
  }, [token])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingSettings(true)
    setMessage({ text: '', type: '' })

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          settings: {
            englishLevel,
            dailyGoal,
            nativeLanguage,
            initialized: true
          }
        })
      })

      const data = await res.json()
      if (res.ok) {
        setMessage({ text: 'Profile and preferences updated successfully.', type: 'success' })
      } else {
        setMessage({ text: data.error || 'Failed to update profile.', type: 'error' })
      }
    } catch (err) {
      setMessage({ text: 'An unexpected error occurred.', type: 'error' })
    } finally {
      setSavingSettings(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMessage({ text: '', type: '' })

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ text: 'New passwords do not match.', type: 'error' })
      return
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ text: 'Password must be at least 6 characters.', type: 'error' })
      return
    }

    setSavingPassword(true)

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })

      const data = await res.json()
      if (res.ok) {
        setPasswordMessage({ text: 'Password changed successfully.', type: 'success' })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setPasswordMessage({ text: data.error || 'Failed to change password.', type: 'error' })
      }
    } catch (err) {
      setPasswordMessage({ text: 'An unexpected error occurred.', type: 'error' })
    } finally {
      setSavingPassword(false)
    }
  }

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-400/20 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-3xl mx-auto space-y-12">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Profile Settings</h1>
          <p className="text-slate-500 font-medium">Manage your personal information and learning preferences.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* General & Preferences */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white rounded-[2rem] p-8 border border-indigo-100 shadow-xl relative overflow-hidden">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="text-2xl">👤</span> Personal Details
              </h2>
              
              <form onSubmit={handleSaveProfile} className="space-y-6 relative z-10">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100/50 rounded-xl text-slate-400 font-medium cursor-not-allowed"
                  />
                  <p className="text-[10px] text-slate-400 italic">Email associated with your account cannot be changed.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-widest">Display Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full p-4 bg-white border-2 border-indigo-50 rounded-xl focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-400/10 text-slate-900 transition-all font-medium shadow-sm"
                  />
                </div>

                <hr className="border-indigo-50" />

                <h2 className="text-xl font-bold text-slate-800 pt-2 mb-6 flex items-center gap-2">
                  <span className="text-2xl">🎯</span> Learning Preferences
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-800 uppercase tracking-widest">Target English Level</label>
                    <select
                      value={englishLevel}
                      onChange={(e) => setEnglishLevel(e.target.value)}
                      className="w-full p-4 bg-white border-2 border-indigo-50 rounded-xl focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-400/10 text-slate-900 font-bold transition-all shadow-sm cursor-pointer appearance-none"
                    >
                      <option value="A1">A1 - Beginner</option>
                      <option value="A2">A2 - Elementary</option>
                      <option value="B1">B1 - Intermediate</option>
                      <option value="B2">B2 - Upper Intermediate</option>
                      <option value="C1">C1 - Advanced</option>
                      <option value="C2">C2 - Proficient</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-800 uppercase tracking-widest">Daily Word Goal</label>
                    <select
                      value={dailyGoal}
                      onChange={(e) => setDailyGoal(e.target.value)}
                      className="w-full p-4 bg-white border-2 border-indigo-50 rounded-xl focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-400/10 text-slate-900 font-bold transition-all shadow-sm cursor-pointer appearance-none"
                    >
                      <option value="10">10 Words / day (Casual)</option>
                      <option value="20">20 Words / day (Steady)</option>
                      <option value="50">50 Words / day (Intensive)</option>
                      <option value="100">100 Words / day (Extreme)</option>
                    </select>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-black text-slate-800 uppercase tracking-widest">Native / Helper Language</label>
                    <select
                      value={nativeLanguage}
                      onChange={(e) => setNativeLanguage(e.target.value)}
                      className="w-full p-4 bg-white border-2 border-indigo-50 rounded-xl focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-400/10 text-slate-900 font-bold transition-all shadow-sm cursor-pointer appearance-none"
                    >
                      <option value="Traditional Chinese">Traditional Chinese (繁體中文)</option>
                      <option value="English">English Only</option>
                      <option value="Spanish">Spanish (Español)</option>
                      <option value="Japanese">Japanese (日本語)</option>
                    </select>
                  </div>
                </div>

                {message.text && (
                  <div className={`p-4 rounded-xl text-sm font-bold ${
                    message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    {message.text}
                  </div>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                  >
                    {savingSettings ? 'Saving Profile...' : 'Save Profile & Settings'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Security */}
          <div className="md:col-span-1 border-t md:border-t-0 pt-8 md:pt-0">
            <div className="bg-white rounded-[2rem] p-8 border border-red-50 shadow-xl">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="text-2xl">🔐</span> Security
              </h2>

              <form onSubmit={handleChangePassword} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full p-4 bg-slate-50 border-2 border-indigo-50 rounded-xl focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-400/10 text-slate-900 transition-all shadow-sm text-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full p-4 bg-slate-50 border-2 border-indigo-50 rounded-xl focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-400/10 text-slate-900 transition-all shadow-sm text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Confirm New</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full p-4 bg-slate-50 border-2 border-indigo-50 rounded-xl focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-400/10 text-slate-900 transition-all shadow-sm text-sm"
                  />
                </div>

                {passwordMessage.text && (
                  <div className={`p-4 rounded-xl text-xs font-bold leading-relaxed ${
                    passwordMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {passwordMessage.text}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="w-full py-4 bg-slate-800 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
                  >
                    {savingPassword ? 'Updating...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
