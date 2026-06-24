import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useWedding } from '../context/WeddingContext'
import { uploadFile, removeFile } from '../lib/storage'
import type { VendorPhoto } from '../types/db'

export function useVendorPhotos(vendorItemId: string | null) {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const [photos, setPhotos] = useState<VendorPhoto[]>([])
  const [loading, setLoading] = useState(true)

  const weddingId = wedding?.id ?? null

  const fetchPhotos = useCallback(async (id: string) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('vendor_photos')
      .select('*')
      .eq('vendor_item_id', id)
      .order('created_at', { ascending: true })
    if (error) console.error('[Blossom] vendor_photos:', error.message)
    setPhotos((data as VendorPhoto[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (vendorItemId) fetchPhotos(vendorItemId)
    else {
      setPhotos([])
      setLoading(false)
    }
  }, [vendorItemId, fetchPhotos])

  const addPhoto = useCallback(
    async (file: File) => {
      if (!user || !weddingId || !vendorItemId) return { error: 'Belum siap.' }
      const { path, error } = await uploadFile(file, user.id, weddingId, 'vendor')
      if (error || !path) return { error: error ?? 'Upload gagal.' }
      const { data, error: insErr } = await supabase
        .from('vendor_photos')
        .insert({
          vendor_item_id: vendorItemId,
          wedding_id: weddingId,
          user_id: user.id,
          photo_url: path,
        })
        .select('*')
        .single()
      if (insErr) return { error: insErr.message }
      setPhotos((prev) => [...prev, data as VendorPhoto])
      return { error: null }
    },
    [user, weddingId, vendorItemId],
  )

  const removePhoto = useCallback(
    async (photo: VendorPhoto) => {
      if (!user) return
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id))
      await removeFile(photo.photo_url)
      const { error } = await supabase
        .from('vendor_photos')
        .delete()
        .eq('id', photo.id)
        .eq('user_id', user.id)
      if (error) console.error('[Blossom] hapus foto:', error.message)
    },
    [user],
  )

  return { photos, loading, addPhoto, removePhoto }
}
