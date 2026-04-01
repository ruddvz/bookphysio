'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react'
import BpLogo from '@/components/BpLogo'
import OtpInput from '@/components/OtpInput'

const OTP_LENGTH = 6
const COUNTDOWN_SECONDS = 45

function VerifyOtpContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const phoneParam = searchParams.get('phone') ?? ''
  const nameParam = searchParams.get('name') ?? ''
  const flowParam = searchParams.get('flow') ?? 'login'

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

    // Dev access bypass — code "264200" shows role picker then creates a client-side dev session
    if (code === '264200') {
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
      const data = await res.json() as { user?: { id: string }; error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Invalid OTP. Please try again.')
        return
      }
      // Redirect based on flow
      if (flowParam === 'signup') {
        router.push('/patient/dashboard')
      } else {
        router.push('/patient/dashboard')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleDevSignIn(role: 'patient' | 'provider') {
    const devSession = {
      user: {
        id: 'dev-user-' + phoneParam,
        phone: '+' + phoneParam,
        email: `${phoneParam}@dev.bookphysio.in`,
        user_metadata: {
          full_name: nameParam || 'Dev User',
          role,
          phone: '+' + phoneParam,
        },
        created_at: new Date().toISOString(),
      },
      access_token: 'dev-access-token-' + Date.now(),
      expires_at: Math.floor(Date.now() / 1000) + 86400,
    }
    try {
      localStorage.setItem('bp-dev-session', JSON.stringify(devSession))
    } catch {
      // localStorage unavailable — proceed anyway
    }
    window.dispatchEvent(new Event('bp-dev-auth'))
    router.push(role === 'provider' ? '/provider/dashboard' : '/patient/dashboard')
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
    <div className="bg-white rounded-[12px] p-10 max-w-[440px] w-full shadow-lg animate-in fade-in duration-500">
      <BpLogo />

      <h1 className="text-[24px] font-bold text-[#333333] mb-1.5">
        Verify your number
      </h1>
      <p className="text-[14px] text-[#666666] mb-8">
        Code sent to{' '}
        <span className="font-semibold text-[#333333]">{displayPhone}</span>
      </p>

      {/* OTP digit inputs */}
      <div className="mb-6">
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
        <p className="text-[12px] text-[#DC2626] text-center -mt-3 mb-4">
          {error}
        </p>
      )}

      {/* Resend + countdown */}
      <div className="flex justify-between items-center mb-7">
        {countdown > 0 ? (
          <span className="text-[14px] text-[#666666]">
            Resend OTP
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className="inline-flex items-center gap-1.5 text-[14px] text-[#00766C] font-semibold bg-transparent border-none cursor-pointer p-0 outline-none hover:text-[#005A52] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Resend OTP
          </button>
        )}
        <span
          className={`text-[14px] tabular-nums ${countdown > 0 ? 'text-[#666666]' : 'text-transparent'}`}
        >
          {formatCountdown(countdown)}
        </span>
      </div>

      {/* Verify button */}
      <button
        type="button"
        onClick={() => handleVerify()}
        disabled={!allFilled || loading}
        className={`w-full flex items-center justify-center gap-2 py-3.5 text-[16px] font-semibold text-white rounded-full mb-5 transition-colors outline-none ${
          allFilled && !loading ? 'bg-[#00766C] hover:bg-[#005A52] cursor-pointer' : 'bg-[#a0cdc9] cursor-not-allowed'
        }`}
      >
        {loading ? 'Verifying…' : (
          <>
            Verify
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Back link */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-[14px] text-[#666666] hover:text-[#333333] bg-transparent border-none cursor-pointer no-underline outline-none transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Dev role picker overlay */}
      {devRolePicker && (
        <div className="absolute inset-0 bg-white rounded-[12px] flex flex-col items-center justify-center gap-6 p-10 animate-in fade-in duration-200">
          <div className="text-center">
            <p className="text-[11px] font-semibold text-[#00766C] uppercase tracking-widest mb-2">Dev Access</p>
            <h2 className="text-[22px] font-bold text-[#333333]">Sign in as…</h2>
          </div>
          <div className="w-full flex flex-col gap-3">
            <button
              type="button"
              onClick={() => handleDevSignIn('patient')}
              className="w-full py-3.5 text-[16px] font-semibold text-white bg-[#00766C] hover:bg-[#005A52] rounded-full transition-colors cursor-pointer"
            >
              Patient
            </button>
            <button
              type="button"
              onClick={() => handleDevSignIn('provider')}
              className="w-full py-3.5 text-[16px] font-semibold text-white bg-[#333333] hover:bg-[#111] rounded-full transition-colors cursor-pointer"
            >
              Doctor / Provider
            </button>
            <button
              type="button"
              onClick={() => setDevRolePicker(false)}
              className="w-full py-2 text-[14px] text-[#666666] hover:text-[#333333] bg-transparent border-none cursor-pointer outline-none transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
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
