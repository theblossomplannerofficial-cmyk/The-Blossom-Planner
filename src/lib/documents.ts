// Opsi pemilik dokumen + daftar dokumen standar KUA (seed).

export const DOC_OWNERS = [
  { value: 'groom', label: 'Mempelai Pria' },
  { value: 'bride', label: 'Mempelai Wanita' },
  { value: 'saksi', label: 'Saksi' },
  { value: 'orangtua', label: 'Orang Tua' },
  { value: 'bersama', label: 'Bersama' },
]

export function ownerLabel(v: string | null): string {
  return DOC_OWNERS.find((o) => o.value === v)?.label ?? '—'
}

export interface SeedDoc {
  name: string
  owner: string
}

// Dokumen umum untuk nikah di KUA (Indonesia) — sesuai daftar sub-prompt.
export const DEFAULT_DOCUMENTS: SeedDoc[] = [
  { name: 'Surat Pengantar Nikah dari Desa/Kelurahan (N1)', owner: 'bersama' },
  { name: 'Surat Keterangan Untuk Nikah', owner: 'bersama' },
  { name: 'Surat Keterangan Asal Usul', owner: 'bersama' },
  { name: 'Surat Persetujuan Mempelai', owner: 'bersama' },
  { name: 'Surat Keterangan Tentang Orang Tua', owner: 'orangtua' },
  { name: 'Surat Izin Orang Tua (jika usia < 21 th)', owner: 'orangtua' },
  { name: 'Fotokopi KTP Calon Pengantin Wanita', owner: 'bride' },
  { name: 'Fotokopi KTP Calon Pengantin Pria', owner: 'groom' },
  { name: 'Fotokopi KTP Saksi', owner: 'saksi' },
  { name: 'Fotokopi KTP Orang Tua', owner: 'orangtua' },
  { name: 'Fotokopi Kartu Keluarga', owner: 'bersama' },
  { name: 'Fotokopi Akta Lahir', owner: 'bersama' },
  { name: 'Surat Keterangan Sehat / Imunisasi Calon Istri', owner: 'bride' },
  { name: 'Surat Pernyataan Belum Pernah Kawin dari Desa/Kelurahan', owner: 'bersama' },
  { name: 'Pas Foto Background Biru 2x3 (5 lembar)', owner: 'bersama' },
  { name: 'Pas Foto Background Biru 3x5 (5 lembar)', owner: 'bersama' },
]
