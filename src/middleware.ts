import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { canRoleAccessPath, isPatientPath, isProviderPath } from '@/lib/auth/access'
import { getDemoRedirectPath, getDemoSessionFromCookies, resolvePostAuthRedirect } from '@/lib/demo/session'
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

function withCsp(response: NextResponse): NextResponse {
  response.headers.set('Content-Security-Policy', cspHeader)
  return response
}

function redirectWithCsp(url: URL): NextResponse {
  return withCsp(NextResponse.redirect(url))
}

function rewriteWithCsp(url: URL): NextResponse {
  return withCsp(NextResponse.rewrite(url))
}

function resolveRewrittenPathname(hostname: string, pathname: string): string {
  if (hostname.includes('ai.bookphysio.in') && (pathname === '/' || pathname === '/index')) {
    return '/patient/dashboard'
  }

  if (hostname.includes('motio.bookphysio.in') && (pathname === '/' || pathname === '/index')) {
    return '/provider/dashboard'
  }

  return pathname
}

function buildLoginRedirect(request: NextRequest, returnTo: string): NextResponse {
  const url = request.nextUrl.clone()
  url.pathname = '/login'
  url.search = ''
  url.searchParams.set('return', returnTo)
  return redirectWithCsp(url)
}

function buildServerErrorResponse(): NextResponse {
  return withCsp(new NextResponse('Internal Server Error', {
    status: 500,
    headers: { 'Cache-Control': 'no-store' },
  }))
}

function initSupabase(request: NextRequest, requestHeaders: Headers) {
  let supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } })
  const supabaseEnv = getPublicSupabaseEnv()
  const supabase = supabaseEnv
    ? createServerClient(
        supabaseEnv.url,
        supabaseEnv.anonKey,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
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

  return { supabase, supabaseResponse }
}

function handleDemoRequest(
  request: NextRequest,
  requestHeaders: Headers,
  pathname: string,
  rewrittenPathname: string,
  role: 'patient' | 'provider',
): NextResponse {
  if (!canRoleAccessPath(role, rewrittenPathname)) {
    return redirectWithCsp(new URL(getDemoRedirectPath(role), request.url))
  }

  if (rewrittenPathname !== pathname) {
    const url = request.nextUrl.clone()
    url.pathname = rewrittenPathname
    return rewriteWithCsp(url)
  }

  return withCsp(NextResponse.next({ request: { headers: requestHeaders } }))
}

async function verifyUserRoleAccess(
  request: NextRequest,
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
  rewrittenPathname: string,
): Promise<NextResponse | null> {
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  if (profileError) {
    console.error('[middleware] Failed to verify user role:', profileError)
    return buildServerErrorResponse()
  }

  if (!canRoleAccessPath(profile?.role, rewrittenPathname)) {
    return redirectWithCsp(new URL(resolvePostAuthRedirect(profile?.role, null), request.url))
  }

  return null
}

export default async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  const { supabase, supabaseResponse } = initSupabase(request, requestHeaders)

  const { data: { user } } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } }
  const demoSession = user ? null : await getDemoSessionFromCookies(request.cookies)
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') || ''
  const rewrittenPathname = resolveRewrittenPathname(hostname, pathname)
  const returnTo = `${rewrittenPathname}${request.nextUrl.search}`

  const isProtected = PROTECTED_PREFIXES.some((prefix) => rewrittenPathname.startsWith(prefix))
  const isAdmin = rewrittenPathname.startsWith(ADMIN_PREFIX)
  const isProviderRoute = isProviderPath(rewrittenPathname)
  const isPatientRoute = isPatientPath(rewrittenPathname)

  if (!user && !demoSession && (isProtected || isAdmin)) {
    return buildLoginRedirect(request, returnTo)
  }

  if (!user && demoSession) {
    return handleDemoRequest(request, requestHeaders, pathname, rewrittenPathname, demoSession.role)
  }

  if (user && supabase && (isProviderRoute || isPatientRoute || isAdmin)) {
    const deniedResponse = await verifyUserRoleAccess(request, supabase, user.id, rewrittenPathname)
    if (deniedResponse) {
      return deniedResponse
    }
  }

  if (rewrittenPathname !== pathname) {
    const url = request.nextUrl.clone()
    url.pathname = rewrittenPathname
    return rewriteWithCsp(url)
  }

  return withCsp(supabaseResponse)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/payments/webhook).*)'],
}
