import { useEffect, useState } from 'react'
import { getSignedUrl } from '../lib/storage'

/** Menampilkan gambar dari bucket privat via signed URL. */
export function SignedImage({ path, className }: { path: string; className?: string }) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    let active = true
    getSignedUrl(path).then((u) => active && setUrl(u))
    return () => {
      active = false
    }
  }, [path])

  if (!url) {
    return <div className={`animate-pulse bg-ink/10 ${className ?? ''}`} />
  }
  return <img src={url} alt="" className={className} loading="lazy" />
}

/** Tombol untuk membuka file (mis. PDF/scan) dari bucket privat. */
export function SignedFileLink({ path, label = 'Lihat scan' }: { path: string; label?: string }) {
  const [busy, setBusy] = useState(false)
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true)
        const url = await getSignedUrl(path)
        setBusy(false)
        if (url) window.open(url, '_blank', 'noopener,noreferrer')
      }}
      className="text-xs font-medium text-burgundy-mid underline underline-offset-2"
    >
      {busy ? 'Membuka…' : label}
    </button>
  )
}
