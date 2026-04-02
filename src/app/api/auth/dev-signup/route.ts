import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  // Only allow in local development — never in production or test
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const searchParams = request.nextUrl.searchParams
  const role = searchParams.get('role') || 'patient'
  const name = searchParams.get('name') || 'Dev User'
  const phone = searchParams.get('phone') || '+919876543210'

  if (!['patient', 'provider', 'admin'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  try {
    const { supabaseAdmin } = await import('@/lib/supabase/admin')
    const uniqueId = Math.floor(Math.random() * 1000000)
    const devEmail = `dev-${role}-${uniqueId}@bookphysio.in`
    const devPhone = `+91${Math.floor(6000000000 + Math.random() * 3999999999)}`

    // Create a new user directly
    const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: devEmail,
      email_confirm: true,
      user_metadata: { 
        role, 
        full_name: `${name} (${role.toUpperCase()})`,
        is_dev: true
      }
    })

    if (createError) {
      console.error('Dev Signup Error:', createError)
      // If user exists, try to get them instead of failing
      if (createError.message.includes('already registered')) {
         const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers()
         const found = existingUser.users.find(u => u.email === devEmail || u.phone === devPhone)
         if (!found) return NextResponse.json({ error: createError.message }, { status: 500 })
      } else {
        return NextResponse.json({ error: createError.message, details: createError }, { status: 500 })
      }
    }

    // Generate a login link
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: devEmail,
    })

    if (linkError) {
      return NextResponse.json({ error: 'Failed to generate session' }, { status: 500 })
    }

    // Verify the link to set cookies in the server client
    const supabase = await createClient()
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: linkData.properties?.hashed_token ?? '',
      type: 'magiclink',
    })

    if (verifyError) {
      return NextResponse.json({ error: 'Failed to establish session' }, { status: 500 })
    }

    // Redirect to the appropriate dashboard
    const redirectPath = role === 'provider' ? '/provider/dashboard' : role === 'admin' ? '/admin/dashboard' : '/patient/dashboard'
    return NextResponse.redirect(new URL(redirectPath, request.url))

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
