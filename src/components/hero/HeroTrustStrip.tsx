import { Sparkline } from '@/components/dashboard/primitives/Sparkline'
import { TrendDelta } from '@/components/dashboard/primitives/TrendDelta'
import { cn } from '@/lib/utils'

export interface HeroTrustStripProps {
  /**
   * Headline count. Displayed above the label. Formatted with the en-IN
   * locale, which uses the Indian lakh/crore grouping (1,00,000 / 10,00,000)
   * at higher magnitudes — this is the intended format for our audience.
   */
  total?: number
  /**
   * Micro-label, e.g. "Bookings this week".
   */
  label?: string
  /**
   * Recent time-series values for the sparkline. Any length works; the
   * sparkline self-scales its Y axis.
   */
  values?: readonly number[]
  /**
   * Percent delta vs. prior period. Omit to hide the chip.
   */
  delta?: number
  className?: string
}

const DEFAULT_VALUES: readonly number[] = [48, 62, 55, 73, 81, 96, 104]
const DEFAULT_TOTAL = 1248
const DEFAULT_LABEL = 'Bookings this week'

/**
 * Premium micro-stat pill surfaced in the v2 hero. Props-driven so the parent
 * can feed a live `/api/stats` payload in a later slice; defaults are chosen
 * so the component renders a plausible preview if no data is wired yet.
 */
export function HeroTrustStrip({
  total = DEFAULT_TOTAL,
  label = DEFAULT_LABEL,
  values = DEFAULT_VALUES,
  delta,
  className,
}: HeroTrustStripProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-4 rounded-full bg-white/80 backdrop-blur-md',
        'border border-[var(--color-bp-primary-muted)] px-5 py-3',
        'shadow-lg shadow-[var(--color-bp-primary)]/10',
        className,
      )}
      data-testid="hero-trust-strip"
    >
      <div className="flex flex-col items-start">
        <div className="flex items-baseline gap-2">
          <span className="text-[22px] font-bold leading-none tracking-tight tabular-nums text-[var(--color-bp-body)]">
            {total.toLocaleString('en-IN')}
          </span>
          {typeof delta === 'number' ? <TrendDelta value={delta} /> : null}
        </div>
        <span className="mt-1 text-[11px] font-medium uppercase tracking-wider text-[var(--color-bp-muted)]">
          {label}
        </span>
      </div>
      <div
        className="h-10 w-px bg-[var(--color-bp-border)]"
        aria-hidden="true"
      />
      <Sparkline
        role="patient"
        values={values}
        width={96}
        height={32}
        ariaLabel={`${label} trend`}
      />
    </div>
  )
}

export default HeroTrustStrip
