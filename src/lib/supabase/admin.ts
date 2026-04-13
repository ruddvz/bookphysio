import { createClient } from '@supabase/supabase-js'

// NEVER import this file in client components or expose to browser
if (typeof window !== 'undefined') {
  throw new Error('admin supabase client must only be used server-side')
}

if (process.env.NODE_ENV === 'production' && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    '[supabase/admin] SUPABASE_SERVICE_ROLE_KEY must be set in production.'
  )
}

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key',
  { auth: { autoRefreshToken: false, persistSession: false } }
)
