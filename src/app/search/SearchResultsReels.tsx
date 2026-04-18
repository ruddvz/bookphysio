'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Doctor } from '@/components/DoctorCard'
import { DoctorCardCompact } from '@/components/DoctorCardCompact'
import { useUiV2 } from '@/hooks/useUiV2'

export default function SearchResultsReels({ results }: { results: Doctor[] }) {
  const isV2 = useUiV2()
  const containerRef = useRef<HTMLDivElement>(null)
  const slideRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)

  const total = results.length

  useEffect(() => {
    slideRefs.current = slideRefs.current.slice(0, total)
  }, [total])

  useEffect(() => {
    if (!isV2 || total === 0) return

    const root = containerRef.current
    if (!root) return

    const slides = slideRefs.current.filter(Boolean) as HTMLDivElement[]
    if (slides.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (!visible?.target) return
        const idx = slides.indexOf(visible.target as HTMLDivElement)
        if (idx >= 0) setActiveIndex(idx)
      },
      { root, threshold: [0.35, 0.55, 0.75] },
    )

    for (const el of slides) observer.observe(el)
    return () => observer.disconnect()
  }, [isV2, total, results])

  const scrollToIndex = useCallback((index: number) => {
    const el = slideRefs.current[index]
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  useEffect(() => {
    if (!isV2 || total === 0) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'PageDown' && e.key !== 'ArrowDown' && e.key !== 'PageUp' && e.key !== 'ArrowUp') {
        return
      }
      e.preventDefault()
      if (e.key === 'PageDown' || e.key === 'ArrowDown') {
        scrollToIndex(Math.min(activeIndex + 1, total - 1))
      } else {
        scrollToIndex(Math.max(activeIndex - 1, 0))
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeIndex, isV2, scrollToIndex, total])

  if (!isV2 || total === 0) {
    return null
  }

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="fixed inset-0 z-40 snap-y snap-mandatory overflow-y-scroll overscroll-contain bg-white"
        tabIndex={0}
        aria-label="Search results, swipe or use arrow keys"
      >
        {results.map((doctor, i) => (
          <div
            key={doctor.id}
            ref={(el) => {
              slideRefs.current[i] = el
            }}
            className="flex h-[100dvh] snap-start snap-always flex-col justify-center px-4"
            role="article"
            aria-label={`Result ${i + 1} of ${total}`}
          >
            <DoctorCardCompact doctor={doctor} />
          </div>
        ))}
      </div>
      <div className="pointer-events-none fixed top-4 right-4 z-50 text-sm text-[#666]">
        {activeIndex + 1}/{total}
      </div>
    </div>
  )
}
