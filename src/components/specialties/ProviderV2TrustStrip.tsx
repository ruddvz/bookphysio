'use client'

import Link from 'next/link'
import { Zap, ShieldCheck, Clock } from 'lucide-react'
import { Badge } from '@/components/dashboard/primitives/Badge'
import { useUiV2 } from '@/hooks/useUiV2'

export interface ProviderV2TrustStripProps {
  /** City / area label — e.g. "Bandra, Mumbai". Falls back to "India". */
  location?: string
  /** Preformatted next-availability string — e.g. "Today, 4:30 PM". */
  nextSlotLabel?: string | null
  /** Destination for the primary "Book in 60s" CTA. */
  bookingHref: string
  /** `true` if the provider carries a verified council / IAP registration. */
  verified?: boolean
}

/**
 * Flag-gated v2 hero addition for `/doctor/[id]` and `/provider/[slug]`.
 * Renders nothing in v1 so SSR output is byte-identical; in v2 it surfaces
 * a trust chip, live-availability pill, and "Book in 60s" primary CTA.
 */
export function ProviderV2TrustStrip({
  location,
  nextSlotLabel,
  bookingHref,
  verified = false,
}: ProviderV2TrustStripProps) {
  const isV2 = useUiV2()
  if (!isV2) return null

  const availabilityCopy = nextSlotLabel ? `Next slot · ${nextSlotLabel}` : 'Check availability'

  return (
    <div
      data-testid="provider-v2-trust-strip"
      data-ui-version="v2"
      className="mb-6 flex flex-wrap items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 shadow-[0_2px_8px_rgba(0,118,108,0.05)]"
    >
      <Badge role="provider" variant="success">
        <ShieldCheck size={12} className="mr-1" />
        {verified ? 'IAP verified' : 'Profile in review'}
      </Badge>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-bp-primary-light)] px-3 py-1 text-[12px] font-semibold text-[var(--color-bp-primary-dark)]">
        <Clock size={12} />
        {availabilityCopy}
      </span>
      {location && (
        <span className="text-[12px] font-medium text-slate-500 truncate max-w-[220px]">{location}</span>
      )}
      <Link
        href={bookingHref}
        data-testid="provider-v2-book-cta"
        className="ml-auto inline-flex items-center gap-2 rounded-full bg-[var(--color-bp-primary)] px-5 py-2 text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(0,118,108,0.2)] transition-colors hover:bg-[var(--color-bp-primary-dark)]"
      >
        <Zap size={14} strokeWidth={2.5} />
        Book in 60s
      </Link>
    </div>
  )
}
