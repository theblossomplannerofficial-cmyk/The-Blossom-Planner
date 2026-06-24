import { useRef, useState } from 'react'
import { useVendorPhotos } from '../hooks/useVendorPhotos'
import { SignedImage } from './Signed'

/** Galeri foto referensi untuk satu vendor item (tabel vendor_photos). */
export default function VendorPhotos({ vendorItemId }: { vendorItemId: string }) {
  const { photos, loading, addPhoto, removePhoto } = useVendorPhotos(vendorItemId)
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="rounded-2xl bg-white/60 p-3 ring-1 ring-ink/5">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink/50">Foto referensi</p>

      {loading ? (
        <p className="text-sm text-ink/40">Memuat…</p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((p) => (
            <div key={p.id} className="relative aspect-square overflow-hidden rounded-xl">
              <SignedImage path={p.photo_url} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(p)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink/60 text-xs text-cream"
                aria-label="Hapus foto"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-ink/15 text-ink/40"
          >
            {uploading ? '…' : '+ Foto'}
          </button>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-burgundy-deep">{error}</p>}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0]
          if (!f) return
          setError(null)
          setUploading(true)
          const { error } = await addPhoto(f)
          setUploading(false)
          if (error) setError(error)
          if (fileRef.current) fileRef.current.value = ''
        }}
      />
    </div>
  )
}
