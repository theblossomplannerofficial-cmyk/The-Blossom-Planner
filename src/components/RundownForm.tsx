import { useState, type FormEvent } from 'react'
import { RUNDOWN_STATUS, COMMON_ACTIVITIES, COMMON_PIC } from '../lib/rundown'
import type { RundownItem, RundownItemInput } from '../types/db'

interface Props {
  initial?: RundownItem | null
  onSubmit: (
    input: Omit<RundownItemInput, 'sort_order' | 'event_id'>,
  ) => Promise<{ error: string | null }>
  onDone: () => void
}

/** Hitung selisih menit antara dua "HH:MM". */
function diffMinutes(start: string, end: string): number | null {
  if (!start || !end) return null
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return null
  const d = eh * 60 + em - (sh * 60 + sm)
  return d > 0 ? d : null
}

export default function RundownForm({ initial, onSubmit, onDone }: Props) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [activity, setActivity] = useState(initial?.activity_name ?? '')
  const [timeStart, setTimeStart] = useState(initial?.time_start?.slice(0, 5) ?? '')
  const [timeEnd, setTimeEnd] = useState(initial?.time_end?.slice(0, 5) ?? '')
  const [pic, setPic] = useState(initial?.pic ?? '')
  const [location, setLocation] = useState(initial?.location ?? '')
  const [status, setStatus] = useState(initial?.status ?? 'belum_dimulai')
  const [link, setLink] = useState(initial?.link ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    const { error } = await onSubmit({
      activity_name: activity.trim(),
      time_start: timeStart || null,
      time_end: timeEnd || null,
      duration_minutes: diffMinutes(timeStart, timeEnd),
      pic: pic.trim() || null,
      location: location.trim() || null,
      status: status || null,
      link: link.trim() || null,
      notes: notes.trim() || null,
    })
    setBusy(false)
    if (error) setError(error)
    else onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-2">
      <div>
        <label className="field-label">Kegiatan</label>
        <input required list="activities" value={activity}
          onChange={(e) => setActivity(e.target.value)} className="field-input"
          placeholder="Pilih atau ketik sendiri" />
        <datalist id="activities">
          {COMMON_ACTIVITIES.map((a) => (<option key={a} value={a} />))}
        </datalist>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Jam mulai</label>
          <input type="time" value={timeStart} onChange={(e) => setTimeStart(e.target.value)} className="field-input" />
        </div>
        <div>
          <label className="field-label">Jam selesai</label>
          <input type="time" value={timeEnd} onChange={(e) => setTimeEnd(e.target.value)} className="field-input" />
        </div>
      </div>
      {diffMinutes(timeStart, timeEnd) !== null && (
        <p className="-mt-2 text-xs text-ink/50">Durasi: {diffMinutes(timeStart, timeEnd)} menit</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">PIC</label>
          <input list="pics" value={pic} onChange={(e) => setPic(e.target.value)}
            className="field-input" placeholder="mis. MC" />
          <datalist id="pics">
            {COMMON_PIC.map((p) => (<option key={p} value={p} />))}
          </datalist>
        </div>
        <div>
          <label className="field-label">Status</label>
          <select value={status ?? ''} onChange={(e) => setStatus(e.target.value)} className="field-input">
            {RUNDOWN_STATUS.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
          </select>
        </div>
      </div>

      <div>
        <label className="field-label">Lokasi</label>
        <input value={location} onChange={(e) => setLocation(e.target.value)}
          className="field-input" placeholder="Opsional" />
      </div>

      <div>
        <label className="field-label">Link (mis. musik/playlist)</label>
        <input value={link} onChange={(e) => setLink(e.target.value)}
          className="field-input" placeholder="https://..." />
      </div>

      <div>
        <label className="field-label">Catatan</label>
        <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="field-input" />
      </div>

      {error && (
        <p className="rounded-xl bg-burgundy-deep/5 px-3 py-2 text-sm text-burgundy-deep">{error}</p>
      )}

      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? 'Menyimpan…' : initial ? 'Simpan Perubahan' : 'Tambah Kegiatan'}
      </button>
    </form>
  )
}
