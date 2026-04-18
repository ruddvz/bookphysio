import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
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

  // Belt-and-braces: ensure Google OAuth users always get role='patient'
  if (data.user.app_metadata?.provider === 'google' && data.user.id) {
    const { error: upsertError } = await supabaseAdmin
      .from('users')
      .upsert(
        {
          id: data.user.id,
          role: 'patient',
          full_name: (data.user.user_metadata?.full_name as string | undefined) ?? data.user.email ?? '',
        },
        { onConflict: 'id', ignoreDuplicates: true },
      )
    if (upsertError) console.error('[api/auth/callback] Google upsert failed:', upsertError)
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
