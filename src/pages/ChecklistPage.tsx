import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { useChecklist } from '../hooks/useChecklist'
import { PHASES } from '../lib/checklist'
import type { ChecklistItem } from '../types/db'

export default function ChecklistPage() {
  const { items, loading, toggleDone, addItem, removeItem, seedDefaults } = useChecklist()
  const [addingPhase, setAddingPhase] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [seeding, setSeeding] = useState(false)

  const grouped = useMemo(() => {
    const map = new Map<string, ChecklistItem[]>()
    for (const it of items) {
      const key = it.phase ?? 'custom'
      const arr = map.get(key) ?? []
      arr.push(it)
      map.set(key, arr)
    }
    return map
  }, [items])

  const done = items.filter((i) => i.is_done).length
  const total = items.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  async function handleAdd(phase: string) {
    if (!newTitle.trim()) return
    await addItem(phase, newTitle)
    setNewTitle('')
    setAddingPhase(null)
  }

  return (
    <>
      <div className="mb-2">
        <Link to="/more" className="text-sm text-burgundy-mid">← Kembali</Link>
      </div>
      <PageHeader title="Checklist" subtitle="Timeline persiapan 12 bulan" />

      {/* Progress keseluruhan */}
      <div className="card">
        <div className="flex items-end justify-between">
          <span className="text-sm text-ink/60">Progress Persiapan</span>
          <span className="font-display text-3xl font-light text-burgundy-deep">{pct}%</span>
        </div>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-ink/10">
          <div className="h-full rounded-full bg-gold-warm transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-xs text-ink/50">{done} dari {total} selesai</p>
      </div>

      {loading ? (
        <p className="card mt-4 text-sm text-ink/50">Memuat…</p>
      ) : total === 0 ? (
        <div className="card mt-4 space-y-3 text-center">
          <p className="text-sm text-ink/60">
            Belum ada checklist. Buat daftar persiapan default untuk mulai.
          </p>
          <button
            className="btn-primary w-full"
            disabled={seeding}
            onClick={async () => {
              setSeeding(true)
              await seedDefaults()
              setSeeding(false)
            }}
          >
            {seeding ? 'Membuat…' : 'Buat Checklist Default'}
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {PHASES.map((phase) => {
            const list = grouped.get(phase.key) ?? []
            if (list.length === 0 && phase.key !== 'custom') return null
            const phaseDone = list.filter((i) => i.is_done).length
            return (
              <section key={phase.key}>
                <h3 className="mb-2 flex items-center justify-between font-display text-xl font-light text-burgundy-deep">
                  <span>{phase.label}</span>
                  <span className="text-sm text-ink/40">{phaseDone}/{list.length}</span>
                </h3>

                <div className="space-y-2">
                  {list.map((it) => (
                    <div
                      key={it.id}
                      className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-ink/5"
                    >
                      <input
                        type="checkbox"
                        checked={it.is_done}
                        onChange={(e) => toggleDone(it.id, e.target.checked)}
                        className="h-5 w-5 shrink-0 rounded accent-burgundy-deep"
                      />
                      <span
                        className={`flex-1 text-sm ${
                          it.is_done ? 'text-ink/40 line-through' : 'text-ink'
                        }`}
                      >
                        {it.title}
                      </span>
                      <button
                        onClick={() => removeItem(it.id)}
                        className="shrink-0 text-xs text-ink/30 hover:text-burgundy-mid"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* Tambah item ke fase */}
                {addingPhase === phase.key ? (
                  <div className="mt-2 flex gap-2">
                    <input
                      autoFocus
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAdd(phase.key)}
                      className="field-input py-2"
                      placeholder="Tugas baru…"
                    />
                    <button onClick={() => handleAdd(phase.key)} className="btn-primary px-4 py-2 text-sm">
                      Tambah
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setAddingPhase(phase.key)
                      setNewTitle('')
                    }}
                    className="mt-2 text-sm text-burgundy-mid"
                  >
                    + Tambah tugas
                  </button>
                )}
              </section>
            )
          })}
        </div>
      )}
    </>
  )
}
