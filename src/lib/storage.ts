import { supabase } from './supabase'
import { maybeCompressImage } from './image'

// Bucket privat. Konvensi path: {user_id}/{wedding_id}/{subdir}/{file}
// RLS storage hanya mengizinkan folder milik user (folder pertama = auth.uid()).
const BUCKET = 'wedding-photos'

function randomId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export async function uploadFile(
  file: File,
  userId: string,
  weddingId: string,
  subdir = '',
): Promise<{ path: string | null; error: string | null }> {
  // Kompres/resize gambar dulu (PDF/non-gambar dilewati).
  const prepared = await maybeCompressImage(file)
  const folder = subdir ? `${subdir}/` : ''
  const path = `${userId}/${weddingId}/${folder}${randomId()}.${prepared.ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, prepared.data, {
    cacheControl: '3600',
    upsert: false,
    contentType: prepared.contentType,
  })
  if (error) return { path: null, error: error.message }
  return { path, error: null }
}

/** Buat signed URL untuk menampilkan file dari bucket privat. */
export async function getSignedUrl(path: string, expiresIn = 3600): Promise<string | null> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresIn)
  if (error) {
    console.error('[Blossom] signed url:', error.message)
    return null
  }
  return data?.signedUrl ?? null
}

export async function removeFile(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) console.error('[Blossom] hapus file:', error.message)
}
