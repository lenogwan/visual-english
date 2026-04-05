'use client'

import { useState, useEffect } from 'react'

interface UnsplashImageProps {
  word: string
  className?: string
  alt?: string
  fallbackUrl?: string
}

export default function UnsplashImage({ word, className = '', alt = '', fallbackUrl }: UnsplashImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    // If a fallbackUrl is provided, we skip the Unsplash search
    if (fallbackUrl || !word) {
      if (loading) setLoading(false);
      return;
    }
    
    // Check cache
    const cached = localStorage.getItem(`unsplash_${word}`)
    if (cached) {
      setImageUrl(cached)
      setLoading(false)
      return
    }

    setLoading(true)
    fetch(`/api/unsplash?q=${encodeURIComponent(word)}`)
      .then(res => res.json())
      .then(data => {
        if (data.url) {
          setImageUrl(data.url)
          localStorage.setItem(`unsplash_${word}`, data.url)
        } else {
          setError(true)
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [word, fallbackUrl])

  if (loading && !fallbackUrl) {
    return (
      <div className={`${className} bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center`}>
        <span className="text-slate-400 text-sm font-medium">Loading image...</span>
      </div>
    )
  }

  const src = fallbackUrl || imageUrl || `https://placehold.co/400x300/4f46e5/ffffff?text=${encodeURIComponent(word)}`

  return (
    <img
      src={src}
      alt={alt || word}
      className={className}
      onError={(e) => {
        (e.target as HTMLImageElement).src = `https://placehold.co/400x300/4f46e5/ffffff?text=${encodeURIComponent(word)}`
      }}
    />
  )
}
