'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRequireAuth } from '@/lib/use-require-auth'
import { useToast } from '@/components/ui/Toast'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'

export default function ProfilePage() {
  const { user, token } = useAuth()
  const { loading: authLoading } = useRequireAuth()
  const { addToast } = useToast()
  
  // Profile state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  
  // Settings state
  const [englishLevel, setEnglishLevel] = useState('B1')
  const [dailyGoal, setDailyGoal] = useState<number>(20)
  const [nativeLanguage, setNativeLanguage] = useState('Traditional Chinese')

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // UI state
  const [loading, setLoading] = useState(true)
  const [savingSettings, setSavingSettings] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    async function loadProfile() {
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

    if (token) {
      loadProfile()
    } else if (!authLoading) {
      setLoading(false)
    }
  }, [token, authLoading])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingSettings(true)

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
        addToast('Profile and preferences updated successfully.', 'success')
      } else {
        addToast(data.error || 'Failed to update profile.', 'error')
      }
    } catch (err) {
      addToast('An unexpected error occurred.', 'error')
    } finally {
      setSavingSettings(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentPassword) {
      addToast('Please enter your current password.', 'error')
      return
    }

    if (newPassword !== confirmPassword) {
      addToast('New passwords do not match.', 'error')
      return
    }

    if (newPassword.length < 6) {
      addToast('Password must be at least 6 characters.', 'error')
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
        addToast('Password changed successfully.', 'success')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        addToast(data.error || 'Failed to change password.', 'error')
      }
    } catch (err) {
      addToast('An unexpected error occurred.', 'error')
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
            <Card>
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="text-2xl">👤</span> Personal Details
              </h2>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                <Input
                  label="Email Address"
                  value={email}
                  disabled
                  className="bg-slate-50 border-slate-100/50 text-slate-400 cursor-not-allowed"
                  helper="Email associated with your account cannot be changed."
                />

                <Input
                  label="Display Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                />

                <hr className="border-indigo-50" />

                <h2 className="text-xl font-bold text-slate-800 pt-2 mb-6 flex items-center gap-2">
                  <span className="text-2xl">🎯</span> Learning Preferences
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Target English Level</label>
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
                    <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Daily Word Goal</label>
                    <select
                      value={dailyGoal}
                      onChange={(e) => setDailyGoal(Number(e.target.value))}
                      className="w-full p-4 bg-white border-2 border-indigo-50 rounded-xl focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-400/10 text-slate-900 font-bold transition-all shadow-sm cursor-pointer appearance-none"
                    >
                      <option value="10">10 Words / day (Casual)</option>
                      <option value="20">20 Words / day (Steady)</option>
                      <option value="50">50 Words / day (Intensive)</option>
                      <option value="100">100 Words / day (Extreme)</option>
                    </select>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Native / Helper Language</label>
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

                <div className="pt-4">
                  <Button type="submit" isLoading={savingSettings} size="lg" className="w-full">
                    {savingSettings ? 'Saving Profile...' : 'Save Profile & Settings'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Security */}
          <div className="md:col-span-1 border-t md:border-t-0 pt-8 md:pt-0">
            <Card className="border-red-50">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="text-2xl">🔐</span> Security
              </h2>

              <form onSubmit={handleChangePassword} className="space-y-5">
                <Input
                  type="password"
                  label="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />

                <Input
                  type="password"
                  label="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />

                <Input
                  type="password"
                  label="Confirm New"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

                <div className="pt-2">
                  <Button type="submit" variant="secondary" isLoading={savingPassword} size="lg" className="w-full bg-slate-800 text-white hover:bg-slate-900 border-slate-800 hover:border-slate-900">
                    {savingPassword ? 'Updating...' : 'Change Password'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
