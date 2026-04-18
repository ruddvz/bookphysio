'use client'

import type { ReactNode } from 'react'
import { useUiV2 } from '@/hooks/useUiV2'

interface StaticLegalHeroProps {
  lastUpdatedLabel: string
  children: ReactNode
}

/**
 * Legal static pages show "Last updated" as plain text in v1; in v2 the Badge is rendered by StaticPageV2Chrome.
 */
export function StaticLegalHero({ lastUpdatedLabel, children }: StaticLegalHeroProps) {
  const v2 = useUiV2()
  return (
    <>
      {children}
      {!v2 ? (
        <p className="mt-4 text-[14px] text-slate-500">Last updated: {lastUpdatedLabel}</p>
      ) : null}
    </>
  )
}
