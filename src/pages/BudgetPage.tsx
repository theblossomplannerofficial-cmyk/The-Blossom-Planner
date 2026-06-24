import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import BudgetAllocator from '../components/BudgetAllocator'
import { useVendorItems } from '../hooks/useVendorItems'
import { useGuests } from '../hooks/useGuests'
import { useWedding } from '../context/WeddingContext'
import { CATEGORIES, categoryIcon, categoryLabel } from '../lib/categories'
import { formatIDR } from '../lib/format'

interface CatAgg {
  key: string
  estimate: number
  actual: number
  paid: number
  count: number
}

export default function BudgetPage() {
  const { items, loading, createItem } = useVendorItems()
  const { guests } = useGuests()
  const { wedding } = useWedding()
  const [allocOpen, setAllocOpen] = useState(false)

  const { cats, totals } = useMemo(() => {
    const map = new Map<string, CatAgg>()
    for (const it of items) {
      const a =
        map.get(it.category) ??
        { key: it.category, estimate: 0, actual: 0, paid: 0, count: 0 }
      a.estimate += Number(it.budget_estimate ?? 0)
      a.actual += Number(it.budget_actual ?? 0)
      a.paid += Number(it.paid_amount ?? 0)
      a.count += 1
      map.set(it.category, a)
    }
    const cats = CATEGORIES.filter((c) => map.has(c.key)).map((c) => map.get(c.key)!)
    const totals = cats.reduce(
      (t, c) => ({
        estimate: t.estimate + c.estimate,
        actual: t.actual + c.actual,
        paid: t.paid + c.paid,
      }),
      { estimate: 0, actual: 0, paid: 0 },
    )
    // urutkan kategori dari aktual terbesar untuk tampilan alokasi
    cats.sort((a, b) => (b.actual || b.estimate) - (a.actual || a.estimate))
    return { cats, totals }
  }, [items])

  const totalBudget = Number(wedding?.total_budget ?? 0)
  const selisihTotal = totals.estimate - totals.actual
  const sisaBayar = totals.actual - totals.paid
  // dasar alokasi: pakai aktual bila ada, jika belum pakai estimasi
  const allocBase = totals.actual > 0 ? totals.actual : totals.estimate
  const payPct = totals.actual > 0 ? Math.min(100, Math.round((totals.paid / totals.actual) * 100)) : 0

  // Auto Budget Allocator (rule-based, client-side).
  const existingCats = useMemo(() => new Set(items.map((i) => i.category)), [items])

  async function applyAllocation(list: { category: string; amount: number }[]) {
    for (const a of list) {
      await createItem({
        category: a.category,
        event_id: null,
        title: categoryLabel(a.category),
        status: null,
        vendor_name: null,
        vendor_status: null,
        pic: null,
        budget_estimate: a.amount,
        budget_actual: 0,
        dp: 0,
        paid_amount: 0,
        is_paid_off: false,
        due_date: null,
        deadline: null,
        reference_links: [],
        details: {},
        notes: 'Dibuat otomatis oleh Auto Budget Allocator',
      })
    }
    setAllocOpen(false)
  }

  return (
    <>
      <PageHeader title="Budget" subtitle="Ringkasan anggaran dari semua item vendor" />

      <button
        onClick={() => setAllocOpen(true)}
        disabled={totalBudget <= 0}
        className="btn-ghost mb-4 w-full disabled:opacity-50"
      >
        ✨ Auto Budget Allocator
      </button>
      {totalBudget <= 0 && (
        <p className="-mt-2 mb-4 text-center text-xs text-ink/40">
          Isi total budget dulu (saat onboarding) untuk memakai allocator.
        </p>
      )}

      {/* Ringkasan utama */}
      <div className="card bg-burgundy-deep text-cream">
        <p className="text-sm text-cream/70">Total Anggaran</p>
        <p className="font-display text-4xl font-light text-gold-light">
          {formatIDR(totalBudget)}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-cream/60">Estimasi vendor</p>
            <p className="font-medium">{formatIDR(totals.estimate)}</p>
          </div>
          <div className="text-right">
            <p className="text-cream/60">Aktual</p>
            <p className="font-medium">{formatIDR(totals.actual)}</p>
          </div>
          <div>
            <p className="text-cream/60">Selisih estimasi</p>
            <p className={`font-medium ${selisihTotal < 0 ? 'text-gold-light' : 'text-cream'}`}>
              {formatIDR(selisihTotal)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-cream/60">Sisa anggaran</p>
            <p className="font-medium">{formatIDR(totalBudget - totals.actual)}</p>
          </div>
        </div>
      </div>

      {/* Status pembayaran */}
      <div className="card mt-4">
        <div className="flex items-end justify-between">
          <span className="text-sm text-ink/60">Status Pembayaran</span>
          <span className="font-display text-3xl font-light text-burgundy-deep">{payPct}%</span>
        </div>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-ink/10">
          <div className="h-full rounded-full bg-gold-warm transition-all" style={{ width: `${payPct}%` }} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-ink/50">Sudah dibayar</p>
            <p className="font-medium text-ink">{formatIDR(totals.paid)}</p>
          </div>
          <div className="text-right">
            <p className="text-ink/50">Sisa harus dibayar</p>
            <p className="font-medium text-burgundy-deep">{formatIDR(sisaBayar)}</p>
          </div>
        </div>
      </div>

      {/* Alokasi per kategori */}
      <h2 className="mb-3 mt-7 text-2xl">Alokasi per Kategori</h2>

      {loading ? (
        <p className="card text-sm text-ink/50">Memuat…</p>
      ) : cats.length === 0 ? (
        <p className="card text-sm text-ink/50">
          Belum ada item vendor. Tambah dulu di tab <b>Acara</b> untuk melihat alokasi budget.
        </p>
      ) : (
        <div className="space-y-3">
          {cats.map((c) => {
            const amount = c.actual || c.estimate
            const pct = allocBase > 0 ? Math.round((amount / allocBase) * 100) : 0
            const selisih = c.estimate - c.actual
            return (
              <div key={c.key} className="card">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-medium text-ink">
                    <span>{categoryIcon(c.key)}</span>
                    {categoryLabel(c.key)}
                    <span className="text-xs font-normal text-ink/40">({c.count})</span>
                  </span>
                  <span className="text-sm font-medium text-burgundy-deep">{pct}%</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink/10">
                  <div className="h-full rounded-full bg-burgundy-mid transition-all" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-ink/40">Estimasi</p>
                    <p className="text-ink">{formatIDR(c.estimate)}</p>
                  </div>
                  <div>
                    <p className="text-ink/40">Aktual</p>
                    <p className="text-ink">{formatIDR(c.actual)}</p>
                  </div>
                  <div>
                    <p className="text-ink/40">Selisih</p>
                    <p className={selisih < 0 ? 'text-burgundy-mid' : 'text-green-700'}>
                      {formatIDR(selisih)}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Auto Budget Allocator */}
      <Modal open={allocOpen} title="✨ Auto Budget Allocator" onClose={() => setAllocOpen(false)}>
        <BudgetAllocator
          total={totalBudget}
          defaultGuests={guests.length}
          existingCats={existingCats}
          onApply={applyAllocation}
        />
      </Modal>
    </>
  )
}
