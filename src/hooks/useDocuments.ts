import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useWedding } from '../context/WeddingContext'
import { DEFAULT_DOCUMENTS } from '../lib/documents'
import { uploadFile, removeFile } from '../lib/storage'
import type { WeddingDocument } from '../types/db'

export function useDocuments() {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const [docs, setDocs] = useState<WeddingDocument[]>([])
  const [loading, setLoading] = useState(true)

  const weddingId = wedding?.id ?? null

  const fetchDocs = useCallback(async (wid: string) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('wedding_id', wid)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
    if (error) console.error('[Blossom] documents:', error.message)
    setDocs((data as WeddingDocument[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (weddingId) fetchDocs(weddingId)
    else {
      setDocs([])
      setLoading(false)
    }
  }, [weddingId, fetchDocs])

  const seedDefaults = useCallback(async () => {
    if (!user || !weddingId) return { error: 'Belum siap.' }
    const rows = DEFAULT_DOCUMENTS.map((d, i) => ({
      user_id: user.id,
      wedding_id: weddingId,
      name: d.name,
      owner: d.owner,
      status: 'belum',
      sort_order: i,
    }))
    const { data, error } = await supabase.from('documents').insert(rows).select('*')
    if (error) return { error: error.message }
    setDocs((prev) => [...prev, ...(data as WeddingDocument[])])
    return { error: null }
  }, [user, weddingId])

  const addDoc = useCallback(
    async (name: string, owner: string | null) => {
      if (!user || !weddingId || !name.trim()) return { error: 'Tidak valid.' }
      const { data, error } = await supabase
        .from('documents')
        .insert({ user_id: user.id, wedding_id: weddingId, name: name.trim(), owner, status: 'belum' })
        .select('*')
        .single()
      if (error) return { error: error.message }
      setDocs((prev) => [...prev, data as WeddingDocument])
      return { error: null }
    },
    [user, weddingId],
  )

  const updateDoc = useCallback(
    async (id: string, patch: Partial<Pick<WeddingDocument, 'status' | 'due_date' | 'owner' | 'name' | 'file_url'>>) => {
      if (!user) return
      // Optimistic
      setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)))
      const { error } = await supabase.from('documents').update(patch).eq('id', id).eq('user_id', user.id)
      if (error) console.error('[Blossom] update doc:', error.message)
    },
    [user],
  )

  const removeDoc = useCallback(
    async (id: string) => {
      if (!user) return
      const doc = docs.find((d) => d.id === id)
      setDocs((prev) => prev.filter((d) => d.id !== id))
      if (doc?.file_url) await removeFile(doc.file_url)
      const { error } = await supabase.from('documents').delete().eq('id', id).eq('user_id', user.id)
      if (error) console.error('[Blossom] hapus doc:', error.message)
    },
    [user, docs],
  )

  /** Upload scan dokumen ke storage, simpan path ke file_url. */
  const uploadScan = useCallback(
    async (id: string, file: File) => {
      if (!user || !weddingId) return { error: 'Belum siap.' }
      const { path, error } = await uploadFile(file, user.id, weddingId, 'documents')
      if (error || !path) return { error: error ?? 'Upload gagal.' }
      await updateDoc(id, { file_url: path })
      return { error: null }
    },
    [user, weddingId, updateDoc],
  )

  return { docs, loading, seedDefaults, addDoc, updateDoc, removeDoc, uploadScan }
}
