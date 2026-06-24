import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import ReminderForm, { REMINDER_TYPES } from '../components/ReminderForm'
import { useReminders } from '../hooks/useReminders'
import { buildIcs, downloadIcs } from '../lib/ics'
import type { Reminder } from '../types/db'

function typeLabel(v: string | null): string {
  return REMINDER_TYPES.find((t) => t.value === v)?.label ?? 'Lainnya'
}

function formatWhen(iso: string | null): string {
  if (!iso) return 'Tanpa waktu'
  return new Date(iso).toLocaleString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function RemindersPage() {
  const { reminders, createReminder, updateReminder, removeReminder } = useReminders()
  const [modal, setModal] = useState<{ reminder: Reminder | null } | null>(null)
  const [notifPerm, setNotifPerm] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied',
  )

  // Jadwalkan notifikasi lokal untuk pengingat yang akan datang (best-effort, selama app terbuka).
  useEffect(() => {
    if (notifPerm !== 'granted') return
    const timers: number[] = []
    const now = Date.now()
    for (const r of reminders) {
      if (r.is_done || !r.remind_at) continue
      const delay = new Date(r.remind_at).getTime() - now
      // Hanya jadwalkan dalam 24 jam ke depan (batas setTimeout & relevansi).
      if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
        const id = window.setTimeout(() => {
          new Notification('Blossom — Pengingat', { body: r.title, icon: '/pwa-192.png' })
        }, delay)
        timers.push(id)
      }
    }
    return () => timers.forEach((t) => clearTimeout(t))
  }, [reminders, notifPerm])

  async function enableNotif() {
    if (typeof Notification === 'undefined') return
    const perm = await Notification.requestPermission()
    setNotifPerm(perm)
    if (perm === 'granted') {
      new Notification('Blossom', { body: 'Notifikasi aktif 🌸', icon: '/pwa-192.png' })
    }
  }

  function exportIcs() {
    const withTime = reminders.filter((r) => r.remind_at)
    if (withTime.length === 0) {
      alert('Belum ada pengingat berwaktu untuk diekspor.')
      return
    }
    const ics = buildIcs(
      withTime.map((r) => ({
        uid: r.id,
        title: r.title,
        start: new Date(r.remind_at!),
        description: r.notes ?? undefined,
      })),
    )
    downloadIcs('blossom-reminders.ics', ics)
  }

  return (
    <>
      <div className="mb-2">
        <Link to="/more" className="text-sm text-burgundy-mid">← Kembali</Link>
      </div>
      <PageHeader title="Reminder" subtitle="Pengingat & ekspor ke kalender" />

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setModal({ reminder: null })} className="btn-primary px-3 py-2 text-sm">
          + Pengingat
        </button>
        <button onClick={exportIcs} className="btn-ghost px-3 py-2 text-sm">
          Export ke Kalender (.ics)
        </button>
        {notifPerm !== 'granted' && (
          <button onClick={enableNotif} className="btn-ghost px-3 py-2 text-sm">
            Aktifkan Notifikasi
          </button>
        )}
      </div>

      {notifPerm === 'granted' && (
        <p className="mt-3 text-xs text-green-700">✓ Notifikasi aktif (berfungsi selama aplikasi terbuka).</p>
      )}

      <div className="mt-6 space-y-2">
        {reminders.length === 0 ? (
          <p className="card text-sm text-ink/50">Belum ada pengingat. Tap “+ Pengingat”.</p>
        ) : (
          reminders.map((r) => (
            <div key={r.id} className="card flex items-start gap-3 py-3">
              <input
                type="checkbox"
                checked={r.is_done}
                onChange={(e) => updateReminder(r.id, { is_done: e.target.checked })}
                className="mt-0.5 h-5 w-5 shrink-0 rounded accent-burgundy-deep"
              />
              <div className="min-w-0 flex-1">
                <p className={`text-sm ${r.is_done ? 'text-ink/40 line-through' : 'font-medium text-ink'}`}>
                  {r.title}
                </p>
                <p className="text-xs text-ink/50">
                  {formatWhen(r.remind_at)} · {typeLabel(r.type)}
                </p>
                {r.notes && <p className="mt-1 text-xs text-ink/60">{r.notes}</p>}
              </div>
              <div className="flex shrink-0 gap-1">
                <button onClick={() => setModal({ reminder: r })}
                  className="rounded-lg px-2 py-1 text-xs text-burgundy-mid hover:bg-burgundy-deep/5">Edit</button>
                <button onClick={() => confirm('Hapus pengingat ini?') && removeReminder(r.id)}
                  className="rounded-lg px-2 py-1 text-xs text-ink/40 hover:bg-ink/5">Hapus</button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        open={!!modal}
        title={modal?.reminder ? 'Edit Pengingat' : 'Tambah Pengingat'}
        onClose={() => setModal(null)}
      >
        {modal && (
          <ReminderForm
            initial={modal.reminder}
            onSubmit={(input) =>
              modal.reminder ? updateReminder(modal.reminder.id, input) : createReminder(input)
            }
            onDone={() => setModal(null)}
          />
        )}
      </Modal>
    </>
  )
}
