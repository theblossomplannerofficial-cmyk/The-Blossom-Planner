import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { SignedFileLink } from '../components/Signed'
import { useDocuments } from '../hooks/useDocuments'
import { DOC_OWNERS, ownerLabel } from '../lib/documents'
import type { WeddingDocument } from '../types/db'

function DocRow({
  doc,
  onToggle,
  onDue,
  onUpload,
  onRemove,
}: {
  doc: WeddingDocument
  onToggle: (done: boolean) => void
  onDue: (d: string) => void
  onUpload: (f: File) => Promise<void>
  onRemove: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const done = doc.status === 'sudah'

  return (
    <div className="card py-3">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={done}
          onChange={(e) => onToggle(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 rounded accent-burgundy-deep"
        />
        <div className="min-w-0 flex-1">
          <p className={`text-sm ${done ? 'text-ink/40 line-through' : 'text-ink'}`}>{doc.name}</p>
          <p className="text-xs text-ink/50">{ownerLabel(doc.owner)}</p>
        </div>
        <button onClick={onRemove} className="shrink-0 text-xs text-ink/30 hover:text-burgundy-mid">✕</button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 pl-8 text-xs">
        <label className="flex items-center gap-1 text-ink/50">
          Tenggat:
          <input
            type="date"
            value={doc.due_date ?? ''}
            onChange={(e) => onDue(e.target.value)}
            className="rounded-lg border border-ink/10 bg-white px-2 py-1"
          />
        </label>

        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0]
            if (!f) return
            setUploading(true)
            await onUpload(f)
            setUploading(false)
            if (fileRef.current) fileRef.current.value = ''
          }}
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="font-medium text-burgundy-mid"
        >
          {uploading ? 'Mengunggah…' : doc.file_url ? 'Ganti scan' : '+ Upload scan'}
        </button>
        {doc.file_url && <SignedFileLink path={doc.file_url} />}
      </div>
    </div>
  )
}

export default function DocumentsPage() {
  const { docs, loading, seedDefaults, addDoc, updateDoc, removeDoc, uploadScan } = useDocuments()
  const [seeding, setSeeding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newOwner, setNewOwner] = useState('bersama')

  const done = docs.filter((d) => d.status === 'sudah').length
  const total = docs.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <>
      <div className="mb-2">
        <Link to="/more" className="text-sm text-burgundy-mid">← Kembali</Link>
      </div>
      <PageHeader title="Dokumen KUA" subtitle="Checklist berkas & upload scan" />

      <div className="card">
        <div className="flex items-end justify-between">
          <span className="text-sm text-ink/60">Kelengkapan Dokumen</span>
          <span className="font-display text-3xl font-light text-burgundy-deep">{pct}%</span>
        </div>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-ink/10">
          <div className="h-full rounded-full bg-gold-warm transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-xs text-ink/50">{done} dari {total} dokumen siap</p>
      </div>

      {loading ? (
        <p className="card mt-4 text-sm text-ink/50">Memuat…</p>
      ) : total === 0 ? (
        <div className="card mt-4 space-y-3 text-center">
          <p className="text-sm text-ink/60">Belum ada dokumen. Buat daftar dokumen KUA standar.</p>
          <button
            className="btn-primary w-full"
            disabled={seeding}
            onClick={async () => {
              setSeeding(true)
              await seedDefaults()
              setSeeding(false)
            }}
          >
            {seeding ? 'Membuat…' : 'Buat Daftar Dokumen Standar'}
          </button>
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-2">
            {docs.map((d) => (
              <DocRow
                key={d.id}
                doc={d}
                onToggle={(done) => updateDoc(d.id, { status: done ? 'sudah' : 'belum' })}
                onDue={(due) => updateDoc(d.id, { due_date: due || null })}
                onUpload={(f) => uploadScan(d.id, f).then(() => {})}
                onRemove={() => confirm(`Hapus "${d.name}"?`) && removeDoc(d.id)}
              />
            ))}
          </div>

          {/* Tambah dokumen custom */}
          <div className="card mt-4 space-y-2">
            <p className="text-sm font-medium text-ink">Tambah dokumen lain</p>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="field-input py-2"
              placeholder="Nama dokumen"
            />
            <div className="flex gap-2">
              <select value={newOwner} onChange={(e) => setNewOwner(e.target.value)} className="field-input py-2">
                {DOC_OWNERS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
              </select>
              <button
                onClick={async () => {
                  if (!newName.trim()) return
                  await addDoc(newName, newOwner)
                  setNewName('')
                }}
                className="btn-primary px-4 py-2 text-sm"
              >
                Tambah
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
