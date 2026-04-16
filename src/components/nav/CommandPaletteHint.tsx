'use client'

import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'

export interface CommandPaletteHintProps {
  /**
   * Destination route. Defaults to `/search`.
   * Locale-aware callers can pass `/hi/search` etc.
   */
  href?: string
  className?: string
}

function detectMac(): boolean {
  if (typeof navigator === 'undefined') return false
  const source = navigator.userAgent || navigator.platform || ''
  return /Mac|iPhone|iPad|iPod/i.test(source)
}

/**
 * Inline premium search trigger that opens the provider search page and
 * listens for the `⌘K` / `Ctrl+K` keyboard shortcut. Used in the public
 * Navbar when the UI v2 flag is on.
 */
export function CommandPaletteHint({
  href = '/search',
  className,
}: CommandPaletteHintProps) {
  const router = useRouter()
  const isMac = useMemo(() => detectMac(), [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'k' && event.key !== 'K') return
      if (!(event.metaKey || event.ctrlKey)) return
      event.preventDefault()
      router.push(href)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [href, router])

  return (
    <button
      type="button"
      onClick={() => router.push(href)}
      aria-label="Search physiotherapists"
      className={cn(
        'hidden lg:inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3.5 py-1.5',
        'text-[13px] font-medium text-slate-500 shadow-sm transition-colors',
        'hover:border-[#00766C]/30 hover:text-[#00766C] hover:bg-[#E6F4F3]/60',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00766C]/40',
        className,
      )}
    >
      <Search size={14} aria-hidden="true" />
      <span>Search</span>
      <span
        data-testid="cmd-palette-shortcut"
        className="ml-1 inline-flex items-center gap-0.5 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-slate-500"
      >
        {isMac ? (
          <>
            <span aria-hidden="true">⌘</span>
            <span>K</span>
          </>
        ) : (
          <>
            <span>Ctrl</span>
            <span aria-hidden="true">+</span>
            <span>K</span>
          </>
        )}
      </span>
    </button>
  )
}

export default CommandPaletteHint
