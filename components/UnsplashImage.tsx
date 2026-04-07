'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'

interface UnsplashImageProps {
  word: string
  className?: string
  alt?: string
  fallbackUrl?: string
}

export default function UnsplashImage({ word, className = '', alt = '', fallbackUrl }: UnsplashImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  // next/image handles errors differently, so we might not need a separate error state here

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
          // Fallback if API returns no URL
          setImageUrl(null); // Explicitly set to null if no URL found
        }
      })
      .catch(() => {
        // Fallback if fetch fails
        setImageUrl(null); // Explicitly set to null on error
      })
      .finally(() => setLoading(false))
  }, [word, fallbackUrl])

  // Use a default placeholder image URL if imageUrl is null after loading
  const src = fallbackUrl || imageUrl || `https://placehold.co/400x300/4f46e5/ffffff?text=${encodeURIComponent(word)}`
  const isPlaceholder = !fallbackUrl && !imageUrl; // Check if it's using the placehold.co fallback

  return (
    <div className={`${className} relative ${loading ? 'bg-slate-100 animate-pulse rounded-2xl' : ''}`}>
      {loading && !fallbackUrl && (
        <span className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm font-medium">Loading image...</span>
      )}
      <Image
        src={src}
        alt={alt || word}
        layout="fill" // Use fill to make it responsive within the container
        objectFit="cover" // Or 'contain', 'fill', 'scale-down' depending on desired behavior
        className={`${className} ${loading && !fallbackUrl ? 'hidden' : ''}`} // Hide the image while loading placeholder text is shown
      // onError callback is handled by next/image's internal mechanisms. 
      // If you need custom error handling (e.g., showing a specific error image), 
      // you might need to use a combination of state and conditionally rendering.
      // For now, rely on the src fallback.
      />
      {/* Fallback image if neither fallbackUrl nor fetched imageUrl is available */}
      {isPlaceholder && !loading && (
        <img
          src={src} // Using standard img for placeholder as next/image might not handle placeholder src well
          alt={alt || word}
          className={className}
        // onError is less critical for a placeholder, but can be added if needed
        />
      )}
    </div>
  )
}
