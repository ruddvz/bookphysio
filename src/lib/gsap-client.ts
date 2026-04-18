// Single registration point for GSAP + its plugins so every component
// imports a ready-to-use `gsap` and `ScrollTrigger`.
//
// All consumers must be client components (`'use client'`) — GSAP runs
// in the browser only. The `useGSAP` hook from `@gsap/react` handles
// cleanup + context scoping automatically; there's no need for an
// explicit `gsap.context()` in each component.

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register plugins once. Safe to call multiple times (GSAP no-ops).
if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP, ScrollTrigger)
}

export { gsap, ScrollTrigger, useGSAP }

type RevealTarget = gsap.TweenTarget

interface RevealVars {
  y?: number
  x?: number
  scale?: number
  duration?: number
  ease?: string
  stagger?: number | gsap.StaggerVars
  delay?: number
  trigger?: Element | string | null
  start?: string
  scrollTrigger?: ScrollTrigger.Vars | boolean
  onComplete?: () => void
}

/**
 * Safe scroll-triggered reveal. Elements remain in their natural (visible)
 * state in SSR/JS-off scenarios and never get stuck at opacity:0 if the
 * ScrollTrigger fails to fire.
 *
 * Key guarantees:
 * - `immediateRender: false` — the "from" state is applied only when the
 *   trigger actually fires, so SSR-rendered DOM stays visible if JS is
 *   delayed or ScrollTrigger misbehaves.
 * - Skips entirely under `prefers-reduced-motion`.
 * - `clearProps` on completion so inline styles don't leak into subsequent
 *   layout calculations or future hover/focus states.
 * - No-ops silently when `targets` is empty.
 */
export function revealOnScroll(targets: RevealTarget, vars: RevealVars = {}) {
  if (typeof window === 'undefined') return null
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null

  const {
    y = 28,
    x = 0,
    scale,
    duration = 0.6,
    ease = 'power3.out',
    stagger,
    delay,
    trigger,
    start = 'top 85%',
    scrollTrigger,
    onComplete,
  } = vars

  const resolvedScrollTrigger =
    scrollTrigger === false
      ? undefined
      : typeof scrollTrigger === 'object' && scrollTrigger !== null
        ? scrollTrigger
        : {
            trigger: trigger ?? undefined,
            start,
            once: true,
          }

  const fromVars: gsap.TweenVars = { opacity: 0 }
  const toVars: gsap.TweenVars = {
    opacity: 1,
    duration,
    ease,
    stagger,
    delay,
    immediateRender: false,
    clearProps: 'opacity,transform',
    onComplete,
  }

  if (y !== 0) {
    fromVars.y = y
    toVars.y = 0
  }
  if (x !== 0) {
    fromVars.x = x
    toVars.x = 0
  }
  if (typeof scale === 'number') {
    fromVars.scale = scale
    toVars.scale = 1
  }

  if (resolvedScrollTrigger) {
    toVars.scrollTrigger = resolvedScrollTrigger
  }

  return gsap.fromTo(targets, fromVars, toVars)
}
