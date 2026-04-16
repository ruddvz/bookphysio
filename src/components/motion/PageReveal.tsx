'use client'

import { useRef, type ReactNode } from 'react'
import { gsap, useGSAP } from '@/lib/gsap-client'

export interface PageRevealProps {
  children: ReactNode
  selector?: string
  stagger?: number
  duration?: number
  y?: number
  className?: string
}

/**
 * Wrap a dashboard page section to stagger-reveal any descendant marked with
 * `data-reveal`. Respects `prefers-reduced-motion` (GSAP exits early when
 * `gsap.globalTimeline` is disabled by the matchMedia query).
 */
export function PageReveal({
  children,
  selector = '[data-reveal]',
  stagger = 0.06,
  duration = 0.5,
  y = 14,
  className,
}: PageRevealProps) {
  const container = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const reduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduced) return

      const root = container.current
      if (!root) return
      const targets = root.querySelectorAll<HTMLElement>(selector)
      if (targets.length === 0) return

      gsap.from(targets, {
        opacity: 0,
        y,
        duration,
        ease: 'power2.out',
        stagger,
        clearProps: 'opacity,transform',
      })
    },
    { scope: container },
  )

  return (
    <div ref={container} className={className}>
      {children}
    </div>
  )
}
