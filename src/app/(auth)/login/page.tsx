'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { z } from 'zod'

const loginSchema = z.object({
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
})

interface LoginErrors {
  phone?: string
}

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

export default function LoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState<LoginErrors>({})
  const [loading, setLoading] = useState(false)
  const [phoneFocused, setPhoneFocused] = useState(false)

  function handlePhoneChange(value: string) {
    setPhone(value.replace(/\D/g, ''))
    if (errors.phone) {
      setErrors({})
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const result = loginSchema.safeParse({ phone })
    if (!result.success) {
      const fieldErrors: LoginErrors = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof LoginErrors
        fieldErrors[field] = issue.message
      }
      setErrors(fieldErrors)
      return
    }
    setLoading(true)
    router.push('/verify-otp?phone=91' + phone)
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
        Log in to BookPhysio
      </h1>
      <p style={{ fontSize: '14px', color: '#666666', margin: '0 0 28px' }}>
        Welcome back
      </p>

      <form onSubmit={handleSubmit} noValidate>
        {/* Mobile Number */}
        <div style={{ marginBottom: '24px' }}>
          <label
            htmlFor="phone"
            style={{
              display: 'block',
              fontSize: '13px',
              color: '#666666',
              marginBottom: '6px',
              fontWeight: 500,
            }}
          >
            Mobile Number
          </label>
          <div
            style={{
              display: 'flex',
              border: `1.5px solid ${errors.phone ? '#DC2626' : phoneFocused ? '#00766C' : '#E5E5E5'}`,
              borderRadius: '8px',
              overflow: 'hidden',
              transition: 'border-color 0.15s',
            }}
          >
            <span
              style={{
                padding: '10px 12px',
                fontSize: '15px',
                color: '#333333',
                backgroundColor: '#F5F5F5',
                borderRight: '1.5px solid #E5E5E5',
                whiteSpace: 'nowrap',
                lineHeight: '1.4',
              }}
            >
              +91
            </span>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              pattern="[6-9][0-9]{9}"
              placeholder="98765 43210"
              maxLength={10}
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              onFocus={() => setPhoneFocused(true)}
              onBlur={() => setPhoneFocused(false)}
              style={{
                flex: 1,
                padding: '10px 14px',
                fontSize: '15px',
                color: '#333333',
                border: 'none',
                outline: 'none',
                backgroundColor: '#ffffff',
              }}
              autoComplete="tel"
            />
          </div>
          {errors.phone && (
            <p
              style={{
                fontSize: '12px',
                color: '#DC2626',
                margin: '4px 0 0',
              }}
            >
              {errors.phone}
            </p>
          )}
        </div>

        {/* Send OTP button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '13px',
            fontSize: '16px',
            fontWeight: 600,
            color: '#ffffff',
            backgroundColor: loading ? '#4aada6' : '#00766C',
            border: 'none',
            borderRadius: '24px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.15s',
            marginBottom: '24px',
          }}
        >
          {loading ? 'Sending…' : 'Send OTP →'}
        </button>
      </form>

      {/* Divider */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E5E5' }} />
        <span style={{ fontSize: '13px', color: '#666666' }}>or</span>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E5E5' }} />
      </div>

      {/* Google button */}
      <button
        type="button"
        onClick={() => alert('Google auth coming soon')}
        style={{
          width: '100%',
          padding: '13px',
          fontSize: '15px',
          fontWeight: 500,
          color: '#333333',
          backgroundColor: '#ffffff',
          border: '1.5px solid #E5E5E5',
          borderRadius: '24px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '28px',
          transition: 'border-color 0.15s',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
          />
          <path
            fill="#34A853"
            d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
          />
          <path
            fill="#FBBC05"
            d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
          />
          <path
            fill="#EA4335"
            d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
          />
        </svg>
        Continue with Google
      </button>

      {/* Signup link */}
      <p
        style={{
          textAlign: 'center',
          fontSize: '14px',
          color: '#666666',
          margin: '0 0 12px',
        }}
      >
        New to BookPhysio?{' '}
        <Link
          href="/signup"
          style={{ color: '#00766C', fontWeight: 600, textDecoration: 'none' }}
        >
          Create an account
        </Link>
      </p>

      {/* Doctor link */}
      <p
        style={{
          textAlign: 'center',
          fontSize: '14px',
          color: '#666666',
          margin: 0,
        }}
      >
        Are you a doctor?{' '}
        <Link
          href="/doctor-signup"
          style={{ color: '#00766C', fontWeight: 600, textDecoration: 'none' }}
        >
          Join as a doctor →
        </Link>
      </p>
    </div>
  )
}
