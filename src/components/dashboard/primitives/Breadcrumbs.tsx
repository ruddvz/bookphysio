import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { DashRole } from '../primitives'

const rolePrefix: Record<DashRole, 'pt' | 'pv' | 'ad'> = {
  patient: 'pt',
  provider: 'pv',
  admin: 'ad',
}

export interface Crumb {
  label: string
  href?: string
}

export interface BreadcrumbsProps {
  role?: DashRole
  items: readonly Crumb[]
  className?: string
}

export function Breadcrumbs({ role = 'provider', items, className = '' }: BreadcrumbsProps) {
  if (items.length === 0) return null
  const prefix = rolePrefix[role]
  const accent = `var(--color-${prefix}-primary)`

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1 text-[12px] font-semibold text-slate-500">
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="transition-colors hover:text-slate-900"
                  style={{ color: 'inherit' }}
                >
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? 'font-bold' : ''} style={isLast ? { color: accent } : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast ? (
                <ChevronRight size={12} className="shrink-0 text-slate-300" aria-hidden="true" />
              ) : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
