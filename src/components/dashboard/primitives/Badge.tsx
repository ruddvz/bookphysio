import type { ReactNode } from 'react'
import type { DashRole, TileTone } from '../primitives'

const rolePrefix: Record<DashRole, 'pt' | 'pv' | 'ad'> = {
  patient: 'pt',
  provider: 'pv',
  admin: 'ad',
}

export type BadgeVariant = 'solid' | 'soft' | 'outline' | 'success' | 'warning' | 'danger'

export interface BadgeProps {
  role?: DashRole
  tone?: TileTone
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

const semanticVariant: Record<Extract<BadgeVariant, 'success' | 'warning' | 'danger'>, string> = {
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-rose-50 text-rose-700',
}

export function Badge({ role = 'provider', tone = 1, variant = 'soft', children, className = '' }: BadgeProps) {
  const prefix = rolePrefix[role]
  const base =
    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider'

  if (variant === 'success' || variant === 'warning' || variant === 'danger') {
    return <span className={`${base} ${semanticVariant[variant]} ${className}`}>{children}</span>
  }

  const style =
    variant === 'solid'
      ? { background: `var(--color-${prefix}-primary)`, color: '#fff' }
      : variant === 'outline'
        ? {
            background: 'transparent',
            color: `var(--color-${prefix}-primary)`,
            boxShadow: `inset 0 0 0 1px var(--color-${prefix}-border)`,
          }
        : {
            background: `var(--color-${prefix}-tile-${tone}-bg)`,
            color: `var(--color-${prefix}-tile-${tone}-fg)`,
          }

  return (
    <span className={`${base} ${className}`} style={style}>
      {children}
    </span>
  )
}
