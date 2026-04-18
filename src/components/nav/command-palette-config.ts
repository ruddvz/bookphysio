import type { StaticLocale } from '@/lib/i18n/static-pages'

export type CommandRole = 'public' | 'patient' | 'provider' | 'admin'

export function withPublicLocale(path: string, locale?: StaticLocale): string {
  if (!locale || locale === 'en') return path
  if (path.startsWith('/hi')) return path
  return path === '/' ? '/hi' : `/hi${path}`
}

export function jumpLinksForRole(
  role: CommandRole,
  locale?: StaticLocale,
): { label: string; href: string }[] {
  const L = (p: string) => withPublicLocale(p, locale)
  switch (role) {
    case 'patient':
      return [
        { label: 'Dashboard', href: '/patient/dashboard' },
        { label: 'Appointments', href: '/patient/appointments' },
        { label: 'Records', href: '/patient/records' },
        { label: 'Messages', href: '/patient/messages' },
      ]
    case 'provider':
      return [
        { label: 'Dashboard', href: '/provider/dashboard' },
        { label: 'Calendar', href: '/provider/calendar' },
        { label: 'Patients', href: '/provider/patients' },
        { label: 'Earnings', href: '/provider/earnings' },
      ]
    case 'admin':
      return [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Listings', href: '/admin/listings' },
        { label: 'Users', href: '/admin/users' },
        { label: 'Analytics', href: '/admin/analytics' },
      ]
    default:
      return [
        { label: 'Home', href: L('/') },
        { label: 'Search', href: L('/search') },
        { label: 'How it works', href: L('/how-it-works') },
        { label: 'About', href: L('/about') },
      ]
  }
}

export function quickActionsForRole(role: CommandRole): { label: string; href: string }[] {
  switch (role) {
    case 'patient':
      return [{ label: 'Book a session', href: '/search' }]
    case 'provider':
      return [
        { label: 'New invoice', href: '/provider/bills/new' },
        { label: 'Set availability', href: '/provider/availability' },
      ]
    case 'admin':
      return [{ label: 'Review listings', href: '/admin/listings' }]
    default:
      return []
  }
}
