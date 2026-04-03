import { NextResponse, type NextRequest } from 'next/server'
import {
  createDemoCookiePayload,
  DEMO_SESSION_COOKIE,
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
  // Allow in local dev OR if the user has a valid preview cookie (for live-site preview access)
  const isLocalDev = process.env.NODE_ENV === 'development'
  if (!isLocalDev && !(await hasValidPreviewCookie(request))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const roleParam = request.nextUrl.searchParams.get('role')
  if (roleParam && !isDemoRole(roleParam)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  const role = roleParam ?? 'patient'
  const requestedReturn =
    request.nextUrl.searchParams.get('returnTo') ?? request.nextUrl.searchParams.get('next') ?? getDemoRedirectPath(role)
  const redirectTo = resolvePostAuthRedirect(role, requestedReturn)
  const cookiePayload = createDemoCookiePayload(role)
  const response = NextResponse.redirect(new URL(redirectTo, request.nextUrl.origin))

  response.cookies.set(DEMO_SESSION_COOKIE, await encodeDemoCookie(cookiePayload), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(cookiePayload.expiresAt * 1000),
  })

  return response
}
