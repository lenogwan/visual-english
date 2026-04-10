'use client'

import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string | null
  role: string // "Admin", "Teacher", "User"
  settings?: string | null // JSON string of preferences
  createdAt: string
  
  // Gamification Fields
  xp?: number
  level?: number
  streakCount?: number
  streakFreezes?: number
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  sessionExpired: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  clearSessionExpired: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionExpired, setSessionExpired] = useState(false)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken) {
      setToken(storedToken)
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch {
          localStorage.removeItem('user')
        }
      }
      fetchUser(storedToken)
    } else {
      setLoading(false)
    }
  }, [])

  async function fetchUser(t: string) {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${t}` },
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        if (data.user) {
          setUser(data.user)
          localStorage.setItem('user', JSON.stringify(data.user))
        }
      } else {
        // Token is invalid or expired
        if (user) setSessionExpired(true) // Only show toast if user was previously logged in
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setToken(null)
      }
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setToken(null)
    } finally {
      setLoading(false)
    }
  }

  function clearSessionExpired() {
    setSessionExpired(false)
  }

  function setSession(token: string, userData: User) {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    document.cookie = `token=${token}; path=/; max-age=${604800}; SameSite=Lax`
    setToken(token)
    setUser(userData)
  }

  async function refreshUser() {
    if (token) await fetchUser(token)
  }

  async function login(email: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json().catch(() => ({ error: 'Invalid server response' }))
    if (!res.ok) throw new Error(data.error || 'Login failed')

    if (!data.token || !data.user) throw new Error('Invalid server response')
    setSession(data.token, data.user)
  }

  async function register(email: string, password: string, name?: string) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })
    const data = await res.json().catch(() => ({ error: 'Invalid server response' }))
    if (!res.ok) throw new Error(data.error || 'Registration failed')

    if (!data.token || !data.user) throw new Error('Invalid server response')
    setSession(data.token, data.user)
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax'
    setSessionExpired(false)
    setToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({ user, token, loading, sessionExpired, login, register, logout, refreshUser, clearSessionExpired }),
    [user, token, loading, sessionExpired]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
