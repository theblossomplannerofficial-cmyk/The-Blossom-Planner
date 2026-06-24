import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useWedding } from '../context/WeddingContext'
import { DEFAULT_CHECKLIST } from '../lib/checklist'
import type { ChecklistItem } from '../types/db'

export function useChecklist() {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [loading, setLoading] = useState(true)

  const weddingId = wedding?.id ?? null

  const fetchItems = useCallback(async (wid: string) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('checklist_items')
      .select('*')
      .eq('wedding_id', wid)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
    if (error) console.error('[Blossom] checklist:', error.message)
    setItems((data as ChecklistItem[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (weddingId) fetchItems(weddingId)
    else {
      setItems([])
      setLoading(false)
    }
  }, [weddingId, fetchItems])

  const toggleDone = useCallback(
    async (id: string, isDone: boolean) => {
      if (!user) return
      // Optimistic update.
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, is_done: isDone } : it)))
      const { error } = await supabase
        .from('checklist_items')
        .update({ is_done: isDone })
        .eq('id', id)
        .eq('user_id', user.id)
      if (error) {
        console.error('[Blossom] toggle checklist:', error.message)
        setItems((prev) => prev.map((it) => (it.id === id ? { ...it, is_done: !isDone } : it)))
      }
    },
    [user],
  )

  const addItem = useCallback(
    async (phase: string, title: string) => {
      if (!user || !weddingId || !title.trim()) return { error: 'Tidak valid.' }
      const { data, error } = await supabase
        .from('checklist_items')
        .insert({ user_id: user.id, wedding_id: weddingId, phase, title: title.trim() })
        .select('*')
        .single()
      if (error) return { error: error.message }
      setItems((prev) => [...prev, data as ChecklistItem])
      return { error: null }
    },
    [user, weddingId],
  )

  const removeItem = useCallback(
    async (id: string) => {
      if (!user) return
      setItems((prev) => prev.filter((it) => it.id !== id))
      const { error } = await supabase
        .from('checklist_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
      if (error) console.error('[Blossom] hapus checklist:', error.message)
    },
    [user],
  )

  /** Seed checklist default (untuk wedding yang belum punya item). */
  const seedDefaults = useCallback(async () => {
    if (!user || !weddingId) return { error: 'Belum siap.' }
    const rows = DEFAULT_CHECKLIST.map((s, i) => ({
      user_id: user.id,
      wedding_id: weddingId,
      phase: s.phase,
      title: s.title,
      sort_order: i,
    }))
    const { data, error } = await supabase.from('checklist_items').insert(rows).select('*')
    if (error) return { error: error.message }
    setItems((prev) => [...prev, ...(data as ChecklistItem[])])
    return { error: null }
  }, [user, weddingId])

  return { items, loading, toggleDone, addItem, removeItem, seedDefaults }
}
