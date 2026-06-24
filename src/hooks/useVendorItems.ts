import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useWedding } from '../context/WeddingContext'
import type { VendorItem, VendorItemInput } from '../types/db'

/** CRUD untuk vendor_items milik wedding aktif. */
export function useVendorItems() {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const [items, setItems] = useState<VendorItem[]>([])
  const [loading, setLoading] = useState(true)

  const weddingId = wedding?.id ?? null

  const fetchItems = useCallback(async (wid: string) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('vendor_items')
      .select('*')
      .eq('wedding_id', wid)
      .order('created_at', { ascending: true })
    if (error) console.error('[Blossom] vendor_items:', error.message)
    setItems((data as VendorItem[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (weddingId) fetchItems(weddingId)
    else {
      setItems([])
      setLoading(false)
    }
  }, [weddingId, fetchItems])

  const createItem = useCallback(
    async (input: VendorItemInput) => {
      if (!user || !weddingId) return { error: 'Belum siap.' }
      // KONVENSI: insert selalu menyertakan user_id & wedding_id.
      const { data, error } = await supabase
        .from('vendor_items')
        .insert({ ...input, user_id: user.id, wedding_id: weddingId })
        .select('*')
        .single()
      if (error) return { error: error.message }
      setItems((prev) => [...prev, data as VendorItem])
      return { error: null }
    },
    [user, weddingId],
  )

  const updateItem = useCallback(
    async (id: string, input: Partial<VendorItemInput>) => {
      if (!user) return { error: 'Belum login.' }
      const { data, error } = await supabase
        .from('vendor_items')
        .update(input)
        .eq('id', id)
        .eq('user_id', user.id)
        .select('*')
        .single()
      if (error) return { error: error.message }
      setItems((prev) => prev.map((it) => (it.id === id ? (data as VendorItem) : it)))
      return { error: null }
    },
    [user],
  )

  const removeItem = useCallback(
    async (id: string) => {
      if (!user) return { error: 'Belum login.' }
      const { error } = await supabase
        .from('vendor_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
      if (error) return { error: error.message }
      setItems((prev) => prev.filter((it) => it.id !== id))
      return { error: null }
    },
    [user],
  )

  return { items, loading, createItem, updateItem, removeItem, refresh: () => weddingId && fetchItems(weddingId) }
}
