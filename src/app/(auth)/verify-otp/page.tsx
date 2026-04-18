'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react'
import BpLogo from '@/components/BpLogo'
import { Badge } from '@/components/dashboard/primitives/Badge'
import OtpInput from '@/components/OtpInput'
import { clearPendingOtp, readPendingOtp } from '@/lib/auth/pending-otp'
import { resolvePostAuthRedirect } from '@/lib/demo/session'
import { cn } from '@/lib/utils'
import { AUTH_COPY, type StaticLocale } from '@/lib/i18n/dynamic-pages'
import { useUiV2 } from '@/hooks/useUiV2'

const OTP_LENGTH = 6
const COUNTDOWN_SECONDS = 45

function VerifyOtpContent({ locale }: { locale?: StaticLocale } = {}) {
  const isV2 = useUiV2()
  const t = AUTH_COPY[locale ?? 'en']
  const router = useRouter()
  const [pendingOtp, setPendingOtp] = useState<ReturnType<typeof readPendingOtp>>(null)
  const [queryFlowId, setQueryFlowId] = useState<string | null>(null)
  const [hasLoadedPendingOtp, setHasLoadedPendingOtp] = useState(false)
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    setPendingOtp(readPendingOtp())
    if (typeof window !== 'undefined') {
      setQueryFlowId(new URLSearchParams(window.location.search).get('flow'))
    }
    setHasLoadedPendingOtp(true)
  }, [])

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const deliveryLabel = pendingOtp?.flow === 'signup' ? t.otpSubheading : t.otpLoginSubheading
  const flowId = queryFlowId ?? pendingOtp?.flowId
  const restartHref = pendingOtp?.returnTo === '/forgot-password' || pendingOtp?.flow === 'password_reset_phone'
    ? '/forgot-password'
    : pendingOtp?.flow === 'signup'
      ? '/signup'
      : '/login'

  const allFilled = otp.every((digit) => digit !== '')

  const formatCountdown = (seconds: number) => {
    const ss = String(seconds % 60).padStart(2, '0')
    return `00:${ss}`
  }


  const cardClass = isV2
    ? 'bg-white rounded-[8px] p-8 pb-10 sm:p-12 sm:pb-12 max-w-[440px] w-full shadow-2xl shadow-bp-primary/5 border border-bp-border animate-in fade-in slide-in-from-bottom-8 duration-700'
    : 'w-full rounded-[var(--sq-lg)] border border-gray-200 bg-white p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500'

  if (!hasLoadedPendingOtp) {
    return (
      <div className={cardClass} data-ui-version={isV2 ? 'v2' : 'v1'}>
        <div className="flex justify-center">
          <BpLogo href="/" size="auth" />
        </div>
        <div className="mt-10 space-y-4">
          <div className="h-10 w-48 rounded-[var(--sq-lg)] bg-bp-surface animate-pulse" />
          <div className="h-4 w-full rounded-full bg-bp-surface animate-pulse" />
          <div className="h-4 w-3/4 rounded-full bg-bp-surface animate-pulse" />
          <div className="grid grid-cols-6 gap-3 pt-6">
            {Array.from({ length: OTP_LENGTH }).map((_, index) => (
              <div key={index} className="h-14 rounded-[var(--sq-lg)] bg-bp-surface animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Auto-submit logic is now inside OtpInput via onComplete

  async function handleVerify(codeOverride?: string) {
    const code = codeOverride || otp.join('')

    if (code.length < OTP_LENGTH) {
      setError('Please enter all 6 digits')
      return
    }
    if (!flowId) {
      setError('Your verification session expired. Please request a fresh OTP.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flow_id: flowId,
          otp: code,
        }),
      })
      const data = await res.json() as {
        redirectTo?: string
        role?: string
        error?: string
      }
      if (!res.ok) {
        setError(data.error ?? 'Invalid OTP. Please try again.')
        setOtp(Array(OTP_LENGTH).fill(''))
        return
      }
      clearPendingOtp()

      // After signup OTP: link email+password to the phone-verified account
      if (pendingOtp?.flow === 'signup') {
        try {
          const raw = sessionStorage.getItem('bp-pending-credentials')
          if (raw) {
            const creds = JSON.parse(raw) as { email: string; password: string }
            await fetch('/api/auth/set-credentials', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(creds),
            })
            sessionStorage.removeItem('bp-pending-credentials')
          }
        } catch {
          // Best-effort — user can set email via forgot-password if this fails
        }
      }

      const fallbackRole = pendingOtp?.flow === 'signup' ? 'patient' : data.role
      const redirectTo =
        pendingOtp?.flow === 'password_reset_phone'
          ? '/forgot-password?after_otp=1'
          : (data.redirectTo ?? resolvePostAuthRedirect(fallbackRole, pendingOtp?.returnTo))

      // Brief success flash before redirect
      setVerified(true)
      setTimeout(() => {
        router.push(redirectTo)
        router.refresh()
      }, 800)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (!flowId) {
      setError('Your verification session expired. Please request a fresh OTP.')
      return
    }

    try {
      const response = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flow_id: flowId }),
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

  if (verified) {
    return (
      <div className="bg-white rounded-[40px] p-8 pb-10 sm:p-12 sm:pb-12 max-w-[440px] w-full shadow-2xl shadow-black/5 border border-bp-border animate-in zoom-in-95 fade-in duration-500 flex flex-col items-center justify-center py-16" data-ui-version={isV2 ? 'v2' : 'v1'}>
        <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6 animate-in zoom-in-50 duration-300">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" strokeWidth={2.5} />
        </div>
        <h2 className="text-[24px] font-bold text-bp-primary tracking-tight">Verified!</h2>
        <p className="mt-2 text-[14px] font-bold text-bp-body/40">Redirecting to your dashboard...</p>
      </div>
    )
  }

  if (!flowId) {
    return (
      <div className={cn(cardClass, 'text-center')} data-ui-version={isV2 ? 'v2' : 'v1'}>
        <div className="flex justify-center">
          <BpLogo href="/" size="auth" />
        </div>

        <div className="mx-auto mt-10 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <RefreshCw className="h-9 w-9" />
        </div>

        <h1 className="mt-8 text-[32px] font-bold text-bp-primary tracking-tighter leading-none">
          {t.otpExpiredHeading}
        </h1>
        <p className="mt-3 text-[15px] font-bold text-bp-body/40 leading-relaxed">
          {t.otpExpiredBody}
        </p>

        <button
          type="button"
          onClick={() => router.push(restartHref)}
          className="mt-10 inline-flex h-14 items-center justify-center gap-3 rounded-[var(--sq-lg)] bg-bp-accent px-6 text-[16px] font-bold text-white transition-all hover:bg-bp-primary active:scale-[0.98]"
        >
          {t.otpRestart}
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    )
  }

  return (
    <div className={cardClass} data-ui-version={isV2 ? 'v2' : 'v1'}>
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
      <div className={cn('mb-8', isV2 && 'v2-otp-keypad')} data-testid={isV2 ? 'v2-otp-keypad' : undefined}>
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
          "w-full h-18 flex items-center justify-center gap-3 py-5 text-[18px] font-bold text-white rounded-[var(--sq-lg)] mb-8 transition-all active:scale-[0.98] relative overflow-hidden",
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

      {isV2 && (
        <div className="flex justify-center mt-6">
          <Badge variant="success">Secure · India&apos;s physio platform</Badge>
        </div>
      )}
      </div>
    </div>
  )
}

export default function VerifyOtpPage({ locale }: { locale?: StaticLocale } = {}) {
  return <VerifyOtpContent locale={locale} />
}
