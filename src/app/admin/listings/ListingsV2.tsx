'use client'

import { Sparkline } from '@/components/dashboard/primitives/Sparkline'
import { Badge } from '@/components/dashboard/primitives/Badge'

export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface ApprovalStatusBadgeProps {
  status: ApprovalStatus
}

export function ApprovalStatusBadge({ status }: ApprovalStatusBadgeProps) {
  const config = {
    pending: { variant: 'warning' as const, label: 'Pending' },
    approved: { variant: 'success' as const, label: 'Approved' },
    rejected: { variant: 'danger' as const, label: 'Rejected' },
  }[status]

  return (
    <Badge role="admin" variant={config.variant} data-testid={`approval-badge-${status}`}>
      {config.label}
    </Badge>
  )
}

const DEFAULT_SLA_VALUES: readonly number[] = [5, 4, 6, 3, 4, 2, 3]

export interface SlaSparklineProps {
  values?: readonly number[]
}

/**
 * Review SLA trend sparkline for admin listings summary (slice 16.33).
 */
export function SlaSparkline({ values = DEFAULT_SLA_VALUES }: SlaSparklineProps) {
  return (
    <div data-testid="sla-sparkline" className="mt-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Review SLA (days)</p>
      <div className="mt-1">
        <Sparkline role="admin" width={72} height={24} values={[...values]} ariaLabel="Review SLA trend in days" />
      </div>
    </div>
  )
}
