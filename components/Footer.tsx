'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 py-12 mt-auto">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-sm font-bold text-slate-400">
          © {new Date().getFullYear()} Visual English. All rights reserved.
        </p>
        <div className="flex items-center gap-8">
          <Link href="/search" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
            Search
          </Link>
          <Link href="/library" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
            Library
          </Link>
          <Link href="/practice" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
            Practice
          </Link>
        </div>
      </div>
    </footer>
  )
}
