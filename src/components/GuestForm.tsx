import { useState, type FormEvent } from 'react'
import {
  GENDER_OPTIONS,
  GUEST_CATEGORIES,
  INVITE_TYPES,
  RSVP_STATUS,
} from '../lib/guests'
import type { Guest, GuestInput, WeddingEvent } from '../types/db'

interface Props {
  events: WeddingEvent[]
  initial?: Guest | null
  onSubmit: (input: GuestInput) => Promise<{ error: string | null }>
  onDone: () => void
}

export default function GuestForm({ events, initial, onSubmit, onDone }: Props) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(initial?.name ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [gender, setGender] = useState(initial?.gender ?? '')
  const [category, setCategory] = useState(initial?.category ?? '')
  const [companions, setCompanions] = useState(String(initial?.companions_count ?? 0))
  const [inviteType, setInviteType] = useState(initial?.invite_type ?? '')
  const [rsvp, setRsvp] = useState(initial?.rsvp_status ?? 'belum_dikirim')
  const [eventId, setEventId] = useState(initial?.event_id ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    const { error } = await onSubmit({
      name: name.trim(),
      phone: phone.trim() || null,
      gender: gender || null,
      category: category || null,
      companions_count: Number(companions) || 0,
      invite_type: inviteType || null,
      rsvp_status: rsvp || null,
      event_id: eventId || null,
      notes: notes.trim() || null,
    })
    setBusy(false)
    if (error) setError(error)
    else onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-2">
      <div>
        <label className="field-label">Nama tamu</label>
        <input required value={name} onChange={(e) => setName(e.target.value)}
          className="field-input" placeholder="Nama lengkap" />
      </div>

      <div>
        <label className="field-label">No. HP / WhatsApp</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)}
          className="field-input" placeholder="08xxxx" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Jenis kelamin</label>
          <select value={gender ?? ''} onChange={(e) => setGender(e.target.value)} className="field-input">
            <option value="">—</option>
            {GENDER_OPTIONS.map((g) => (<option key={g.value} value={g.value}>{g.label}</option>))}
          </select>
        </div>
        <div>
          <label className="field-label">Kategori</label>
          <select value={category ?? ''} onChange={(e) => setCategory(e.target.value)} className="field-input">
            <option value="">—</option>
            {GUEST_CATEGORIES.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
          </select>
        </div>
        <div>
          <label className="field-label">Jumlah pendamping</label>
          <input type="number" inputMode="numeric" min={0} value={companions}
            onChange={(e) => setCompanions(e.target.value)} className="field-input" />
        </div>
        <div>
          <label className="field-label">Jenis undangan</label>
          <select value={inviteType ?? ''} onChange={(e) => setInviteType(e.target.value)} className="field-input">
            <option value="">—</option>
            {INVITE_TYPES.map((i) => (<option key={i.value} value={i.value}>{i.label}</option>))}
          </select>
        </div>
        <div>
          <label className="field-label">Status RSVP</label>
          <select value={rsvp ?? ''} onChange={(e) => setRsvp(e.target.value)} className="field-input">
            {RSVP_STATUS.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
          </select>
        </div>
        <div>
          <label className="field-label">Untuk acara</label>
          <select value={eventId ?? ''} onChange={(e) => setEventId(e.target.value)} className="field-input">
            <option value="">Semua acara</option>
            {events.map((ev) => (<option key={ev.id} value={ev.id}>{ev.name}</option>))}
          </select>
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
        {busy ? 'Menyimpan…' : initial ? 'Simpan Perubahan' : 'Tambah Tamu'}
      </button>
    </form>
  )
}
