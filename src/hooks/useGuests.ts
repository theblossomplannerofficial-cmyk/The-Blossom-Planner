import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useWedding } from '../context/WeddingContext'
import type { Guest, GuestInput } from '../types/db'

export function useGuests() {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)

  const weddingId = wedding?.id ?? null

  const fetchGuests = useCallback(async (wid: string) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('wedding_id', wid)
      .order('created_at', { ascending: true })
    if (error) console.error('[Blossom] guests:', error.message)
    setGuests((data as Guest[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (weddingId) fetchGuests(weddingId)
    else {
      setGuests([])
      setLoading(false)
    }
  }, [weddingId, fetchGuests])

  const createGuest = useCallback(
    async (input: GuestInput) => {
      if (!user || !weddingId) return { error: 'Belum siap.' }
      const { data, error } = await supabase
        .from('guests')
        .insert({ ...input, user_id: user.id, wedding_id: weddingId })
        .select('*')
        .single()
      if (error) return { error: error.message }
      setGuests((prev) => [...prev, data as Guest])
      return { error: null }
    },
    [user, weddingId],
  )

  const updateGuest = useCallback(
    async (id: string, input: Partial<GuestInput>) => {
      if (!user) return { error: 'Belum login.' }
      const { data, error } = await supabase
        .from('guests')
        .update(input)
        .eq('id', id)
        .eq('user_id', user.id)
        .select('*')
        .single()
      if (error) return { error: error.message }
      setGuests((prev) => prev.map((g) => (g.id === id ? (data as Guest) : g)))
      return { error: null }
    },
    [user],
  )

  const removeGuest = useCallback(
    async (id: string) => {
      if (!user) return
      setGuests((prev) => prev.filter((g) => g.id !== id))
      const { error } = await supabase.from('guests').delete().eq('id', id).eq('user_id', user.id)
      if (error) console.error('[Blossom] hapus tamu:', error.message)
    },
    [user],
  )

  return { guests, loading, createGuest, updateGuest, removeGuest }
}
