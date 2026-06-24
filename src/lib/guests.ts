// Opsi untuk modul Tamu (sesuai nilai di skema guests).

export const GENDER_OPTIONS = [
  { value: 'P', label: 'Pria' },
  { value: 'W', label: 'Wanita' },
]

export const GUEST_CATEGORIES = [
  { value: 'keluarga_pria', label: 'Keluarga Pria' },
  { value: 'keluarga_wanita', label: 'Keluarga Wanita' },
  { value: 'teman_pria', label: 'Teman Pria' },
  { value: 'teman_wanita', label: 'Teman Wanita' },
  { value: 'rekan_kerja', label: 'Rekan Kerja' },
  { value: 'vip', label: 'VIP' },
  { value: 'vendor', label: 'Vendor' },
]

export const INVITE_TYPES = [
  { value: 'online', label: 'Online' },
  { value: 'fisik', label: 'Fisik' },
]

export const RSVP_STATUS = [
  { value: 'belum_dikirim', label: 'Belum dikirim' },
  { value: 'terkirim', label: 'Terkirim' },
  { value: 'dibuka', label: 'Dibuka' },
  { value: 'hadir', label: 'Hadir' },
  { value: 'tidak_hadir', label: 'Tidak hadir' },
  { value: 'pending', label: 'Pending' },
]

export function rsvpLabel(v: string | null): string {
  return RSVP_STATUS.find((s) => s.value === v)?.label ?? '—'
}

export function categoryLabel(v: string | null): string {
  return GUEST_CATEGORIES.find((c) => c.value === v)?.label ?? '—'
}
