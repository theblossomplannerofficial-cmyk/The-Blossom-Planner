import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import RundownForm from '../components/RundownForm'
import { useEvents } from '../hooks/useEvents'
import { useRundown } from '../hooks/useRundown'
import { RUNDOWN_STATUS, rundownStatusLabel } from '../lib/rundown'
import type { RundownItem } from '../types/db'

const STATUS_COLOR: Record<string, string> = {
  selesai: 'bg-green-600/10 text-green-700',
  sedang_berlangsung: 'bg-gold-warm/15 text-gold-warm',
  ditunda: 'bg-ink/10 text-ink/60',
  dibatalkan: 'bg-burgundy-deep/10 text-burgundy-deep',
  belum_dimulai: 'bg-ink/10 text-ink/50',
}

export default function RundownPage() {
  const { events } = useEvents()
  const [eventId, setEventId] = useState<string | null>(null)

  // Default ke acara pertama.
  useEffect(() => {
    if (!eventId && events.length > 0) setEventId(events[0].id)
  }, [events, eventId])

  const { items, loading, createItem, updateItem, removeItem, move } = useRundown(eventId)
  const [modal, setModal] = useState<{ item: RundownItem | null } | null>(null)

  const sorted = useMemo(
    () => [...items].sort((a, b) => a.sort_order - b.sort_order),
    [items],
  )

  function handleDelete(it: RundownItem) {
    if (confirm(`Hapus kegiatan "${it.activity_name}"?`)) removeItem(it.id)
  }

  return (
    <>
      <div className="mb-2">
        <Link to="/more" className="text-sm text-burgundy-mid">← Kembali</Link>
      </div>
      <PageHeader title="Rundown Acara" subtitle="Susunan acara per kegiatan" />

      {events.length === 0 ? (
        <p className="card text-sm text-ink/50">
          Belum ada acara. Tambah acara dulu di tab <b>Acara</b>.
        </p>
      ) : (
        <>
          {/* Pilih acara */}
          <div className="mb-4 flex flex-wrap gap-2">
            {events.map((ev) => (
              <button
                key={ev.id}
                onClick={() => setEventId(ev.id)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  eventId === ev.id
                    ? 'bg-burgundy-deep text-cream'
                    : 'bg-white text-ink/60 ring-1 ring-ink/10'
                }`}
              >
                {ev.name}
              </button>
            ))}
          </div>

          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-2xl">Kegiatan</h2>
            <button onClick={() => setModal({ item: null })} className="btn-primary px-3 py-1.5 text-sm">
              + Kegiatan
            </button>
          </div>

          {loading ? (
            <p className="card text-sm text-ink/50">Memuat…</p>
          ) : sorted.length === 0 ? (
            <p className="card text-sm text-ink/50">Belum ada kegiatan. Tap “+ Kegiatan”.</p>
          ) : (
            <div className="space-y-2">
              {sorted.map((it, idx) => (
                <div key={it.id} className="card py-3">
                  <div className="flex items-start gap-3">
                    {/* Reorder */}
                    <div className="flex flex-col">
                      <button onClick={() => move(it.id, -1)} disabled={idx === 0}
                        className="text-ink/40 disabled:opacity-20">▲</button>
                      <button onClick={() => move(it.id, 1)} disabled={idx === sorted.length - 1}
                        className="text-ink/40 disabled:opacity-20">▼</button>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-burgundy-deep">
                          {it.time_start ? it.time_start.slice(0, 5) : '--:--'}
                          {it.time_end ? `–${it.time_end.slice(0, 5)}` : ''}
                        </span>
                        {it.duration_minutes ? (
                          <span className="text-xs text-ink/40">({it.duration_minutes}m)</span>
                        ) : null}
                      </div>
                      <p className="font-medium text-ink">{it.activity_name}</p>
                      <p className="text-xs text-ink/50">
                        {it.pic ? `PIC: ${it.pic}` : ''}
                        {it.pic && it.location ? ' · ' : ''}
                        {it.location ?? ''}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          STATUS_COLOR[it.status ?? ''] ?? 'bg-ink/10 text-ink/50'
                        }`}>
                          {rundownStatusLabel(it.status)}
                        </span>
                        {it.link && (
                          <a href={it.link} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-burgundy-mid underline">Link</a>
                        )}
                      </div>
                      {it.notes && <p className="mt-1 text-xs text-ink/60">{it.notes}</p>}
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <button onClick={() => setModal({ item: it })}
                        className="rounded-lg px-2 py-1 text-xs text-burgundy-mid hover:bg-burgundy-deep/5">Edit</button>
                      <button onClick={() => handleDelete(it)}
                        className="rounded-lg px-2 py-1 text-xs text-ink/40 hover:bg-ink/5">Hapus</button>
                    </div>
                  </div>

                  {/* Ubah status cepat */}
                  <select
                    value={it.status ?? ''}
                    onChange={(e) => updateItem(it.id, { status: e.target.value })}
                    className="field-input mt-2 py-1.5 text-sm"
                  >
                    {RUNDOWN_STATUS.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <Modal
        open={!!modal}
        title={modal?.item ? 'Edit Kegiatan' : 'Tambah Kegiatan'}
        onClose={() => setModal(null)}
      >
        {modal && (
          <RundownForm
            initial={modal.item}
            onSubmit={(input) =>
              modal.item ? updateItem(modal.item.id, input) : createItem(input)
            }
            onDone={() => setModal(null)}
          />
        )}
      </Modal>
    </>
  )
}
