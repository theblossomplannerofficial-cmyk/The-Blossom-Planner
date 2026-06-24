import { useState, type FormEvent } from 'react'
import type { PartyMember, PartyMemberInput } from '../types/db'

const PARTY_OPTIONS = [
  { value: 'bridesmaid', label: 'Bridesmaid' },
  { value: 'groomsmen', label: 'Groomsmen' },
]

const ROLE_OPTIONS = [
  { value: 'pendamping', label: 'Pendamping' },
  { value: 'koordinator_tamu', label: 'Koordinator Tamu' },
  { value: 'dokumentasi', label: 'Dokumentasi' },
  { value: 'lainnya', label: 'Lainnya' },
]

interface Props {
  defaultParty?: string
  initial?: PartyMember | null
  onSubmit: (input: PartyMemberInput) => Promise<{ error: string | null }>
  onDone: () => void
}

export default function PartyForm({ defaultParty, initial, onSubmit, onDone }: Props) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [party, setParty] = useState(initial?.party ?? defaultParty ?? 'bridesmaid')
  const [name, setName] = useState(initial?.name ?? '')
  const [contact, setContact] = useState(initial?.contact ?? '')
  const [size, setSize] = useState(initial?.clothing_size ?? '')
  const [role, setRole] = useState(initial?.role ?? 'pendamping')
  const [notes, setNotes] = useState(initial?.notes ?? '')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    const { error } = await onSubmit({
      party,
      name: name.trim(),
      contact: contact.trim() || null,
      clothing_size: size.trim() || null,
      role: role || null,
      notes: notes.trim() || null,
    })
    setBusy(false)
    if (error) setError(error)
    else onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-2">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Tim</label>
          <select value={party ?? ''} onChange={(e) => setParty(e.target.value)} className="field-input">
            {PARTY_OPTIONS.map((p) => (<option key={p.value} value={p.value}>{p.label}</option>))}
          </select>
        </div>
        <div>
          <label className="field-label">Peran</label>
          <select value={role ?? ''} onChange={(e) => setRole(e.target.value)} className="field-input">
            {ROLE_OPTIONS.map((r) => (<option key={r.value} value={r.value}>{r.label}</option>))}
          </select>
        </div>
      </div>

      <div>
        <label className="field-label">Nama</label>
        <input required value={name} onChange={(e) => setName(e.target.value)} className="field-input" placeholder="Nama lengkap" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Kontak</label>
          <input value={contact} onChange={(e) => setContact(e.target.value)} className="field-input" placeholder="08xxxx" />
        </div>
        <div>
          <label className="field-label">Ukuran baju</label>
          <input value={size} onChange={(e) => setSize(e.target.value)} className="field-input" placeholder="mis. M / L" />
        </div>
      </div>

      <div>
        <label className="field-label">Catatan</label>
        <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="field-input" />
      </div>

      {error && (
        <p className="rounded-xl bg-burgundy-deep/5 px-3 py-2 text-sm text-burgundy-deep">{error}</p>
      )}

      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? 'Menyimpan…' : initial ? 'Simpan Perubahan' : 'Tambah'}
      </button>
    </form>
  )
}
