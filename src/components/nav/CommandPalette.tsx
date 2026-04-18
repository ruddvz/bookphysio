'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Clock, Search } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import type { StaticLocale } from '@/lib/i18n/static-pages'
import { cn } from '@/lib/utils'
import {
  type CommandRole,
  jumpLinksForRole,
  quickActionsForRole,
} from './command-palette-config'

const RECENT_KEY = 'bp_cmd_recent'
const MAX_RECENT = 5

function readRecent(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((x): x is string => typeof x === 'string').slice(0, MAX_RECENT)
  } catch {
    return []
  }
}

function pushRecent(href: string) {
  if (typeof window === 'undefined') return
  const prev = readRecent().filter((p) => p !== href)
  const next = [href, ...prev].slice(0, MAX_RECENT)
  localStorage.setItem(RECENT_KEY, JSON.stringify(next))
}

function normalizeRole(r: string | undefined | null): CommandRole {
  if (r === 'admin' || r === 'provider' || r === 'patient') return r
  return 'public'
}

export interface CommandPaletteProps {
  locale?: StaticLocale
}

type Row =
  | { kind: 'jump'; label: string; href: string }
  | { kind: 'action'; label: string; href: string }
  | { kind: 'recent'; label: string; href: string }

export function CommandPalette({ locale }: CommandPaletteProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['navbar-profile'],
    queryFn: async () => {
      const res = await fetch('/api/profile')
      if (!res.ok) return null
      return res.json() as Promise<{ role?: string }>
    },
    enabled: Boolean(user),
    staleTime: 60_000,
  })

  const role: CommandRole = useMemo(() => {
    if (!user) return 'public'
    return normalizeRole(profile?.role)
  }, [user, profile?.role])

  const jumpLinks = useMemo(() => jumpLinksForRole(role, locale), [role, locale])
  const quickActions = useMemo(() => quickActionsForRole(role), [role])

  const [recentPaths, setRecentPaths] = useState<string[]>([])

  useEffect(() => {
    if (open) setRecentPaths(readRecent())
  }, [open])

  const q = query.trim().toLowerCase()

  const rows: Row[] = useMemo(() => {
    const out: Row[] = []
    const match = (label: string, href: string) =>
      !q || label.toLowerCase().includes(q) || href.toLowerCase().includes(q)

    for (const j of jumpLinks) {
      if (match(j.label, j.href)) out.push({ kind: 'jump', ...j })
    }
    for (const a of quickActions) {
      if (match(a.label, a.href)) out.push({ kind: 'action', ...a })
    }
    for (const href of recentPaths) {
      if (!q || href.toLowerCase().includes(q)) out.push({ kind: 'recent', label: href, href })
    }
    return out
  }, [jumpLinks, quickActions, recentPaths, q])

  useEffect(() => {
    setHighlight(0)
  }, [query, open, rows.length])

  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => inputRef.current?.focus(), 0)
    return () => window.clearTimeout(t)
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'k' && e.key !== 'K') return
      if (!(e.metaKey || e.ctrlKey)) return
      e.preventDefault()
      setOpen((o) => !o)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!open) return
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [open])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const navigate = useCallback(
    (href: string) => {
      pushRecent(href)
      router.push(href)
      setOpen(false)
      setQuery('')
    },
    [router],
  )

  const onKeyNav = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => Math.min(h + 1, Math.max(0, rows.length - 1)))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => Math.max(0, h - 1))
    } else if (e.key === 'Enter' && rows[highlight]) {
      e.preventDefault()
      navigate(rows[highlight]!.href)
    }
  }

  const sectionLabel = (kind: Row['kind']) => {
    if (kind === 'jump') return 'Jump to page'
    if (kind === 'action') return 'Quick actions'
    return 'Recent'
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'hidden lg:inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3.5 py-1.5',
          'text-[13px] font-medium text-slate-500 shadow-sm transition-colors',
          'hover:border-[#00766C]/30 hover:text-[#00766C] hover:bg-[#E6F4F3]/60',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00766C]/40',
        )}
        aria-haspopup="dialog"
        aria-expanded={open}
        data-testid="command-palette-trigger"
      >
        <Search size={14} aria-hidden="true" />
        <span>Search</span>
        <kbd className="hidden sm:inline text-[10px] font-semibold text-slate-400">⌘K</kbd>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[200] flex items-start justify-center bg-black/40 px-4 pt-[12vh] sm:pt-[15vh]"
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          data-testid="command-palette-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false)
          }}
        >
          <div
            className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
              <Search size={18} className="text-slate-400 shrink-0" aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyNav}
                placeholder="Jump or search…"
                className="flex-1 min-w-0 bg-transparent text-[15px] text-slate-900 placeholder:text-slate-400 outline-none"
                aria-label="Command palette search"
                data-testid="command-palette-input"
              />
            </div>

            <div
              className="max-h-[min(60vh,420px)] overflow-y-auto py-2"
              role="listbox"
            >
              {user && profileLoading ? (
                <p className="px-4 py-6 text-[13px] text-slate-500">Loading…</p>
              ) : rows.length === 0 ? (
                <p className="px-4 py-6 text-[13px] text-slate-500">No matches.</p>
              ) : (
                rows.map((row, i) => {
                  const showHead = i === 0 || rows[i - 1]!.kind !== row.kind
                  return (
                    <div key={`${row.kind}-${row.href}-${i}`}>
                      {showHead ? (
                        <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {sectionLabel(row.kind)}
                        </p>
                      ) : null}
                      <button
                        type="button"
                        role="option"
                        aria-selected={i === highlight}
                        id={`cmd-row-${i}`}
                        onMouseEnter={() => setHighlight(i)}
                        onClick={() => navigate(row.href)}
                        className={cn(
                          'flex w-full items-center gap-2 px-4 py-2.5 text-left text-[14px] font-medium',
                          i === highlight ? 'bg-[#E6F4F3] text-[#00766C]' : 'text-slate-700 hover:bg-slate-50',
                        )}
                      >
                        {row.kind === 'recent' ? (
                          <Clock size={15} className="shrink-0 opacity-60" aria-hidden />
                        ) : null}
                        <span className="min-w-0 truncate">{row.label}</span>
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
