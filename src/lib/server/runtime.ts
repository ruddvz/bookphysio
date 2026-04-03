export function isDevelopmentEnvironment(): boolean {
  return process.env.NODE_ENV === 'development'
}

function getTrustedPlatformForwardedHeaders(request: Request): Array<string | null> {
  if (process.env.CF_PAGES) {
    return [request.headers.get('cf-connecting-ip')]
  }

  if (process.env.VERCEL === '1') {
    return [request.headers.get('x-real-ip')]
  }

  return []
}

function normalizeIpCandidate(value: string | null | undefined): string | null {
  if (!value) {
    return null
  }

  const candidate = value.split(',')[0]?.trim()
  if (!candidate) {
    return null
  }

  return /^[0-9A-Fa-f:.]+$/.test(candidate) ? candidate : null
}

export function getRequestIpAddress(request: Request): string | null {
  for (const headerValue of getTrustedPlatformForwardedHeaders(request)) {
    const normalizedHeaderIp = normalizeIpCandidate(headerValue)
    if (normalizedHeaderIp) {
      return normalizedHeaderIp
    }
  }

  return normalizeIpCandidate((request as Request & { ip?: string | null }).ip)
}

export function getConfiguredAppOrigin(): string | null {
  const rawOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL

  if (!rawOrigin) {
    return null
  }

  try {
    return new URL(rawOrigin).origin
  } catch {
    return null
  }
}

export function buildConfiguredAppUrl(pathname: string): URL | null {
  const origin = getConfiguredAppOrigin()

  if (!origin) {
    return null
  }

  return new URL(pathname, origin)
}