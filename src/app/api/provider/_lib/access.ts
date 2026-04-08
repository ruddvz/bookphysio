import { NextResponse, type NextRequest } from 'next/server'
import { getDemoSessionFromCookies } from '@/lib/demo/session'
import { createClient } from '@/lib/supabase/server'

export interface ProviderAccessContext {
  supabase: Awaited<ReturnType<typeof createClient>>
  providerId: string
  isDemo: boolean
  demoSessionId: string | null
}

export async function requireProviderAccess(
  request: NextRequest,
): Promise<ProviderAccessContext | NextResponse> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const demoSession = !user ? await getDemoSessionFromCookies(request.cookies) : null

  if (!user && demoSession?.role === 'provider') {
    return {
      supabase,
      providerId: demoSession.userId,
      isDemo: true,
      demoSessionId: demoSession.sessionId,
    }
  }

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('[api/provider/access] Failed to verify provider role:', profileError)
    return NextResponse.json({ error: 'Failed to verify provider access' }, { status: 500 })
  }

  if (profile?.role !== 'provider') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return {
    supabase,
    providerId: user.id,
    isDemo: false,
    demoSessionId: null,
  }
}