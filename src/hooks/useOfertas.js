import { useEffect, useMemo, useSyncExternalStore } from 'react'
import { supabase } from '../lib/supabase'

// Ofertas ativas de todos os lugares (poucas linhas): carregadas uma vez e compartilhadas.
let estado = { lista: [], carregado: false }
const ouvintes = new Set()
let promessa = null
function publicar(novo) { estado = novo; ouvintes.forEach(f => f()) }

export function carregarOfertas(forcar = false) {
  if (estado.carregado && !forcar) return Promise.resolve(estado.lista)
  if (promessa && !forcar) return promessa
  promessa = supabase.from('ofertas').select('id,business_id,titulo,regras,inicio,fim,usos')
    .eq('ativo', true).order('criado_em', { ascending: false })
    .then(({ data }) => { publicar({ lista: data || [], carregado: true }); return data || [] })
    .finally(() => { promessa = null })
  return promessa
}

export function useOfertas() {
  const s = useSyncExternalStore(f => { ouvintes.add(f); return () => ouvintes.delete(f) }, () => estado)
  useEffect(() => { carregarOfertas() }, [])
  const porLugar = useMemo(() => {
    const m = new Map()
    for (const o of s.lista) { if (!m.has(o.business_id)) m.set(o.business_id, []); m.get(o.business_id).push(o) }
    return m
  }, [s.lista])
  return { ofertas: s.lista, porLugar, carregado: s.carregado }
}

/** Marca o uso de uma oferta (balcão). Devolve o número de usos ou null se expirou. */
export async function usarOferta(id) {
  let visitor = 'anon'
  try { visitor = JSON.parse(localStorage.getItem('mv_vis') || 'null')?.id || 'anon' } catch { /* */ }
  const { data } = await supabase.rpc('usar_oferta', { p_oferta: id, p_visitor: visitor })
  return data
}

export const vigente = o => (!o.fim || new Date(o.fim) > new Date()) && new Date(o.inicio) <= new Date()
export const validade = o => (o.fim ? `até ${new Date(o.fim).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}` : 'sem prazo')
