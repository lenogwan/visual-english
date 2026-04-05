'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-indigo-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-xl">👁️</span>
            </div>
            <span className="font-extrabold text-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tight">
              Visual English
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-slate-600 hover:text-indigo-600 font-semibold transition-all hover:scale-105">
              {user ? 'Dashboard' : 'Home'}
            </Link>
            <Link href="/learn" className="text-slate-600 hover:text-indigo-600 font-semibold transition-all hover:scale-105">
              Learn
            </Link>
            {user && (
              <Link href="/quiz" className="text-slate-600 hover:text-indigo-600 font-semibold transition-all hover:scale-105">
                Quizzes
              </Link>
            )}
            <Link href="/practice" className="text-slate-600 hover:text-indigo-600 font-semibold transition-all hover:scale-105">
              Practice
            </Link>
            
            <div className="h-6 w-px bg-slate-200 mx-2" />

            {user ? (
              <div className="flex items-center gap-6">
                {(user.role === 'Admin' || user.role === 'admin' || user.role === 'Teacher' || user.role === 'teacher') && (
                  <Link href="/admin" className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-bold hover:bg-indigo-100 transition-colors">
                    Admin
                  </Link>
                )}
                <div className="flex flex-col items-end mr-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                    {user.role}
                  </span>
                  <span className="text-sm font-semibold text-slate-700 leading-tight">{user.email}</span>
                </div>
                <Link
                  href="/profile"
                  className="p-2 text-slate-500 hover:text-indigo-600 transition-colors"
                  title="Profile Settings"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all hover:-translate-y-0.5"
              >
                Login
              </Link>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

          {menuOpen && (
            <div className="md:hidden py-6 space-y-4 animate-fadeIn">
              <Link href="/" className="block px-4 py-2 text-slate-700 font-bold hover:text-indigo-600">
                {user ? 'Dashboard' : 'Home'}
              </Link>
              <Link href="/learn" className="block px-4 py-2 text-slate-700 font-bold hover:text-indigo-600">Learn</Link>
              {user && (
                <Link href="/quiz" className="block px-4 py-2 text-slate-700 font-bold hover:text-indigo-600">Quizzes</Link>
              )}
              <Link href="/practice" className="block px-4 py-2 text-slate-700 font-bold hover:text-indigo-600">Practice</Link>
              <div className="border-t border-slate-100 pt-4 px-4">
                {user ? (
                  <div className="flex flex-col gap-4">
                    <span className="text-sm font-semibold text-slate-600">{user.email}</span>
                    <button onClick={logout} className="text-red-500 font-bold">Logout</button>
                  </div>
                ) : (
                  <Link href="/login" className="block py-3 text-center bg-indigo-600 text-white rounded-xl font-bold">Login</Link>
                )}
              </div>
            </div>
          )}
      </div>
    </nav>
  )
}
