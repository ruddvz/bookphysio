'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, RefreshCw, CheckCircle2 } from 'lucide-react'
import BpLogo from '@/components/BpLogo'
import { createClient } from '@/lib/supabase/client'

const RESEND_COOLDOWN_SECONDS = 60

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [resendError, setResendError] = useState<string>('')
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  async function handleResend() {
    if (!email || resendStatus === 'loading' || countdown > 0) return

    setResendStatus('loading')
    setResendError('')

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      })

      if (error) {
        setResendError('Unable to resend the email right now. Please try again.')
        setResendStatus('error')
        return
      }

      setResendStatus('sent')
      setCountdown(RESEND_COOLDOWN_SECONDS)
    } catch {
      setResendError('Network error. Please try again.')
      setResendStatus('error')
    }
  }

  const maskedEmail = email
    ? email.replace(/^(.)(.*)(@.*)$/, (_m, a, b, c) => `${a}${'•'.repeat(Math.min(Math.max(b.length, 1), 6))}${c}`)
    : null

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6">

        {/* Logo */}
        <div className="flex justify-center">
          <BpLogo href="/" size="auth" className="h-10 w-[200px]" linkClassName="justify-center" />
        </div>

        {/* Icon + heading */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-bp-primary/10">
            <Mail className="h-8 w-8 text-bp-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Check your email
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            We&apos;ve sent a confirmation link to{' '}
            {maskedEmail ? (
              <span className="font-semibold text-gray-700">{maskedEmail}</span>
            ) : (
              'your email address'
            )}
            .<br />
            Click the link in the email to activate your account.
          </p>
        </div>

        {/* Resend section */}
        <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-4 text-center space-y-3">
          <p className="text-sm text-gray-500">
            Didn&apos;t receive it? Check your spam folder or resend below.
          </p>

          {resendStatus === 'sent' ? (
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>Email resent!</span>
              {countdown > 0 && (
                <span className="text-gray-400 font-normal">
                  (resend again in {countdown}s)
                </span>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendStatus === 'loading' || countdown > 0}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {resendStatus === 'loading' ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Resending…
                </>
              ) : countdown > 0 ? (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Resend in {countdown}s
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Resend confirmation email
                </>
              )}
            </button>
          )}

          {resendStatus === 'error' && resendError && (
            <p className="text-xs font-medium text-red-500">{resendError}</p>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500">
          Wrong email?{' '}
          <Link href="/signup" className="font-semibold text-bp-primary hover:text-bp-primary-dark transition-colors">
            Sign up again
          </Link>
        </p>

      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="w-full rounded-2xl border border-gray-200 bg-white p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-10 w-[200px] bg-gray-100 rounded animate-pulse" />
          <div className="h-16 w-16 rounded-full bg-gray-100 animate-pulse" />
          <div className="h-6 w-48 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
