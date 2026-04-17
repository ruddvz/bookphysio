'use client'

import { usePathname } from 'next/navigation'
import { Breadcrumbs, type Crumb } from '@/components/dashboard/primitives/Breadcrumbs'
import { useUiV2 } from '@/hooks/useUiV2'
import type { NavRole } from '@/components/dashboard/TopPillNav'

export interface DashboardBreadcrumbsProps {
  role: NavRole
  /**
   * Optional override for the derived trail. Pages with dynamic segments
   * (e.g. `/provider/patients/[id]`) pass their own labels so crumbs read
   * "Patients › Priya Sharma" instead of the raw UUID.
   */
  items?: readonly Crumb[]
  className?: string
}

const ROOT_HREF: Record<NavRole, string> = {
  patient: '/patient/dashboard',
  provider: '/provider/dashboard',
  admin: '/admin',
}

const ROOT_LABEL: Record<NavRole, string> = {
  patient: 'Patient',
  provider: 'Practitioner',
  admin: 'Admin',
}

/**
 * Segment → human label. Unknown segments fall back to Title Case.
 * Intentionally small and role-agnostic; page-specific overrides come
 * through the `items` prop.
 */
const LABEL_MAP: Record<string, string> = {
  dashboard: 'Overview',
  appointments: 'Appointments',
  patients: 'Patients',
  calendar: 'Schedule',
  availability: 'Availability',
  earnings: 'Earnings',
  profile: 'Profile',
  messages: 'Messages',
  notifications: 'Notifications',
  records: 'Records',
  payments: 'Payments',
  bills: 'Bills',
  new: 'New',
  'ai-assistant': 'AI Assistant',
  listings: 'Approvals',
  users: 'Users',
  analytics: 'Analytics',
  pending: 'Pending',
}

function toTitleCase(segment: string): string {
  return segment
    .split('-')
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(' ')
}

function labelFor(segment: string): string {
  return LABEL_MAP[segment] ?? toTitleCase(segment)
}

/**
 * Derive breadcrumbs from the pathname, stripping the role prefix.
 * Returns `null` if the path is the role's root dashboard (crumbs would
 * collapse to a single label, which adds noise without context).
 */
export function buildCrumbsFromPath(pathname: string, role: NavRole): readonly Crumb[] | null {
  if (!pathname) return null

  const rootHref = ROOT_HREF[role]
  const segments = pathname.split('/').filter(Boolean)

  // Root dashboard for each role — nothing useful to show.
  if (pathname === rootHref) return null

  const rootCrumb: Crumb = { label: ROOT_LABEL[role], href: rootHref }

  // Drop the leading role segment ("patient", "provider", "admin") and
  // rebuild from there. Admin has no second-level "dashboard" segment,
  // so we just walk every remaining segment.
  const tail = segments.slice(1)
  if (tail.length === 0) return [rootCrumb]

  const trail: Crumb[] = [rootCrumb]
  let acc = `/${segments[0]}`
  tail.forEach((segment, i) => {
    acc = `${acc}/${segment}`
    const isLast = i === tail.length - 1
    trail.push({ label: labelFor(segment), href: isLast ? undefined : acc })
  })
  return trail
}

/**
 * Flag-gated (UI v2) breadcrumb strip for dashboard chrome.
 *
 * Renders nothing when:
 *   - UI v2 is off
 *   - The pathname is the role's root dashboard
 *   - An explicit `items={[]}` override is passed
 */
export function DashboardBreadcrumbs({ role, items, className }: DashboardBreadcrumbsProps) {
  const uiV2 = useUiV2()
  const pathname = usePathname() ?? ''

  if (!uiV2) return null

  const resolved = items ?? buildCrumbsFromPath(pathname, role)
  if (!resolved || resolved.length === 0) return null

  return <Breadcrumbs role={role} items={resolved} className={className} />
}
