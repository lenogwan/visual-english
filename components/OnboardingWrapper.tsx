'use client'

import { useAuth } from '@/lib/auth-context'
import { useState, useEffect } from 'react'
import OnboardingModal from './OnboardingModal'

export default function OnboardingWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (user && user.settings) {
        try {
            const settings = JSON.parse(user.settings)
            if (!settings.initialized) setShow(true)
        } catch { setShow(true) }
    } else if (user) {
        setShow(true)
    }
  }, [user])

  return (
    <>
      {show && <OnboardingModal onComplete={() => setShow(false)} />}
      {children}
    </>
  )
}
