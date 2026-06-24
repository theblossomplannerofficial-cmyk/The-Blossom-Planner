// Auto Budget Allocator — pembagian budget rule-based (jalan di client).
// Persentase default ala alokasi pernikahan Indonesia (total 100%).

export interface Allocation {
  category: string
  pct: number
}

export const ALLOCATION_PRESET: Allocation[] = [
  { category: 'catering', pct: 30 },
  { category: 'venue', pct: 15 },
  { category: 'dekorasi', pct: 12 },
  { category: 'dokumentasi', pct: 10 },
  { category: 'attire', pct: 8 },
  { category: 'mua', pct: 5 },
  { category: 'music', pct: 4 },
  { category: 'souvenir', pct: 4 },
  { category: 'cincin', pct: 3 },
  { category: 'buku_tamu_undangan', pct: 3 },
  { category: 'transportasi', pct: 2 },
  { category: 'florist', pct: 2 },
  { category: 'mc', pct: 2 },
]

export interface AllocationResult {
  category: string
  pct: number
  amount: number
}

export function allocateBudget(total: number): AllocationResult[] {
  return ALLOCATION_PRESET.map((a) => ({
    category: a.category,
    pct: a.pct,
    amount: Math.round((total * a.pct) / 100),
  }))
}
