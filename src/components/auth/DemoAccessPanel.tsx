'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, MonitorSmartphone, ShieldCheck, Stethoscope, UserRound } from 'lucide-react'
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
  if (!isDemoAccessEnabled()) {
    return null
  }

  const router = useRouter()
  const [loadingRole, setLoadingRole] = useState<DemoRole | null>(null)
  const [error, setError] = useState('')

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
    <section className="rounded-[28px] border border-teal-100 bg-[linear-gradient(180deg,_#F7FCFB_0%,_#FFFFFF_100%)] p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E6F4F3] text-[#00766C] shadow-inner">
          <MonitorSmartphone size={22} strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#00766C]">Demo access</p>
          <h2 className="mt-1 text-[18px] font-black tracking-tight text-[#333333]">Preview the full product</h2>
          <p className="mt-1 text-[13px] font-medium leading-relaxed text-[#666666]">
            Jump straight into the patient, provider, or admin experience without a live OTP.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
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
                'flex items-center gap-4 rounded-[22px] border border-transparent px-4 py-4 text-left transition-all',
                'bg-white shadow-sm hover:-translate-y-0.5 hover:border-teal-100 hover:shadow-lg',
                'disabled:cursor-not-allowed disabled:opacity-70'
              )}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F4F8F8] text-[#00766C]">
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <OptionIcon size={20} strokeWidth={2.5} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-black text-[#333333]">{option.title}</p>
                <p className="mt-1 text-[12px] font-medium leading-relaxed text-[#666666]">{option.description}</p>
              </div>
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