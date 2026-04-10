'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string | null
  role: string // "Admin", "Teacher", "User"
  settings?: string | null // JSON string of preferences
  createdAt: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

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
        setUser(data.user)
        localStorage.setItem('user', JSON.stringify(data.user))
      } else {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setToken(null)
      }
    } catch {
      localStorage.removeItem('token')
      setToken(null)
    } finally {
      setLoading(false)
    }
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
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    
    const token = data.token
    const userData = data.user
    
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    
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
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
