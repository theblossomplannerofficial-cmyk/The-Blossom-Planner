import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import EventForm from '../components/EventForm'
import VendorItemForm from '../components/VendorItemForm'
import VendorItemCard from '../components/VendorItemCard'
import { useEvents } from '../hooks/useEvents'
import { useVendorItems } from '../hooks/useVendorItems'
import { CATEGORIES, categoryLabel, categoryIcon } from '../lib/categories'
import type { VendorItem, WeddingEvent } from '../types/db'

export default function EventsPage() {
  const { events, createEvent, updateEvent, removeEvent } = useEvents()
  const { items, loading, createItem, updateItem, removeItem } = useVendorItems()

  const [eventModal, setEventModal] = useState<{ item: WeddingEvent | null } | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [vendorModal, setVendorModal] = useState<{
    category: string
    item: VendorItem | null
  } | null>(null)

  // Kelompokkan item per kategori, urut sesuai CATEGORIES.
  const grouped = useMemo(() => {
    const map = new Map<string, VendorItem[]>()
    for (const it of items) {
      const arr = map.get(it.category) ?? []
      arr.push(it)
      map.set(it.category, arr)
    }
    return CATEGORIES.filter((c) => map.has(c.key)).map((c) => ({
      cfg: c,
      items: map.get(c.key)!,
    }))
  }, [items])

  function handleDeleteEvent(ev: WeddingEvent) {
    if (confirm(`Hapus acara "${ev.name}"?`)) removeEvent(ev.id)
  }
  function handleDeleteItem(it: VendorItem) {
    if (confirm(`Hapus item "${it.title || 'ini'}"?`)) removeItem(it.id)
  }

  return (
    <>
      <PageHeader title="Acara" subtitle="Acara & kebutuhan vendor per kategori" />

      {/* ACARA */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-2xl">Daftar Acara</h2>
        <button onClick={() => setEventModal({ item: null })} className="btn-ghost px-3 py-1.5 text-sm">
          + Acara
        </button>
      </div>

      {events.length === 0 ? (
        <p className="card text-sm text-ink/50">
          Belum ada acara. Tambah Lamaran, Akad, atau Resepsi.
        </p>
      ) : (
        <div className="space-y-3">
          {events.map((ev) => (
            <div key={ev.id} className="card flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-ink">{ev.name}</p>
                <p className="text-sm text-ink/60">
                  {ev.event_date || 'Tanggal belum diisi'}
                  {ev.time_start ? ` · ${ev.time_start.slice(0, 5)}` : ''}
                </p>
                {ev.location_name && (
                  <p className="text-sm text-ink/50">{ev.location_name}</p>
                )}
              </div>
              <div className="flex shrink-0 gap-1">
                <button onClick={() => setEventModal({ item: ev })}
                  className="rounded-lg px-2 py-1 text-xs text-burgundy-mid hover:bg-burgundy-deep/5">Edit</button>
                <button onClick={() => handleDeleteEvent(ev)}
                  className="rounded-lg px-2 py-1 text-xs text-ink/40 hover:bg-ink/5">Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VENDOR */}
      <div className="mb-3 mt-8 flex items-center justify-between">
        <h2 className="text-2xl">Vendor & Kebutuhan</h2>
        <button onClick={() => setPickerOpen(true)} className="btn-primary px-3 py-1.5 text-sm">
          + Item
        </button>
      </div>

      {loading ? (
        <p className="card text-sm text-ink/50">Memuat…</p>
      ) : grouped.length === 0 ? (
        <p className="card text-sm text-ink/50">
          Belum ada item. Tap “+ Item” untuk menambah kebutuhan vendor (venue, catering, dekorasi, dll.).
        </p>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ cfg, items }) => (
            <section key={cfg.key}>
              <h3 className="mb-2 flex items-center gap-2 font-display text-xl font-light text-burgundy-deep">
                <span>{cfg.icon}</span> {cfg.label}
                <span className="text-sm text-ink/40">({items.length})</span>
              </h3>
              <div className="space-y-3">
                {items.map((it) => (
                  <VendorItemCard
                    key={it.id}
                    item={it}
                    events={events}
                    onEdit={(item) => setVendorModal({ category: item.category, item })}
                    onDelete={handleDeleteItem}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* MODAL: Acara */}
      <Modal
        open={!!eventModal}
        title={eventModal?.item ? 'Edit Acara' : 'Tambah Acara'}
        onClose={() => setEventModal(null)}
      >
        {eventModal && (
          <EventForm
            initial={eventModal.item}
            onSubmit={(input) =>
              eventModal.item
                ? updateEvent(eventModal.item.id, input)
                : createEvent(input)
            }
            onDone={() => setEventModal(null)}
          />
        )}
      </Modal>

      {/* MODAL: Pilih kategori */}
      <Modal open={pickerOpen} title="Pilih Kategori" onClose={() => setPickerOpen(false)}>
        <div className="grid grid-cols-2 gap-3 pb-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => {
                setPickerOpen(false)
                setVendorModal({ category: c.key, item: null })
              }}
              className="flex items-center gap-2 rounded-2xl bg-white p-3 text-left ring-1 ring-ink/5 active:scale-[0.98]"
            >
              <span className="text-xl">{c.icon}</span>
              <span className="text-sm font-medium text-ink">{c.label}</span>
            </button>
          ))}
        </div>
      </Modal>

      {/* MODAL: Item vendor */}
      <Modal
        open={!!vendorModal}
        title={
          vendorModal
            ? `${vendorModal.item ? 'Edit' : 'Tambah'} ${categoryLabel(vendorModal.category)} ${categoryIcon(
                vendorModal.category,
              )}`
            : ''
        }
        onClose={() => setVendorModal(null)}
      >
        {vendorModal && (
          <VendorItemForm
            category={vendorModal.category}
            events={events}
            initial={vendorModal.item}
            onSubmit={(input) =>
              vendorModal.item
                ? updateItem(vendorModal.item.id, input)
                : createItem(input)
            }
            onDone={() => setVendorModal(null)}
          />
        )}
      </Modal>
    </>
  )
}
