import { cn } from '@/lib/utils'

type VisitType = 'in_clinic' | 'home_visit' | 'online'

const VISIT_CONFIG: Record<VisitType, { label: string; className: string }> = {
  in_clinic:  { label: 'In-clinic',   className: 'bg-blue-50 text-blue-700' },
  home_visit: { label: 'Home Visit',  className: 'bg-purple-50 text-purple-700' },
  online:     { label: 'Online',      className: 'bg-[#E6F4F3] text-[#00766C]' },
}

interface VisitTypeBadgeProps {
  type: VisitType | string
  className?: string
}

export function VisitTypeBadge({ type, className }: VisitTypeBadgeProps) {
  const config = VISIT_CONFIG[type as VisitType] ?? { label: type, className: 'bg-gray-100 text-gray-600' }
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', config.className, className)}>
      {config.label}
    </span>
  )
}
