import { useState, type FormEvent } from 'react'
import type { WeddingEvent, WeddingEventInput } from '../types/db'

interface Props {
  initial?: WeddingEvent | null
  onSubmit: (input: WeddingEventInput) => Promise<{ error: string | null }>
  onDone: () => void
}

const PRESETS = ['Lamaran', 'Akad', 'Resepsi']

export default function EventForm({ initial, onSubmit, onDone }: Props) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(initial?.name ?? '')
  const [eventDate, setEventDate] = useState(initial?.event_date ?? '')
  const [timeStart, setTimeStart] = useState(initial?.time_start ?? '')
  const [timeEnd, setTimeEnd] = useState(initial?.time_end ?? '')
  const [locationName, setLocationName] = useState(initial?.location_name ?? '')
  const [mapsLink, setMapsLink] = useState(initial?.maps_link ?? '')
  const [address, setAddress] = useState(initial?.address ?? '')
  const [indoorOutdoor, setIndoorOutdoor] = useState(initial?.indoor_outdoor ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    const { error } = await onSubmit({
      name: name.trim(),
      event_date: eventDate || null,
      time_start: timeStart || null,
      time_end: timeEnd || null,
      location_name: locationName.trim() || null,
      maps_link: mapsLink.trim() || null,
      address: address.trim() || null,
      indoor_outdoor: indoorOutdoor || null,
      notes: notes.trim() || null,
    })
    setBusy(false)
    if (error) setError(error)
    else onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-2">
      <div>
        <label className="field-label">Nama acara</label>
        <input required value={name} onChange={(e) => setName(e.target.value)}
          className="field-input" placeholder="mis. Akad" />
        <div className="mt-2 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button key={p} type="button" onClick={() => setName(p)}
              className="rounded-full border border-burgundy-mid/30 px-3 py-1 text-xs text-burgundy-mid">
              {p}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="field-label">Tanggal</label>
        <input type="date" value={eventDate ?? ''} onChange={(e) => setEventDate(e.target.value)} className="field-input" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Jam mulai</label>
          <input type="time" value={timeStart ?? ''} onChange={(e) => setTimeStart(e.target.value)} className="field-input" />
        </div>
        <div>
          <label className="field-label">Jam selesai</label>
          <input type="time" value={timeEnd ?? ''} onChange={(e) => setTimeEnd(e.target.value)} className="field-input" />
        </div>
      </div>

      <div>
        <label className="field-label">Nama lokasi</label>
        <input value={locationName} onChange={(e) => setLocationName(e.target.value)}
          className="field-input" placeholder="mis. Gedung Serbaguna" />
      </div>

      <div>
        <label className="field-label">Link Google Maps</label>
        <input value={mapsLink} onChange={(e) => setMapsLink(e.target.value)}
          className="field-input" placeholder="https://maps.google.com/..." />
      </div>

      <div>
        <label className="field-label">Alamat</label>
        <textarea rows={2} value={address} onChange={(e) => setAddress(e.target.value)} className="field-input" />
      </div>

      <div>
        <label className="field-label">Indoor / Outdoor</label>
        <select value={indoorOutdoor ?? ''} onChange={(e) => setIndoorOutdoor(e.target.value)} className="field-input">
          <option value="">—</option>
          <option value="indoor">Indoor</option>
          <option value="outdoor">Outdoor</option>
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
        {busy ? 'Menyimpan…' : initial ? 'Simpan Perubahan' : 'Tambah Acara'}
      </button>
    </form>
  )
}
