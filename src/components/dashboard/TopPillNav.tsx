'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Bell, LogOut, MessageSquare, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import BpLogo from '@/components/BpLogo'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  exact?: boolean
}

export type NavRole = 'patient' | 'provider' | 'admin'

interface TopPillNavProps {
  role: NavRole
  items: NavItem[]
  /** href for bell icon link */
  notificationsHref?: string
  /** href for messages icon link */
  messagesHref?: string
  /** href for avatar → profile link */
  profileHref?: string
  /** label shown below the greeting (e.g. "Patient", "Practitioner", "Administrator") */
  roleLabel: string
  children: ReactNode
}

/**
 * TopPillNav — shared dashboard chrome for patient / provider / admin.
 *
 * Theme comes from CSS custom properties prefixed by role:
 *   --color-{pt|pv|ad}-nav-bg, --color-{pt|pv|ad}-track-bg,
 *   --color-{pt|pv|ad}-active-bg, --color-{pt|pv|ad}-active-fg,
 *   --color-{pt|pv|ad}-border, --color-{pt|pv|ad}-surface, etc.
 *
 * Responsive:
 *   - ≥xl: full pill nav in centre of header
 *   - <xl: hamburger that opens a dropdown
 *   - <lg: sticky bottom tab bar (first 5 items)
 */
