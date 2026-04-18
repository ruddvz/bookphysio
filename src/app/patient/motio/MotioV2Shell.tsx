'use client'

import { Zap } from 'lucide-react'
import { useUiV2 } from '@/hooks/useUiV2'
import { Badge } from '@/components/dashboard/primitives/Badge'

/**
 * v2 chrome above Motio chat — self-gates via `useUiV2()`.
 */
export function MotioV2Shell() {
  const v2 = useUiV2()
  if (!v2) return null

  return (
    <section
      data-ui-version="v2"
      data-testid="motio-v2-shell"
      className="mb-6 rounded-[var(--sq-lg)] border border-[var(--color-pt-border-soft)] bg-[var(--color-pt-tile-1-bg)] px-5 py-4"
      aria-label="Motio recovery assistant header"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-pt-primary)]">
            RECOVERY ASSISTANT
          </p>
          <h1 className="text-[22px] font-bold tracking-tight text-[var(--color-pt-ink)]">Motio</h1>
          <p className="max-w-2xl text-[14px] leading-relaxed text-[var(--color-pt-muted)]">
            Tell me what hurts — I&apos;ll help you find the right next step
          </p>
        </div>
        <Badge role="patient" variant="soft" tone={1} aria-label="Patient AI">
          Patient AI
        </Badge>
      </div>
      <div className="mt-4 flex items-center gap-2 border-t border-[var(--color-pt-border-soft)] pt-3 text-[13px] text-[var(--color-pt-muted)]">
        <Zap className="h-4 w-4 shrink-0 text-[var(--color-pt-primary)]" aria-hidden />
        <span>Instant guidance · Always free · Not a substitute for a physio</span>
      </div>
    </section>
  )
}
