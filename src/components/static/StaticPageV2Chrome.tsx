'use client'

import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/dashboard/primitives/Badge'
import { useUiV2 } from '@/hooks/useUiV2'
import { cn } from '@/lib/utils'

export interface StaticTocItem {
  id: string
  label: string
}

export interface StaticPageV2ChromeProps {
  /** Shown in Badge below the title in v2 only, e.g. "April 2026" */
  lastUpdated: string
  /** Anchor ids must match elements in the body (section id or h2 id). Omit or empty = no TOC column */
  tocItems?: readonly StaticTocItem[]
  hero: ReactNode
  /** Main column(s) — in v2 long-form pages this is typically section content without the legacy aside TOC */
  body: ReactNode
}

/**
 * v2-only editorial chrome: optional sticky TOC (~220px) + last-updated Badge.
 * When `useUiV2()` is false, renders `hero` + `body` unchanged (no extra wrappers).
 */
export function StaticPageV2Chrome({
  lastUpdated,
  tocItems,
  hero,
  body,
}: StaticPageV2ChromeProps) {
  const v2 = useUiV2()
  const [activeId, setActiveId] = useState<string | null>(null)
  const hasToc = Boolean(tocItems && tocItems.length > 0)

  useEffect(() => {
    if (!v2 || !hasToc || !tocItems) return
    const ids = tocItems.map((t) => t.id)
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
    )

    for (const el of elements) observer.observe(el)
    return () => observer.disconnect()
  }, [v2, hasToc, tocItems])

  if (!v2) {
    return (
      <>
        {hero}
        {body}
      </>
    )
  }

  return (
    <>
      <div className="relative pb-14 lg:pb-16">
        {hero}
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 flex w-full max-w-[720px] -translate-x-1/2 justify-center px-6 sr-only">
          <Badge role="patient" variant="soft" tone={1} className="pointer-events-auto normal-case tracking-normal">
            Last updated: {lastUpdated}
          </Badge>
        </div>
      </div>

      <section className="py-12 lg:py-16">
        <div
          className={cn(
            'mx-auto max-w-[1142px] px-6',
            hasToc && 'lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 xl:gap-14',
          )}
        >
          {hasToc && tocItems ? (
            <aside className="mb-10 lg:mb-0 lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:sticky">
              <h2 className="sr-only">
                On this page
              </h2>
              <nav aria-label="Page sections">
                <ul className="space-y-1.5 border-l border-slate-200 pl-3">
                  {tocItems.map((item) => {
                    const active = activeId === item.id
                    return (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          className={cn(
                            'block rounded-md py-1.5 text-[13px] font-medium leading-snug transition-colors',
                            active
                              ? 'font-semibold text-[#00766C]'
                              : 'text-slate-600 hover:text-[#00766C]',
                          )}
                        >
                          {item.label}
                        </a>
                      </li>
                    )
                  })}
                </ul>
              </nav>
            </aside>
          ) : null}

          <div
            className={cn(
              'min-w-0',
              hasToc ? 'max-w-[720px]' : 'mx-auto max-w-[720px]',
            )}
          >
            {body}
          </div>
        </div>
      </section>
    </>
  )
}
