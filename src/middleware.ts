import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getDemoRedirectPath, getDemoSessionFromCookies, resolvePostAuthRedirect } from '@/lib/demo/session'
import { canRoleAccessPath, isPatientPath, isProviderPath } from '@/lib/auth/access'
import { getPublicSupabaseEnv } from '@/lib/supabase/env'

const PROTECTED_PREFIXES = ['/patient', '/provider', '/dashboard', '/appointments', '/book', '/profile', '/notifications', '/schedule', '/patients', '/reviews', '/settings', '/onboarding']
const ADMIN_PREFIX = '/admin'

// Nonce-based CSP requires every page to be dynamically rendered (no static
// pre-rendering).  Many pages in this app use generateStaticParams / static
// rendering for performance, so the nonce can never be injected into their
// pre-built HTML.  The browser then blocks every script whose nonce doesn't
// match the per-request CSP header, killing React hydration entirely.
//
// Fix: use 'self' + 'unsafe-inline' instead of nonces.  This still prevents
// loading scripts from arbitrary third-party origins while being compatible
// with static rendering.  See Next.js docs:
//   node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md
const isDev = process.env.NODE_ENV === 'development'
const cspHeader = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://checkout.razorpay.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://*.supabase.co https://lh3.googleusercontent.com",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.resend.com https://*.upstash.io",
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
].join('; ')

export default async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)

  let supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } })
  const supabaseEnv = getPublicSupabaseEnv()
  const supabase = supabaseEnv
    ? createServerClient(
        supabaseEnv.url,
        supabaseEnv.anonKey,
        {
          cookies: {
            getAll() { return request.cookies.getAll() },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
              supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } })
              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, options)
              )
            },
          },
        }
      )
    : null

  const { data: { user } } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } }
  const demoSession = user ? null : await getDemoSessionFromCookies(request.cookies)
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') || ''
  const rewrittenPathname = hostname.includes('ai.bookphysio.in') && (pathname === '/' || pathname === '/index')
    ? '/patient/dashboard'
    : hostname.includes('motio.bookphysio.in') && (pathname === '/' || pathname === '/index')
      ? '/provider/dashboard'
      : pathname
  const returnTo = `${rewrittenPathname}${request.nextUrl.search}`

  const isProtected = PROTECTED_PREFIXES.some((prefix) => rewrittenPathname.startsWith(prefix))
  const isAdmin = rewrittenPathname.startsWith(ADMIN_PREFIX)
  const isProviderRoute = isProviderPath(rewrittenPathname)
  const isPatientRoute = isPatientPath(rewrittenPathname)

  if (!user && !demoSession && (isProtected || isAdmin)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = ''
    url.searchParams.set('return', returnTo)
    const redirectResponse = NextResponse.redirect(url)
    redirectResponse.headers.set('Content-Security-Policy', cspHeader)
    return redirectResponse
  }

  if (!user && demoSession) {
    if (!canRoleAccessPath(demoSession.role, rewrittenPathname)) {
      return NextResponse.redirect(new URL(getDemoRedirectPath(demoSession.role), request.url))
    }

    if (rewrittenPathname !== pathname) {
      const url = request.nextUrl.clone()
      url.pathname = rewrittenPathname
      const demoRewrite = NextResponse.rewrite(url)
      demoRewrite.headers.set('Content-Security-Policy', cspHeader)
      return demoRewrite
    }

    const demoNext = NextResponse.next({ request: { headers: requestHeaders } })
    demoNext.headers.set('Content-Security-Policy', cspHeader)
    return demoNext
  }

  if (user && supabase && (isProviderRoute || isPatientRoute || isAdmin)) {
    // Defense-in-depth: admin API routes independently enforce requireAdmin() server-side.
    // This middleware redirect prevents unnecessary round-trips for non-admin UI users.
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('[middleware] Failed to verify user role:', profileError)
      return new NextResponse('Internal Server Error', {
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
          'Content-Security-Policy': cspHeader,
        },
      })
    }

    const roleHomeUrl = new URL(resolvePostAuthRedirect(profile?.role, null), request.url)

    if (!canRoleAccessPath(profile?.role, rewrittenPathname)) {
      const roleRedirect = NextResponse.redirect(roleHomeUrl)
      roleRedirect.headers.set('Content-Security-Policy', cspHeader)
      return roleRedirect
    }
  }

  if (rewrittenPathname !== pathname) {
    const url = request.nextUrl.clone()
    url.pathname = rewrittenPathname
    const rewriteResponse = NextResponse.rewrite(url)
    rewriteResponse.headers.set('Content-Security-Policy', cspHeader)
    return rewriteResponse
  }

  supabaseResponse.headers.set('Content-Security-Policy', cspHeader)
  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/payments/webhook).*)'],
}
