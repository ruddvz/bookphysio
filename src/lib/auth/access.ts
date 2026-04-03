export type AppRole = 'patient' | 'provider' | 'admin' | null | undefined

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
    return role === 'provider'
  }

  if (isPatientPath(pathname)) {
    return role === 'patient'
  }

  return true
}