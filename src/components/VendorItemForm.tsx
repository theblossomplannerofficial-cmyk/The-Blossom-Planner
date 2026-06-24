import { useMemo, useState, type FormEvent } from 'react'
import {
  CATEGORY_MAP,
  ITEM_STATUS,
  VENDOR_STATUS,
  PIC_OPTIONS,
} from '../lib/categories'
import { formatIDR } from '../lib/format'
import VendorPhotos from './VendorPhotos'
import type { VendorItem, VendorItemInput, WeddingEvent } from '../types/db'

interface Props {
  category: string
  events: WeddingEvent[]
  initial?: VendorItem | null
  onSubmit: (input: VendorItemInput) => Promise<{ error: string | null }>
  onDone: () => void
}

function numOrZero(v: string): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export default function VendorItemForm({
  category,
  events,
  initial,
  onSubmit,
  onDone,
}: Props) {
  const cfg = CATEGORY_MAP[category]
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState(initial?.title ?? '')
  const [vendorName, setVendorName] = useState(initial?.vendor_name ?? '')
  const [status, setStatus] = useState(initial?.status ?? '')
  const [vendorStatus, setVendorStatus] = useState(initial?.vendor_status ?? '')
  const [pic, setPic] = useState(initial?.pic ?? '')
  const [eventId, setEventId] = useState(initial?.event_id ?? '')
  const [budgetEstimate, setBudgetEstimate] = useState(
    initial?.budget_estimate != null ? String(initial.budget_estimate) : '',
  )
  const [budgetActual, setBudgetActual] = useState(
    initial?.budget_actual != null ? String(initial.budget_actual) : '',
  )
  const [dp, setDp] = useState(initial?.dp != null ? String(initial.dp) : '')
  // "extra" = pelunasan / pembayaran selain DP. paid_amount = dp + extra.
  const [extra, setExtra] = useState(
    initial ? String(Math.max(0, (initial.paid_amount ?? 0) - (initial.dp ?? 0))) : '',
  )
  const [isPaidOff, setIsPaidOff] = useState(initial?.is_paid_off ?? false)
  const [dueDate, setDueDate] = useState(initial?.due_date ?? '')
  const [deadline, setDeadline] = useState(initial?.deadline ?? '')
  const [links, setLinks] = useState((initial?.reference_links ?? []).join('\n'))
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [details, setDetails] = useState<Record<string, string>>(() => {
    const d: Record<string, string> = {}
    for (const f of cfg?.details ?? []) {
      const v = initial?.details?.[f.key]
      d[f.key] = v != null ? String(v) : ''
    }
    return d
  })

  // Pratinjau hitungan otomatis (sama dengan generated column di DB).
  const preview = useMemo(() => {
    const est = numOrZero(budgetEstimate)
    const act = numOrZero(budgetActual)
    const paid = numOrZero(dp) + numOrZero(extra) // total dibayar = DP + pelunasan
    return { selisih: est - act, totalPaid: paid, sisa: act - paid }
  }, [budgetEstimate, budgetActual, dp, extra])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)

    // Bersihkan details: hanya simpan yang terisi.
    const detailsClean: Record<string, unknown> = {}
    for (const f of cfg?.details ?? []) {
      const raw = details[f.key]?.trim()
      if (raw) detailsClean[f.key] = f.type === 'number' ? Number(raw) : raw
    }

    const input: VendorItemInput = {
      category,
      event_id: eventId || null,
      title: title.trim() || null,
      status: status || null,
      vendor_name: vendorName.trim() || null,
      vendor_status: vendorStatus || null,
      pic: pic || null,
      budget_estimate: numOrZero(budgetEstimate),
      budget_actual: numOrZero(budgetActual),
      dp: numOrZero(dp),
      paid_amount: numOrZero(dp) + numOrZero(extra), // total dibayar (DP + pelunasan)
      is_paid_off: isPaidOff,
      due_date: dueDate || null,
      deadline: deadline || null,
      reference_links: links
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean),
      details: detailsClean,
      notes: notes.trim() || null,
    }

    const { error } = await onSubmit(input)
    setBusy(false)
    if (error) setError(error)
    else onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-2">
      <div>
        <label className="field-label">Nama item</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="field-input"
          placeholder={`mis. ${cfg?.label ?? 'Item'}`}
        />
      </div>

      <div>
        <label className="field-label">Nama vendor</label>
        <input
          value={vendorName}
          onChange={(e) => setVendorName(e.target.value)}
          className="field-input"
          placeholder="Opsional"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Status item</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="field-input">
            <option value="">—</option>
            {ITEM_STATUS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label">Status vendor</label>
          <select value={vendorStatus} onChange={(e) => setVendorStatus(e.target.value)} className="field-input">
            <option value="">—</option>
            {VENDOR_STATUS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label">PIC</label>
          <select value={pic} onChange={(e) => setPic(e.target.value)} className="field-input">
            <option value="">—</option>
            {PIC_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label">Untuk acara</label>
          <select value={eventId ?? ''} onChange={(e) => setEventId(e.target.value)} className="field-input">
            <option value="">Umum (semua)</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>{ev.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Budget */}
      <div className="rounded-2xl bg-white/60 p-3 ring-1 ring-ink/5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Estimasi (Rp)</label>
            <input type="number" inputMode="numeric" min={0} value={budgetEstimate}
              onChange={(e) => setBudgetEstimate(e.target.value)} className="field-input" placeholder="0" />
          </div>
          <div>
            <label className="field-label">Aktual (Rp)</label>
            <input type="number" inputMode="numeric" min={0} value={budgetActual}
              onChange={(e) => setBudgetActual(e.target.value)} className="field-input" placeholder="0" />
          </div>
          <div>
            <label className="field-label">DP / uang muka (Rp)</label>
            <input type="number" inputMode="numeric" min={0} value={dp}
              onChange={(e) => setDp(e.target.value)} className="field-input" placeholder="0" />
          </div>
          <div>
            <label className="field-label">Pelunasan / bayar lagi (Rp)</label>
            <input type="number" inputMode="numeric" min={0} value={extra}
              onChange={(e) => setExtra(e.target.value)} className="field-input" placeholder="0" />
          </div>
        </div>
        <div className="mt-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-ink/60">Selisih (estimasi − aktual)</span>
            <b className="text-ink">{formatIDR(preview.selisih)}</b>
          </div>
          <div className="flex justify-between">
            <span className="text-ink/60">Total dibayar (DP + pelunasan)</span>
            <b className="text-ink">{formatIDR(preview.totalPaid)}</b>
          </div>
          <div className="flex justify-between">
            <span className="text-ink/60">Sisa bayar</span>
            <b className="text-burgundy-deep">{formatIDR(preview.sisa)}</b>
          </div>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm text-ink/70">
          <input type="checkbox" checked={isPaidOff} onChange={(e) => setIsPaidOff(e.target.checked)}
            className="h-4 w-4 rounded accent-burgundy-deep" />
          Sudah lunas
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Jatuh tempo bayar</label>
          <input type="date" value={dueDate ?? ''} onChange={(e) => setDueDate(e.target.value)} className="field-input" />
        </div>
        <div>
          <label className="field-label">Deadline</label>
          <input type="date" value={deadline ?? ''} onChange={(e) => setDeadline(e.target.value)} className="field-input" />
        </div>
      </div>

      {/* Field khusus kategori */}
      {(cfg?.details.length ?? 0) > 0 && (
        <div className="rounded-2xl bg-white/60 p-3 ring-1 ring-ink/5">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink/50">
            Detail {cfg?.label}
          </p>
          <div className="space-y-3">
            {cfg?.details.map((f) => (
              <div key={f.key}>
                <label className="field-label">{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea rows={2} value={details[f.key] ?? ''}
                    onChange={(e) => setDetails((d) => ({ ...d, [f.key]: e.target.value }))}
                    className="field-input" />
                ) : (
                  <input type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                    value={details[f.key] ?? ''}
                    onChange={(e) => setDetails((d) => ({ ...d, [f.key]: e.target.value }))}
                    className="field-input" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="field-label">Link referensi (satu per baris)</label>
        <textarea rows={2} value={links} onChange={(e) => setLinks(e.target.value)}
          className="field-input" placeholder="https://..." />
      </div>

      <div>
        <label className="field-label">Catatan</label>
        <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="field-input" />
      </div>

      {/* Foto referensi hanya tersedia setelah item disimpan (butuh vendor_item_id). */}
      {initial ? (
        <VendorPhotos vendorItemId={initial.id} />
      ) : (
        <p className="rounded-xl bg-white/60 px-3 py-2 text-xs text-ink/50 ring-1 ring-ink/5">
          Simpan item dulu, lalu buka Edit untuk menambahkan foto referensi.
        </p>
      )}

      {error && (
        <p className="rounded-xl bg-burgundy-deep/5 px-3 py-2 text-sm text-burgundy-deep">{error}</p>
      )}

      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? 'Menyimpan…' : initial ? 'Simpan Perubahan' : 'Tambah Item'}
      </button>
    </form>
  )
}
