import { useState, type FormEvent } from 'react'
import type { Reminder, ReminderInput } from '../types/db'

export const REMINDER_TYPES = [
  { value: 'payment', label: 'Pembayaran' },
  { value: 'ring', label: 'Cincin' },
  { value: 'guest_final', label: 'Finalisasi Tamu' },
  { value: 'catering_final', label: 'Finalisasi Catering' },
  { value: 'rundown_final', label: 'Finalisasi Rundown' },
  { value: 'custom', label: 'Lainnya' },
]

/** ISO -> nilai untuk <input type=datetime-local> (waktu lokal). */
function toLocalInput(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const off = d.getTimezoneOffset()
  const local = new Date(d.getTime() - off * 60_000)
  return local.toISOString().slice(0, 16)
}

interface Props {
  initial?: Reminder | null
  onSubmit: (input: ReminderInput) => Promise<{ error: string | null }>
  onDone: () => void
}

export default function ReminderForm({ initial, onSubmit, onDone }: Props) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState(initial?.title ?? '')
  const [remindAt, setRemindAt] = useState(toLocalInput(initial?.remind_at ?? null))
  const [type, setType] = useState(initial?.type ?? 'custom')
  const [notes, setNotes] = useState(initial?.notes ?? '')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    const { error } = await onSubmit({
      title: title.trim(),
      remind_at: remindAt ? new Date(remindAt).toISOString() : null,
      type: type || null,
      is_done: initial?.is_done ?? false,
      notes: notes.trim() || null,
    })
    setBusy(false)
    if (error) setError(error)
    else onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-2">
      <div>
        <label className="field-label">Judul pengingat</label>
        <input required value={title} onChange={(e) => setTitle(e.target.value)}
          className="field-input" placeholder="mis. Pelunasan catering" />
      </div>
      <div>
        <label className="field-label">Waktu</label>
        <input type="datetime-local" value={remindAt} onChange={(e) => setRemindAt(e.target.value)} className="field-input" />
      </div>
      <div>
        <label className="field-label">Jenis</label>
        <select value={type ?? ''} onChange={(e) => setType(e.target.value)} className="field-input">
          {REMINDER_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
        </select>
      </div>
      <div>
        <label className="field-label">Catatan</label>
        <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="field-input" />
      </div>

      {error && (
        <p className="rounded-xl bg-burgundy-deep/5 px-3 py-2 text-sm text-burgundy-deep">{error}</p>
      )}

      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? 'Menyimpan…' : initial ? 'Simpan Perubahan' : 'Tambah Pengingat'}
      </button>
    </form>
  )
}
