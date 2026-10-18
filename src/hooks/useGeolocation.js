import { useSyncExternalStore } from 'react'

// Localização compartilhada por todo o app. Só pede permissão quando a pessoa toca em "perto de mim".
let estado = { location: null, error: null, loading: false }
const ouvintes = new Set()
const publicar = novo => { estado = { ...estado, ...novo }; ouvintes.forEach(f => f()) }

export function pedirLocalizacao() {
  if (!navigator.geolocation) { publicar({ error: 'Seu celular não informou a localização.' }); return }
  publicar({ loading: true, error: null })
  navigator.geolocation.getCurrentPosition(
    p => publicar({ location: { lat: p.coords.latitude, lng: p.coords.longitude }, loading: false }),
    () => publicar({ error: 'Não foi possível obter sua localização.', loading: false }),
    { timeout: 10000, maximumAge: 120000 },
  )
}

function distanciaKm(aLat, aLng, bLat, bLng) {
  const R = 6371, r = Math.PI / 180
  const dLat = (bLat - aLat) * r, dLng = (bLng - aLng) * r
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * r) * Math.cos(bLat * r) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

export function useGeolocation() {
  const s = useSyncExternalStore(f => { ouvintes.add(f); return () => ouvintes.delete(f) }, () => estado)
  return {
    ...s,
    requestLocation: pedirLocalizacao,
    getDistance: (lat, lng) => (s.location ? distanciaKm(s.location.lat, s.location.lng, lat, lng) : null),
    formatDistance: km => (km == null ? '' : km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1).replace('.', ',')} km`),
  }
}
