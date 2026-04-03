import { cn } from '@/lib/utils'

type Status = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

const STATUS_CONFIG: Record<Status, { label: string; className: string }> = {
  pending:   { label: 'Pending',   className: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmed', className: 'bg-bp-accent/10 text-bp-accent' },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-700' },
  no_show:   { label: 'No Show',   className: 'bg-bp-surface text-bp-body' },
}

interface StatusBadgeProps {
  status: Status | string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status as Status] ?? { label: status, className: 'bg-bp-surface text-bp-body' }
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', config.className, className)}>
      {config.label}
    </span>
  )
}
