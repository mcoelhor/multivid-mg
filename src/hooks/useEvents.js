import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function parseDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function iso(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function janela(filter) {
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
  const mais = n => { const d = new Date(hoje); d.setDate(hoje.getDate() + n); return d }
  if (filter === 'today') return [hoje, hoje]
  if (filter === 'tomorrow') return [mais(1), mais(1)]
  if (filter === 'weekend') {
    const dow = hoje.getDay() // 0 dom ... 6 sáb
    const sab = dow === 0 ? mais(-1) : mais(6 - dow)
    const dom = new Date(sab); dom.setDate(sab.getDate() + 1)
    return [dow === 0 ? hoje : sab, dom]
  }
  if (filter === '7days') return [hoje, mais(7)]
  if (filter === '30days') return [hoje, mais(30)]
  return [hoje, null]
}

const ajusta = e => ({ ...e, image: e.image_url || '', website: e.link || '' })

export function useEvents({ filter, category } = {}) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let vivo = true
    const [ini, fim] = janela(filter)
    let q = supabase.from('events').select('*').eq('active', true).gte('date_start', iso(ini)).order('date_start')
    if (fim) q = q.lte('date_start', iso(fim))
    if (category) q = q.eq('category', category)
    q.then(({ data }) => { if (vivo) setEvents((data || []).map(ajusta)) })
      .catch(() => { if (vivo) setEvents([]) })
      .finally(() => { if (vivo) setLoading(false) })
    return () => { vivo = false }
  }, [filter, category])

  return { events, loading }
}

export function useEvent(id) {
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!id) return
    supabase.from('events').select('*').eq('id', id).maybeSingle()
      .then(({ data }) => setEvent(data ? ajusta(data) : null))
      .catch(() => setEvent(null))
      .finally(() => setLoading(false))
  }, [id])
  return { event, loading }
}

export { parseDate }
