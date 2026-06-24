import { useState, type FormEvent } from 'react'
import { useWedding } from '../context/WeddingContext'
import { useAuth } from '../context/AuthContext'

export default function OnboardingScreen() {
  const { createWedding } = useWedding()
  const { signOut } = useAuth()

  const [groomName, setGroomName] = useState('')
  const [brideName, setBrideName] = useState('')
  const [groomNick, setGroomNick] = useState('')
  const [brideNick, setBrideNick] = useState('')
  const [dateEngagement, setDateEngagement] = useState('')
  const [dateAkad, setDateAkad] = useState('')
  const [dateResepsi, setDateResepsi] = useState('')
  const [totalBudget, setTotalBudget] = useState('')

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)

    const { error } = await createWedding({
      groom_name: groomName.trim() || null,
      bride_name: brideName.trim() || null,
      groom_nickname: groomNick.trim() || null,
      bride_nickname: brideNick.trim() || null,
      date_engagement: dateEngagement || null,
      date_akad: dateAkad || null,
      date_resepsi: dateResepsi || null,
      total_budget: totalBudget ? Number(totalBudget) : 0,
    })

    setBusy(false)
    if (error) setError(error)
    // Jika sukses, WeddingProvider otomatis mengarahkan ke Dashboard.
  }

  return (
    <div className="mx-auto min-h-[100dvh] max-w-md px-5 py-10">
      <header className="text-center">
        <p className="font-script text-4xl text-burgundy-deep">Selamat datang 🌸</p>
        <h1 className="mt-2 text-2xl">Ceritakan tentang pernikahanmu</h1>
        <p className="mt-1 text-sm text-ink/60">
          Isi data dasar dulu — bisa diubah kapan saja nanti.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="card mt-8 space-y-5">
        {/* Nama pasangan */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="bride" className="field-label">
              Nama Mempelai Wanita
            </label>
            <input
              id="bride"
              required
              value={brideName}
              onChange={(e) => setBrideName(e.target.value)}
              className="field-input"
              placeholder="Nama lengkap"
            />
          </div>
          <div>
            <label htmlFor="groom" className="field-label">
              Nama Mempelai Pria
            </label>
            <input
              id="groom"
              required
              value={groomName}
              onChange={(e) => setGroomName(e.target.value)}
              className="field-input"
              placeholder="Nama lengkap"
            />
          </div>
          <div>
            <label htmlFor="brideNick" className="field-label">
              Panggilan Wanita
            </label>
            <input
              id="brideNick"
              value={brideNick}
              onChange={(e) => setBrideNick(e.target.value)}
              className="field-input"
              placeholder="Opsional"
            />
          </div>
          <div>
            <label htmlFor="groomNick" className="field-label">
              Panggilan Pria
            </label>
            <input
              id="groomNick"
              value={groomNick}
              onChange={(e) => setGroomNick(e.target.value)}
              className="field-input"
              placeholder="Opsional"
            />
          </div>
        </div>

        <hr className="border-ink/5" />

        {/* Tanggal */}
        <div className="space-y-3">
          <div>
            <label htmlFor="akad" className="field-label">
              Tanggal Akad
            </label>
            <input
              id="akad"
              type="date"
              required
              value={dateAkad}
              onChange={(e) => setDateAkad(e.target.value)}
              className="field-input"
            />
          </div>
          <div>
            <label htmlFor="resepsi" className="field-label">
              Tanggal Resepsi
            </label>
            <input
              id="resepsi"
              type="date"
              required
              value={dateResepsi}
              onChange={(e) => setDateResepsi(e.target.value)}
              className="field-input"
            />
          </div>
          <div>
            <label htmlFor="engagement" className="field-label">
              Tanggal Lamaran <span className="text-ink/40">(opsional)</span>
            </label>
            <input
              id="engagement"
              type="date"
              value={dateEngagement}
              onChange={(e) => setDateEngagement(e.target.value)}
              className="field-input"
            />
          </div>
        </div>

        <hr className="border-ink/5" />

        <div>
          <label htmlFor="budget" className="field-label">
            Perkiraan Total Budget <span className="text-ink/40">(opsional)</span>
          </label>
          <input
            id="budget"
            type="number"
            inputMode="numeric"
            min={0}
            value={totalBudget}
            onChange={(e) => setTotalBudget(e.target.value)}
            className="field-input"
            placeholder="mis. 150000000"
          />
        </div>

        {error && (
          <p className="rounded-xl bg-burgundy-deep/5 px-3 py-2 text-sm text-burgundy-deep">
            {error}
          </p>
        )}

        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? 'Menyimpan…' : 'Mulai Rencanakan'}
        </button>
      </form>

      <button
        onClick={signOut}
        className="mx-auto mt-6 block text-sm text-ink/50 underline-offset-2 hover:underline"
      >
        Keluar
      </button>
    </div>
  )
}
