import PageHeader from '../components/PageHeader'
import { useWedding } from '../context/WeddingContext'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { formatIDR } from '../lib/format'

function formatDate(d: string | null): string | null {
  if (!d) return null
  return new Date(d + 'T00:00:00').toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** Hari menuju tanggal terdekat yang belum lewat (akad lalu resepsi). */
function daysUntil(dates: (string | null)[]): number | null {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (const d of dates) {
    if (!d) continue
    const target = new Date(d + 'T00:00:00')
    const diff = Math.round((target.getTime() - today.getTime()) / 86_400_000)
    if (diff >= 0) return diff
  }
  return null
}

export default function DashboardPage() {
  const { wedding } = useWedding()
  const { stats, loading } = useDashboardStats(wedding?.id ?? null)
  if (!wedding) return null

  const bride = wedding.bride_nickname || wedding.bride_name || 'Mempelai Wanita'
  const groom = wedding.groom_nickname || wedding.groom_name || 'Mempelai Pria'
  const countdown = daysUntil([wedding.date_akad, wedding.date_resepsi])

  const checklistPct =
    stats.checklistTotal > 0
      ? Math.round((stats.checklistDone / stats.checklistTotal) * 100)
      : 0

  const totalBudget = Number(wedding.total_budget ?? 0)
  const budgetBase = totalBudget > 0 ? totalBudget : stats.budgetEstimate
  const budgetPct =
    budgetBase > 0 ? Math.min(100, Math.round((stats.budgetActual / budgetBase) * 100)) : 0
  const budgetRemaining = budgetBase - stats.budgetActual

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Selamat datang di persiapan pernikahanmu 🌸"
      />

      {/* Kartu pasangan + countdown */}
      <div className="card bg-burgundy-deep text-cream">
        <p className="text-center font-display text-5xl font-normal leading-tight tracking-wide">
          {bride} <span className="text-gold-light">&amp;</span> {groom}
        </p>
        {countdown !== null && (
          <div className="mt-5 text-center">
            <div className="flex items-baseline justify-center gap-2">
              <span className="font-display text-7xl font-medium leading-none text-gold-light">
                {countdown}
              </span>
              <span className="font-body text-lg font-medium text-cream/80">hari</span>
            </div>
            <p className="mt-2 text-xs uppercase tracking-[0.3em] text-cream/60">
              menuju hari bahagia
            </p>
          </div>
        )}
      </div>

      {/* Tanggal penting */}
      <div className="mt-4 space-y-3">
        {formatDate(wedding.date_akad) && (
          <div className="card flex items-center justify-between py-3">
            <span className="text-sm text-ink/60">Akad</span>
            <span className="font-medium text-ink">{formatDate(wedding.date_akad)}</span>
          </div>
        )}
        {formatDate(wedding.date_resepsi) && (
          <div className="card flex items-center justify-between py-3">
            <span className="text-sm text-ink/60">Resepsi</span>
            <span className="font-medium text-ink">
              {formatDate(wedding.date_resepsi)}
            </span>
          </div>
        )}
        {formatDate(wedding.date_engagement) && (
          <div className="card flex items-center justify-between py-3">
            <span className="text-sm text-ink/60">Lamaran</span>
            <span className="font-medium text-ink">
              {formatDate(wedding.date_engagement)}
            </span>
          </div>
        )}
      </div>

      {/* Ringkasan */}
      <h2 className="mb-3 mt-7 text-2xl">Ringkasan</h2>

      {/* Checklist progress */}
      <div className="card">
        <div className="flex items-end justify-between">
          <span className="text-sm text-ink/60">Progress Persiapan</span>
          <span className="font-display text-3xl font-light text-burgundy-deep">
            {checklistPct}%
          </span>
        </div>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-ink/10">
          <div
            className="h-full rounded-full bg-gold-warm transition-all"
            style={{ width: `${checklistPct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-ink/50">
          {stats.checklistDone} dari {stats.checklistTotal} item selesai
        </p>
      </div>

      {/* Budget */}
      <div className="card mt-4">
        <div className="flex items-end justify-between">
          <span className="text-sm text-ink/60">Anggaran</span>
          <span className="font-medium text-ink">{formatIDR(budgetBase)}</span>
        </div>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-ink/10">
          <div
            className="h-full rounded-full bg-burgundy-mid transition-all"
            style={{ width: `${budgetPct}%` }}
          />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-ink/50">Terpakai</p>
            <p className="font-medium text-burgundy-deep">{formatIDR(stats.budgetActual)}</p>
          </div>
          <div className="text-right">
            <p className="text-ink/50">Sisa</p>
            <p
              className={`font-medium ${
                budgetRemaining < 0 ? 'text-burgundy-mid' : 'text-ink'
              }`}
            >
              {formatIDR(budgetRemaining)}
            </p>
          </div>
        </div>
      </div>

      {/* Tamu & Vendor */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="card">
          <p className="text-sm text-ink/60">Tamu Hadir</p>
          <p className="mt-1 font-display text-4xl font-light text-burgundy-deep">
            {stats.guestsAttending}
          </p>
          <p className="text-xs text-ink/50">dari {stats.guestsTotal} tamu</p>
        </div>
        <div className="card">
          <p className="text-sm text-ink/60">Vendor Deal</p>
          <p className="mt-1 font-display text-4xl font-light text-burgundy-deep">
            {stats.vendorBooked}
          </p>
          <p className="text-xs text-ink/50">booked/lunas/selesai · dari {stats.vendorTotal}</p>
        </div>
      </div>

      {loading && (
        <p className="mt-4 text-center text-xs text-ink/40">Memuat ringkasan…</p>
      )}
    </>
  )
}
