'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const OTP_LENGTH = 6
const COUNTDOWN_SECONDS = 45

function BpLogo() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '28px',
      }}
    >
      <img
        src="/images/logo-icon.png"
        alt="BookPhysio"
        style={{ width: '36px', height: '36px', objectFit: 'contain' }}
      />
      <span style={{ fontSize: '20px', fontWeight: 700, color: '#333333' }}>
        BookPhysio
      </span>
    </div>
  )
}

function VerifyOtpContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const phoneParam = searchParams.get('phone') ?? ''
  const displayPhone = phoneParam
    ? `+${phoneParam.slice(0, 2)} ${phoneParam.slice(2, 7)} ${phoneParam.slice(7)}`
    : ''

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [focused, setFocused] = useState<number | null>(null)
  const [error, setError] = useState<string>('')
  const inputRefs = useRef<HTMLInputElement[]>([])

  // Countdown timer
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

  function handleVerify() {
    const code = otp.join('')
    if (code.length < OTP_LENGTH) {
      setError('Please enter all 6 digits')
      return
    }
    router.push('/')
  }

  function handleResend() {
    setCountdown(COUNTDOWN_SECONDS)
    setOtp(Array(OTP_LENGTH).fill(''))
    setError('')
    focusInput(0)
  }

  const allFilled = otp.every((d) => d !== '')

  const formatCountdown = (s: number) => {
    const mm = String(Math.floor(s / 60)).padStart(2, '0')
    const ss = String(s % 60).padStart(2, '0')
    return `${mm}:${ss}`
  }

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        padding: '40px',
        maxWidth: '440px',
        width: '100%',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      }}
    >
      <BpLogo />

      <h1
        style={{
          fontSize: '24px',
          fontWeight: 700,
          color: '#333333',
          margin: '0 0 6px',
        }}
      >
        Verify your number
      </h1>
      <p style={{ fontSize: '14px', color: '#666666', margin: '0 0 32px' }}>
        Code sent to{' '}
        <span style={{ fontWeight: 600, color: '#333333' }}>{displayPhone}</span>
      </p>

      {/* OTP digit inputs */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'center',
          marginBottom: '24px',
        }}
      >
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
            style={{
              width: '48px',
              height: '56px',
              textAlign: 'center',
              fontSize: '22px',
              fontWeight: 600,
              color: '#333333',
              backgroundColor: '#ffffff',
              border: `2px solid ${focused === index || digit ? '#00766C' : '#E5E5E5'}`,
              borderRadius: '8px',
              outline: 'none',
              transition: 'border-color 0.15s',
            }}
          />
        ))}
      </div>

      {/* Error */}
      {error && (
        <p
          style={{
            fontSize: '12px',
            color: '#DC2626',
            textAlign: 'center',
            margin: '-12px 0 16px',
          }}
        >
          {error}
        </p>
      )}

      {/* Resend + countdown */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '28px',
        }}
      >
        {countdown > 0 ? (
          <span style={{ fontSize: '14px', color: '#666666' }}>
            Resend OTP
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            style={{
              fontSize: '14px',
              color: '#00766C',
              fontWeight: 600,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Resend OTP
          </button>
        )}
        <span
          style={{
            fontSize: '14px',
            color: countdown > 0 ? '#666666' : 'transparent',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {formatCountdown(countdown)}
        </span>
      </div>

      {/* Verify button */}
      <button
        type="button"
        onClick={handleVerify}
        disabled={!allFilled}
        style={{
          width: '100%',
          padding: '13px',
          fontSize: '16px',
          fontWeight: 600,
          color: '#ffffff',
          backgroundColor: allFilled ? '#00766C' : '#a0cdc9',
          border: 'none',
          borderRadius: '24px',
          cursor: allFilled ? 'pointer' : 'not-allowed',
          transition: 'background-color 0.15s',
          marginBottom: '20px',
        }}
      >
        Verify →
      </button>

      {/* Back link */}
      <div style={{ textAlign: 'center' }}>
        <Link
          href="#"
          onClick={(e) => { e.preventDefault(); router.back() }}
          style={{
            fontSize: '14px',
            color: '#666666',
            textDecoration: 'none',
          }}
        >
          ← Back
        </Link>
      </div>
    </div>
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '40px',
            maxWidth: '440px',
            width: '100%',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          }}
        />
      }
    >
      <VerifyOtpContent />
    </Suspense>
  )
}
