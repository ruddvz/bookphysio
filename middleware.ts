import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PREFIXES = ['/patient', '/provider', '/dashboard', '/appointments', '/book', '/profile', '/notifications', '/schedule', '/patients', '/reviews', '/settings', '/onboarding']
const ADMIN_PREFIX = '/admin'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_key',
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // 1. ai.bookphysio.in -> Patient Companion (BookPhysio AI)
  if (hostname.includes('ai.bookphysio.in') && (pathname === '/' || pathname === '/index')) {
    const url = request.nextUrl.clone()
    url.pathname = '/patient/motio'
    return NextResponse.rewrite(url)
  }

  // 2. motio.bookphysio.in -> Doctor Assistant (BookPhysio AI provider mode)
  if (hostname.includes('motio.bookphysio.in') && (pathname === '/' || pathname === '/index')) {
    const url = request.nextUrl.clone()
    url.pathname = '/provider/ai-assistant'
    return NextResponse.rewrite(url)
  }

  const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p))
  const isAdmin = pathname.startsWith(ADMIN_PREFIX)
  const isProviderRoute = pathname.startsWith('/provider')

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('return', pathname)
    return NextResponse.redirect(url)
  }

  if (user && isProviderRoute) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'provider') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  if (isAdmin) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user?.id ?? '')
      .single()
    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/payments/webhook).*)'],
}
