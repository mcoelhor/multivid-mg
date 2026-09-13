import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { MOCK_EVENTS } from '../data/mockData'

function parseDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function useEvents({ filter, category } = {}) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase.from('events').select('*').eq('active', true).order('date_start')
      if (category) query = query.eq('category', category)

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (filter === 'today') {
        const end = today.toISOString().slice(0, 10)
        query = query.gte('date_start', end).lte('date_start', end)
      } else if (filter === 'tomorrow') {
        const tom = new Date(today)
        tom.setDate(today.getDate() + 1)
        const d = tom.toISOString().slice(0, 10)
        query = query.gte('date_start', d).lte('date_start', d)
      } else if (filter === 'weekend') {
        const day = today.getDay()
        const diff = day <= 5 ? 5 - day : 0
        const sat = new Date(today); sat.setDate(today.getDate() + diff)
        const sun = new Date(sat); sun.setDate(sat.getDate() + 1)
        query = query.gte('date_start', sat.toISOString().slice(0, 10)).lte('date_start', sun.toISOString().slice(0, 10))
      } else if (filter === '7days') {
        const end = new Date(today); end.setDate(today.getDate() + 7)
        query = query.gte('date_start', today.toISOString().slice(0, 10)).lte('date_start', end.toISOString().slice(0, 10))
      } else if (filter === '30days') {
        const end = new Date(today); end.setDate(today.getDate() + 30)
        query = query.gte('date_start', today.toISOString().slice(0, 10)).lte('date_start', end.toISOString().slice(0, 10))
      } else {
        query = query.gte('date_start', today.toISOString().slice(0, 10))
      }

      const { data, error } = await query
      if (error) throw error
      setEvents(data || [])
    } catch {
      let results = MOCK_EVENTS.filter(e => e.active)
      const today = new Date(); today.setHours(0, 0, 0, 0)

      if (filter === 'today') {
        results = results.filter(e => parseDate(e.date_start).getTime() === today.getTime())
      } else if (filter === 'tomorrow') {
        const tom = new Date(today); tom.setDate(today.getDate() + 1)
        results = results.filter(e => parseDate(e.date_start).getTime() === tom.getTime())
      } else if (filter === 'weekend') {
        const day = today.getDay()
        const diff = day <= 5 ? 5 - day : 0
        const sat = new Date(today); sat.setDate(today.getDate() + diff)
        const sun = new Date(sat); sun.setDate(sat.getDate() + 1)
        results = results.filter(e => {
          const d = parseDate(e.date_start)
          return d >= sat && d <= sun
        })
      } else if (filter === '7days') {
        const end = new Date(today); end.setDate(today.getDate() + 7)
        results = results.filter(e => parseDate(e.date_start) >= today && parseDate(e.date_start) <= end)
      } else if (filter === '30days') {
        const end = new Date(today); end.setDate(today.getDate() + 30)
        results = results.filter(e => parseDate(e.date_start) >= today && parseDate(e.date_start) <= end)
      }

      if (category) results = results.filter(e => e.category === category)
      setEvents(results)
    } finally {
      setLoading(false)
    }
  }, [filter, category])

  useEffect(() => { fetch() }, [fetch])

  return { events, loading }
}
