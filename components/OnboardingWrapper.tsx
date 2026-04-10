'use client'

import { useAuth } from '@/lib/auth-context'
import { useState, useEffect } from 'react'
import OnboardingModal from './OnboardingModal'

export default function OnboardingWrapper({ children }: { children: React.ReactNode }) {
  const { user, refreshUser } = useAuth()
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
            setShow(true)
        }
    }
  }, [user])

  const handleComplete = async () => {
    setShow(false)
    await refreshUser() // Smooth sync
  }

  return (
    <>
      {show && <OnboardingModal onComplete={handleComplete} />}
      {children}
    </>
  )
}