export default function TopPillNav({
  role,
  items,
  notificationsHref,
  messagesHref,
  profileHref,
  roleLabel,
  children,
}: TopPillNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuth()
  const prefix = role === 'patient' ? 'pt' : role === 'provider' ? 'pv' : 'ad'
  // inline style objects — pull from role CSS variables
  const surfaceStyle = { background: `var(--color-${prefix}-surface)` }
  const headerStyle = {
    background: `var(--color-${prefix}-nav-bg)`,
    borderColor: `var(--color-${prefix}-border)`,
  }
  const trackStyle = {
    background: `var(--color-${prefix}-track-bg)`,
    borderColor: `var(--color-${prefix}-border)`,
  }

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ??
    roleLabel
  const navDisplayName = role === 'admin' ? roleLabel : displayName
  const initials =
    displayName
      .split(' ')
      .slice(0, 2)
      .map((w: string) => w[0]?.toUpperCase() ?? '')
      .join('') || '?'

  // Fetch avatar_url from profile API (avatar is stored in users table, not auth metadata)
  useEffect(() => {
    if (!user?.id || role === 'admin') return
    let cancelled = false
    fetch('/api/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { avatar_url?: string | null } | null) => {
        if (!cancelled && data?.avatar_url) setAvatarUrl(data.avatar_url)
      })
      .catch(() => {/* ignore — fallback to initials */})
    return () => { cancelled = true }
  }, [role, user?.id])

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (e) {
      console.error(e)
    } finally {
      router.push('/login')
    }
  }

  const isActive = (item: NavItem) => {
    if (item.exact) return pathname === item.href
    return pathname === item.href || pathname.startsWith(item.href + '/')
  }

  const activePillClass =
    role === 'admin'
      ? 'bg-[var(--color-ad-active-bg)] text-[var(--color-ad-active-fg)] shadow-md'
      : role === 'patient'
        ? 'bg-[var(--color-pt-active-bg)] text-[var(--color-pt-active-fg)] shadow-md'
        : 'bg-[var(--color-pv-active-bg)] text-[var(--color-pv-active-fg)] shadow-md'

  const inactivePillClass = 'text-slate-500 hover:text-slate-900 hover:bg-white/60'

  const bottomActiveClass =
    role === 'admin'
      ? 'text-[var(--color-ad-primary)]'
      : role === 'patient'
        ? 'text-[var(--color-pt-primary)]'
        : 'text-[var(--color-pv-primary)]'

  const avatarClass =
    role === 'admin'
      ? 'bg-gradient-to-br from-slate-800 to-slate-600'
      : role === 'patient'
        ? 'bg-gradient-to-br from-[var(--color-pt-primary)] to-[var(--color-pt-primary-hover)]'
        : 'bg-gradient-to-br from-[var(--color-pv-primary)] to-[var(--color-pv-primary-hover)]'

  return (
    <div className="min-h-screen" style={surfaceStyle}>
      {/* ── Desktop / tablet header ─────────────────────────── */}
      <header
        className="sticky top-0 z-40 border-b backdrop-blur-md"
        style={headerStyle}
      >
        <div className="max-w-[1600px] mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
          {/* Logo */}
          <Link
            href={items[0]?.href ?? '/'}
            className="shrink-0 transition-transform hover:scale-[1.02] active:scale-95"
          >
            <BpLogo size="nav" />
          </Link>

          {/* Pill nav — desktop only */}
          <nav
            aria-label={`${role} navigation`}
            className="hidden xl:flex items-center gap-1 rounded-full border p-1.5 shadow-inner"
            style={trackStyle}
          >
            {items.map((item) => {
              const active = isActive(item)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-all duration-200',
                    active ? activePillClass : inactivePillClass
                  )}
                >
                  <Icon size={16} strokeWidth={active ? 2.5 : 2} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-2 sm:gap-3">
            {notificationsHref && (
              <Link
                href={notificationsHref}
                className="flex w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border items-center justify-center text-slate-500 hover:text-slate-900 hover:shadow-md transition-all relative shrink-0"
                style={{ borderColor: `var(--color-${prefix}-border)` }}
                aria-label="Notifications"
              >
                <Bell size={17} />
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
              </Link>
            )}

            {messagesHref && (
              <Link
                href={messagesHref}
                className="flex w-9 h-9 sm:w-10 sm:h-10 rounded-full items-center justify-center text-white shadow-md transition-colors shrink-0"
                style={{ background: `var(--color-${prefix}-active-bg)` }}
                aria-label="Messages"
              >
                <MessageSquare size={16} />
              </Link>
            )}

            {/* Profile */}
            <Link
              href={profileHref ?? '#'}
              className="flex items-center gap-3 pl-2 sm:pl-3 sm:border-l group"
              style={{ borderColor: `var(--color-${prefix}-border)` }}
            >
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center overflow-hidden text-white text-[13px] font-bold shadow-md shrink-0',
                  role === 'admin' ? 'rounded-[14px] border border-slate-700/80' : 'rounded-full',
                  avatarClass
                )}
              >
                {role === 'admin' ? (
                  <ShieldCheck size={18} aria-hidden="true" data-testid="admin-avatar-icon" />
                ) : avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={navDisplayName}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
            </Link>

            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="hidden xl:inline-flex items-center gap-2 rounded-full bg-white border px-4 py-2 text-[13px] font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              style={{ borderColor: `var(--color-${prefix}-border)` }}
            >
              <LogOut size={16} />
              Sign out
            </button>

            {/* Mobile sign-out (icon only) — admin uses desktop "Sign out" only */}
            {role !== 'admin' && (
              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="xl:hidden w-10 h-10 rounded-full bg-white border flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                style={{ borderColor: `var(--color-${prefix}-border)` }}
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── UI v2 breadcrumb strip (hidden on root, hidden when flag off) */}
      {null}

      {/* ── Main content ─────────────────────────────────────── */}
      <main className="relative pb-28 lg:pb-10">{children}</main>

      {/* ── Mobile floating icon pill nav ───────────────────── */}
      <nav
        className="xl:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40"
        aria-label={`${role} mobile navigation`}
      >
        <div
          className="flex items-center gap-1 rounded-full border bg-white/90 backdrop-blur-xl px-2 py-2 shadow-[0_8px_32px_rgba(15,23,42,0.12)]"
          style={{ borderColor: `var(--color-${prefix}-border)` }}
        >
          {items.map((item) => {
            const active = isActive(item)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                title={item.label}
                className={cn(
                  'w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95',
                  active ? activePillClass : `${inactivePillClass} ${bottomActiveClass.replace('text-', 'hover:text-')}`
                )}
              >
                <Icon size={19} strokeWidth={active ? 2.6 : 2.2} />
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
