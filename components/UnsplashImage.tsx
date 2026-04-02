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
    if (!word) return
    
    const cached = localStorage.getItem(`unsplash_${word}`)
    if (cached) {
      setImageUrl(cached)
      setLoading(false)
      return
    }

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
  }, [word])

  if (loading) {
    return (
      <div className={`${className} bg-gray-200 animate-pulse rounded-2xl flex items-center justify-center`}>
        <span className="text-gray-400 text-sm">Loading image...</span>
      </div>
    )
  }

  const src = imageUrl || fallbackUrl || `https://placehold.co/400x300/9333ea/ffffff?text=${encodeURIComponent(word)}`

  return (
    <img
      src={src}
      alt={alt || word}
      className={className}
      onError={(e) => {
        (e.target as HTMLImageElement).src = `https://placehold.co/400x300/9333ea/ffffff?text=${encodeURIComponent(word)}`
      }}
    />
  )
}
