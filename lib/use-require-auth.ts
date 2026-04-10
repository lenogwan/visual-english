'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './auth-context'

/**
 * Hook that redirects unauthenticated users to /login.
 * Shows loading state while auth is being verified.
 *
 * Usage in page components:
 *   const auth = useRequireAuth()
 *   if (!auth.user) return <LoadingSpinner />
 */
export function useRequireAuth() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  return { user, loading }
}

/**
 * Hook that redirects non-staff users to /.
 * Combines auth check with role check.
 */
export function useRequireStaff() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.push('/login')
    } else if (user.role !== 'Admin' && user.role !== 'Teacher') {
      router.push('/')
    }
  }, [loading, user, router])

  return { user, loading }
}
