'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react'
import BpLogo from '@/components/BpLogo'
import OtpInput from '@/components/OtpInput'
import { isDemoAccessEnabled, resolvePostAuthRedirect, type DemoRole } from '@/lib/demo/session'
import { launchDemoSession } from '@/lib/demo/client'

const OTP_LENGTH = 6
const COUNTDOWN_SECONDS = 45

function VerifyOtpContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const phoneParam = searchParams.get('phone') ?? ''
  const nameParam = searchParams.get('name') ?? ''
  const flowParam = searchParams.get('flow') ?? 'login'
  const returnParam = searchParams.get('return')

  const displayPhone = phoneParam
    ? `+${phoneParam.slice(0, 2)} ${phoneParam.slice(2, 7)} ${phoneParam.slice(7)}`
    : ''

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [devRolePicker, setDevRolePicker] = useState(false)

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  // Auto-submit logic is now inside OtpInput via onComplete

  async function handleVerify(codeOverride?: string) {
    const code = codeOverride || otp.join('')
    if (code.length < OTP_LENGTH) {
      setError('Please enter all 6 digits')
      return
    }
    setLoading(true)

    // Dev access bypass — code "264200" shows the demo role picker.
    if (code === '264200' && isDemoAccessEnabled()) {
      setLoading(false)
      setDevRolePicker(true)
      return
    }

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: '+' + phoneParam,
          otp: code,
          ...(flowParam === 'signup' && nameParam ? { full_name: nameParam } : {}),
        }),
      })
      const data = await res.json() as {
        user?: { id: string; user_metadata?: { role?: string } }
        role?: string
        error?: string
      }
      if (!res.ok) {
        setError(data.error ?? 'Invalid OTP. Please try again.')
        return
      }
      const fallbackRole = flowParam === 'signup' ? 'patient' : data.role ?? data.user?.user_metadata?.role
      router.push(resolvePostAuthRedirect(fallbackRole, returnParam))
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDevSignIn(role: DemoRole) {
    setLoading(true)
    setError('')

    try {
      const redirectTo = await launchDemoSession(role, returnParam)
      router.push(redirectTo)
    } catch {
      setError('Demo access is unavailable right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setCountdown(COUNTDOWN_SECONDS)
    setOtp(Array(OTP_LENGTH).fill(''))
    setError('')
    try {
      await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '+' + phoneParam }),
      })
    } catch {
      // silently ignore resend errors — user can retry countdown
    }
  }

  const allFilled = otp.every((d) => d !== '')

  const formatCountdown = (s: number) => {
    const mm = String(Math.floor(s / 60)).padStart(2, '0')
    const ss = String(s % 60).padStart(2, '0')
    return `${mm}:${ss}`
  }

  return (
    <div className="bg-white rounded-[40px] p-8 sm:p-12 max-w-[440px] w-full shadow-2xl shadow-bp-primary/5 border border-bp-border animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="relative">
      <BpLogo />

      <h1 className="text-[28px] font-black text-bp-primary mb-2 mt-10 tracking-tighter leading-none">
        Verify your number
      </h1>
      <p className="text-[15px] font-bold text-bp-body/40 mb-10">
        Code sent to{' '}
        <span className="text-bp-primary">{displayPhone}</span>
      </p>

      {/* OTP digit inputs */}
      <div className="mb-8">
        <OtpInput
          value={otp}
          onChange={setOtp}
          onComplete={handleVerify}
          disabled={loading}
          error={!!error}
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-[12px] font-bold text-red-500 text-center -mt-4 mb-6">
          {error}
        </p>
      )}

      {/* Resend + countdown */}
      <div className="flex justify-between items-center mb-10">
        {countdown > 0 ? (
          <span className="text-[14px] font-bold text-bp-body/40">
            Resend OTP
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className="inline-flex items-center gap-2 text-[14px] text-bp-accent font-black bg-transparent border-none cursor-pointer p-0 outline-none hover:underline transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Resend OTP
          </button>
        )}
        <span
          className={`text-[14px] font-bold tabular-nums ${countdown > 0 ? 'text-bp-body/40' : 'text-transparent'}`}
        >
          {formatCountdown(countdown)}
        </span>
      </div>

      {/* Verify button */}
      <button
        type="button"
        onClick={() => handleVerify()}
        disabled={!allFilled || loading}
        className={cn(
          "w-full flex items-center justify-center gap-3 py-5 text-[16px] font-black text-white rounded-2xl mb-8 transition-all active:scale-[0.98]",
          allFilled && !loading ? 'bg-bp-primary hover:bg-bp-primary/95 shadow-xl shadow-bp-primary/10 cursor-pointer' : 'bg-bp-border cursor-not-allowed text-white/50'
        )}
      >
        {loading ? 'Verifying…' : (
          <>
            Verify
            <ArrowRight className="w-5 h-5 text-bp-accent" />
          </>
        )}
      </button>

      {/* Back link */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-[14px] text-bp-body/40 hover:text-bp-primary font-bold bg-transparent border-none cursor-pointer no-underline outline-none transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Dev role picker overlay */}
      {devRolePicker && (
        <div className="absolute inset-x-[-32px] sm:inset-x-[-48px] inset-y-[-32px] sm:inset-y-[-48px] bg-white rounded-[40px] flex flex-col items-center justify-center gap-8 p-10 animate-in fade-in zoom-in-95 duration-300 z-50">
          <div className="text-center">
            <p className="text-[10px] font-black text-bp-accent uppercase tracking-[0.2em] mb-3">Dev Access</p>
            <h2 className="text-[28px] font-black text-bp-primary tracking-tighter">Sign in as…</h2>
          </div>
          <div className="w-full flex flex-col gap-4">
            <button
              type="button"
              onClick={() => handleDevSignIn('patient')}
              className="w-full py-5 text-[16px] font-black text-white bg-bp-accent hover:bg-bp-accent/90 rounded-2xl shadow-xl shadow-bp-accent/20 transition-all active:scale-95"
            >
              Patient
            </button>
            <button
              type="button"
              onClick={() => handleDevSignIn('provider')}
              className="w-full py-5 text-[16px] font-black text-white bg-bp-primary hover:bg-bp-primary/95 rounded-2xl shadow-xl shadow-bp-primary/10 transition-all active:scale-95"
            >
              Doctor / Provider
            </button>
            <button
              type="button"
              onClick={() => handleDevSignIn('admin')}
              className="w-full py-5 text-[16px] font-black text-white bg-slate-900 hover:bg-slate-950 rounded-2xl shadow-xl transition-all active:scale-95"
            >
              Operator / Admin
            </button>
            <button
              type="button"
              onClick={() => setDevRolePicker(false)}
              className="w-full py-3 text-[14px] text-bp-body/40 hover:text-bp-primary font-bold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white rounded-[12px] p-10 max-w-[440px] w-full shadow-lg" />
      }
    >
      <VerifyOtpContent />
    </Suspense>
  )
}
