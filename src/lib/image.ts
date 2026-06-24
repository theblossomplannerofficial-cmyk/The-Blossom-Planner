// Kompres/resize gambar di client sebelum upload (hemat storage).
// Non-gambar (mis. PDF) dikembalikan apa adanya.

export interface PreparedFile {
  data: Blob
  ext: string
  contentType: string
}

function extOf(name: string, fallback = 'bin'): string {
  return name.includes('.') ? name.split('.').pop()!.toLowerCase() : fallback
}

export async function maybeCompressImage(
  file: File,
  maxSide = 1600,
  quality = 0.82,
): Promise<PreparedFile> {
  if (!file.type.startsWith('image/')) {
    return { data: file, ext: extOf(file.name), contentType: file.type || 'application/octet-stream' }
  }

  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
    const w = Math.round(bitmap.width * scale)
    const h = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('no ctx')
    // Latar putih agar PNG transparan tetap rapi saat dikonversi ke JPEG.
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)
    ctx.drawImage(bitmap, 0, 0, w, h)
    bitmap.close?.()

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', quality),
    )
    if (!blob) throw new Error('toBlob gagal')

    // Jika hasil malah lebih besar (gambar kecil), pakai file asli.
    if (blob.size >= file.size) {
      return { data: file, ext: extOf(file.name, 'jpg'), contentType: file.type }
    }
    return { data: blob, ext: 'jpg', contentType: 'image/jpeg' }
  } catch {
    return { data: file, ext: extOf(file.name, 'jpg'), contentType: file.type }
  }
}
