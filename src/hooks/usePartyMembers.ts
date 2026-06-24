import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useWedding } from '../context/WeddingContext'
import type { PartyMember, PartyMemberInput } from '../types/db'

export function usePartyMembers() {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const [members, setMembers] = useState<PartyMember[]>([])
  const [loading, setLoading] = useState(true)

  const weddingId = wedding?.id ?? null

  const fetchMembers = useCallback(async (wid: string) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('party_members')
      .select('*')
      .eq('wedding_id', wid)
      .order('created_at', { ascending: true })
    if (error) console.error('[Blossom] party_members:', error.message)
    setMembers((data as PartyMember[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (weddingId) fetchMembers(weddingId)
    else {
      setMembers([])
      setLoading(false)
    }
  }, [weddingId, fetchMembers])

  const createMember = useCallback(
    async (input: PartyMemberInput) => {
      if (!user || !weddingId) return { error: 'Belum siap.' }
      const { data, error } = await supabase
        .from('party_members')
        .insert({ ...input, user_id: user.id, wedding_id: weddingId })
        .select('*')
        .single()
      if (error) return { error: error.message }
      setMembers((prev) => [...prev, data as PartyMember])
      return { error: null }
    },
    [user, weddingId],
  )

  const updateMember = useCallback(
    async (id: string, input: Partial<PartyMemberInput>) => {
      if (!user) return { error: 'Belum login.' }
      const { data, error } = await supabase
        .from('party_members')
        .update(input)
        .eq('id', id)
        .eq('user_id', user.id)
        .select('*')
        .single()
      if (error) return { error: error.message }
      setMembers((prev) => prev.map((m) => (m.id === id ? (data as PartyMember) : m)))
      return { error: null }
    },
    [user],
  )

  const removeMember = useCallback(
    async (id: string) => {
      if (!user) return
      setMembers((prev) => prev.filter((m) => m.id !== id))
      const { error } = await supabase.from('party_members').delete().eq('id', id).eq('user_id', user.id)
      if (error) console.error('[Blossom] hapus member:', error.message)
    },
    [user],
  )

  return { members, loading, createMember, updateMember, removeMember }
}
