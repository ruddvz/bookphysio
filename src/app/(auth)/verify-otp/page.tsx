'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react'
import BpLogo from '@/components/BpLogo'
import OtpInput from '@/components/OtpInput'
import { clearPendingOtp, readPendingOtp } from '@/lib/auth/pending-otp'
import { resolvePostAuthRedirect } from '@/lib/demo/session'
import { cn } from '@/lib/utils'
import { AUTH_COPY, localePath, type StaticLocale } from '@/lib/i18n/dynamic-pages'

const OTP_LENGTH = 6
const COUNTDOWN_SECONDS = 45

function VerifyOtpContent({ locale }: { locale?: StaticLocale } = {}) {
  const t = AUTH_COPY[locale ?? 'en']
  const router = useRouter()
  const [pendingOtp, setPendingOtp] = useState<ReturnType<typeof readPendingOtp>>(null)
  const [hasLoadedPendingOtp, setHasLoadedPendingOtp] = useState(false)
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(false)

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
  const deliveryLabel = pendingOtp?.flow === 'login' ? t.otpLoginSubheading(displayPhone) : t.otpSubheading(displayPhone)

  const allFilled = otp.every((digit) => digit !== '')

  const formatCountdown = (seconds: number) => {
    const ss = String(seconds % 60).padStart(2, '0')
    return `00:${ss}`
  }


  if (!hasLoadedPendingOtp) {
    return (
      <div className="bg-white rounded-[40px] p-8 pb-10 sm:p-12 sm:pb-12 max-w-[440px] w-full shadow-2xl shadow-black/5 border border-bp-border animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex justify-center">
          <BpLogo href="/" size="auth" />
        </div>
        <div className="mt-10 space-y-4">
          <div className="h-10 w-48 rounded-2xl bg-bp-surface animate-pulse" />
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
      <div className="bg-white rounded-[40px] p-8 pb-10 sm:p-12 sm:pb-12 max-w-[440px] w-full shadow-2xl shadow-black/5 border border-bp-border animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex justify-center">
          <BpLogo href="/" size="auth" />
        </div>

        <h1 className="text-[32px] font-bold text-bp-primary mb-3 mt-10 tracking-tighter leading-none">
          OTP session expired
        </h1>
        <p className="text-[15px] font-bold text-bp-body/40 mb-10 leading-relaxed">
          Start over from login or password recovery to request a fresh verification code.
        </p>

        <div className="flex flex-col gap-4">
          <Link
            href={localePath(locale ?? 'en', '/login')}
            className="w-full h-16 flex items-center justify-center gap-3 text-[16px] font-bold text-white rounded-2xl transition-all active:scale-[0.98] bg-bp-accent hover:bg-bp-primary shadow-xl shadow-bp-primary/10"
          >
            {t.loginBackToLogin}
            <ArrowRight className="w-5 h-5 text-bp-accent" />
          </Link>
          <Link
            href="/forgot-password"
            className="w-full h-16 flex items-center justify-center gap-3 text-[16px] font-bold text-bp-accent rounded-2xl border-2 border-bp-border bg-white hover:bg-bp-surface transition-all active:scale-[0.98]"
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
        setOtp(Array(OTP_LENGTH).fill(''))
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

  async function handleResend() {
    const phone = pendingOtp?.phone ?? ''
    const flow = pendingOtp?.flow ?? 'login'

    if (!phone) {
      setError('Your verification session expired. Please request a fresh OTP.')
      return
    }

    try {
      const response = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '+' + phone, flow }),
      })

      const data = await response.json().catch(() => ({})) as { error?: string }
      if (!response.ok) {
        setError(data.error ?? 'Unable to resend OTP right now. Please try again.')
        return
      }

      setCountdown(COUNTDOWN_SECONDS)
      setOtp(Array(OTP_LENGTH).fill(''))
      setError('')
    } catch {
      setError('Unable to resend OTP right now. Please check your connection and retry.')
    }
  }

  return (
    <div className="bg-white rounded-[40px] p-8 pb-10 sm:p-12 sm:pb-12 max-w-[440px] w-full shadow-2xl shadow-black/5 border border-bp-border animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="relative">
      <div className="flex justify-center">
        <BpLogo href="/" size="auth" />
      </div>

      <h1 className="text-[32px] font-bold text-bp-primary mb-3 mt-10 tracking-tighter leading-none">
        {t.otpHeading}
      </h1>
      <p className="text-[15px] font-bold text-bp-body/40 mb-10 leading-relaxed">
        {deliveryLabel}
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
        <p className="text-[13px] font-bold text-red-500 text-center -mt-4 mb-6 animate-in shake duration-500">
          {error}
        </p>
      )}

      {/* Resend + countdown */}
      <div className="flex justify-between items-center mb-10 px-1">
        {countdown > 0 ? (
          <span className="text-[14px] font-bold text-bp-body/30 uppercase tracking-widest">
            {t.otpResendIn(formatCountdown(countdown))}
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className="inline-flex items-center gap-2 text-[14px] text-bp-accent font-bold bg-transparent border-none cursor-pointer p-0 outline-none hover:underline transition-colors uppercase tracking-widest"
          >
            <RefreshCw className="w-4 h-4" />
            {t.otpResend}
          </button>
        )}
        <span
          className={cn(
            "text-[14px] font-bold tabular-nums tracking-widest transition-opacity duration-300",
            countdown > 0 ? 'text-bp-body/40' : 'opacity-0'
          )}
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
          "w-full h-18 flex items-center justify-center gap-3 py-5 text-[18px] font-bold text-white rounded-2xl mb-8 transition-all active:scale-[0.98] relative overflow-hidden",
          allFilled && !loading 
            ? 'bg-bp-accent hover:bg-bp-primary shadow-xl shadow-bp-primary/10 cursor-pointer' 
            : 'bg-bp-border cursor-not-allowed text-white/50'
        )}
      >
        <span className="relative z-10 flex items-center gap-3">
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              {t.otpVerifyingButton}
            </>
          ) : (
            <>
              {t.otpVerifyButton}
              <ArrowRight className="w-5 h-5 text-bp-accent" />
            </>
          )}
        </span>
        {allFilled && !loading && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full hover:animate-shine" />
        )}
      </button>

      {/* Back link */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-[14px] text-bp-body/40 hover:text-bp-accent font-bold bg-transparent border-none cursor-pointer no-underline outline-none transition-colors uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.otpBack}
        </button>
      </div>
      </div>
    </div>
  )
}

export default function VerifyOtpPage({ locale }: { locale?: StaticLocale } = {}) {
  return <VerifyOtpContent locale={locale} />
}
