import type { LucideIcon } from 'lucide-react'

export type AIChatVariant = 'patient' | 'provider' | 'pai'

export type Tone = 'teal' | 'emerald' | 'amber' | 'slate' | 'violet'

export type MetricCard = {
  label: string
  value: string
  caption: string
  icon: LucideIcon
  tone: Tone
}

export type RailCard = {
  label: string
  title: string
  detail: string
  icon: LucideIcon
  href?: string
  cta?: string
  tone: Tone
}

export type VariantCopy = {
  eyebrow: string
  title: string
  description: string
  modeLabel: string
  liveNote: string
  primaryHref: string
  primaryLabel: string
  secondaryHref: string
  secondaryLabel: string
  quickPrompts: string[]
  metrics: MetricCard[]
  safetyTitle: string
  safetyPoints: string[]
  railTitle: string
  railCards: RailCard[]
  footerNote: string
  contextLabel: string
}
