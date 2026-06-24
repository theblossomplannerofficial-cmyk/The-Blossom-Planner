import Brand from '../components/Brand'
import { useAuth } from '../context/AuthContext'
import { whatsappLink } from '../config'

export default function AccessExpiredScreen() {
  const { user, profile, signOut, refreshProfile } = useAuth()

  const expired = profile?.expires_at
    ? new Date(profile.expires_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  const message = `Halo, masa akses Blossom Wedding Planner saya sudah berakhir. Saya ingin memperpanjang. Email: ${
    user?.email ?? '-'
  }`

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm text-center">
        <Brand size="sm" />

        <div className="card mt-8 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-burgundy-deep/5 text-2xl">
            🌙
          </div>
          <h2 className="text-2xl">Akses berakhir</h2>
          <p className="text-sm leading-relaxed text-ink/70">
            Masa akses akun kamu{expired ? ` berakhir pada ${expired}` : ''}.
            Perpanjang lewat WhatsApp untuk melanjutkan persiapan pernikahanmu.
          </p>

          <a
            href={whatsappLink(message)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full"
          >
            Perpanjang via WhatsApp
          </a>

          <button onClick={refreshProfile} className="btn-ghost w-full">
            Sudah diperpanjang? Muat ulang
          </button>
        </div>

        <button
          onClick={signOut}
          className="mt-6 text-sm text-ink/50 underline-offset-2 hover:underline"
        >
          Keluar
        </button>
      </div>
    </div>
  )
}
