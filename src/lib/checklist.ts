// Definisi fase timeline persiapan + checklist default (seed).
// Fase mengikuti kolom "phase" di skema checklist_items.

export interface PhaseConfig {
  key: string
  label: string
}

export const PHASES: PhaseConfig[] = [
  { key: '12_9_bulan', label: '12–9 Bulan Sebelum' },
  { key: '8_6_bulan', label: '8–6 Bulan Sebelum' },
  { key: '5_4_bulan', label: '5–4 Bulan Sebelum' },
  { key: '3_2_bulan', label: '3–2 Bulan Sebelum' },
  { key: '1_bulan', label: '1 Bulan Sebelum' },
  { key: '1_minggu', label: '1 Minggu Sebelum' },
  { key: 'custom', label: 'Lainnya' },
]

export const PHASE_LABEL: Record<string, string> = Object.fromEntries(
  PHASES.map((p) => [p.key, p.label]),
)

export interface SeedItem {
  phase: string
  title: string
}

// Checklist default ala persiapan pernikahan Indonesia.
export const DEFAULT_CHECKLIST: SeedItem[] = [
  // 12–9 bulan
  { phase: '12_9_bulan', title: 'Tentukan tanggal & konsep pernikahan' },
  { phase: '12_9_bulan', title: 'Susun anggaran (budget) total' },
  { phase: '12_9_bulan', title: 'Buat daftar tamu kasar' },
  { phase: '12_9_bulan', title: 'Survey & booking venue' },
  { phase: '12_9_bulan', title: 'Booking vendor utama (catering, dokumentasi, dekorasi)' },
  // 8–6 bulan
  { phase: '8_6_bulan', title: 'Booking MUA & busana pengantin' },
  { phase: '8_6_bulan', title: 'Tentukan tema & dekorasi' },
  { phase: '8_6_bulan', title: 'Pesan cincin pernikahan' },
  { phase: '8_6_bulan', title: 'Mulai urus dokumen KUA / catatan sipil' },
  { phase: '8_6_bulan', title: 'Booking MC & entertainment' },
  // 5–4 bulan
  { phase: '5_4_bulan', title: 'Fitting busana tahap pertama' },
  { phase: '5_4_bulan', title: 'Finalisasi desain undangan' },
  { phase: '5_4_bulan', title: 'Pesan souvenir' },
  { phase: '5_4_bulan', title: 'Trial makeup' },
  { phase: '5_4_bulan', title: 'Food testing catering' },
  // 3–2 bulan
  { phase: '3_2_bulan', title: 'Sebar undangan' },
  { phase: '3_2_bulan', title: 'Finalisasi daftar tamu & RSVP' },
  { phase: '3_2_bulan', title: 'Susun rundown acara' },
  { phase: '3_2_bulan', title: 'Siapkan seserahan & mahar' },
  { phase: '3_2_bulan', title: 'Bayar DP/cicilan vendor bertahap' },
  // 1 bulan
  { phase: '1_bulan', title: 'Fitting busana terakhir' },
  { phase: '1_bulan', title: 'Konfirmasi ulang semua vendor' },
  { phase: '1_bulan', title: 'Technical meeting & finalisasi rundown' },
  { phase: '1_bulan', title: 'Siapkan perlengkapan akad' },
  { phase: '1_bulan', title: 'Pelunasan vendor' },
  // 1 minggu
  { phase: '1_minggu', title: 'Konfirmasi jumlah tamu ke catering' },
  { phase: '1_minggu', title: 'Siapkan amplop, mahar & seserahan' },
  { phase: '1_minggu', title: 'Perawatan diri & istirahat cukup' },
  { phase: '1_minggu', title: 'Cek ulang semua dokumen & cincin' },
  { phase: '1_minggu', title: 'Briefing keluarga & panitia' },
]
