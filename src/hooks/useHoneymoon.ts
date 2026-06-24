import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useWedding } from '../context/WeddingContext'
import type { Honeymoon, HoneymoonInput } from '../types/db'

/** Satu baris honeymoon per wedding. */
export function useHoneymoon() {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const [honeymoon, setHoneymoon] = useState<Honeymoon | null>(null)
  const [loading, setLoading] = useState(true)

  const weddingId = wedding?.id ?? null

  const fetchHoneymoon = useCallback(async (wid: string) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('honeymoon')
      .select('*')
      .eq('wedding_id', wid)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()
    if (error) console.error('[Blossom] honeymoon:', error.message)
    setHoneymoon((data as Honeymoon | null) ?? null)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (weddingId) fetchHoneymoon(weddingId)
    else {
      setHoneymoon(null)
      setLoading(false)
    }
  }, [weddingId, fetchHoneymoon])

  /** Buat bila belum ada, atau update bila sudah. */
  const saveHoneymoon = useCallback(
    async (input: HoneymoonInput) => {
      if (!user || !weddingId) return { error: 'Belum siap.' }
      if (honeymoon) {
        const { data, error } = await supabase
          .from('honeymoon')
          .update(input)
          .eq('id', honeymoon.id)
          .eq('user_id', user.id)
          .select('*')
          .single()
        if (error) return { error: error.message }
        setHoneymoon(data as Honeymoon)
      } else {
        const { data, error } = await supabase
          .from('honeymoon')
          .insert({ ...input, user_id: user.id, wedding_id: weddingId })
          .select('*')
          .single()
        if (error) return { error: error.message }
        setHoneymoon(data as Honeymoon)
      }
      return { error: null }
    },
    [user, weddingId, honeymoon],
  )

  return { honeymoon, loading, saveHoneymoon }
}
