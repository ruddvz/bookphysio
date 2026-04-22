import { cn } from '@/lib/utils'

type VisitType = 'in_clinic' | 'home_visit' | 'online'

const VISIT_CONFIG: Record<VisitType, { label: string; className: string }> = {
  in_clinic:  { label: 'In-clinic',   className: 'bg-bp-accent/10 text-bp-accent' },
  home_visit: { label: 'Home Visit',  className: 'bg-bp-secondary/10 text-bp-secondary' },
  online:     { label: 'Online',      className: 'bg-bp-teal-light text-bp-teal' },
}

interface VisitTypeBadgeProps {
  type: VisitType | string
  className?: string
}

export function VisitTypeBadge({ type, className }: VisitTypeBadgeProps) {
  const config = VISIT_CONFIG[type as VisitType] ?? { label: type, className: 'bg-bp-surface text-bp-body' }
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', config.className, className)}>
      {config.label}
    </span>
  )
}
