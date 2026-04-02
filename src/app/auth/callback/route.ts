import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { resolvePostAuthRedirect } from '@/lib/demo/session'

async function resolveUserRole(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string | undefined,
  fallbackRole: string | undefined
) {
  if (!userId) {
    return fallbackRole ?? 'patient'
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  return profile?.role ?? fallbackRole ?? 'patient'
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const role = await resolveUserRole(supabase, data.user?.id, data.user?.user_metadata?.role as string | undefined)
      const redirectTo = resolvePostAuthRedirect(role, next)
      return NextResponse.redirect(new URL(redirectTo, request.url))
    }
    
    console.error('Auth callback error:', error)
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(new URL('/login?error=auth-callback-failed', request.url))
}
