import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useWedding } from '../context/WeddingContext'
import type { CoupleProfile, CoupleProfileInput } from '../types/db'

/** Profil detail mempelai (couple_profiles): satu baris per role ('groom'|'bride'). */
export function useCoupleProfiles() {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const [profiles, setProfiles] = useState<CoupleProfile[]>([])
  const [loading, setLoading] = useState(true)

  const weddingId = wedding?.id ?? null

  const fetchProfiles = useCallback(async (wid: string) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('couple_profiles')
      .select('*')
      .eq('wedding_id', wid)
    if (error) console.error('[Blossom] couple_profiles:', error.message)
    setProfiles((data as CoupleProfile[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (weddingId) fetchProfiles(weddingId)
    else {
      setProfiles([])
      setLoading(false)
    }
  }, [weddingId, fetchProfiles])

  const byRole = useCallback(
    (role: string) => profiles.find((p) => p.role === role) ?? null,
    [profiles],
  )

  /** Simpan (update bila role sudah ada, insert bila belum). */
  const saveProfile = useCallback(
    async (role: string, input: CoupleProfileInput) => {
      if (!user || !weddingId) return { error: 'Belum siap.' }
      const existing = profiles.find((p) => p.role === role)
      if (existing) {
        const { data, error } = await supabase
          .from('couple_profiles')
          .update(input)
          .eq('id', existing.id)
          .eq('user_id', user.id)
          .select('*')
          .single()
        if (error) return { error: error.message }
        setProfiles((prev) => prev.map((p) => (p.id === existing.id ? (data as CoupleProfile) : p)))
      } else {
        const { data, error } = await supabase
          .from('couple_profiles')
          .insert({ ...input, role, user_id: user.id, wedding_id: weddingId })
          .select('*')
          .single()
        if (error) return { error: error.message }
        setProfiles((prev) => [...prev, data as CoupleProfile])
      }
      return { error: null }
    },
    [user, weddingId, profiles],
  )

  return { profiles, loading, byRole, saveProfile }
}
