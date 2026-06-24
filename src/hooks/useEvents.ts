import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useWedding } from '../context/WeddingContext'
import type { WeddingEvent, WeddingEventInput } from '../types/db'

/** CRUD untuk events milik wedding aktif. */
export function useEvents() {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const [events, setEvents] = useState<WeddingEvent[]>([])
  const [loading, setLoading] = useState(true)

  const weddingId = wedding?.id ?? null

  const fetchEvents = useCallback(async (wid: string) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('wedding_id', wid)
      .order('sort_order', { ascending: true })
      .order('event_date', { ascending: true })
    if (error) console.error('[Blossom] events:', error.message)
    setEvents((data as WeddingEvent[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (weddingId) fetchEvents(weddingId)
    else {
      setEvents([])
      setLoading(false)
    }
  }, [weddingId, fetchEvents])

  const createEvent = useCallback(
    async (input: WeddingEventInput) => {
      if (!user || !weddingId) return { error: 'Belum siap.' }
      const { data, error } = await supabase
        .from('events')
        .insert({ ...input, user_id: user.id, wedding_id: weddingId })
        .select('*')
        .single()
      if (error) return { error: error.message }
      setEvents((prev) => [...prev, data as WeddingEvent])
      return { error: null }
    },
    [user, weddingId],
  )

  const updateEvent = useCallback(
    async (id: string, input: Partial<WeddingEventInput>) => {
      if (!user) return { error: 'Belum login.' }
      const { data, error } = await supabase
        .from('events')
        .update(input)
        .eq('id', id)
        .eq('user_id', user.id)
        .select('*')
        .single()
      if (error) return { error: error.message }
      setEvents((prev) => prev.map((e) => (e.id === id ? (data as WeddingEvent) : e)))
      return { error: null }
    },
    [user],
  )

  const removeEvent = useCallback(
    async (id: string) => {
      if (!user) return { error: 'Belum login.' }
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
      if (error) return { error: error.message }
      setEvents((prev) => prev.filter((e) => e.id !== id))
      return { error: null }
    },
    [user],
  )

  return { events, loading, createEvent, updateEvent, removeEvent }
}
