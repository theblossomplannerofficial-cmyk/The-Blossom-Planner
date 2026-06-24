import { CATEGORY_MAP, VENDOR_STATUS, ITEM_STATUS } from '../lib/categories'
import { formatIDR } from '../lib/format'
import type { VendorItem, WeddingEvent } from '../types/db'

interface Props {
  item: VendorItem
  events: WeddingEvent[]
  onEdit: (item: VendorItem) => void
  onDelete: (item: VendorItem) => void
}

function labelOf(list: { value: string; label: string }[], v: string | null) {
  return list.find((x) => x.value === v)?.label ?? null
}

/**
 * Kartu vendor reusable — SATU komponen untuk SEMUA kategori.
 * Field khusus kategori dirender dari kolom JSONB "details".
 */
export default function VendorItemCard({ item, events, onEdit, onDelete }: Props) {
  const cfg = CATEGORY_MAP[item.category]
  const eventName = events.find((e) => e.id === item.event_id)?.name
  const itemStatus = labelOf(ITEM_STATUS, item.status)
  const vendorStatus = labelOf(VENDOR_STATUS, item.vendor_status)

  const selisih = item.budget_difference ?? 0
  const sisa = item.remaining_payment ?? 0

  const detailEntries = cfg?.details
    .map((f) => ({ label: f.label, value: item.details?.[f.key] }))
    .filter((d) => d.value != null && d.value !== '') ?? []

  return (
    <div className="card space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{item.title || '(Tanpa nama)'}</p>
          {item.vendor_name && (
            <p className="truncate text-sm text-ink/60">{item.vendor_name}</p>
          )}
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            onClick={() => onEdit(item)}
            className="rounded-lg px-2 py-1 text-xs text-burgundy-mid hover:bg-burgundy-deep/5"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(item)}
            className="rounded-lg px-2 py-1 text-xs text-ink/40 hover:bg-ink/5"
          >
            Hapus
          </button>
        </div>
      </div>

      {/* Badge status */}
      {(itemStatus || vendorStatus || item.is_paid_off) && (
        <div className="flex flex-wrap gap-2">
          {vendorStatus && (
            <span className="rounded-full bg-burgundy-deep/10 px-2.5 py-0.5 text-xs font-medium text-burgundy-deep">
              {vendorStatus}
            </span>
          )}
          {itemStatus && (
            <span className="rounded-full bg-gold-warm/15 px-2.5 py-0.5 text-xs font-medium text-gold-warm">
              {itemStatus}
            </span>
          )}
          {item.is_paid_off && (
            <span className="rounded-full bg-green-600/10 px-2.5 py-0.5 text-xs font-medium text-green-700">
              Lunas
            </span>
          )}
        </div>
      )}

      {/* Budget grid */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 rounded-2xl bg-cream/70 p-3 text-sm">
        <span className="text-ink/50">Estimasi</span>
        <span className="text-right text-ink">{formatIDR(item.budget_estimate)}</span>
        <span className="text-ink/50">Aktual</span>
        <span className="text-right text-ink">{formatIDR(item.budget_actual)}</span>
        <span className="text-ink/50">Selisih</span>
        <span className={`text-right font-medium ${selisih < 0 ? 'text-burgundy-mid' : 'text-green-700'}`}>
          {formatIDR(selisih)}
        </span>
        <span className="text-ink/50">Total dibayar</span>
        <span className="text-right text-ink">{formatIDR(item.paid_amount)}</span>
        <span className="text-ink/50">Sisa bayar</span>
        <span className="text-right font-medium text-burgundy-deep">{formatIDR(sisa)}</span>
      </div>

      {/* Meta */}
      {(eventName || item.deadline || item.due_date) && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/50">
          {eventName && <span>🗓️ {eventName}</span>}
          {item.due_date && <span>Jatuh tempo: {item.due_date}</span>}
          {item.deadline && <span>Deadline: {item.deadline}</span>}
        </div>
      )}

      {/* Detail kategori */}
      {detailEntries.length > 0 && (
        <div className="space-y-0.5 text-xs text-ink/60">
          {detailEntries.map((d) => (
            <p key={d.label}>
              <span className="text-ink/40">{d.label}:</span> {String(d.value)}
            </p>
          ))}
        </div>
      )}

      {/* Link referensi */}
      {item.reference_links && item.reference_links.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {item.reference_links.map((l, i) => (
            <a
              key={i}
              href={l}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-burgundy-mid underline underline-offset-2"
            >
              Link {i + 1}
            </a>
          ))}
        </div>
      )}

      {item.notes && <p className="text-sm text-ink/70">{item.notes}</p>}
    </div>
  )
}
