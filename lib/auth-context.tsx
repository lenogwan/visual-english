'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string | null
  role: string // "Admin", "Teacher", "User"
  createdAt: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      setToken(storedToken)
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        // Invalid stored user, remove it
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  async function fetchUser(t: string) {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${t}` },
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        localStorage.removeItem('token')
        setToken(null)
      }
    } catch {
      localStorage.removeItem('token')
      setToken(null)
    } finally {
      setLoading(false)
    }
  }

  function setCookie(token: string) {
    document.cookie = `token=${token}; path=/; max-age=${604800}; SameSite=Lax; Secure=false`
  }

  function removeCookie() {
    document.cookie = 'token=; path=/; max-age=0; SameSite=Lax'
  }

  async function login(email: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    
    const token = data.token
    const userData = data.user
    
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    
    // Set cookie for middleware
    document.cookie = `token=${token}; path=/; max-age=${604800}; SameSite=Lax`
    
    setToken(token)
    setUser(userData)
  }

  async function register(email: string, password: string, name?: string) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    
    const token = data.token
    const userData = data.user
    
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    
    // Set cookie for middleware
    document.cookie = `token=${token}; path=/; max-age=${604800}; SameSite=Lax`
    
    setToken(token)
    setUser(userData)
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    document.cookie = 'token=; path=/; max-age=0'
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
