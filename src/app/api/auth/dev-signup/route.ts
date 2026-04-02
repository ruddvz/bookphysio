import { NextResponse, type NextRequest } from 'next/server'

// Stable dev test accounts — same user every time, role baked into metadata (picked up by DB trigger)
const DEV_ACCOUNTS: Record<string, { email: string; phone: string; name: string }> = {
  patient:  { email: 'dev-patient@bookphysio.in',  phone: '+919000000001', name: 'Dev Patient' },
  provider: { email: 'dev-provider@bookphysio.in', phone: '+919000000002', name: 'Dev Provider' },
  admin:    { email: 'dev-admin@bookphysio.in',    phone: '+919000000003', name: 'Dev Admin' },
}

export async function GET(request: NextRequest) {
  // Only allow in local development — never in production or test
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const role = request.nextUrl.searchParams.get('role') ?? 'patient'
  if (!Object.keys(DEV_ACCOUNTS).includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  const account = DEV_ACCOUNTS[role]
  const dashboardPath = role === 'provider' ? '/provider/dashboard' : role === 'admin' ? '/admin/dashboard' : '/patient/dashboard'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? `http://localhost:${process.env.PORT ?? 3000}`
  const redirectTo = `${siteUrl}/auth/callback?next=${dashboardPath}`

  try {
    const { supabaseAdmin } = await import('@/lib/supabase/admin')

    // Get or create the stable dev test user
    const { data: listData } = await supabaseAdmin.auth.admin.listUsers()
    const existing = listData?.users.find(u => u.email === account.email)

    if (!existing) {
      const { error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: account.email,
        phone: account.phone,
        email_confirm: true,
        phone_confirm: true,
        user_metadata: {
          role,
          full_name: account.name,
          is_dev: true,
        },
      })
      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 500 })
      }
    }

    // Generate a magic link — Supabase visits action_link then redirects to /auth/callback
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: account.email,
      options: { redirectTo },
    })

    if (linkError || !linkData.properties?.action_link) {
      return NextResponse.json({ error: linkError?.message ?? 'No action_link returned' }, { status: 500 })
    }

    // Redirect the browser through Supabase's auth flow — cookies are set correctly this way
    return NextResponse.redirect(linkData.properties.action_link)

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
