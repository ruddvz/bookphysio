'use client'

import { useState } from 'react'
import Link from 'next/link'
import { z } from 'zod'
import { Mail, ArrowLeft, KeyRound, RotateCcw, ArrowRight } from 'lucide-react'
import BpLogo from '@/components/BpLogo'

const forgotSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Please enter your mobile number or email')
    .refine(
      (v) => /^[6-9]\d{9}$/.test(v) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      'Enter a valid mobile number or email address'
    ),
})

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [focused, setFocused] = useState(false)
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(false)

  function handleChange(value: string) {
    setIdentifier(value)
    if (error) setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = forgotSchema.safeParse({ identifier })
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }
    setLoading(true)
    try {
      // Stub — real reset API not yet wired
      await new Promise((r) => setTimeout(r, 600))
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setSubmitted(false)
    setIdentifier('')
    setError('')
  }

  return (
    <div className="bg-white rounded-[12px] p-10 max-w-[440px] w-full shadow-lg animate-in fade-in duration-500">
      <BpLogo />

      {!submitted ? (
        <>
          <h1 className="text-[24px] font-bold text-[#333333] mb-3">Forgot Password?</h1>
          <p className="text-[14px] text-[#666666] mb-7 leading-relaxed">
            Enter your mobile number or email address and we&apos;ll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-6">
              <label htmlFor="identifier" className="block text-[13px] text-[#666666] mb-1.5 font-medium">
                Mobile Number or Email
              </label>
              <div className="relative">
                <input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => handleChange(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="e.g. 98765 43210 or name@email.com"
                  className={`w-full pl-10 pr-4 py-2.5 text-[15px] text-[#333333] bg-white rounded-[8px] outline-none border-[1.5px] transition-colors ${
                    error
                      ? 'border-[#DC2626]'
                      : focused
                      ? 'border-[#00766C]'
                      : 'border-[#E5E5E5]'
                  }`}
                />
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              </div>
              {error && (
                <p className="text-[12px] text-[#DC2626] mt-1">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-3.5 text-[16px] font-semibold text-white rounded-full transition-colors outline-none cursor-pointer ${
                loading ? 'bg-[#a0cdc9] cursor-not-allowed' : 'bg-[#00766C] hover:bg-[#005A52]'
              }`}
            >
              {loading ? 'Sending…' : (
                <>
                  Reset Password
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </>
      ) : (
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#E6F4F3] flex items-center justify-center mb-6">
            <Mail className="w-8 h-8 text-[#00766C]" />
          </div>
          <h2 className="text-[24px] font-bold text-[#333333] mb-3">Check your inbox</h2>
          <p className="text-[14px] text-[#666666] mb-8 leading-relaxed">
            If an account exists for{' '}
            <span className="font-semibold text-[#333333]">{identifier}</span>,
            we have sent instructions to reset your password.
          </p>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 text-[#00766C] font-semibold text-[14px] bg-transparent border-none cursor-pointer hover:text-[#005A52] transition-colors outline-none"
          >
            <RotateCcw className="w-4 h-4" />
            Try another email/number
          </button>
        </div>
      )}

      <div className="mt-8 text-center border-t border-[#F5F5F5] pt-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-[#00766C] font-semibold no-underline text-[14px] hover:text-[#005A52] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
      </div>
    </div>
  )
}
