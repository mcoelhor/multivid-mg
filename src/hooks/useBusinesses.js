import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { MOCK_BUSINESSES } from '../data/mockData'

function isOpenNow(hours) {
  if (!hours) return null
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const now = new Date()
  const dayName = days[now.getDay()]
  const todayHours = hours[dayName]
  if (!todayHours || todayHours.closed) return false
  if (todayHours.open === '00:00' && todayHours.close === '23:59') return true
  const [openH, openM] = todayHours.open.split(':').map(Number)
  const [closeH, closeM] = todayHours.close.split(':').map(Number)
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const openMinutes = openH * 60 + openM
  const closeMinutes = closeH * 60 + closeM
  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes
}

export function useBusinesses({ category, subcategory, search, openNow, sortBy } = {}) {
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('businesses')
        .select('*, business_images(image_url, display_order)')
        .eq('status', 'active')

      if (category) query = query.eq('category', category)
      if (subcategory) query = query.eq('subcategory', subcategory)
      if (search) {
        query = query.or(
          `name.ilike.%${search}%,description.ilike.%${search}%,subcategory.ilike.%${search}%,tags.cs.{${search}}`
        )
      }

      const { data, error: dbError } = await query.order('featured', { ascending: false }).order('rating', { ascending: false })

      if (dbError) throw dbError

      let results = (data || []).map(b => ({
        ...b,
        images: b.business_images?.sort((a, z) => a.display_order - z.display_order).map(i => i.image_url) || [],
        isOpen: isOpenNow(b.hours),
      }))

      if (openNow) results = results.filter(b => b.isOpen === true)

      setBusinesses(results)
    } catch {
      // Fall back to mock data if Supabase is not seeded yet
      let results = MOCK_BUSINESSES.map(b => ({ ...b, isOpen: isOpenNow(b.hours) }))
      if (category) results = results.filter(b => b.category === category)
      if (subcategory) results = results.filter(b => b.subcategory === subcategory)
      if (search) {
        const q = search.toLowerCase()
        results = results.filter(b =>
          b.name.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          b.subcategory.toLowerCase().includes(q) ||
          b.tags?.some(t => t.toLowerCase().includes(q))
        )
      }
      if (openNow) results = results.filter(b => b.isOpen === true)
      setBusinesses(results)
    } finally {
      setLoading(false)
    }
  }, [category, subcategory, search, openNow, sortBy])

  useEffect(() => { fetch() }, [fetch])

  return { businesses, loading, error, refetch: fetch }
}

export function useBusinessBySlug(slug) {
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    const load = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('*, business_images(image_url, display_order)')
          .eq('slug', slug)
          .eq('status', 'active')
          .single()

        if (error) throw error
        const b = {
          ...data,
          images: data.business_images?.sort((a, z) => a.display_order - z.display_order).map(i => i.image_url) || [],
          isOpen: isOpenNow(data.hours),
        }
        setBusiness(b)
      } catch {
        const b = MOCK_BUSINESSES.find(b => b.slug === slug)
        if (b) setBusiness({ ...b, isOpen: isOpenNow(b.hours) })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  return { business, loading }
}
