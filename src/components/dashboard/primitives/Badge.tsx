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

// `success` uses the project teal tokens so verified / healthy states match
// the brand primary. `warning` and `danger` keep amber/rose because they carry
// universally understood semantic meaning (caution / error) that the brand
// palette does not have dedicated tokens for.
const semanticVariant: Record<Extract<BadgeVariant, 'success' | 'warning' | 'danger'>, string> = {
  success: 'bg-[var(--color-bp-primary-light)] text-[var(--color-bp-primary-dark)]',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-rose-50 text-rose-700',
}

const solidVariant: Record<'pt' | 'pv' | 'ad', string> = {
  pt: 'bg-[var(--color-pt-primary)] text-white',
  pv: 'bg-[var(--color-pv-primary)] text-white',
  ad: 'bg-[var(--color-ad-primary)] text-white',
}

const outlineVariant: Record<'pt' | 'pv' | 'ad', string> = {
  pt: 'bg-transparent text-[var(--color-pt-primary)] shadow-[inset_0_0_0_1px_var(--color-pt-border)]',
  pv: 'bg-transparent text-[var(--color-pv-primary)] shadow-[inset_0_0_0_1px_var(--color-pv-border)]',
  ad: 'bg-transparent text-[var(--color-ad-primary)] shadow-[inset_0_0_0_1px_var(--color-ad-border)]',
}

const softVariant: Record<'pt' | 'pv' | 'ad', Record<TileTone, string>> = {
  pt: {
    1: 'bg-[var(--color-pt-tile-1-bg)] text-[var(--color-pt-tile-1-fg)]',
    2: 'bg-[var(--color-pt-tile-2-bg)] text-[var(--color-pt-tile-2-fg)]',
    3: 'bg-[var(--color-pt-tile-3-bg)] text-[var(--color-pt-tile-3-fg)]',
    4: 'bg-[var(--color-pt-tile-4-bg)] text-[var(--color-pt-tile-4-fg)]',
    5: 'bg-[var(--color-pt-tile-5-bg)] text-[var(--color-pt-tile-5-fg)]',
    6: 'bg-[var(--color-pt-tile-6-bg)] text-[var(--color-pt-tile-6-fg)]',
  },
  pv: {
    1: 'bg-[var(--color-pv-tile-1-bg)] text-[var(--color-pv-tile-1-fg)]',
    2: 'bg-[var(--color-pv-tile-2-bg)] text-[var(--color-pv-tile-2-fg)]',
    3: 'bg-[var(--color-pv-tile-3-bg)] text-[var(--color-pv-tile-3-fg)]',
    4: 'bg-[var(--color-pv-tile-4-bg)] text-[var(--color-pv-tile-4-fg)]',
    5: 'bg-[var(--color-pv-tile-5-bg)] text-[var(--color-pv-tile-5-fg)]',
    6: 'bg-[var(--color-pv-tile-6-bg)] text-[var(--color-pv-tile-6-fg)]',
  },
  ad: {
    1: 'bg-[var(--color-ad-tile-1-bg)] text-[var(--color-ad-tile-1-fg)]',
    2: 'bg-[var(--color-ad-tile-2-bg)] text-[var(--color-ad-tile-2-fg)]',
    3: 'bg-[var(--color-ad-tile-3-bg)] text-[var(--color-ad-tile-3-fg)]',
    4: 'bg-[var(--color-ad-tile-4-bg)] text-[var(--color-ad-tile-4-fg)]',
    5: 'bg-[var(--color-ad-tile-5-bg)] text-[var(--color-ad-tile-5-fg)]',
    6: 'bg-[var(--color-ad-tile-6-bg)] text-[var(--color-ad-tile-6-fg)]',
  },
}

const BASE =
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider'

function variantClass(variant: BadgeVariant, prefix: 'pt' | 'pv' | 'ad', tone: TileTone): string {
  if (variant === 'success' || variant === 'warning' || variant === 'danger') {
    return semanticVariant[variant]
  }
  if (variant === 'solid') return solidVariant[prefix]
  if (variant === 'outline') return outlineVariant[prefix]
  return softVariant[prefix][tone]
}

export function Badge({ role = 'provider', tone = 1, variant = 'soft', children, className = '' }: BadgeProps) {
  const prefix = rolePrefix[role]
  const variantClasses = variantClass(variant, prefix, tone)
  return <span className={`${BASE} ${variantClasses} ${className}`}>{children}</span>
}
