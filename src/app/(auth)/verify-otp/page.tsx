'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react'
import BpLogo from '@/components/BpLogo'
import OtpInput from '@/components/OtpInput'
import { clearPendingOtp, readPendingOtp } from '@/lib/auth/pending-otp'
import { isDemoAccessEnabled, resolvePostAuthRedirect, type DemoRole } from '@/lib/demo/session'
import { launchDemoSession } from '@/lib/demo/client'
import { cn } from '@/lib/utils'

const OTP_LENGTH = 6
const COUNTDOWN_SECONDS = 45

function VerifyOtpContent() {
  const router = useRouter()
  const [pendingOtp, setPendingOtp] = useState<ReturnType<typeof readPendingOtp>>(null)
  const [hasLoadedPendingOtp, setHasLoadedPendingOtp] = useState(false)
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [devRolePicker, setDevRolePicker] = useState(false)

  useEffect(() => {
    setPendingOtp(readPendingOtp())
    setHasLoadedPendingOtp(true)
  }, [])

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const displayPhone = pendingOtp?.phone
    ? `+${pendingOtp.phone.slice(0, 2)} ${pendingOtp.phone.slice(2, 7)} ${pendingOtp.phone.slice(7)}`
    : ''

  const allFilled = otp.every((d) => d !== '')

  const formatCountdown = (s: number) => {
    const mm = String(Math.floor(s / 60)).padStart(2, '0')
    const ss = String(s % 60).padStart(2, '0')
    return `${mm}:${ss}`
  }

  if (!hasLoadedPendingOtp) {
    return (
      <div className="bg-white rounded-[40px] p-8 pb-10 sm:p-12 sm:pb-12 max-w-[440px] w-full shadow-2xl shadow-bp-primary/5 border border-bp-border animate-in fade-in slide-in-from-bottom-8 duration-700">
        <BpLogo href="/" frameClassName="h-[35px] w-[140px]" />
        <div className="mt-10 space-y-4">
          <div className="h-8 w-44 rounded-full bg-bp-surface animate-pulse" />
          <div className="h-4 w-full rounded-full bg-bp-surface animate-pulse" />
          <div className="h-4 w-3/4 rounded-full bg-bp-surface animate-pulse" />
          <div className="grid grid-cols-6 gap-3 pt-6">
            {Array.from({ length: OTP_LENGTH }).map((_, index) => (
              <div key={index} className="h-14 rounded-2xl bg-bp-surface animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!pendingOtp) {
    return (
      <div className="bg-white rounded-[40px] p-8 pb-10 sm:p-12 sm:pb-12 max-w-[440px] w-full shadow-2xl shadow-bp-primary/5 border border-bp-border animate-in fade-in slide-in-from-bottom-8 duration-700">
        <BpLogo href="/" frameClassName="h-[35px] w-[140px]" />

        <h1 className="text-[28px] font-black text-bp-primary mb-2 mt-10 tracking-tighter leading-none">
          OTP session expired
        </h1>
        <p className="text-[15px] font-bold text-bp-body/40 mb-10 leading-relaxed">
          Start over from login or password recovery to request a fresh verification code.
        </p>

        <div className="flex flex-col gap-4">
          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-3 py-5 text-[16px] font-black text-white rounded-2xl transition-all active:scale-[0.98] bg-bp-primary hover:bg-bp-primary/95 shadow-xl shadow-bp-primary/10"
          >
            Go to Login
            <ArrowRight className="w-5 h-5 text-bp-accent" />
          </Link>
          <Link
            href="/forgot-password"
            className="w-full flex items-center justify-center gap-3 py-5 text-[16px] font-black text-bp-primary rounded-2xl border border-bp-border bg-bp-surface/40 hover:bg-bp-surface transition-all active:scale-[0.98]"
          >
            Recover Access
          </Link>
        </div>
      </div>
    )
  }

  // Auto-submit logic is now inside OtpInput via onComplete

  async function handleVerify(codeOverride?: string) {
    const code = codeOverride || otp.join('')
    const phone = pendingOtp?.phone ?? ''

    if (code.length < OTP_LENGTH) {
      setError('Please enter all 6 digits')
      return
    }

    if (!phone) {
      setError('Your verification session expired. Please request a fresh OTP.')
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
          phone: '+' + phone,
          otp: code,
          ...(pendingOtp?.flow === 'signup' && pendingOtp.fullName ? { full_name: pendingOtp.fullName } : {}),
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
      clearPendingOtp()
      const fallbackRole = pendingOtp?.flow === 'signup' ? 'patient' : data.role ?? data.user?.user_metadata?.role
      router.push(resolvePostAuthRedirect(fallbackRole, pendingOtp?.returnTo))
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
      const redirectTo = await launchDemoSession(role, pendingOtp?.returnTo ?? null)
      clearPendingOtp()
      router.push(redirectTo)
    } catch {
      setError('Demo access is unavailable right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    const phone = pendingOtp?.phone ?? ''

    setCountdown(COUNTDOWN_SECONDS)
    setOtp(Array(OTP_LENGTH).fill(''))
    setError('')

    if (!phone) {
      setError('Your verification session expired. Please request a fresh OTP.')
      return
    }

    try {
      await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '+' + phone }),
      })
    } catch {
      // silently ignore resend errors — user can retry countdown
    }
  }

  return (
    <div className="bg-white rounded-[40px] p-8 pb-10 sm:p-12 sm:pb-12 max-w-[440px] w-full shadow-2xl shadow-bp-primary/5 border border-bp-border animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="relative">
      <BpLogo href="/" frameClassName="h-[35px] w-[140px]" />

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
  return <VerifyOtpContent />
}
