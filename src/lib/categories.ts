// Konfigurasi kategori vendor. SATU tabel vendor_items dipakai untuk semua kategori;
// field khusus per kategori didefinisikan di sini dan disimpan ke kolom JSONB "details".

export interface DetailField {
  key: string
  label: string
  type: 'text' | 'number' | 'date' | 'textarea'
}

export interface CategoryConfig {
  key: string
  label: string
  icon: string // emoji ringan
  details: DetailField[]
}

export const CATEGORIES: CategoryConfig[] = [
  { key: 'venue', label: 'Venue', icon: '🏛️', details: [
    { key: 'kapasitas', label: 'Kapasitas tamu', type: 'number' },
    { key: 'fasilitas', label: 'Fasilitas', type: 'textarea' },
  ] },
  { key: 'catering', label: 'Catering', icon: '🍽️', details: [
    { key: 'menu', label: 'Menu', type: 'textarea' },
    { key: 'porsi_disediakan', label: 'Porsi disediakan', type: 'number' },
    { key: 'food_testing', label: 'Jadwal food testing', type: 'text' },
  ] },
  { key: 'dekorasi', label: 'Dekorasi', icon: '🌸', details: [
    { key: 'tema', label: 'Tema', type: 'text' },
    { key: 'detail', label: 'Detail (pelaminan, backdrop, dll.)', type: 'textarea' },
  ] },
  { key: 'attire', label: 'Busana', icon: '👗', details: [
    { key: 'warna', label: 'Warna', type: 'text' },
    { key: 'style', label: 'Style', type: 'text' },
    { key: 'jadwal_fitting', label: 'Jadwal fitting', type: 'date' },
    { key: 'status_fitting', label: 'Status fitting', type: 'text' },
  ] },
  { key: 'cincin', label: 'Cincin', icon: '💍', details: [
    { key: 'bahan', label: 'Bahan', type: 'text' },
    { key: 'ukuran', label: 'Ukuran', type: 'text' },
  ] },
  { key: 'dokumentasi', label: 'Dokumentasi', icon: '📸', details: [
    { key: 'paket', label: 'Paket', type: 'text' },
    { key: 'cakupan', label: 'Cakupan (foto/video/drone)', type: 'textarea' },
  ] },
  { key: 'mua', label: 'MUA', icon: '💄', details: [
    { key: 'jumlah_look', label: 'Jumlah look', type: 'number' },
    { key: 'jadwal_trial', label: 'Jadwal trial makeup', type: 'date' },
  ] },
  { key: 'souvenir', label: 'Souvenir', icon: '🎁', details: [
    { key: 'jenis', label: 'Jenis', type: 'text' },
    { key: 'jumlah', label: 'Jumlah', type: 'number' },
  ] },
  { key: 'transportasi', label: 'Transportasi', icon: '🚗', details: [
    { key: 'jenis_kendaraan', label: 'Jenis kendaraan', type: 'text' },
    { key: 'rute', label: 'Rute', type: 'textarea' },
  ] },
  { key: 'mc', label: 'MC', icon: '🎤', details: [] },
  { key: 'florist', label: 'Florist', icon: '💐', details: [
    { key: 'jenis_bunga', label: 'Jenis bunga', type: 'textarea' },
  ] },
  { key: 'music', label: 'Musik / Entertainment', icon: '🎶', details: [
    { key: 'jenis', label: 'Jenis (band/DJ/akustik)', type: 'text' },
  ] },
  { key: 'mahar', label: 'Mahar', icon: '🪙', details: [
    { key: 'bentuk', label: 'Bentuk mahar', type: 'textarea' },
  ] },
  { key: 'seserahan', label: 'Seserahan', icon: '🧺', details: [
    { key: 'kategori', label: 'Kategori', type: 'text' },
    { key: 'barang', label: 'Daftar barang', type: 'textarea' },
  ] },
  { key: 'buku_tamu_undangan', label: 'Undangan & Buku Tamu', icon: '✉️', details: [
    { key: 'jenis', label: 'Jenis (online/cetak)', type: 'text' },
    { key: 'jumlah', label: 'Jumlah', type: 'number' },
  ] },
  { key: 'lainnya', label: 'Lainnya', icon: '📦', details: [] },
]

export const CATEGORY_MAP: Record<string, CategoryConfig> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c]),
)

export function categoryLabel(key: string): string {
  return CATEGORY_MAP[key]?.label ?? key
}

export function categoryIcon(key: string): string {
  return CATEGORY_MAP[key]?.icon ?? '📦'
}

// Opsi status item & status vendor (sesuai catatan skema).
export const ITEM_STATUS = [
  { value: 'belum_survey', label: 'Belum survey' },
  { value: 'sudah_survey', label: 'Sudah survey' },
  { value: 'ragu', label: 'Masih ragu' },
  { value: 'belum_selesai', label: 'Belum selesai' },
  { value: 'selesai', label: 'Selesai' },
]

export const VENDOR_STATUS = [
  { value: 'prospect', label: 'Prospect' },
  { value: 'survey', label: 'Survey' },
  { value: 'quotation', label: 'Quotation' },
  { value: 'negotiation', label: 'Negosiasi' },
  { value: 'booked', label: 'Booked' },
  { value: 'paid', label: 'Paid' },
  { value: 'completed', label: 'Completed' },
]

export const PIC_OPTIONS = [
  { value: 'pria', label: 'Mempelai Pria' },
  { value: 'wanita', label: 'Mempelai Wanita' },
  { value: 'lainnya', label: 'Lainnya' },
]
