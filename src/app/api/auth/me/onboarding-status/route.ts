import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({
      signedIn: false,
      role: null,
      emailConfirmed: false,
      providerExists: false,
      onboardingStep: null as number | null,
      email: null as string | null,
    })
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role ?? 'patient'

  const { data: providerRow } = await supabase
    .from('providers')
    .select('onboarding_step')
    .eq('id', user.id)
    .maybeSingle()

  return NextResponse.json({
    signedIn: true,
    role,
    emailConfirmed: Boolean(user.email_confirmed_at),
    providerExists: Boolean(providerRow),
    onboardingStep: providerRow?.onboarding_step ?? null,
    email: user.email ?? null,
  })
}
