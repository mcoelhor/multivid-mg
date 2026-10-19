import { useState, useEffect, useMemo, useSyncExternalStore } from 'react'
import { supabase, BUSINESS_COLS } from '../lib/supabase'
import { statusHorario, pesoEstado } from '../lib/horario'
import { buscar } from '../lib/busca'

// A base inteira tem poucas centenas de lugares: carrega uma vez e filtra no celular.
// Assim a busca é instantânea e funciona mesmo com sinal fraco depois do primeiro acesso.
const CACHE_KEY = 'mv_lugares_v5'
let estado = { lista: lerCache(), carregando: true, erro: null }
const ouvintes = new Set()
let pedido = null

function lerCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null')?.lista || [] } catch { return [] }
}

function publicar(novo) {
  estado = { ...estado, ...novo }
  ouvintes.forEach(fn => fn())
}

export function carregarLugares(forcar = false) {
  if (pedido && !forcar) return pedido
  pedido = supabase
    .from('businesses')
    .select(`${BUSINESS_COLS}, business_images(image_url, display_order)`)
    .eq('status', 'active')
    .order('name')
    .then(({ data, error }) => {
      if (error) throw error
      const lista = (data || []).map(b => ({
        ...b,
        images: (b.business_images || []).sort((a, z) => a.display_order - z.display_order).map(i => i.image_url),
      }))
      try { localStorage.setItem(CACHE_KEY, JSON.stringify({ em: Date.now(), lista })) } catch { /* cheio */ }
      publicar({ lista, carregando: false, erro: null })
    })
    .catch(err => publicar({ carregando: false, erro: err?.message || 'Sem conexão' }))
  return pedido
}

function useLugares() {
  const snap = useSyncExternalStore(
    fn => { ouvintes.add(fn); return () => ouvintes.delete(fn) },
    () => estado,
  )
  useEffect(() => { carregarLugares() }, [])
  return snap
}

/** Recalcula "aberto agora" a cada minuto. */
export function useRelogio() {
  const [t, setT] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setT(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [])
  return t
}

const PLANO = { premium: 0, destaque: 1, free: 2 }
const planoVale = b => (b.plan_expires_at && new Date(b.plan_expires_at) <= new Date() ? 'free' : b.plan)

export function ordenar(lista) {
  return [...lista].sort((a, b) =>
    (planoVale(a) === 'premium' ? 0 : 1) - (planoVale(b) === 'premium' ? 0 : 1) ||
    pesoEstado(a.st) - pesoEstado(b.st) ||
    (PLANO[planoVale(a)] ?? 2) - (PLANO[planoVale(b)] ?? 2) ||
    a.name.localeCompare(b.name, 'pt-BR'))
}

export function useBusinesses({ category, subcategory, search, openNow, group } = {}) {
  const { lista, carregando, erro } = useLugares()
  const tick = useRelogio()

  const businesses = useMemo(() => {
    let r = lista.map(b => {
      const st = statusHorario(b)
      return { ...b, st, isOpen: st.estado === 'aberto' ? true : st.estado === 'fechado' ? false : null }
    })
    if (group) r = r.filter(b => b.urgency_group === group)
    if (category) r = r.filter(b => b.category === category)
    if (subcategory) r = r.filter(b => b.subcategory === subcategory)
    if (search) {
      r = buscar(r, search).sort((a, b) => b.score - a.score || pesoEstado(a.st) - pesoEstado(b.st) || a.name.localeCompare(b.name, 'pt-BR'))
    } else {
      r = ordenar(r)
    }
    if (openNow) r = r.filter(b => b.st.estado === 'aberto')
    return r
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lista, category, subcategory, search, openNow, group, tick])

  return { businesses, loading: carregando && !lista.length, error: lista.length ? null : erro, refetch: () => carregarLugares(true) }
}

export function useBusinessBySlug(slug) {
  const { businesses, loading } = useBusinesses()
  const business = businesses.find(b => b.slug === slug) || null
  return { business, loading: loading && !business }
}
