import { useMemo, useState } from 'react'
import { allocateBudget } from '../lib/allocator'
import { categoryIcon, categoryLabel } from '../lib/categories'
import { formatIDR } from '../lib/format'

interface Props {
  total: number
  defaultGuests: number
  existingCats: Set<string>
  /** Terapkan: hanya kategori baru (belum ada) yang dibuat. */
  onApply: (allocations: { category: string; amount: number }[]) => Promise<void>
}

export default function BudgetAllocator({ total, defaultGuests, existingCats, onApply }: Props) {
  const [guests, setGuests] = useState(String(defaultGuests || ''))
  const [amounts, setAmounts] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {}
    for (const a of allocateBudget(total)) init[a.category] = a.amount
    return init
  })
  const [applying, setApplying] = useState(false)

  const rows = useMemo(() => Object.keys(amounts), [amounts])
  const sum = useMemo(() => Object.values(amounts).reduce((t, n) => t + (n || 0), 0), [amounts])
  const diff = total - sum
  const guestCount = Number(guests) || 0
  const cateringPerGuest = guestCount > 0 ? Math.round((amounts['catering'] ?? 0) / guestCount) : 0

  async function handleApply() {
    setApplying(true)
    const list = rows
      .filter((cat) => !existingCats.has(cat) && (amounts[cat] ?? 0) > 0)
      .map((cat) => ({ category: cat, amount: amounts[cat] }))
    await onApply(list)
    setApplying(false)
  }

  const newCount = rows.filter((c) => !existingCats.has(c) && (amounts[c] ?? 0) > 0).length

  return (
    <div className="space-y-4 pb-2">
      <p className="text-sm text-ink/60">
        Saran pembagian dari total anggaran <b>{formatIDR(total)}</b>. Semua angka bisa kamu
        ubah. Saat diterapkan, item estimasi dibuat untuk kategori yang <b>belum ada</b>.
      </p>

      <div>
        <label className="field-label">Perkiraan jumlah tamu</label>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          className="field-input"
          placeholder="mis. 300"
        />
        {guestCount > 0 && (
          <p className="mt-1 text-xs text-ink/50">
            Catering ≈ <b>{formatIDR(cateringPerGuest)}</b> / tamu
          </p>
        )}
      </div>

      <div className="space-y-2">
        {rows.map((cat) => {
          const exists = existingCats.has(cat)
          return (
            <div key={cat} className="flex items-center gap-2">
              <span className={`flex-1 text-sm ${exists ? 'text-ink/40' : 'text-ink'}`}>
                {categoryIcon(cat)} {categoryLabel(cat)}
                {exists && <span className="ml-1 text-xs text-ink/40">(sudah ada)</span>}
              </span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={amounts[cat] ?? 0}
                onChange={(e) =>
                  setAmounts((prev) => ({ ...prev, [cat]: Number(e.target.value) || 0 }))
                }
                disabled={exists}
                className="field-input w-36 py-1.5 text-right text-sm disabled:opacity-50"
              />
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-ink/5">
        <span className="text-ink/60">Total alokasi</span>
        <span className="text-right">
          <b className="text-ink">{formatIDR(sum)}</b>
          <span className={`ml-2 text-xs ${diff === 0 ? 'text-ink/40' : diff < 0 ? 'text-burgundy-mid' : 'text-green-700'}`}>
            {diff === 0 ? 'pas' : diff < 0 ? `lebih ${formatIDR(-diff)}` : `sisa ${formatIDR(diff)}`}
          </span>
        </span>
      </div>

      <button onClick={handleApply} disabled={applying || newCount === 0} className="btn-primary w-full">
        {applying
          ? 'Menerapkan…'
          : newCount === 0
            ? 'Semua kategori sudah ada'
            : `Buat ${newCount} item estimasi`}
      </button>
    </div>
  )
}
