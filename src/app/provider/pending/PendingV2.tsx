'use client'

import { CheckCircle2, Clock, Circle } from 'lucide-react'
import { Badge } from '@/components/dashboard/primitives/Badge'

type StepDef =
  | {
      title: string
      description: string
      icon: 'done' | 'clock' | 'empty'
      badge: { kind: 'semantic'; variant: 'success' | 'warning'; label: string }
    }
  | {
      title: string
      description: string
      icon: 'done' | 'clock' | 'empty'
      badge: { kind: 'soft'; tone: 3; label: string }
    }

const STEPS: StepDef[] = [
  {
    title: 'Account created',
    description: 'Registration complete',
    icon: 'done',
    badge: { kind: 'semantic', variant: 'success', label: 'Done' },
  },
  {
    title: 'Email confirmed',
    description: 'Identity verified',
    icon: 'done',
    badge: { kind: 'semantic', variant: 'success', label: 'Done' },
  },
  {
    title: 'Credentials review',
    description: 'Under team review',
    icon: 'clock',
    badge: { kind: 'semantic', variant: 'warning', label: 'Pending' },
  },
  {
    title: 'Dashboard access',
    description: 'Available after approval',
    icon: 'empty',
    badge: { kind: 'soft', tone: 3, label: 'Locked' },
  },
]

function StepIcon({ kind }: { kind: StepDef['icon'] }) {
  if (kind === 'done') return <CheckCircle2 className="h-6 w-6 text-emerald-600" aria-hidden />
  if (kind === 'clock') return <Clock className="h-6 w-6 text-amber-500" aria-hidden />
  return <Circle className="h-6 w-6 text-slate-300" aria-hidden />
}

function StepBadge({ badge }: { badge: StepDef['badge'] }) {
  if (badge.kind === 'soft') {
    return (
      <Badge role="provider" variant="soft" tone={badge.tone}>
        {badge.label}
      </Badge>
    )
  }
  return (
    <Badge role="provider" variant={badge.variant}>
      {badge.label}
    </Badge>
  )
}

/**
 * v2 vertical onboarding stepper for provider pending screen (slice 16.32).
 */
export function PendingStepperV2() {
  return (
    <div data-testid="pending-stepper-v2" className="relative pl-6">
      <div className="absolute left-[11px] top-3 bottom-3 border-l-2 border-slate-200" aria-hidden />
      <ul className="space-y-0">
        {STEPS.map((step) => (
          <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
            <div className="absolute -left-[25px] top-0.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white">
              <StepIcon kind={step.icon} />
            </div>
            <div className="min-w-0 flex-1 rounded-lg border border-slate-100 bg-slate-50/80 p-3 sm:p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                  <p className="text-xs text-slate-500">{step.description}</p>
                </div>
                <StepBadge badge={step.badge} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
