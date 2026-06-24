import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import GiftForm from '../components/GiftForm'
import { useHoneymoon } from '../hooks/useHoneymoon'
import { useGifts } from '../hooks/useGifts'
import { formatIDR } from '../lib/format'
import type { Gift } from '../types/db'

function num(v: string): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export default function HoneymoonPage() {
  const { honeymoon, saveHoneymoon } = useHoneymoon()
  const { gifts, createGift, updateGift, removeGift } = useGifts()

  // Form honeymoon (inline)
  const [destination, setDestination] = useState('')
  const [departure, setDeparture] = useState('')
  const [ret, setRet] = useState('')
  const [hotel, setHotel] = useState('')
  const [ticket, setTicket] = useState('')
  const [bTransport, setBTransport] = useState('')
  const [bHotel, setBHotel] = useState('')
  const [bAct, setBAct] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (honeymoon) {
      setDestination(honeymoon.destination ?? '')
      setDeparture(honeymoon.departure_date ?? '')
      setRet(honeymoon.return_date ?? '')
      setHotel(honeymoon.hotel ?? '')
      setTicket(honeymoon.ticket_info ?? '')
      setBTransport(honeymoon.budget_transport != null ? String(honeymoon.budget_transport) : '')
      setBHotel(honeymoon.budget_hotel != null ? String(honeymoon.budget_hotel) : '')
      setBAct(honeymoon.budget_activities != null ? String(honeymoon.budget_activities) : '')
      setNotes(honeymoon.notes ?? '')
    }
  }, [honeymoon])

  const totalHoneymoon = num(bTransport) + num(bHotel) + num(bAct)

  async function handleSaveHoneymoon() {
    setSaving(true)
    setSaved(false)
    const { error } = await saveHoneymoon({
      destination: destination.trim() || null,
      departure_date: departure || null,
      return_date: ret || null,
      hotel: hotel.trim() || null,
      ticket_info: ticket.trim() || null,
      budget_transport: num(bTransport),
      budget_hotel: num(bHotel),
      budget_activities: num(bAct),
      notes: notes.trim() || null,
    })
    setSaving(false)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  // Gifts
  const [giftModal, setGiftModal] = useState<{ gift: Gift | null } | null>(null)
  const giftTotals = useMemo(() => {
    let cash = 0
    let registryValue = 0
    for (const g of gifts) {
      if (g.type === 'cash') cash += Number(g.amount ?? 0)
      else registryValue += Number(g.gift_value ?? 0)
    }
    return { cash, registryValue }
  }, [gifts])

  return (
    <>
      <div className="mb-2">
        <Link to="/more" className="text-sm text-burgundy-mid">← Kembali</Link>
      </div>
      <PageHeader title="Honeymoon & Hadiah" subtitle="Rencana bulan madu & catatan hadiah/angpao" />

      {/* HONEYMOON */}
      <h2 className="mb-3 text-2xl">Bulan Madu</h2>
      <div className="card space-y-4">
        <div>
          <label className="field-label">Destinasi</label>
          <input value={destination} onChange={(e) => setDestination(e.target.value)}
            className="field-input" placeholder="mis. Bali" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Berangkat</label>
            <input type="date" value={departure} onChange={(e) => setDeparture(e.target.value)} className="field-input" />
          </div>
          <div>
            <label className="field-label">Kembali</label>
            <input type="date" value={ret} onChange={(e) => setRet(e.target.value)} className="field-input" />
          </div>
        </div>
        <div>
          <label className="field-label">Hotel</label>
          <input value={hotel} onChange={(e) => setHotel(e.target.value)} className="field-input" placeholder="Nama hotel" />
        </div>
        <div>
          <label className="field-label">Info tiket</label>
          <input value={ticket} onChange={(e) => setTicket(e.target.value)} className="field-input" placeholder="mis. Garuda GA-404" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="field-label">Transport</label>
            <input type="number" min={0} value={bTransport} onChange={(e) => setBTransport(e.target.value)} className="field-input" placeholder="0" />
          </div>
          <div>
            <label className="field-label">Hotel</label>
            <input type="number" min={0} value={bHotel} onChange={(e) => setBHotel(e.target.value)} className="field-input" placeholder="0" />
          </div>
          <div>
            <label className="field-label">Aktivitas</label>
            <input type="number" min={0} value={bAct} onChange={(e) => setBAct(e.target.value)} className="field-input" placeholder="0" />
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink/60">Total budget honeymoon</span>
          <b className="text-burgundy-deep">{formatIDR(totalHoneymoon)}</b>
        </div>
        <div>
          <label className="field-label">Catatan</label>
          <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="field-input" />
        </div>
        <button onClick={handleSaveHoneymoon} disabled={saving} className="btn-primary w-full">
          {saving ? 'Menyimpan…' : saved ? 'Tersimpan ✓' : 'Simpan Rencana Honeymoon'}
        </button>
      </div>

      {/* GIFTS */}
      <div className="mb-3 mt-8 flex items-center justify-between">
        <h2 className="text-2xl">Hadiah & Angpao</h2>
        <button onClick={() => setGiftModal({ gift: null })} className="btn-primary px-3 py-1.5 text-sm">
          + Hadiah
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <p className="text-sm text-ink/60">Total Angpao</p>
          <p className="mt-1 font-display text-3xl font-light text-burgundy-deep">{formatIDR(giftTotals.cash)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-ink/60">Nilai Hadiah</p>
          <p className="mt-1 font-display text-3xl font-light text-burgundy-deep">{formatIDR(giftTotals.registryValue)}</p>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {gifts.length === 0 ? (
          <p className="card text-sm text-ink/50">Belum ada catatan hadiah. Tap “+ Hadiah”.</p>
        ) : (
          gifts.map((g) => (
            <div key={g.id} className="card flex items-start justify-between gap-2 py-3">
              <div className="min-w-0">
                <p className="font-medium text-ink">{g.giver_name || '(Tanpa nama)'}</p>
                <p className="text-xs text-ink/50">
                  {g.type === 'cash'
                    ? `Angpao · ${formatIDR(g.amount)}${g.payment_method ? ` · ${g.payment_method}` : ''}`
                    : `Hadiah · ${g.gift_type ?? '-'}${g.gift_value ? ` · ${formatIDR(g.gift_value)}` : ''}`}
                </p>
                {g.notes && <p className="mt-1 text-xs text-ink/60">{g.notes}</p>}
              </div>
              <div className="flex shrink-0 gap-1">
                <button onClick={() => setGiftModal({ gift: g })}
                  className="rounded-lg px-2 py-1 text-xs text-burgundy-mid hover:bg-burgundy-deep/5">Edit</button>
                <button onClick={() => confirm('Hapus catatan ini?') && removeGift(g.id)}
                  className="rounded-lg px-2 py-1 text-xs text-ink/40 hover:bg-ink/5">Hapus</button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        open={!!giftModal}
        title={giftModal?.gift ? 'Edit Hadiah' : 'Tambah Hadiah'}
        onClose={() => setGiftModal(null)}
      >
        {giftModal && (
          <GiftForm
            initial={giftModal.gift}
            onSubmit={(input) =>
              giftModal.gift ? updateGift(giftModal.gift.id, input) : createGift(input)
            }
            onDone={() => setGiftModal(null)}
          />
        )}
      </Modal>
    </>
  )
}
