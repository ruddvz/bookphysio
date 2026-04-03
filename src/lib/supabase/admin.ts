import { createClient } from '@supabase/supabase-js'

// NEVER import this file in client components or expose to browser
if (typeof window !== 'undefined') {
  throw new Error('admin supabase client must only be used server-side')
}

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? (() => { throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set') })(),
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? (() => { throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set') })(),
  { auth: { autoRefreshToken: false, persistSession: false } }
)
