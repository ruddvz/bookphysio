export function isDevelopmentEnvironment(): boolean {
  return process.env.NODE_ENV === 'development'
}

export function getRequestIpAddress(request: Request): string | null {
  const ip = (request as Request & { ip?: string | null }).ip

  if (typeof ip !== 'string') {
    return null
  }

  const normalizedIp = ip.trim()
  return normalizedIp.length > 0 ? normalizedIp : null
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