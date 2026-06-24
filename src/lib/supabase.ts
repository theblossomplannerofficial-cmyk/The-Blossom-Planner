import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Bantu developer: env belum diisi (lihat .env.example)
  console.error(
    '[Blossom] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY belum di-set. ' +
      'Salin .env.example menjadi .env dan isi kredensial Supabase (anon key saja).',
  )
}

// CATATAN: hanya gunakan ANON key di frontend. JANGAN pernah menaruh service_role key di sini.
export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
