import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'multivid_favorites'

export function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : { businesses: [], events: [] }
    } catch {
      return { businesses: [], events: [] }
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  }, [favorites])

  const toggleBusiness = useCallback((id) => {
    setFavorites(prev => ({
      ...prev,
      businesses: prev.businesses.includes(id)
        ? prev.businesses.filter(fid => fid !== id)
        : [...prev.businesses, id],
    }))
  }, [])

  const toggleEvent = useCallback((id) => {
    setFavorites(prev => ({
      ...prev,
      events: prev.events.includes(id)
        ? prev.events.filter(fid => fid !== id)
        : [...prev.events, id],
    }))
  }, [])

  const isFavoriteBusiness = useCallback((id) => favorites.businesses.includes(id), [favorites])
  const isFavoriteEvent = useCallback((id) => favorites.events.includes(id), [favorites])

  return { favorites, toggleBusiness, toggleEvent, isFavoriteBusiness, isFavoriteEvent }
}
