'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react'
import { useAuth } from './auth-context'

interface FavoritesContextType {
  favorites: Set<string>
  isFavorited: (wordId: string) => boolean
  refresh: () => Promise<void>
  loading: boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  const fetchFavorites = useCallback(async () => {
    if (!token) {
      setFavorites(new Set())
      return
    }
    setLoading(true)
    try {
      // Fetch first page (up to 100 favorites)
      const res = await fetch('/api/favorites?limit=100', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      const ids = new Set<string>((data.favorites || []).map((w: any) => w.id))
      setFavorites(ids)
    } catch {
      setFavorites(new Set())
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  const isFavorited = useCallback((wordId: string) => favorites.has(wordId), [favorites])
  const refresh = useCallback(fetchFavorites, [fetchFavorites])

  const value = useMemo(() => ({ favorites, isFavorited, refresh, loading }), [favorites, isFavorited, refresh, loading])

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) throw new Error('useFavorites must be used within FavoritesProvider')
  return context
}
