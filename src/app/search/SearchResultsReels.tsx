'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import DoctorCard, { type Doctor } from '@/components/DoctorCard'
import { DoctorCardCompact } from '@/components/DoctorCardCompact'

export default function SearchResultsReels({ results }: { results: Doctor[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const slideRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)

  const total = results.length

  useEffect(() => {
    slideRefs.current = slideRefs.current.slice(0, total)
  }, [total])

  useEffect(() => {
    if (total === 0) return

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
  }, [total, results])

  const scrollToIndex = useCallback((index: number) => {
    const el = slideRefs.current[index]
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  useEffect(() => {
    if (total === 0) return

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
  }, [activeIndex, scrollToIndex, total])

  if (total === 0) {
    return null
  }

  return (
    <div className="relative h-full">
      <div
        ref={containerRef}
        className="h-full w-full snap-y snap-mandatory overflow-y-scroll overscroll-contain"
        tabIndex={0}
        aria-label="Search results, swipe or use arrow keys"
      >
        {results.map((doctor, i) => (
          <div
            key={doctor.id}
            ref={(el) => {
              slideRefs.current[i] = el
            }}
            className="flex h-[100dvh] snap-start snap-always flex-col items-center justify-center px-4 py-8"
            role="article"
            aria-label={`Result ${i + 1} of ${total}`}
          >
            <div className="w-full max-w-3xl">
              {/* Compact card on mobile, full card on desktop */}
              <div className="block md:hidden">
                <DoctorCardCompact doctor={doctor} />
              </div>
              <div className="hidden md:block">
                <DoctorCard doctor={doctor} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Slide counter */}
      <div className="pointer-events-none absolute top-4 right-4 z-10 rounded-full bg-black/20 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
        {activeIndex + 1}/{total}
      </div>
    </div>
  )
}
