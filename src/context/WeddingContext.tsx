import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { supabase } from '../lib/supabase'
import type { Wedding, WeddingInput } from '../types/db'
import { DEFAULT_CHECKLIST } from '../lib/checklist'
import { useAuth } from './AuthContext'

interface WeddingContextValue {
  wedding: Wedding | null
  loading: boolean
  /** Membuat baris weddings baru milik user yang sedang login. */
  createWedding: (input: WeddingInput) => Promise<{ error: string | null }>
  /** Memperbarui wedding yang sudah ada. */
  updateWedding: (input: Partial<WeddingInput>) => Promise<{ error: string | null }>
  refreshWedding: () => Promise<void>
}

const WeddingContext = createContext<WeddingContextValue | undefined>(undefined)

export function WeddingProvider({ children }: { children: ReactNode }) {
  const { user, accessState } = useAuth()
  const [wedding, setWedding] = useState<Wedding | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchWedding = useCallback(async (userId: string) => {
    setLoading(true)
    // Satu user = satu wedding (untuk saat ini). Ambil yang pertama / terbaru.
    const { data, error } = await supabase
      .from('weddings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (error) console.error('[Blossom] Gagal memuat wedding:', error.message)
    setWedding((data as Wedding | null) ?? null)
    setLoading(false)
  }, [])

  // Muat wedding hanya saat user sudah aktif (lolos gate).
  useEffect(() => {
    if (accessState === 'active' && user) {
      fetchWedding(user.id)
    } else {
      setWedding(null)
      setLoading(accessState === 'loading')
    }
  }, [accessState, user, fetchWedding])

  const createWedding = useCallback(
    async (input: WeddingInput) => {
      if (!user) return { error: 'Belum login.' }
      // KONVENSI: setiap insert selalu menyertakan user_id (auth.uid()).
      const { data, error } = await supabase
        .from('weddings')
        .insert({ ...input, user_id: user.id })
        .select('*')
        .single()

      if (error) return { error: error.message }
      const created = data as Wedding
      setWedding(created)

      // Modul 5: seed checklist default untuk wedding baru.
      const rows = DEFAULT_CHECKLIST.map((s, i) => ({
        user_id: user.id,
        wedding_id: created.id,
        phase: s.phase,
        title: s.title,
        sort_order: i,
      }))
      const { error: seedErr } = await supabase.from('checklist_items').insert(rows)
      if (seedErr) console.error('[Blossom] seed checklist:', seedErr.message)

      return { error: null }
    },
    [user],
  )

  const updateWedding = useCallback(
    async (input: Partial<WeddingInput>) => {
      if (!user || !wedding) return { error: 'Tidak ada wedding untuk diperbarui.' }
      const { data, error } = await supabase
        .from('weddings')
        .update(input)
        .eq('id', wedding.id)
        .eq('user_id', user.id)
        .select('*')
        .single()

      if (error) return { error: error.message }
      setWedding(data as Wedding)
      return { error: null }
    },
    [user, wedding],
  )

  const refreshWedding = useCallback(async () => {
    if (user) await fetchWedding(user.id)
  }, [user, fetchWedding])

  const value = useMemo<WeddingContextValue>(
    () => ({ wedding, loading, createWedding, updateWedding, refreshWedding }),
    [wedding, loading, createWedding, updateWedding, refreshWedding],
  )

  return <WeddingContext.Provider value={value}>{children}</WeddingContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWedding(): WeddingContextValue {
  const ctx = useContext(WeddingContext)
  if (!ctx) throw new Error('useWedding harus dipakai di dalam <WeddingProvider>')
  return ctx
}
