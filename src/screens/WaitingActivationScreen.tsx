import Brand from '../components/Brand'
import { useAuth } from '../context/AuthContext'
import { whatsappLink } from '../config'

export default function WaitingActivationScreen() {
  const { user, signOut, refreshProfile } = useAuth()

  const message = `Halo, saya ingin mengaktifkan akun Blossom Wedding Planner. Email saya: ${
    user?.email ?? '-'
  }`

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm text-center">
        <Brand size="sm" />

        <div className="card mt-8 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-warm/10 text-2xl">
            ⏳
          </div>
          <h2 className="text-2xl">Akun menunggu aktivasi</h2>
          <p className="text-sm leading-relaxed text-ink/70">
            Terima kasih sudah mendaftar. Akun kamu (
            <span className="font-medium text-ink">{user?.email}</span>) belum
            aktif. Selesaikan pembayaran lewat WhatsApp, lalu admin akan
            mengaktifkan akunmu.
          </p>

          <a
            href={whatsappLink(message)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full"
          >
            Hubungi Admin via WhatsApp
          </a>

          <button onClick={refreshProfile} className="btn-ghost w-full">
            Sudah diaktifkan? Muat ulang
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
