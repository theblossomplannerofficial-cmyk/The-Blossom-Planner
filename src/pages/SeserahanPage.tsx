import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import VendorItemForm from '../components/VendorItemForm'
import VendorItemCard from '../components/VendorItemCard'
import PartyForm from '../components/PartyForm'
import { useVendorItems } from '../hooks/useVendorItems'
import { useEvents } from '../hooks/useEvents'
import { usePartyMembers } from '../hooks/usePartyMembers'
import { categoryLabel } from '../lib/categories'
import type { PartyMember, VendorItem } from '../types/db'

const ROLE_LABEL: Record<string, string> = {
  pendamping: 'Pendamping',
  koordinator_tamu: 'Koordinator Tamu',
  dokumentasi: 'Dokumentasi',
  lainnya: 'Lainnya',
}

export default function SeserahanPage() {
  const { items, createItem, updateItem, removeItem } = useVendorItems()
  const { events } = useEvents()
  const { members, createMember, updateMember, removeMember } = usePartyMembers()

  const [vendorModal, setVendorModal] = useState<{ category: string; item: VendorItem | null } | null>(null)
  const [partyModal, setPartyModal] = useState<{ party: string; member: PartyMember | null } | null>(null)

  const seserahan = useMemo(() => items.filter((i) => i.category === 'seserahan'), [items])
  const mahar = useMemo(() => items.filter((i) => i.category === 'mahar'), [items])
  const bridesmaids = useMemo(() => members.filter((m) => m.party === 'bridesmaid'), [members])
  const groomsmen = useMemo(() => members.filter((m) => m.party === 'groomsmen'), [members])

  function renderVendorSection(category: string, list: VendorItem[]) {
    return (
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-2xl">{categoryLabel(category)}</h2>
          <button onClick={() => setVendorModal({ category, item: null })} className="btn-primary px-3 py-1.5 text-sm">
            + Tambah
          </button>
        </div>
        {list.length === 0 ? (
          <p className="card text-sm text-ink/50">Belum ada {categoryLabel(category).toLowerCase()}.</p>
        ) : (
          <div className="space-y-3">
            {list.map((it) => (
              <VendorItemCard
                key={it.id}
                item={it}
                events={events}
                onEdit={(item) => setVendorModal({ category: item.category, item })}
                onDelete={(item) => confirm(`Hapus "${item.title || 'item'}"?`) && removeItem(item.id)}
              />
            ))}
          </div>
        )}
      </section>
    )
  }

  function renderPartySection(party: string, title: string, list: PartyMember[]) {
    return (
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-2xl">{title}</h2>
          <button onClick={() => setPartyModal({ party, member: null })} className="btn-primary px-3 py-1.5 text-sm">
            + Tambah
          </button>
        </div>
        {list.length === 0 ? (
          <p className="card text-sm text-ink/50">Belum ada anggota.</p>
        ) : (
          <div className="space-y-2">
            {list.map((m) => (
              <div key={m.id} className="card flex items-start justify-between gap-2 py-3">
                <div className="min-w-0">
                  <p className="font-medium text-ink">{m.name}</p>
                  <p className="text-xs text-ink/50">
                    {ROLE_LABEL[m.role ?? ''] ?? '—'}
                    {m.clothing_size ? ` · Baju ${m.clothing_size}` : ''}
                    {m.contact ? ` · ${m.contact}` : ''}
                  </p>
                  {m.notes && <p className="mt-1 text-xs text-ink/60">{m.notes}</p>}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button onClick={() => setPartyModal({ party: m.party ?? party, member: m })}
                    className="rounded-lg px-2 py-1 text-xs text-burgundy-mid hover:bg-burgundy-deep/5">Edit</button>
                  <button onClick={() => confirm(`Hapus "${m.name}"?`) && removeMember(m.id)}
                    className="rounded-lg px-2 py-1 text-xs text-ink/40 hover:bg-ink/5">Hapus</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    )
  }

  return (
    <>
      <div className="mb-2">
        <Link to="/more" className="text-sm text-burgundy-mid">← Kembali</Link>
      </div>
      <PageHeader title="Seserahan & Pendamping" subtitle="Seserahan, mahar, bridesmaid & groomsmen" />

      <div className="space-y-8">
        {renderVendorSection('seserahan', seserahan)}
        {renderVendorSection('mahar', mahar)}
        {renderPartySection('bridesmaid', 'Bridesmaid', bridesmaids)}
        {renderPartySection('groomsmen', 'Groomsmen', groomsmen)}
      </div>

      {/* Modal vendor (seserahan/mahar) */}
      <Modal
        open={!!vendorModal}
        title={vendorModal ? `${vendorModal.item ? 'Edit' : 'Tambah'} ${categoryLabel(vendorModal.category)}` : ''}
        onClose={() => setVendorModal(null)}
      >
        {vendorModal && (
          <VendorItemForm
            category={vendorModal.category}
            events={events}
            initial={vendorModal.item}
            onSubmit={(input) =>
              vendorModal.item ? updateItem(vendorModal.item.id, input) : createItem(input)
            }
            onDone={() => setVendorModal(null)}
          />
        )}
      </Modal>

      {/* Modal pendamping */}
      <Modal
        open={!!partyModal}
        title={partyModal?.member ? 'Edit Anggota' : 'Tambah Anggota'}
        onClose={() => setPartyModal(null)}
      >
        {partyModal && (
          <PartyForm
            defaultParty={partyModal.party}
            initial={partyModal.member}
            onSubmit={(input) =>
              partyModal.member ? updateMember(partyModal.member.id, input) : createMember(input)
            }
            onDone={() => setPartyModal(null)}
          />
        )}
      </Modal>
    </>
  )
}
