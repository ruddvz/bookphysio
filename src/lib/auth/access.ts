export type AppRole = 'patient' | 'provider' | 'provider_pending' | 'admin' | null | undefined

export function isAdminPath(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/')
}

export function isProviderPath(pathname: string): boolean {
  return pathname === '/provider' || pathname.startsWith('/provider/')
}

export function isPatientPath(pathname: string): boolean {
  return (
    pathname === '/patient' ||
    pathname.startsWith('/patient/') ||
    pathname === '/book' ||
    pathname.startsWith('/book/')
  )
}

export function canRoleAccessPath(role: AppRole, pathname: string): boolean {
  if (isAdminPath(pathname)) {
    return role === 'admin'
  }

  if (isProviderPath(pathname)) {
    // provider_pending users may only access the pending-approval holding page.
    // All other /provider/* routes require the fully-approved 'provider' role.
    if (pathname === '/provider/pending' || pathname.startsWith('/provider/pending/')) {
      return role === 'provider' || role === 'provider_pending'
    }
    return role === 'provider'
  }

  if (isPatientPath(pathname)) {
    return role === 'patient'
  }

  return true
}