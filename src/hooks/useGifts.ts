import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useWedding } from '../context/WeddingContext'
import type { Gift, GiftInput } from '../types/db'

export function useGifts() {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const [gifts, setGifts] = useState<Gift[]>([])
  const [loading, setLoading] = useState(true)

  const weddingId = wedding?.id ?? null

  const fetchGifts = useCallback(async (wid: string) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('gifts')
      .select('*')
      .eq('wedding_id', wid)
      .order('created_at', { ascending: false })
    if (error) console.error('[Blossom] gifts:', error.message)
    setGifts((data as Gift[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (weddingId) fetchGifts(weddingId)
    else {
      setGifts([])
      setLoading(false)
    }
  }, [weddingId, fetchGifts])

  const createGift = useCallback(
    async (input: GiftInput) => {
      if (!user || !weddingId) return { error: 'Belum siap.' }
      const { data, error } = await supabase
        .from('gifts')
        .insert({ ...input, user_id: user.id, wedding_id: weddingId })
        .select('*')
        .single()
      if (error) return { error: error.message }
      setGifts((prev) => [data as Gift, ...prev])
      return { error: null }
    },
    [user, weddingId],
  )

  const updateGift = useCallback(
    async (id: string, input: Partial<GiftInput>) => {
      if (!user) return { error: 'Belum login.' }
      const { data, error } = await supabase
        .from('gifts')
        .update(input)
        .eq('id', id)
        .eq('user_id', user.id)
        .select('*')
        .single()
      if (error) return { error: error.message }
      setGifts((prev) => prev.map((g) => (g.id === id ? (data as Gift) : g)))
      return { error: null }
    },
    [user],
  )

  const removeGift = useCallback(
    async (id: string) => {
      if (!user) return
      setGifts((prev) => prev.filter((g) => g.id !== id))
      const { error } = await supabase.from('gifts').delete().eq('id', id).eq('user_id', user.id)
      if (error) console.error('[Blossom] hapus gift:', error.message)
    },
    [user],
  )

  return { gifts, loading, createGift, updateGift, removeGift }
}
