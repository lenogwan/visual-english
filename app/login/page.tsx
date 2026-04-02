'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  
  const { login, register, user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading || user) {
    return (
      <div className="min-h-screen relaxed-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="text-xl font-bold text-slate-400 tracking-widest animate-pulse uppercase">Already Logged In...</div>
        </div>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await register(email, password, name || undefined)
      }
      router.push('/')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen relaxed-bg flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/95 rounded-[2.5rem] p-10 border border-indigo-100 shadow-2xl">
        <h1 className="text-4xl font-black text-slate-900 text-center mb-10 tracking-tighter">
          {isLogin ? 'Login' : 'Join Visual English'}
        </h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-4 bg-slate-50 border-2 border-indigo-50 rounded-2xl focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-400/10 text-slate-900 placeholder-slate-300 transition-all font-medium"
                placeholder="How shall we call you?"
              />
            </div>
          )}
          
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-slate-50 border-2 border-indigo-50 rounded-2xl focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-400/10 text-slate-900 placeholder-slate-300 transition-all font-medium"
              placeholder="your@email.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-slate-50 border-2 border-indigo-50 rounded-2xl focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-400/10 text-slate-900 placeholder-slate-300 transition-all font-medium"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 px-6 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50 mt-4"
          >
            {submitting ? 'PROCESSING...' : isLogin ? 'LOGIN' : 'REGISTER'}
          </button>
        </form>
        
        <p className="mt-8 text-center text-xs font-black uppercase tracking-widest">
          <span className="text-slate-400">
            {isLogin ? "Don't have an account?" : 'Already registered?'}
          </span>{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            {isLogin ? 'REGISTER' : 'LOGIN'}
          </button>
        </p>
      </div>
    </div>
  )
}
