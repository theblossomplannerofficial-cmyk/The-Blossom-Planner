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

// Dokumen umum untuk nikah di KUA (Indonesia).
export const DEFAULT_DOCUMENTS: SeedDoc[] = [
  { name: 'Surat Pengantar Nikah dari RT/RW', owner: 'bersama' },
  { name: 'Surat Keterangan untuk Menikah (N1)', owner: 'bersama' },
  { name: 'Surat Keterangan Asal-Usul (N2)', owner: 'bersama' },
  { name: 'Surat Persetujuan Mempelai (N3)', owner: 'bersama' },
  { name: 'Surat Keterangan tentang Orang Tua (N4)', owner: 'bersama' },
  { name: 'Surat Izin Orang Tua (N5) — jika usia < 21', owner: 'bersama' },
  { name: 'Fotokopi KTP Mempelai Pria', owner: 'groom' },
  { name: 'Fotokopi KTP Mempelai Wanita', owner: 'bride' },
  { name: 'Fotokopi Kartu Keluarga (KK)', owner: 'bersama' },
  { name: 'Fotokopi Akta Kelahiran', owner: 'bersama' },
  { name: 'Pas Foto 2x3 (background biru)', owner: 'bersama' },
  { name: 'Pas Foto 3x4 (background biru)', owner: 'bersama' },
  { name: 'Fotokopi KTP Saksi', owner: 'saksi' },
  { name: 'Surat Rekomendasi Nikah (jika beda wilayah)', owner: 'bersama' },
  { name: 'Akta Cerai / Surat Kematian (jika pernah menikah)', owner: 'bersama' },
]
