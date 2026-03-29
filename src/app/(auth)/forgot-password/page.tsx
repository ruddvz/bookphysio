'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier) return
    setSubmitted(true)
  }

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '40px', maxWidth: '440px', width: '100%', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
      {!submitted ? (
        <>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#333333', margin: '0 0 12px' }}>Forgot Password?</h1>
          <p style={{ fontSize: '14px', color: '#666666', margin: '0 0 28px', lineHeight: 1.6 }}>
            Enter your mobile number or email address and we&apos;ll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="identifier" style={{ display: 'block', fontSize: '13px', color: '#666666', marginBottom: '8px', fontWeight: 500 }}>
                Mobile Number or Email
              </label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. 98765 43210 or name@email.com"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  fontSize: '15px',
                  border: '1.5px solid #E5E5E5',
                  borderRadius: '8px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '13px',
                fontSize: '16px',
                fontWeight: 600,
                color: '#ffffff',
                backgroundColor: '#00766C',
                border: 'none',
                borderRadius: '24px',
                cursor: 'pointer'
              }}
            >
              Reset Password
            </button>
          </form>
        </>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '24px' }}>✉️</div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#333333', marginBottom: '12px' }}>Check your inbox</h2>
          <p style={{ fontSize: '14px', color: '#666666', marginBottom: '32px', lineHeight: 1.6 }}>
            If an account exists for {identifier}, we have sent instructions to reset your password.
          </p>
          <button 
             onClick={() => setSubmitted(false)}
             style={{ backgroundColor: 'transparent', border: 'none', color: '#00766C', fontWeight: 600, cursor: 'pointer' }}
          >
            Try another email/number
          </button>
        </div>
      )}

      <div style={{ marginTop: '32px', textAlign: 'center', borderTop: '1px solid #F5F5F5', paddingTop: '24px' }}>
        <Link href="/login" style={{ color: '#00766C', fontWeight: 600, textDecoration: 'none', fontSize: '14px' }}>
          ← Back to Login
        </Link>
      </div>
    </div>
  )
}
