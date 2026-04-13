import { createClient } from '@supabase/supabase-js'

// NEVER import this file in client components or expose to browser
if (typeof window !== 'undefined') {
  throw new Error('admin supabase client must only be used server-side')
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in production')
  }
  console.warn('WARNING: Supabase admin credentials missing. Admin API features will fail.')
}

export const supabaseAdmin = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  serviceRoleKey ?? '',
  { auth: { autoRefreshToken: false, persistSession: false } }
)
