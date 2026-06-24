import { useState, type FormEvent } from 'react'
import Brand from '../components/Brand'
import { useAuth } from '../context/AuthContext'

type Mode = 'signin' | 'signup'

export default function LoginScreen() {
  const { signInWithPassword, signUpWithPassword } = useAuth()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setBusy(true)

    if (mode === 'signin') {
      const { error } = await signInWithPassword(email.trim(), password)
      if (error) setError(error)
    } else {
      const { error, needsConfirmation } = await signUpWithPassword(email.trim(), password)
      if (error) {
        setError(error)
      } else if (needsConfirmation) {
        setInfo('Akun dibuat. Cek email kamu untuk konfirmasi, lalu login.')
        setMode('signin')
      }
      // Jika tanpa konfirmasi email, AuthProvider otomatis mengarahkan ke layar berikutnya.
    }
    setBusy(false)
  }

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <Brand variant="full" />

        <form onSubmit={handleSubmit} className="card mt-8 space-y-4">
          <h2 className="text-center text-2xl">
            {mode === 'signin' ? 'Masuk' : 'Daftar Akun'}
          </h2>

          <div>
            <label htmlFor="email" className="field-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field-input"
              placeholder="nama@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="field-label">
              Kata sandi
            </label>
            <input
              id="password"
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field-input"
              placeholder="Minimal 6 karakter"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-burgundy-deep/5 px-3 py-2 text-sm text-burgundy-deep">
              {error}
            </p>
          )}
          {info && (
            <p className="rounded-xl bg-gold-warm/10 px-3 py-2 text-sm text-ink/80">
              {info}
            </p>
          )}

          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? 'Memproses…' : mode === 'signin' ? 'Masuk' : 'Daftar'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/60">
          {mode === 'signin' ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin')
              setError(null)
              setInfo(null)
            }}
            className="font-medium text-burgundy-mid underline-offset-2 hover:underline"
          >
            {mode === 'signin' ? 'Daftar di sini' : 'Masuk'}
          </button>
        </p>
      </div>
    </div>
  )
}
