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

export function DemoAccessPanel() {
  const demoAccessEnabled = isDemoAccessEnabled()
  const router = useRouter()
  const [loadingRole, setLoadingRole] = useState<DemoRole | null>(null)
  const [error, setError] = useState('')

  if (!demoAccessEnabled) {
    return null
  }

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
    <section className="rounded-[40px] border border-bp-border bg-bp-surface/50 p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-bp-accent/10 text-bp-accent shadow-inner">
          <MonitorSmartphone size={28} strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-bp-accent/60">System Entry</p>
          <h2 className="mt-1 text-[20px] font-black tracking-tight text-bp-primary">Preview the Experience</h2>
          <p className="mt-1 text-[13px] font-bold leading-relaxed text-bp-body/60">
            Jump straight into the patient, provider, or admin flows with a single click.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
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
                'group flex items-center gap-5 rounded-[28px] border border-bp-border px-5 py-5 text-left transition-all',
                'bg-white shadow-sm hover:-translate-y-1 hover:border-bp-accent/20 hover:shadow-2xl hover:shadow-bp-primary/5',
                'disabled:cursor-not-allowed disabled:opacity-70'
              )}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-bp-surface text-bp-primary group-hover:bg-bp-accent group-hover:text-white transition-all">
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <OptionIcon size={22} strokeWidth={2.5} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-black text-bp-primary group-hover:text-bp-accent transition-colors">{option.title}</p>
                <p className="mt-1 text-[12px] font-bold leading-relaxed text-bp-body/40">{option.description}</p>
              </div>
              <ChevronRight size={18} className="text-bp-body/10 group-hover:text-bp-accent group-hover:translate-x-1 transition-all" />
            </button>
          )
        })}
      </div>

      {error && (
        <p className="mt-4 text-[12px] font-bold text-red-600">{error}</p>
      )}
    </section>
  )
}