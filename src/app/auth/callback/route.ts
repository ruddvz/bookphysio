import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse, type NextRequest } from 'next/server'
import { resolvePostAuthRedirect, clearDemoSessionCookies } from '@/lib/demo/session'

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
      // Belt-and-braces: ensure new Google OAuth users get role='patient'
      // (guard against trigger edge cases where no public.users row was created yet)
      if (data.user?.app_metadata?.provider === 'google' && data.user.id) {
        await supabaseAdmin
          .from('users')
          .upsert(
            {
              id: data.user.id,
              role: 'patient',
              full_name: (data.user.user_metadata?.full_name as string | undefined) ?? data.user.email ?? '',
            },
            { onConflict: 'id', ignoreDuplicates: true },
          )
          .catch((e: unknown) => console.error('[auth/callback] Google upsert failed:', e))
      }

      const role = await resolveUserRole(supabase, data.user?.id, data.user?.user_metadata?.role as string | undefined)
      const redirectTo = resolvePostAuthRedirect(role, next)
      const response = NextResponse.redirect(new URL(redirectTo, request.url))
      clearDemoSessionCookies(response)
      return response
    }
    
    console.error('Auth callback error:', error)
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(new URL('/login?error=auth-callback-failed', request.url))
}
