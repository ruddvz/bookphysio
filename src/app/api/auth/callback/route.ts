import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sanitizeReturnPath, resolvePostAuthRedirect, clearDemoSessionCookies } from '@/lib/demo/session'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const returnTo = sanitizeReturnPath(searchParams.get('return_to'))

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role')
    .eq('id', data.user.id)
    .single()

  if (profileError) {
    console.error('[auth/callback] Failed to fetch user profile:', profileError)
  }

  const role = profile?.role ?? 'patient'
  const redirectTo = resolvePostAuthRedirect(role, returnTo)

  const response = NextResponse.redirect(`${origin}${redirectTo}`)
  clearDemoSessionCookies(response)
  return response
}
