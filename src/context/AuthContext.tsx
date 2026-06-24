import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types/db'

/**
 * Status akses yang menentukan layar mana yang ditampilkan shell:
 *  - loading        : masih menentukan sesi / profil
 *  - unauthenticated: belum login  -> LoginScreen
 *  - pending        : login tapi profiles.is_active = false -> WaitingActivationScreen
 *  - expired        : expires_at sudah lewat -> AccessExpiredScreen
 *  - active         : boleh masuk app
 *
 * Catatan: gating dilakukan di level APP (bukan RLS), sesuai desain skema.
 */
export type AccessState =
  | 'loading'
  | 'unauthenticated'
  | 'pending'
  | 'expired'
  | 'active'

interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: Profile | null
  accessState: AccessState
  refreshProfile: () => Promise<void>
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>
  signUpWithPassword: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null; needsConfirmation: boolean }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function deriveAccessState(
  session: Session | null,
  profile: Profile | null,
  sessionResolved: boolean,
  profileResolved: boolean,
): AccessState {
  if (!sessionResolved) return 'loading'
  if (!session) return 'unauthenticated'
  if (!profileResolved) return 'loading'
  // Profil belum ada (trigger handle_new_user mungkin belum sempat jalan) -> anggap menunggu aktivasi
  if (!profile) return 'pending'
  if (!profile.is_active) return 'pending'
  if (profile.expires_at && new Date(profile.expires_at).getTime() < Date.now()) {
    return 'expired'
  }
  return 'active'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sessionResolved, setSessionResolved] = useState(false)
  const [profileResolved, setProfileResolved] = useState(false)

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('[Blossom] Gagal memuat profil:', error.message)
    }
    setProfile((data as Profile | null) ?? null)
    setProfileResolved(true)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!session?.user) return
    setProfileResolved(false)
    await fetchProfile(session.user.id)
  }, [session, fetchProfile])

  // Inisialisasi sesi + langganan perubahan auth
  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setSessionResolved(true)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setSessionResolved(true)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  // Saat sesi berubah, ambil profil
  useEffect(() => {
    if (!session?.user) {
      setProfile(null)
      setProfileResolved(true)
      return
    }
    setProfileResolved(false)
    fetchProfile(session.user.id)
  }, [session, fetchProfile])

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }, [])

  const signUpWithPassword = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    return {
      error: error?.message ?? null,
      // Jika konfirmasi email diaktifkan, session belum terbentuk sampai email diklik.
      needsConfirmation: !error && !data.session,
    }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }, [])

  const accessState = deriveAccessState(
    session,
    profile,
    sessionResolved,
    profileResolved,
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      accessState,
      refreshProfile,
      signInWithPassword,
      signUpWithPassword,
      signOut,
    }),
    [
      session,
      profile,
      accessState,
      refreshProfile,
      signInWithPassword,
      signUpWithPassword,
      signOut,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam <AuthProvider>')
  return ctx
}
