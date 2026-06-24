import { useState, type FormEvent } from 'react'
import type { CoupleProfile, CoupleProfileInput } from '../types/db'

interface Props {
  title: string
  initial: CoupleProfile | null
  onSave: (input: CoupleProfileInput) => Promise<{ error: string | null }>
}

export default function CoupleProfileForm({ title, initial, onSave }: Props) {
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [fullName, setFullName] = useState(initial?.full_name ?? '')
  const [nickname, setNickname] = useState(initial?.nickname ?? '')
  const [birthPlace, setBirthPlace] = useState(initial?.birth_place ?? '')
  const [birthDate, setBirthDate] = useState(initial?.birth_date ?? '')
  const [religion, setReligion] = useState(initial?.religion ?? '')
  const [education, setEducation] = useState(initial?.education ?? '')
  const [occupation, setOccupation] = useState(initial?.occupation ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [address, setAddress] = useState(initial?.address ?? '')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    const { error } = await onSave({
      full_name: fullName.trim() || null,
      nickname: nickname.trim() || null,
      birth_place: birthPlace.trim() || null,
      birth_date: birthDate || null,
      religion: religion.trim() || null,
      education: education.trim() || null,
      occupation: occupation.trim() || null,
      phone: phone.trim() || null,
      email: email.trim() || null,
      address: address.trim() || null,
    })
    setBusy(false)
    if (error) setError(error)
    else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-3">
      <h3 className="font-display text-xl font-light text-burgundy-deep">{title}</h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="field-label">Nama lengkap</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="field-input" />
        </div>
        <div>
          <label className="field-label">Panggilan</label>
          <input value={nickname} onChange={(e) => setNickname(e.target.value)} className="field-input" />
        </div>
        <div>
          <label className="field-label">Agama</label>
          <input value={religion} onChange={(e) => setReligion(e.target.value)} className="field-input" />
        </div>
        <div>
          <label className="field-label">Tempat lahir</label>
          <input value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} className="field-input" />
        </div>
        <div>
          <label className="field-label">Tanggal lahir</label>
          <input type="date" value={birthDate ?? ''} onChange={(e) => setBirthDate(e.target.value)} className="field-input" />
        </div>
        <div>
          <label className="field-label">Pendidikan</label>
          <input value={education} onChange={(e) => setEducation(e.target.value)} className="field-input" />
        </div>
        <div>
          <label className="field-label">Pekerjaan</label>
          <input value={occupation} onChange={(e) => setOccupation(e.target.value)} className="field-input" />
        </div>
        <div>
          <label className="field-label">No. HP</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="field-input" />
        </div>
        <div>
          <label className="field-label">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field-input" />
        </div>
        <div className="col-span-2">
          <label className="field-label">Alamat</label>
          <textarea rows={2} value={address} onChange={(e) => setAddress(e.target.value)} className="field-input" />
        </div>
      </div>

      {error && <p className="rounded-xl bg-burgundy-deep/5 px-3 py-2 text-sm text-burgundy-deep">{error}</p>}

      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? 'Menyimpan…' : saved ? 'Tersimpan ✓' : 'Simpan'}
      </button>
    </form>
  )
}
