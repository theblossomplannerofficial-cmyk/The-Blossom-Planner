import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface DashboardStats {
  // Checklist
  checklistTotal: number
  checklistDone: number
  // Budget (dari vendor_items)
  budgetEstimate: number
  budgetActual: number
  budgetPaid: number
  // Tamu
  guestsTotal: number
  guestsAttending: number
  // Vendor
  vendorTotal: number
  vendorBooked: number
}

const EMPTY: DashboardStats = {
  checklistTotal: 0,
  checklistDone: 0,
  budgetEstimate: 0,
  budgetActual: 0,
  budgetPaid: 0,
  guestsTotal: 0,
  guestsAttending: 0,
  vendorTotal: 0,
  vendorBooked: 0,
}

/** Mengambil ringkasan angka dari berbagai tabel untuk Dashboard (Modul 2). */
export function useDashboardStats(weddingId: string | null) {
  const [stats, setStats] = useState<DashboardStats>(EMPTY)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async (wid: string) => {
    setLoading(true)

    // Helper hitung baris tanpa menarik datanya (head + count exact).
    const countRows = async (
      table: string,
      filters: Record<string, string | number | boolean> = {},
    ) => {
      let q = supabase
        .from(table)
        .select('id', { count: 'exact', head: true })
        .eq('wedding_id', wid)
      for (const [k, v] of Object.entries(filters)) q = q.eq(k, v)
      const { count, error } = await q
      if (error) console.error(`[Blossom] count ${table}:`, error.message)
      return count ?? 0
    }

    // Vendor "sudah deal" = booked, paid, atau completed (sudah melewati tahap booked).
    const countSecuredVendors = supabase
      .from('vendor_items')
      .select('id', { count: 'exact', head: true })
      .eq('wedding_id', wid)
      .in('vendor_status', ['booked', 'paid', 'completed'])
      .then((r) => {
        if (r.error) console.error('[Blossom] vendor secured:', r.error.message)
        return r.count ?? 0
      })

    const [
      checklistTotal,
      checklistDone,
      guestsTotal,
      guestsAttending,
      vendorTotal,
      vendorBooked,
      vendorRows,
    ] = await Promise.all([
      countRows('checklist_items'),
      countRows('checklist_items', { is_done: true }),
      countRows('guests'),
      countRows('guests', { rsvp_status: 'hadir' }),
      countRows('vendor_items'),
      countSecuredVendors,
      supabase
        .from('vendor_items')
        .select('budget_estimate, budget_actual, paid_amount')
        .eq('wedding_id', wid),
    ])

    let budgetEstimate = 0
    let budgetActual = 0
    let budgetPaid = 0
    if (vendorRows.error) {
      console.error('[Blossom] budget vendor_items:', vendorRows.error.message)
    } else {
      for (const r of vendorRows.data ?? []) {
        budgetEstimate += Number(r.budget_estimate ?? 0)
        budgetActual += Number(r.budget_actual ?? 0)
        budgetPaid += Number(r.paid_amount ?? 0)
      }
    }

    setStats({
      checklistTotal,
      checklistDone,
      budgetEstimate,
      budgetActual,
      budgetPaid,
      guestsTotal,
      guestsAttending,
      vendorTotal,
      vendorBooked,
    })
    setLoading(false)
  }, [])

  useEffect(() => {
    if (weddingId) fetchStats(weddingId)
    else {
      setStats(EMPTY)
      setLoading(false)
    }
  }, [weddingId, fetchStats])

  const refresh = useCallback(() => {
    if (weddingId) fetchStats(weddingId)
  }, [weddingId, fetchStats])

  return { stats, loading, refresh }
}
