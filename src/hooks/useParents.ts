import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useWedding } from '../context/WeddingContext'
import type { Parent, ParentInput } from '../types/db'

/** Data orang tua (parents): satu baris per side ('groom'|'bride'). */
export function useParents() {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const [parents, setParents] = useState<Parent[]>([])
  const [loading, setLoading] = useState(true)

  const weddingId = wedding?.id ?? null

  const fetchParents = useCallback(async (wid: string) => {
    setLoading(true)
    const { data, error } = await supabase.from('parents').select('*').eq('wedding_id', wid)
    if (error) console.error('[Blossom] parents:', error.message)
    setParents((data as Parent[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (weddingId) fetchParents(weddingId)
    else {
      setParents([])
      setLoading(false)
    }
  }, [weddingId, fetchParents])

  const bySide = useCallback(
    (side: string) => parents.find((p) => p.side === side) ?? null,
    [parents],
  )

  const saveParent = useCallback(
    async (side: string, input: ParentInput) => {
      if (!user || !weddingId) return { error: 'Belum siap.' }
      const existing = parents.find((p) => p.side === side)
      if (existing) {
        const { data, error } = await supabase
          .from('parents')
          .update(input)
          .eq('id', existing.id)
          .eq('user_id', user.id)
          .select('*')
          .single()
        if (error) return { error: error.message }
        setParents((prev) => prev.map((p) => (p.id === existing.id ? (data as Parent) : p)))
      } else {
        const { data, error } = await supabase
          .from('parents')
          .insert({ ...input, side, user_id: user.id, wedding_id: weddingId })
          .select('*')
          .single()
        if (error) return { error: error.message }
        setParents((prev) => [...prev, data as Parent])
      }
      return { error: null }
    },
    [user, weddingId, parents],
  )

  return { parents, loading, bySide, saveParent }
}
