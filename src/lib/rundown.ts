// Opsi untuk modul Rundown (sesuai nilai status di skema rundown_items).

export const RUNDOWN_STATUS = [
  { value: 'belum_dimulai', label: 'Belum dimulai' },
  { value: 'sedang_berlangsung', label: 'Sedang berlangsung' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'ditunda', label: 'Ditunda' },
  { value: 'dibatalkan', label: 'Dibatalkan' },
]

export function rundownStatusLabel(v: string | null): string {
  return RUNDOWN_STATUS.find((s) => s.value === v)?.label ?? '—'
}

// Saran kegiatan umum (dropdown + tetap bisa custom).
export const COMMON_ACTIVITIES = [
  'Persiapan & Make Up',
  'Kedatangan Tamu',
  'Akad Nikah',
  'Sesi Foto Keluarga',
  'Resepsi Dimulai',
  'Sambutan Keluarga',
  'Pemotongan Kue',
  'Tukar Cincin',
  'Hiburan / Tarian',
  'Lempar Buket',
  'Sesi Foto Bersama Tamu',
  'Penutupan',
]

// Saran PIC umum.
export const COMMON_PIC = ['Mempelai Pria', 'Mempelai Wanita', 'MC', 'WO', 'Keluarga', 'Vendor']
