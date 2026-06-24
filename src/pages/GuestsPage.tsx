import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import GuestForm from '../components/GuestForm'
import { useGuests } from '../hooks/useGuests'
import { useEvents } from '../hooks/useEvents'
import { RSVP_STATUS, rsvpLabel, categoryLabel } from '../lib/guests'
import type { Guest } from '../types/db'

const RSVP_COLOR: Record<string, string> = {
  hadir: 'bg-green-600/10 text-green-700',
  tidak_hadir: 'bg-burgundy-deep/10 text-burgundy-deep',
  pending: 'bg-gold-warm/15 text-gold-warm',
  belum_dikirim: 'bg-ink/10 text-ink/60',
  terkirim: 'bg-ink/10 text-ink/60',
  dibuka: 'bg-ink/10 text-ink/60',
}

export default function GuestsPage() {
  const { guests, loading, createGuest, updateGuest, removeGuest } = useGuests()
  const { events } = useEvents()
  const [modal, setModal] = useState<{ guest: Guest | null } | null>(null)
  const [filter, setFilter] = useState('all')

  const rekap = useMemo(() => {
    let people = 0
    let attending = 0
    let attendingPeople = 0
    let unconfirmed = 0
    for (const g of guests) {
      const head = 1 + (g.companions_count ?? 0)
      people += head
      if (g.rsvp_status === 'hadir') {
        attending += 1
        attendingPeople += head
      }
      if (!['hadir', 'tidak_hadir'].includes(g.rsvp_status ?? '')) unconfirmed += 1
    }
    return { total: guests.length, people, attending, attendingPeople, unconfirmed }
  }, [guests])

  const filtered = useMemo(
    () => (filter === 'all' ? guests : guests.filter((g) => g.rsvp_status === filter)),
    [guests, filter],
  )

  function handleDelete(g: Guest) {
    if (confirm(`Hapus tamu "${g.name}"?`)) removeGuest(g.id)
  }

  return (
    <>
      <PageHeader title="Tamu" subtitle="Daftar tamu & RSVP" />

      {/* Rekap */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <p className="text-sm text-ink/60">Total Undangan</p>
          <p className="mt-1 font-display text-4xl font-light text-burgundy-deep">{rekap.total}</p>
          <p className="text-xs text-ink/50">{rekap.people} orang termasuk pendamping</p>
        </div>
        <div className="card">
          <p className="text-sm text-ink/60">Hadir (RSVP)</p>
          <p className="mt-1 font-display text-4xl font-light text-green-700">{rekap.attending}</p>
          <p className="text-xs text-ink/50">≈ {rekap.attendingPeople} orang</p>
        </div>
      </div>
      <div className="mt-3 card flex items-center justify-between">
        <span className="text-sm text-ink/60">Belum konfirmasi</span>
        <span className="font-display text-2xl font-light text-gold-warm">{rekap.unconfirmed}</span>
      </div>

      {/* Aksi + filter */}
      <div className="mt-6 mb-3 flex items-center justify-between gap-2">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="field-input max-w-[55%] py-2">
          <option value="all">Semua status</option>
          {RSVP_STATUS.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
        </select>
        <button onClick={() => setModal({ guest: null })} className="btn-primary px-3 py-2 text-sm">
          + Tamu
        </button>
      </div>

      {loading ? (
        <p className="card text-sm text-ink/50">Memuat…</p>
      ) : filtered.length === 0 ? (
        <p className="card text-sm text-ink/50">
          {guests.length === 0 ? 'Belum ada tamu. Tap “+ Tamu”.' : 'Tidak ada tamu pada filter ini.'}
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((g) => (
            <div key={g.id} className="card py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{g.name}</p>
                  <p className="text-xs text-ink/50">
                    {g.category ? categoryLabel(g.category) : 'Tanpa kategori'}
                    {g.companions_count ? ` · +${g.companions_count} pendamping` : ''}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    RSVP_COLOR[g.rsvp_status ?? ''] ?? 'bg-ink/10 text-ink/60'
                  }`}
                >
                  {rsvpLabel(g.rsvp_status)}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <select
                  value={g.rsvp_status ?? ''}
                  onChange={(e) => updateGuest(g.id, { rsvp_status: e.target.value })}
                  className="field-input flex-1 py-1.5 text-sm"
                >
                  {RSVP_STATUS.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
                </select>
                <button onClick={() => setModal({ guest: g })}
                  className="rounded-lg px-2 py-1 text-xs text-burgundy-mid hover:bg-burgundy-deep/5">Edit</button>
                <button onClick={() => handleDelete(g)}
                  className="rounded-lg px-2 py-1 text-xs text-ink/40 hover:bg-ink/5">Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!modal}
        title={modal?.guest ? 'Edit Tamu' : 'Tambah Tamu'}
        onClose={() => setModal(null)}
      >
        {modal && (
          <GuestForm
            events={events}
            initial={modal.guest}
            onSubmit={(input) =>
              modal.guest ? updateGuest(modal.guest.id, input) : createGuest(input)
            }
            onDone={() => setModal(null)}
          />
        )}
      </Modal>
    </>
  )
}
