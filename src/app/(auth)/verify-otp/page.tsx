'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react'

const OTP_LENGTH = 6
const COUNTDOWN_SECONDS = 45

function BpLogo() {
  return (
    <div className="flex items-center gap-2.5 mb-7">
      <img
        src="/images/logo-icon.png"
        alt="BookPhysio"
        className="w-9 h-9 object-contain"
      />
      <span className="text-[20px] font-bold text-[#333333]">
        BookPhysio
      </span>
    </div>
  )
}

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
  const [focused, setFocused] = useState<number | null>(null)
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const inputRefs = useRef<HTMLInputElement[]>([])

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const focusInput = useCallback((index: number) => {
    inputRefs.current[index]?.focus()
  }, [])

  function handleInput(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1)
    const nextOtp = otp.map((d, i) => (i === index ? digit : d))
    setOtp(nextOtp)
    setError('')
    if (digit && index < OTP_LENGTH - 1) {
      focusInput(index + 1)
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        setOtp((prev) => prev.map((d, i) => (i === index ? '' : d)))
      } else if (index > 0) {
        setOtp((prev) => prev.map((d, i) => (i === index - 1 ? '' : d)))
        focusInput(index - 1)
      }
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return
    const nextOtp = Array(OTP_LENGTH)
      .fill('')
      .map((_, i) => pasted[i] ?? '')
    setOtp(nextOtp)
    const nextFocus = Math.min(pasted.length, OTP_LENGTH - 1)
    focusInput(nextFocus)
  }

  async function handleVerify() {
    const code = otp.join('')
    if (code.length < OTP_LENGTH) {
      setError('Please enter all 6 digits')
      return
    }
    setLoading(true)
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

  async function handleResend() {
    setCountdown(COUNTDOWN_SECONDS)
    setOtp(Array(OTP_LENGTH).fill(''))
    setError('')
    focusInput(0)
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
      <div className="flex gap-2.5 justify-center mb-6">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              if (el) inputRefs.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]"
            maxLength={1}
            value={digit}
            onChange={(e) => handleInput(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => setFocused(index)}
            onBlur={() => setFocused(null)}
            aria-label={`OTP digit ${index + 1}`}
            className={`w-12 h-14 text-center text-[22px] font-semibold text-[#333333] bg-white rounded-[8px] outline-none border-2 transition-colors ${
              focused === index || digit ? 'border-[#00766C]' : 'border-[#E5E5E5]'
            }`}
          />
        ))}
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
        onClick={handleVerify}
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
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-[14px] text-[#666666] hover:text-[#333333] bg-transparent border-none cursor-pointer no-underline outline-none transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
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
