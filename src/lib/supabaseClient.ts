import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string
if (!url || !anon) throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')

const client: SupabaseClient = createClient(url, anon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'fitfi.auth',
  },
})

// Compat: werkt als object én als functie (supabase() => client)
type SupabaseCompat = SupabaseClient & (() => SupabaseClient)
const supabaseCompat = Object.assign(() => client, client) as SupabaseCompat

export { supabaseCompat as supabase, client as supabaseClient }
export default client