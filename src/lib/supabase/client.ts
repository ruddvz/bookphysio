import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required')
    }
    console.warn('Supabase credentials missing. Auth features will be disabled.')
  }

  return createBrowserClient(
    url ?? 'https://placeholder.supabase.co',
    key ?? ''
  )
}
