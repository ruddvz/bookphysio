import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getDemoRedirectPath, parseDemoCookie, resolvePostAuthRedirect } from '@/lib/demo/session'

const PROTECTED_PREFIXES = ['/patient', '/provider', '/dashboard', '/appointments', '/book', '/profile', '/notifications', '/schedule', '/patients', '/reviews', '/settings', '/onboarding']
const ADMIN_PREFIX = '/admin'

export default async function middleware(request: NextRequest) {
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
  const demoSession = user ? null : parseDemoCookie(request.cookies.get('bp-demo-session')?.value)
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') || ''
  const rewrittenPathname = hostname.includes('ai.bookphysio.in') && (pathname === '/' || pathname === '/index')
    ? '/patient/motio'
    : hostname.includes('motio.bookphysio.in') && (pathname === '/' || pathname === '/index')
      ? '/provider/ai-assistant'
      : pathname
  const returnTo = `${rewrittenPathname}${request.nextUrl.search}`

  const isProtected = PROTECTED_PREFIXES.some((prefix) => rewrittenPathname.startsWith(prefix))
  const isAdmin = rewrittenPathname.startsWith(ADMIN_PREFIX)
  const isProviderRoute = rewrittenPathname.startsWith('/provider')
  const isPatientRoute = rewrittenPathname.startsWith('/patient')

  if (!user && !demoSession && (isProtected || isAdmin)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = ''
    url.searchParams.set('return', returnTo)
    return NextResponse.redirect(url)
  }

  if (!user && demoSession) {
    if (isAdmin && demoSession.role !== 'admin') {
      return NextResponse.redirect(new URL(getDemoRedirectPath(demoSession.role), request.url))
    }

    if (isProviderRoute && demoSession.role !== 'provider') {
      return NextResponse.redirect(new URL(getDemoRedirectPath(demoSession.role), request.url))
    }

    if (isPatientRoute && demoSession.role !== 'patient') {
      return NextResponse.redirect(new URL(getDemoRedirectPath(demoSession.role), request.url))
    }

    if (rewrittenPathname !== pathname) {
      const url = request.nextUrl.clone()
      url.pathname = rewrittenPathname
      return NextResponse.rewrite(url)
    }

    return NextResponse.next({ request })
  }

  if (user && (isProviderRoute || isPatientRoute || isAdmin)) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const roleHomeUrl = new URL(resolvePostAuthRedirect(profile?.role, null), request.url)

    if (isProviderRoute && profile?.role !== 'provider') {
      return NextResponse.redirect(roleHomeUrl)
    }

    if (isPatientRoute && profile?.role !== 'patient') {
      return NextResponse.redirect(roleHomeUrl)
    }

    if (isAdmin && profile?.role !== 'admin') {
      return NextResponse.redirect(roleHomeUrl)
    }
  }

  if (rewrittenPathname !== pathname) {
    const url = request.nextUrl.clone()
    url.pathname = rewrittenPathname
    return NextResponse.rewrite(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/payments/webhook).*)'],
}