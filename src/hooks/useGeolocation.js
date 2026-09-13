import { useState, useEffect } from 'react'

const MONTE_VERDE_CENTER = { lat: -22.8686, lng: -46.0422 }

export function useGeolocation() {
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocalização não suportada neste dispositivo.')
      return
    }
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLoading(false)
      },
      () => {
        setError('Não foi possível obter sua localização.')
        setLoading(false)
      },
      { timeout: 10000, maximumAge: 60000 }
    )
  }

  useEffect(() => { requestLocation() }, [])

  const getDistance = (lat, lng) => {
    const userLat = location?.lat ?? MONTE_VERDE_CENTER.lat
    const userLng = location?.lng ?? MONTE_VERDE_CENTER.lng
    const R = 6371
    const dLat = ((lat - userLat) * Math.PI) / 180
    const dLng = ((lng - userLng) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((userLat * Math.PI) / 180) *
      Math.cos((lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
    const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return d
  }

  const formatDistance = (km) => {
    if (km < 1) return `${Math.round(km * 1000)} m`
    return `${km.toFixed(1)} km`
  }

  return { location, error, loading, getDistance, formatDistance, defaultCenter: MONTE_VERDE_CENTER }
}
