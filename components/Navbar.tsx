'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const userMenuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navLinks = [
    { name: user ? 'Dashboard' : 'Home', href: '/' },
    { name: 'Learn', href: '/learn' },
    { name: 'Quizzes', href: '/quiz', auth: true },
    { name: 'Practice', href: '/practice' },
    { name: 'Library', href: '/library' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-indigo-100/50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            </div>
            <span className="font-extrabold text-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tight">
              Visual English
            </span>
          </Link>

          {/* Center Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              if (link.auth && !user) return null
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`font-bold transition-all hover:scale-105 ${
                    isActive ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'
                  }`}
                >
                  {link.name}
                </Link>
              )
            })}
          </div>
          
          <div className="flex items-center gap-4">
            {/* Search Button moved to the right */}
            {user && (
              <Link 
                href="/search" 
                className={`p-2.5 rounded-xl transition-all hover:scale-110 flex items-center gap-2 group ${
                  pathname === '/search' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
                }`}
                title="Search Words"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="hidden lg:inline text-sm font-bold tracking-tight">Search</span>
              </Link>
            )}

            <div className="hidden md:block h-6 w-px bg-slate-200 mx-2" />

            {user ? (
              <div className="flex items-center gap-4 relative" ref={userMenuRef}>
                {(user.role === 'Admin' || user.role === 'admin' || user.role === 'Teacher' || user.role === 'teacher') && (
                  <Link href="/admin" className="hidden lg:block px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-bold hover:bg-indigo-100 transition-colors">
                    Admin
                  </Link>
                )}
                
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                      {user.role}
                    </span>
                    <span className="text-sm font-bold text-slate-700 leading-tight group-hover:text-indigo-600">
                      {user.name || user.email.split('@')[0]}
                    </span>
                  </div>
                  <div className="w-9 h-9 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-xs border border-indigo-200 shadow-sm group-hover:bg-indigo-200 transition-all">
                    {(user.name || user.email)[0].toUpperCase()}
                  </div>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-indigo-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-[60]">
                    <div className="px-4 py-2 border-b border-slate-50 mb-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Signed in as</p>
                      <p className="text-xs font-semibold text-slate-600 truncate">{user.email}</p>
                    </div>
                    {(user.role === 'Admin' || user.role === 'admin' || user.role === 'Teacher' || user.role === 'teacher') && (
                      <Link 
                        href="/admin" 
                        onClick={() => setUserMenuOpen(false)}
                        className="flex lg:hidden items-center gap-2 px-4 py-2 text-sm text-indigo-600 font-bold hover:bg-indigo-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Admin Panel
                      </Link>
                    )}
                    <Link 
                      href="/profile" 
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile Settings
                    </Link>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors text-left"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all hover:-translate-y-0.5"
              >
                Login
              </Link>
            )}
            
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 transition-colors text-slate-600 hover:text-indigo-600 border border-slate-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden py-6 space-y-4 animate-fadeIn border-t border-slate-50">
            {navLinks.map((link) => {
              if (link.auth && !user) return null
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl font-bold transition-all ${
                    isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </Link>
              )
            })}
            
            <div className="pt-4 px-4 border-t border-slate-50">
              {user ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold border border-indigo-200 shadow-sm">
                      {(user.name || user.email)[0].toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 tracking-tight">{user.name || user.email.split('@')[0]}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.role}</span>
                    </div>
                  </div>
                  <Link href="/profile" onClick={() => setMenuOpen(false)} className="px-4 py-2 text-slate-600 font-bold hover:text-indigo-600">Profile Settings</Link>
                  <button onClick={() => { setMenuOpen(false); logout(); }} className="px-4 py-2 text-red-500 font-bold text-left">Log out</button>
                </div>
              ) : (
                <Link href="/login" onClick={() => setMenuOpen(false)} className="block py-4 text-center bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200">Login</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
