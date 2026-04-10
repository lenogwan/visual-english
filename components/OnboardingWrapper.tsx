'use client'

import { useAuth } from '@/lib/auth-context'
import { useState, useEffect } from 'react'
import OnboardingModal from './OnboardingModal'

export default function OnboardingWrapper({ children }: { children: React.ReactNode }) {
  const { user, refreshUser } = useAuth() // Assume refreshUser exists or we need to handle it
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (user && user.role === 'User') {
        try {
            const settings = user.settings ? JSON.parse(user.settings) : {}
            // Only show if NOT initialized
            if (!settings.initialized) {
                setShow(true)
            }
        } catch (e) {
            // If JSON parse fails, treat as not initialized
            setShow(true)
        }
    }
  }, [user])

  const handleComplete = async () => {
    setShow(false)
    if (refreshUser) await refreshUser() // Refresh local user context to pick up new settings
    window.location.reload() // Force UI sync
  }

  return (
    <>
      {show && <OnboardingModal onComplete={handleComplete} />}
      {children}
    </>
  )
}
