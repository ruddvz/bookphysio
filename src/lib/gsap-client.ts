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
