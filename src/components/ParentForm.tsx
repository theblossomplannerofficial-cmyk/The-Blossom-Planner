import { useState, type FormEvent } from 'react'
import type { Parent, ParentInput } from '../types/db'

interface Props {
  title: string
  initial: Parent | null
  onSave: (input: ParentInput) => Promise<{ error: string | null }>
}

export default function ParentForm({ title, initial, onSave }: Props) {
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [father, setFather] = useState(initial?.father_name ?? '')
  const [mother, setMother] = useState(initial?.mother_name ?? '')
  const [contact, setContact] = useState(initial?.contact ?? '')
  const [address, setAddress] = useState(initial?.address ?? '')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    const { error } = await onSave({
      father_name: father.trim() || null,
      mother_name: mother.trim() || null,
      contact: contact.trim() || null,
      address: address.trim() || null,
    })
    setBusy(false)
    if (error) setError(error)
    else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-3">
      <h3 className="font-display text-xl font-light text-burgundy-deep">{title}</h3>
      <div>
        <label className="field-label">Nama Ayah</label>
        <input value={father} onChange={(e) => setFather(e.target.value)} className="field-input" />
      </div>
      <div>
        <label className="field-label">Nama Ibu</label>
        <input value={mother} onChange={(e) => setMother(e.target.value)} className="field-input" />
      </div>
      <div>
        <label className="field-label">Kontak</label>
        <input value={contact} onChange={(e) => setContact(e.target.value)} className="field-input" />
      </div>
      <div>
        <label className="field-label">Alamat</label>
        <textarea rows={2} value={address} onChange={(e) => setAddress(e.target.value)} className="field-input" />
      </div>

      {error && <p className="rounded-xl bg-burgundy-deep/5 px-3 py-2 text-sm text-burgundy-deep">{error}</p>}

      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? 'Menyimpan…' : saved ? 'Tersimpan ✓' : 'Simpan'}
      </button>
    </form>
  )
}
