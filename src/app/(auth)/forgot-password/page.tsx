'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { z } from 'zod'
import { ArrowLeft, KeyRound, RotateCcw, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react'
import BpLogo from '@/components/BpLogo'
import { Badge } from '@/components/dashboard/primitives/Badge'
import { savePendingOtp } from '@/lib/auth/pending-otp'
import { cn } from '@/lib/utils'
import { useUiV2 } from '@/hooks/useUiV2'
import { DEFAULT_OTP_LENGTH, OtpDigits, type OtpDigitsHandle } from '@/components/auth/OtpDigits'

const forgotSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Please enter your mobile number or email')
    .refine(
      (v) => /^[6-9]\d{9}$/.test(v) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      'Enter a valid mobile number or email address'
    ),
})

const RESEND_COOLDOWN_SECONDS = 60

function ForgotPasswordContent() {
  const isV2 = useUiV2()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [identifier, setIdentifier] = useState('')
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [focused, setFocused] = useState(false)
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const [emailForReset, setEmailForReset] = useState('')
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(DEFAULT_OTP_LENGTH).fill(''))
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [verifyError, setVerifyError] = useState('')
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSent, setResendSent] = useState(false)
  const [resendError, setResendError] = useState('')
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN_SECONDS)
  const otpRef = useRef<OtpDigitsHandle | null>(null)

  // Countdown after step 2 (email path)
  useEffect(() => {
    if (step !== 2) return
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown, step])

  const afterOtp = searchParams.get('after_otp') === '1'

  useEffect(() => {
    if (afterOtp) {
      setStep(3)
    }
  }, [afterOtp])

  function handleChange(value: string) {
    setIdentifier(value)
    if (error) setError('')
  }

  async function handleSubmitStep1(e: React.FormEvent) {
    e.preventDefault()
    const result = forgotSchema.safeParse({ identifier })
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }
    setLoading(true)
    setError('')
    try {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)

      if (isEmail) {
        const res = await fetch('/api/auth/password-reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: identifier }),
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({})) as { error?: string }
          setError(data.error || 'Failed to send reset code. Please try again.')
          return
        }

        setEmailForReset(identifier.trim().toLowerCase())
        setCountdown(RESEND_COOLDOWN_SECONDS)
        setStep(2)
        return
      }

      const cleanPhone = identifier.startsWith('+91') ? identifier : `+91${identifier.replace(/\s/g, '')}`
      const flowId = crypto.randomUUID()
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          flow: 'login',
          flow_id: flowId,
          return_to: '/forgot-password',
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { message?: string; error?: string }
        setError(data.message || data.error || 'Failed to send OTP')
        return
      }

      savePendingOtp({
        flow: 'password_reset_phone',
        flowId,
        returnTo: '/forgot-password',
      })

      router.push(`/verify-otp?flow=${encodeURIComponent(flowId)}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  async function handleResendEmail() {
    if (resendLoading || countdown > 0 || !emailForReset) return
    setResendLoading(true)
    setResendError('')
    setResendSent(false)
    try {
      const res = await fetch('/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailForReset }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string }
        setResendError(data.error ?? 'Unable to resend. Please try again.')
        return
      }
      setResendSent(true)
      setCountdown(RESEND_COOLDOWN_SECONDS)
      setOtpDigits(Array(DEFAULT_OTP_LENGTH).fill(''))
      otpRef.current?.focusFirst()
    } catch {
      setResendError('Network error. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  async function handleVerifyPassword(e: React.FormEvent) {
    e.preventDefault()
    setVerifyError('')

    if (afterOtp) {
      if (password.length < 8) {
        setVerifyError('Password must be at least 8 characters.')
        return
      }
      if (password !== confirmPassword) {
        setVerifyError('Passwords do not match.')
        return
      }
      setVerifyLoading(true)
      try {
        const supabase = (await import('@/lib/supabase/client')).createClient()
        const { error: upd } = await supabase.auth.updateUser({ password })
        if (upd) {
          setVerifyError(upd.message)
          return
        }
        router.push('/login?reset=1')
      } catch {
        setVerifyError('Unable to update password. Please try again.')
      } finally {
        setVerifyLoading(false)
      }
      return
    }

    const code = otpDigits.join('')
    if (code.length !== DEFAULT_OTP_LENGTH) {
      setVerifyError('Enter all 6 digits of your code.')
      return
    }
    if (password.length < 8) {
      setVerifyError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setVerifyError('Passwords do not match.')
      return
    }

    setVerifyLoading(true)
    try {
      const res = await fetch('/api/auth/password-reset/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailForReset,
          code,
          newPassword: password,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string }
        setVerifyError(data.error ?? 'Invalid or expired code.')
        return
      }
      router.push('/login?reset=1')
    } catch {
      setVerifyError('Network error. Please try again.')
    } finally {
      setVerifyLoading(false)
    }
  }

  function handleResetFlow() {
    setStep(1)
    setIdentifier('')
    setEmailForReset('')
    setOtpDigits(Array(DEFAULT_OTP_LENGTH).fill(''))
    setPassword('')
    setConfirmPassword('')
    setError('')
    setVerifyError('')
    setResendError('')
    setCountdown(RESEND_COOLDOWN_SECONDS)
    router.replace('/forgot-password', { scroll: false })
  }

  const cardClass = isV2
    ? 'bg-white rounded-[8px] p-8 pb-10 sm:p-12 sm:pb-12 max-w-[440px] w-full shadow-2xl shadow-bp-primary/5 border border-bp-border animate-in fade-in slide-in-from-bottom-8 duration-700'
    : 'w-full rounded-[var(--sq-lg)] border border-gray-200 bg-white p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500'

  const maskedEmail = emailForReset.replace(
    /^(.)(.*)(@.*)$/,
    (_m, first, local, domain) => `${first}${'•'.repeat(Math.min(Math.max(local.length, 1), 6))}${domain}`,
  )

  return (
    <div className={cardClass} data-ui-version={isV2 ? 'v2' : 'v1'}>
      <div className="flex justify-center">
        <BpLogo href="/" size="auth" linkClassName="mx-auto" />
      </div>

      {step === 1 && (
        <>
          <h1 className="text-[28px] font-black text-bp-primary mb-2 mt-10 tracking-tighter leading-none">
            Forgot Password?
          </h1>
          <p className="text-[15px] font-bold text-bp-body/40 mb-10">
            Enter your mobile number or email and we&apos;ll help you recover access.
          </p>

          <form onSubmit={handleSubmitStep1} noValidate>
            <div className="mb-10">
              <label htmlFor="identifier" className="block text-[11px] font-black uppercase tracking-[0.2em] text-bp-body/40 mb-2 ml-1">
                Mobile Number or Email
              </label>
              <div className="relative group">
                <input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => handleChange(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="e.g. 98765 43210 or name@email.com"
                  className={cn(
                    'w-full pl-12 pr-4 py-4 text-[16px] font-bold text-bp-primary bg-bp-surface rounded-[var(--sq-lg)] outline-none border-2 transition-all',
                    error ? 'border-red-200 bg-red-50/30' : focused ? 'border-bp-accent bg-white shadow-xl shadow-bp-primary/5' : 'border-transparent hover:border-bp-border'
                  )}
                />
                <KeyRound className={cn('absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors', focused ? 'text-bp-accent' : 'text-bp-body/20')} />
              </div>
              {error && (
                <p className="text-[11px] font-bold text-red-500 mt-1.5 ml-1">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                'w-full flex items-center justify-center gap-3 py-5 text-[16px] font-black text-white rounded-[24px] transition-all shadow-xl shadow-bp-primary/10 active:scale-[0.98]',
                loading ? 'bg-bp-primary/40 cursor-not-allowed' : 'bg-bp-primary hover:bg-bp-accent hover:shadow-bp-accent/20'
              )}
            >
              {loading ? 'Sending…' : (
                <>
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-[28px] font-black text-bp-primary mb-2 mt-10 tracking-tighter leading-none">
            Check your inbox
          </h2>
          <p className="text-[15px] font-bold text-bp-body/40 mb-6 leading-relaxed">
            If an account exists for <span className="text-bp-primary font-black">{maskedEmail}</span>, we sent a 6-digit code. Enter it below with your new password.
          </p>

          <form onSubmit={handleVerifyPassword} noValidate>
            <OtpDigits
              ref={otpRef}
              value={otpDigits}
              onChange={setOtpDigits}
              hasError={!!verifyError}
            />

            <div className="mb-4">
              <label htmlFor="new-password" className="block text-[11px] font-black uppercase tracking-[0.2em] text-bp-body/40 mb-2 ml-1">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 text-[16px] font-bold text-bp-primary bg-bp-surface rounded-[var(--sq-lg)] outline-none border-2 border-transparent hover:border-bp-border focus:border-bp-accent"
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="confirm-password" className="block text-[11px] font-black uppercase tracking-[0.2em] text-bp-body/40 mb-2 ml-1">
                Confirm password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-4 text-[16px] font-bold text-bp-primary bg-bp-surface rounded-[var(--sq-lg)] outline-none border-2 border-transparent hover:border-bp-border focus:border-bp-accent"
                placeholder="Re-enter password"
                autoComplete="new-password"
              />
            </div>

            {verifyError && (
              <p className="text-[14px] font-bold text-red-500 mb-4">{verifyError}</p>
            )}

            <button
              type="submit"
              disabled={verifyLoading}
              className={cn(
                'w-full flex items-center justify-center gap-3 py-5 text-[16px] font-black text-white rounded-[24px] transition-all shadow-xl shadow-bp-primary/10 mb-6',
                verifyLoading ? 'bg-bp-primary/40 cursor-not-allowed' : 'bg-bp-primary hover:bg-bp-accent'
              )}
            >
              {verifyLoading ? 'Updating…' : (
                <>
                  Update password
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-center space-y-2">
            <p className="text-sm text-gray-500">Didn&apos;t receive it? Check spam or resend.</p>
            {resendSent && countdown > 0 ? (
              <div className="flex items-center justify-center gap-2 text-sm font-medium text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>New code sent!</span>
                <span className="text-gray-400 font-normal">(resend in {countdown}s)</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleResendEmail}
                disabled={resendLoading || countdown > 0}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {resendLoading ? (
                  <><RefreshCw className="h-4 w-4 animate-spin" />Resending…</>
                ) : countdown > 0 ? (
                  <><RefreshCw className="h-4 w-4" />Resend in {countdown}s</>
                ) : (
                  <><RefreshCw className="h-4 w-4" />Resend code</>
                )}
              </button>
            )}
            {resendError && <p className="text-xs font-medium text-red-500">{resendError}</p>}
          </div>

          <button
            type="button"
            onClick={handleResetFlow}
            className="mt-8 text-[14px] font-black text-bp-accent hover:text-bp-primary transition-all flex items-center gap-2 mx-auto focus:outline-none"
          >
            <RotateCcw className="w-4 h-4" />
            Try another email/number
          </button>
        </div>
      )}

      {step === 3 && afterOtp && (
        <div>
          <h2 className="text-[28px] font-black text-bp-primary mb-2 mt-10 tracking-tighter leading-none">
            Set a new password
          </h2>
          <p className="text-[15px] font-bold text-bp-body/40 mb-6">
            Your phone is verified. Choose a new password for your account.
          </p>
          <form onSubmit={handleVerifyPassword} noValidate>
            <div className="mb-4">
              <label htmlFor="phone-new-password" className="block text-[11px] font-black uppercase tracking-[0.2em] text-bp-body/40 mb-2 ml-1">
                New password
              </label>
              <input
                id="phone-new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 text-[16px] font-bold text-bp-primary bg-bp-surface rounded-[var(--sq-lg)] outline-none border-2 border-transparent hover:border-bp-border focus:border-bp-accent"
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="phone-confirm-password" className="block text-[11px] font-black uppercase tracking-[0.2em] text-bp-body/40 mb-2 ml-1">
                Confirm password
              </label>
              <input
                id="phone-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-4 text-[16px] font-bold text-bp-primary bg-bp-surface rounded-[var(--sq-lg)] outline-none border-2 border-transparent hover:border-bp-border focus:border-bp-accent"
                placeholder="Re-enter password"
                autoComplete="new-password"
              />
            </div>
            {verifyError && (
              <p className="text-[14px] font-bold text-red-500 mb-4">{verifyError}</p>
            )}
            <button
              type="submit"
              disabled={verifyLoading}
              className={cn(
                'w-full flex items-center justify-center gap-3 py-5 text-[16px] font-black text-white rounded-[24px] transition-all shadow-xl shadow-bp-primary/10',
                verifyLoading ? 'bg-bp-primary/40 cursor-not-allowed' : 'bg-bp-primary hover:bg-bp-accent'
              )}
            >
              {verifyLoading ? 'Updating…' : (
                <>
                  Update password
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      )}

      <div className="mt-10 text-center border-t border-bp-border pt-8">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-bp-body/40 font-bold text-[14px] hover:text-bp-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
      </div>

      {isV2 && (
        <div className="flex justify-center mt-6">
          <Badge variant="success">Secure · India&apos;s physio platform</Badge>
        </div>
      )}
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[320px]" />}>
      <ForgotPasswordContent />
    </Suspense>
  )
}
