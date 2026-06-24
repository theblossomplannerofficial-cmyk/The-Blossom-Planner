import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useWedding } from '../context/WeddingContext'
import type { RundownItem, RundownItemInput } from '../types/db'

/** CRUD + reorder rundown_items untuk satu event. */
export function useRundown(eventId: string | null) {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const [items, setItems] = useState<RundownItem[]>([])
  const [loading, setLoading] = useState(true)

  const weddingId = wedding?.id ?? null

  const fetchItems = useCallback(async (evId: string) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('rundown_items')
      .select('*')
      .eq('event_id', evId)
      .order('sort_order', { ascending: true })
      .order('time_start', { ascending: true })
    if (error) console.error('[Blossom] rundown:', error.message)
    setItems((data as RundownItem[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (eventId) fetchItems(eventId)
    else {
      setItems([])
      setLoading(false)
    }
  }, [eventId, fetchItems])

  const createItem = useCallback(
    async (input: Omit<RundownItemInput, 'sort_order' | 'event_id'>) => {
      if (!user || !weddingId || !eventId) return { error: 'Belum siap.' }
      const nextOrder = items.length
        ? Math.max(...items.map((i) => i.sort_order ?? 0)) + 1
        : 0
      const { data, error } = await supabase
        .from('rundown_items')
        .insert({
          ...input,
          event_id: eventId,
          user_id: user.id,
          wedding_id: weddingId,
          sort_order: nextOrder,
        })
        .select('*')
        .single()
      if (error) return { error: error.message }
      setItems((prev) => [...prev, data as RundownItem])
      return { error: null }
    },
    [user, weddingId, eventId, items],
  )

  const updateItem = useCallback(
    async (id: string, input: Partial<RundownItemInput>) => {
      if (!user) return { error: 'Belum login.' }
      const { data, error } = await supabase
        .from('rundown_items')
        .update(input)
        .eq('id', id)
        .eq('user_id', user.id)
        .select('*')
        .single()
      if (error) return { error: error.message }
      setItems((prev) => prev.map((it) => (it.id === id ? (data as RundownItem) : it)))
      return { error: null }
    },
    [user],
  )

  const removeItem = useCallback(
    async (id: string) => {
      if (!user) return
      setItems((prev) => prev.filter((it) => it.id !== id))
      const { error } = await supabase
        .from('rundown_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
      if (error) console.error('[Blossom] hapus rundown:', error.message)
    },
    [user],
  )

  /** Geser item ke atas/bawah dengan menukar sort_order tetangga. */
  const move = useCallback(
    async (id: string, dir: -1 | 1) => {
      if (!user) return
      const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order)
      const idx = sorted.findIndex((i) => i.id === id)
      const swapIdx = idx + dir
      if (idx < 0 || swapIdx < 0 || swapIdx >= sorted.length) return
      const a = sorted[idx]
      const b = sorted[swapIdx]
      // Tukar sort_order secara optimistic.
      setItems((prev) =>
        prev.map((it) =>
          it.id === a.id
            ? { ...it, sort_order: b.sort_order }
            : it.id === b.id
              ? { ...it, sort_order: a.sort_order }
              : it,
        ),
      )
      const [r1, r2] = await Promise.all([
        supabase.from('rundown_items').update({ sort_order: b.sort_order }).eq('id', a.id).eq('user_id', user.id),
        supabase.from('rundown_items').update({ sort_order: a.sort_order }).eq('id', b.id).eq('user_id', user.id),
      ])
      if (r1.error || r2.error) {
        console.error('[Blossom] reorder rundown gagal')
        if (eventId) fetchItems(eventId)
      }
    },
    [user, items, eventId, fetchItems],
  )

  return { items, loading, createItem, updateItem, removeItem, move }
}
