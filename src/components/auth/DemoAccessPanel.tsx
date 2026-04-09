'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, MonitorSmartphone, ShieldCheck, Stethoscope, UserRound, ChevronRight } from 'lucide-react'
import { isDemoAccessEnabled, sanitizeReturnPath, type DemoRole } from '@/lib/demo/session'
import { launchDemoSession } from '@/lib/demo/client'
import { cn } from '@/lib/utils'

const demoOptions: Array<{
  role: DemoRole
  title: string
  description: string
  icon: typeof UserRound
}> = [
  {
    role: 'patient',
    title: 'Open patient demo',
    description: 'See booking, dashboard, and AI recovery guidance.',
    icon: UserRound,
  },
  {
    role: 'provider',
    title: 'Open provider demo',
    description: 'Review calendar, patients, AI copilot, and messages.',
    icon: Stethoscope,
  },
  {
    role: 'admin',
    title: 'Open admin demo',
    description: 'Inspect ops metrics, approvals, and analytics.',
    icon: ShieldCheck,
  },
]

export function DemoAccessPanel({ variant = 'default' }: { variant?: 'default' | 'compact' }) {
  const demoAccessEnabled = isDemoAccessEnabled()
  const router = useRouter()
  const [loadingRole, setLoadingRole] = useState<DemoRole | null>(null)
  const [error, setError] = useState('')

  if (!demoAccessEnabled) {
    return null
  }

  const isCompact = variant === 'compact'

  async function handleDemoAccess(role: DemoRole) {
    setLoadingRole(role)
    setError('')

    try {
      const returnTo = sanitizeReturnPath(typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('return'))
      const redirectTo = await launchDemoSession(role, returnTo)
      router.push(redirectTo)
    } catch (launchError) {
      const message = launchError instanceof Error ? launchError.message : 'Unable to open the demo right now.'
      setError(message)
    } finally {
      setLoadingRole(null)
    }
  }

  return (
    <section className={cn(
      'backdrop-blur-sm',
      isCompact
        ? 'rounded-[24px] border border-bp-border/70 bg-white/75 p-4 shadow-sm shadow-bp-primary/5'
        : 'rounded-[28px] border border-dashed border-bp-border bg-white/75 p-4 shadow-sm shadow-bp-primary/5 sm:p-5'
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          'flex items-center justify-center text-bp-accent ring-1 ring-bp-border/80',
          isCompact ? 'h-9 w-9 rounded-xl bg-white shadow-sm' : 'h-11 w-11 rounded-2xl bg-bp-surface shadow-inner'
        )}>
          <MonitorSmartphone size={isCompact ? 18 : 22} strokeWidth={2.3} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-bp-body/45">Internal review only</p>
          <h2 className={cn('mt-1 font-bold tracking-tight text-bp-primary', isCompact ? 'text-[14px]' : 'text-[16px]')}>Quick demo access</h2>
          <p className={cn('mt-1 font-bold leading-relaxed text-bp-body/50', isCompact ? 'text-[11px]' : 'text-[12px]')}>
            Open patient, provider, or admin flows without using the public sign-in paths.
          </p>
        </div>
      </div>

      <div className={cn('grid gap-2.5', isCompact ? 'mt-3' : 'mt-4')}>
        {demoOptions.map((option) => {
          const OptionIcon = option.icon
          const isLoading = loadingRole === option.role

          return (
            <button
              key={option.role}
              type="button"
              onClick={() => handleDemoAccess(option.role)}
              disabled={!!loadingRole}
              className={cn(
                'group flex items-center gap-4 border border-bp-border/90 text-left transition-all',
                'bg-bp-surface/70 shadow-sm hover:border-bp-accent/25 hover:bg-white hover:shadow-lg hover:shadow-bp-primary/5',
                'disabled:cursor-not-allowed disabled:opacity-70',
                isCompact ? 'rounded-xl px-3.5 py-3' : 'rounded-2xl px-4 py-3.5'
              )}
            >
              <div className={cn(
                'flex items-center justify-center bg-white text-bp-primary ring-1 ring-bp-border/70 transition-all group-hover:bg-bp-accent group-hover:text-white',
                isCompact ? 'h-9 w-9 rounded-lg' : 'h-10 w-10 rounded-xl'
              )}>
                {isLoading ? <Loader2 size={isCompact ? 16 : 18} className="animate-spin" /> : <OptionIcon size={isCompact ? 18 : 22} strokeWidth={2.5} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn('font-bold text-bp-primary group-hover:text-bp-accent transition-colors', isCompact ? 'text-[13px]' : 'text-[14px]')}>{option.title}</p>
                <p className={cn('mt-1 font-bold leading-relaxed text-bp-body/45', isCompact ? 'text-[10px]' : 'text-[11px]')}>{option.description}</p>
              </div>
              <ChevronRight size={isCompact ? 14 : 16} className="text-bp-body/15 group-hover:text-bp-accent group-hover:translate-x-1 transition-all" />
            </button>
          )
        })}
      </div>

      {error && (
        <p className={cn('font-bold text-red-600', isCompact ? 'mt-3 text-[11px]' : 'mt-4 text-[12px]')}>{error}</p>
      )}
    </section>
  )
}