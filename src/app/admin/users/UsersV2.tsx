'use client'

import { Badge } from '@/components/dashboard/primitives/Badge'
import { TrendDelta } from '@/components/dashboard/primitives/TrendDelta'

export type DirectoryRole = 'Patient' | 'Provider' | 'Pending' | 'Suspended'

export interface RoleBadgeProps {
  role: DirectoryRole
}

export function RoleBadge({ role }: RoleBadgeProps) {
  if (role === 'Patient') {
    return (
      <Badge role="admin" variant="soft" tone={1} data-testid="role-badge-patient">
        {role}
      </Badge>
    )
  }
  if (role === 'Provider') {
    return (
      <Badge role="admin" variant="success" data-testid="role-badge-provider">
        {role}
      </Badge>
    )
  }
  if (role === 'Pending') {
    return (
      <Badge role="admin" variant="warning" data-testid="role-badge-pending">
        {role}
      </Badge>
    )
  }
  return (
    <Badge role="admin" variant="danger" data-testid="role-badge-suspended">
      {role}
    </Badge>
  )
}

export interface LastActiveDeltaProps {
  label: string
}

function deltaValue(label: string): number {
  const l = label.toLowerCase()
  if (l.includes('min')) return 5
  if (l.includes('hour')) return 2
  if (l.includes('day')) return -10
  return 0
}

/**
 * Demo TrendDelta derived from human-readable last-active copy (slice 16.34).
 */
export function LastActiveDelta({ label }: LastActiveDeltaProps) {
  return (
    <span data-testid="last-active-delta">
      <TrendDelta value={deltaValue(label)} />
    </span>
  )
}
