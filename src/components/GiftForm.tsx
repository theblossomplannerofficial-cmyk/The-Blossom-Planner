import { useState, type FormEvent } from 'react'
import type { Gift, GiftInput } from '../types/db'

interface Props {
  initial?: Gift | null
  onSubmit: (input: GiftInput) => Promise<{ error: string | null }>
  onDone: () => void
}

export default function GiftForm({ initial, onSubmit, onDone }: Props) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [type, setType] = useState(initial?.type ?? 'cash')
  const [giver, setGiver] = useState(initial?.giver_name ?? '')
  const [giftType, setGiftType] = useState(initial?.gift_type ?? '')
  const [giftValue, setGiftValue] = useState(initial?.gift_value != null ? String(initial.gift_value) : '')
  const [amount, setAmount] = useState(initial?.amount != null ? String(initial.amount) : '')
  const [method, setMethod] = useState(initial?.payment_method ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')

  const isCash = type === 'cash'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    const { error } = await onSubmit({
      type,
      giver_name: giver.trim() || null,
      gift_type: isCash ? null : giftType.trim() || null,
      gift_value: isCash ? null : giftValue ? Number(giftValue) : null,
      amount: isCash ? (amount ? Number(amount) : null) : null,
      payment_method: isCash ? method.trim() || null : null,
      notes: notes.trim() || null,
    })
    setBusy(false)
    if (error) setError(error)
    else onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-2">
      <div className="flex gap-2">
        {[
          { value: 'cash', label: 'Cash / Angpao' },
          { value: 'registry', label: 'Hadiah (Registry)' },
        ].map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setType(t.value)}
            className={`flex-1 rounded-2xl px-3 py-2 text-sm font-medium transition ${
              type === t.value ? 'bg-burgundy-deep text-cream' : 'bg-white text-ink/60 ring-1 ring-ink/10'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div>
        <label className="field-label">Nama pemberi</label>
        <input value={giver} onChange={(e) => setGiver(e.target.value)} className="field-input" placeholder="Nama tamu/keluarga" />
      </div>

      {isCash ? (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Jumlah (Rp)</label>
            <input type="number" inputMode="numeric" min={0} value={amount}
              onChange={(e) => setAmount(e.target.value)} className="field-input" placeholder="0" />
          </div>
          <div>
            <label className="field-label">Metode</label>
            <input value={method} onChange={(e) => setMethod(e.target.value)}
              className="field-input" placeholder="Tunai / Transfer" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Jenis hadiah</label>
            <input value={giftType} onChange={(e) => setGiftType(e.target.value)}
              className="field-input" placeholder="mis. Peralatan dapur" />
          </div>
          <div>
            <label className="field-label">Perkiraan nilai (Rp)</label>
            <input type="number" inputMode="numeric" min={0} value={giftValue}
              onChange={(e) => setGiftValue(e.target.value)} className="field-input" placeholder="0" />
          </div>
        </div>
      )}

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
