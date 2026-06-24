import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../context/AuthContext'

interface MenuLink {
  to?: string
  icon: string
  label: string
  soon?: boolean
}

const MENU: MenuLink[] = [
  { to: '/profil', icon: '💑', label: 'Profil Pernikahan' },
  { to: '/checklist', icon: '✅', label: 'Checklist & Timeline' },
  { to: '/rundown', icon: '🗒️', label: 'Rundown Acara' },
  { to: '/dokumen', icon: '📄', label: 'Dokumen KUA' },
  { to: '/seserahan', icon: '🧺', label: 'Seserahan & Pendamping' },
  { to: '/honeymoon', icon: '✈️', label: 'Honeymoon & Hadiah' },
  { to: '/reminder', icon: '🔔', label: 'Reminder' },
]

export default function MorePage() {
  const { user, profile, signOut } = useAuth()

  return (
    <>
      <PageHeader title="More" subtitle="Akun & menu lainnya" />

      <div className="card space-y-1">
        <p className="text-sm text-ink/50">Masuk sebagai</p>
        <p className="font-medium text-ink">{user?.email}</p>
        {profile?.expires_at && (
          <p className="pt-2 text-xs text-ink/50">
            Akses berlaku hingga{' '}
            {new Date(profile.expires_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        )}
      </div>

      <div className="mt-4 overflow-hidden rounded-3xl bg-white ring-1 ring-ink/5">
        {MENU.map((m, i) => {
          const content = (
            <div
              className={`flex items-center gap-3 px-4 py-3.5 ${
                i > 0 ? 'border-t border-ink/5' : ''
              } ${m.soon ? 'opacity-50' : 'active:bg-cream'}`}
            >
              <span className="text-xl">{m.icon}</span>
              <span className="flex-1 text-sm font-medium text-ink">{m.label}</span>
              {m.soon ? (
                <span className="text-xs text-ink/40">Segera</span>
              ) : (
                <span className="text-ink/30">›</span>
              )}
            </div>
          )
          return m.to && !m.soon ? (
            <Link key={m.label} to={m.to}>
              {content}
            </Link>
          ) : (
            <div key={m.label}>{content}</div>
          )
        })}
      </div>

      <button onClick={signOut} className="btn-ghost mt-6 w-full">
        Keluar
      </button>
    </>
  )
}
