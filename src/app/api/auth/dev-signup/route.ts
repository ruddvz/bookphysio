import { NextResponse, type NextRequest } from 'next/server'
import {
  createDemoCookiePayload,
  DEMO_SESSION_COOKIE,
  DEMO_SESSION_SUPPRESSION_COOKIE,
  encodeDemoCookie,
  getDemoRedirectPath,
  resolvePostAuthRedirect,
  type DemoRole,
} from '@/lib/demo/session'
import { hasValidPreviewCookie } from '@/lib/preview/token'

function isDemoRole(value: string | null): value is DemoRole {
  return value === 'patient' || value === 'provider' || value === 'admin'
}

export async function GET(request: NextRequest) {
  const secureCookies = process.env.NODE_ENV === 'production'
  const previewAccessAllowed = process.env.NODE_ENV !== 'development'
    ? await hasValidPreviewCookie(request)
    : false

  // Only available in local development — not for production preview deploys
  if (process.env.NODE_ENV !== 'development' && !previewAccessAllowed) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const roleParam = request.nextUrl.searchParams.get('role')
  if (roleParam && !isDemoRole(roleParam)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  const role: DemoRole = roleParam && isDemoRole(roleParam) ? roleParam : 'patient'
  const requestedReturn =
    request.nextUrl.searchParams.get('returnTo') ?? request.nextUrl.searchParams.get('next') ?? getDemoRedirectPath(role)
  // resolvePostAuthRedirect calls sanitizeReturnPath internally — open-redirect safe.
  const redirectTo = resolvePostAuthRedirect(role, requestedReturn)
  const cookiePayload = createDemoCookiePayload(role)
  const response = NextResponse.redirect(new URL(redirectTo, request.nextUrl.origin))

  response.cookies.set(DEMO_SESSION_COOKIE, await encodeDemoCookie(cookiePayload), {
    httpOnly: true,
    sameSite: 'lax',
    secure: secureCookies,
    path: '/',
    expires: new Date(cookiePayload.expiresAt * 1000),
  })
  response.cookies.set(DEMO_SESSION_SUPPRESSION_COOKIE, '', {
    sameSite: 'lax',
    secure: secureCookies,
    path: '/',
    expires: new Date(0),
  })

  return response
}
