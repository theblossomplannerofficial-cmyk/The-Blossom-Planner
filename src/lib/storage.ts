import { supabase } from './supabase'

// Bucket privat. Konvensi path: {user_id}/{wedding_id}/{subdir}/{file}
// RLS storage hanya mengizinkan folder milik user (folder pertama = auth.uid()).
const BUCKET = 'wedding-photos'

function randomName(file: File): string {
  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'bin'
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  return `${rand}.${ext}`
}

export async function uploadFile(
  file: File,
  userId: string,
  weddingId: string,
  subdir = '',
): Promise<{ path: string | null; error: string | null }> {
  const folder = subdir ? `${subdir}/` : ''
  const path = `${userId}/${weddingId}/${folder}${randomName(file)}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
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
