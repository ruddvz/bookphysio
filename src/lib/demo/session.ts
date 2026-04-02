import type { Session, User } from '@supabase/supabase-js'

export type DemoRole = 'patient' | 'provider' | 'admin'

export interface DemoCookiePayload {
  sessionId: string
  userId: string
  role: DemoRole
  fullName: string
  phone: string
  expiresAt: number
}

interface DemoProfileDefinition {
  id: string
  fullName: string
  phone: string
  email: string
  createdAt: string
  avatarUrl: string | null
}

const DAY_IN_SECONDS = 24 * 60 * 60
const APP_ORIGIN = 'https://bookphysio.local'

const DEMO_PROFILES: Record<DemoRole, DemoProfileDefinition> = {
  patient: {
    id: '00000000-0000-4000-8000-000000000001',
    fullName: 'Aarav Kapoor',
    phone: '+919876543210',
    email: 'aarav.demo@bookphysio.in',
    createdAt: '2026-04-01T09:00:00.000Z',
    avatarUrl: null,
  },
  provider: {
    id: '00000000-0000-4000-8000-000000000002',
    fullName: 'Dr. Meera Iyer',
    phone: '+919812345678',
    email: 'meera.demo@bookphysio.in',
    createdAt: '2026-04-01T09:00:00.000Z',
    avatarUrl: null,
  },
  admin: {
    id: '00000000-0000-4000-8000-000000000003',
    fullName: 'Ops Admin',
    phone: '+919800000001',
    email: 'ops.demo@bookphysio.in',
    createdAt: '2026-04-01T09:00:00.000Z',
    avatarUrl: null,
  },
}

export const DEMO_SESSION_COOKIE = 'bp-demo-session'
export const DEMO_LOCAL_STORAGE_KEY = 'bp-dev-session'

function isDemoRole(value: string): value is DemoRole {
  return value === 'patient' || value === 'provider' || value === 'admin'
}

function encodeBase64Url(value: string): string {
  if (typeof window === 'undefined') {
    return Buffer.from(value, 'utf8').toString('base64url')
  }

  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function decodeBase64Url(value: string): string {
  if (typeof window === 'undefined') {
    return Buffer.from(value, 'base64url').toString('utf8')
  }

  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (value.length % 4 || 4)) % 4)
  return atob(padded)
}

export function isDemoAccessEnabled(): boolean {
  return process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
}

function createDemoSessionId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function getDemoProfile(role: DemoRole): DemoProfileDefinition {
  return DEMO_PROFILES[role]
}

export function getDemoProfileById(userId: string): (DemoProfileDefinition & { role: DemoRole }) | null {
  for (const [role, profile] of Object.entries(DEMO_PROFILES)) {
    if (profile.id === userId) {
      return {
        ...profile,
        role: role as DemoRole,
      }
    }
  }

  return null
}

export function getDemoRedirectPath(role: DemoRole): string {
  switch (role) {
    case 'provider':
      return '/provider/dashboard'
    case 'admin':
      return '/admin'
    case 'patient':
    default:
      return '/patient/dashboard'
  }
}

function normalizeRole(role: string | null | undefined): DemoRole {
  return role === 'provider' || role === 'admin' ? role : 'patient'
}

export function sanitizeReturnPath(value: string | null | undefined): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return null
  }

  try {
    const normalized = new URL(value, APP_ORIGIN)
    const sanitizedPath = `${normalized.pathname}${normalized.search}${normalized.hash}`

    if (normalized.origin !== APP_ORIGIN || !sanitizedPath.startsWith('/') || sanitizedPath.startsWith('//')) {
      return null
    }

    return sanitizedPath
  } catch {
    return null
  }
}

function isRoleCompatibleReturnPath(role: DemoRole, returnPath: string): boolean {
  const pathname = new URL(returnPath, APP_ORIGIN).pathname

  if (pathname === '/') {
    return true
  }

  if (pathname === '/update-password') {
    return true
  }

  switch (role) {
    case 'admin':
      return pathname === '/admin' || pathname.startsWith('/admin/')
    case 'provider':
      return pathname === '/provider' || pathname.startsWith('/provider/')
    case 'patient':
    default:
      return (
        pathname === '/patient' ||
        pathname.startsWith('/patient/') ||
        pathname === '/book' ||
        pathname.startsWith('/book/')
      )
  }
}

export function resolvePostAuthRedirect(role: string | null | undefined, requestedReturn: string | null | undefined): string {
  const normalizedRole = normalizeRole(role)
  const safeReturn = sanitizeReturnPath(requestedReturn)

  if (safeReturn && isRoleCompatibleReturnPath(normalizedRole, safeReturn)) {
    return safeReturn
  }

  return getDemoRedirectPath(normalizedRole)
}

export function createDemoCookiePayload(role: DemoRole): DemoCookiePayload {
  const profile = getDemoProfile(role)

  return {
    sessionId: createDemoSessionId(),
    userId: profile.id,
    role,
    fullName: profile.fullName,
    phone: profile.phone,
    expiresAt: Math.floor(Date.now() / 1000) + DAY_IN_SECONDS,
  }
}

export function encodeDemoCookie(payload: DemoCookiePayload): string {
  return encodeBase64Url(JSON.stringify(payload))
}

export function parseDemoCookie(value: string | null | undefined): DemoCookiePayload | null {
  if (!isDemoAccessEnabled()) {
    return null
  }

  if (!value) {
    return null
  }

  try {
    const parsed = JSON.parse(decodeBase64Url(value)) as Partial<DemoCookiePayload>
    const profile = parsed.role && isDemoRole(parsed.role) ? getDemoProfile(parsed.role) : null

    if (
      typeof parsed.sessionId !== 'string' ||
      typeof parsed.expiresAt !== 'number' ||
      !parsed.role ||
      !isDemoRole(parsed.role) ||
      !profile
    ) {
      return null
    }

    if (parsed.expiresAt <= Math.floor(Date.now() / 1000)) {
      return null
    }

    return {
      sessionId: parsed.sessionId,
      userId: profile.id,
      role: parsed.role,
      fullName: profile.fullName,
      phone: profile.phone,
      expiresAt: parsed.expiresAt,
    }
  } catch {
    return null
  }
}

export function createDemoSession(role: DemoRole): Session {
  const profile = getDemoProfile(role)
  const expiresAt = Math.floor(Date.now() / 1000) + DAY_IN_SECONDS

  return {
    access_token: `demo-${role}-${Date.now()}`,
    refresh_token: '',
    expires_in: DAY_IN_SECONDS,
    expires_at: expiresAt,
    token_type: 'bearer',
    user: {
      id: profile.id,
      aud: 'authenticated',
      app_metadata: {
        provider: 'demo',
      },
      user_metadata: {
        full_name: profile.fullName,
        role,
        phone: profile.phone,
        is_demo: true,
      },
      created_at: profile.createdAt,
      email: profile.email,
      phone: profile.phone,
      confirmed_at: profile.createdAt,
      email_confirmed_at: profile.createdAt,
      phone_confirmed_at: profile.createdAt,
      identities: [],
      factors: [],
      role: 'authenticated',
    } as User,
  }
}

export function serializeDemoSessionForStorage(session: Session): string {
  return JSON.stringify({
    user: session.user,
    access_token: session.access_token,
    expires_at: session.expires_at,
  })
}