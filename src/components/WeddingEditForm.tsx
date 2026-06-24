import { useState, type FormEvent } from 'react'
import type { Wedding, WeddingInput } from '../types/db'

interface Props {
  wedding: Wedding
  onSave: (input: WeddingInput) => Promise<{ error: string | null }>
}

export default function WeddingEditForm({ wedding, onSave }: Props) {
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [brideName, setBrideName] = useState(wedding.bride_name ?? '')
  const [groomName, setGroomName] = useState(wedding.groom_name ?? '')
  const [brideNick, setBrideNick] = useState(wedding.bride_nickname ?? '')
  const [groomNick, setGroomNick] = useState(wedding.groom_nickname ?? '')
  const [dateEngagement, setDateEngagement] = useState(wedding.date_engagement ?? '')
  const [dateAkad, setDateAkad] = useState(wedding.date_akad ?? '')
  const [dateResepsi, setDateResepsi] = useState(wedding.date_resepsi ?? '')
  const [totalBudget, setTotalBudget] = useState(
    wedding.total_budget != null ? String(wedding.total_budget) : '',
  )

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    const { error } = await onSave({
      bride_name: brideName.trim() || null,
      groom_name: groomName.trim() || null,
      bride_nickname: brideNick.trim() || null,
      groom_nickname: groomNick.trim() || null,
      date_engagement: dateEngagement || null,
      date_akad: dateAkad || null,
      date_resepsi: dateResepsi || null,
      total_budget: totalBudget ? Number(totalBudget) : 0,
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
      <h3 className="font-display text-xl font-light text-burgundy-deep">Data Pernikahan</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Nama Mempelai Wanita</label>
          <input value={brideName} onChange={(e) => setBrideName(e.target.value)} className="field-input" />
        </div>
        <div>
          <label className="field-label">Nama Mempelai Pria</label>
          <input value={groomName} onChange={(e) => setGroomName(e.target.value)} className="field-input" />
        </div>
        <div>
          <label className="field-label">Panggilan Wanita</label>
          <input value={brideNick} onChange={(e) => setBrideNick(e.target.value)} className="field-input" />
        </div>
        <div>
          <label className="field-label">Panggilan Pria</label>
          <input value={groomNick} onChange={(e) => setGroomNick(e.target.value)} className="field-input" />
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="field-label">Tanggal Akad</label>
          <input type="date" value={dateAkad ?? ''} onChange={(e) => setDateAkad(e.target.value)} className="field-input" />
        </div>
        <div>
          <label className="field-label">Tanggal Resepsi</label>
          <input type="date" value={dateResepsi ?? ''} onChange={(e) => setDateResepsi(e.target.value)} className="field-input" />
        </div>
        <div>
          <label className="field-label">Tanggal Lamaran</label>
          <input type="date" value={dateEngagement ?? ''} onChange={(e) => setDateEngagement(e.target.value)} className="field-input" />
        </div>
        <div>
          <label className="field-label">Total Budget (Rp)</label>
          <input type="number" inputMode="numeric" min={0} value={totalBudget}
            onChange={(e) => setTotalBudget(e.target.value)} className="field-input" placeholder="mis. 150000000" />
        </div>
      </div>

      {error && <p className="rounded-xl bg-burgundy-deep/5 px-3 py-2 text-sm text-burgundy-deep">{error}</p>}

      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? 'Menyimpan…' : saved ? 'Tersimpan ✓' : 'Simpan'}
      </button>
    </form>
  )
}
