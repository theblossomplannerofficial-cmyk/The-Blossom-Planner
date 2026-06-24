/** Format angka ke Rupiah tanpa desimal, mis. 150000000 -> "Rp 150.000.000". */
export function formatIDR(value: number | null | undefined): string {
  const n = value ?? 0
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n)
}

/** Versi ringkas untuk angka besar, mis. 150000000 -> "Rp 150 jt". */
export function formatIDRShort(value: number | null | undefined): string {
  const n = value ?? 0
  if (Math.abs(n) >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)} M`
  if (Math.abs(n) >= 1_000_000) return `Rp ${Math.round(n / 1_000_000)} jt`
  if (Math.abs(n) >= 1_000) return `Rp ${Math.round(n / 1_000)} rb`
  return formatIDR(n)
}
