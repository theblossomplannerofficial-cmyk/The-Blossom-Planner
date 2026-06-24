import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useWedding } from '../context/WeddingContext'
import type { Reminder, ReminderInput } from '../types/db'

export function useReminders() {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)

  const weddingId = wedding?.id ?? null

  const fetchReminders = useCallback(async (wid: string) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('wedding_id', wid)
      .order('remind_at', { ascending: true, nullsFirst: false })
    if (error) console.error('[Blossom] reminders:', error.message)
    setReminders((data as Reminder[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (weddingId) fetchReminders(weddingId)
    else {
      setReminders([])
      setLoading(false)
    }
  }, [weddingId, fetchReminders])

  const createReminder = useCallback(
    async (input: ReminderInput) => {
      if (!user || !weddingId) return { error: 'Belum siap.' }
      const { data, error } = await supabase
        .from('reminders')
        .insert({ ...input, user_id: user.id, wedding_id: weddingId })
        .select('*')
        .single()
      if (error) return { error: error.message }
      setReminders((prev) =>
        [...prev, data as Reminder].sort((a, b) =>
          (a.remind_at ?? '').localeCompare(b.remind_at ?? ''),
        ),
      )
      return { error: null }
    },
    [user, weddingId],
  )

  const updateReminder = useCallback(
    async (id: string, input: Partial<ReminderInput>) => {
      if (!user) return { error: 'Belum login.' }
      const { data, error } = await supabase
        .from('reminders')
        .update(input)
        .eq('id', id)
        .eq('user_id', user.id)
        .select('*')
        .single()
      if (error) return { error: error.message }
      setReminders((prev) => prev.map((r) => (r.id === id ? (data as Reminder) : r)))
      return { error: null }
    },
    [user],
  )

  const removeReminder = useCallback(
    async (id: string) => {
      if (!user) return
      setReminders((prev) => prev.filter((r) => r.id !== id))
      const { error } = await supabase.from('reminders').delete().eq('id', id).eq('user_id', user.id)
      if (error) console.error('[Blossom] hapus reminder:', error.message)
    },
    [user],
  )

  return { reminders, loading, createReminder, updateReminder, removeReminder }
}
