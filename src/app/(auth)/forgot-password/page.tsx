'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { Mail, ArrowLeft, KeyRound, RotateCcw, ArrowRight } from 'lucide-react'
import BpLogo from '@/components/BpLogo'
import { savePendingOtp } from '@/lib/auth/pending-otp'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

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
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [focused, setFocused] = useState(false)
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(false)
  
  const supabase = createClient()

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
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)
      
      if (isEmail) {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(identifier, {
          redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
        })
        
        if (resetError) {
          setError(resetError.message)
          return
        }
      } else {
        // Phone users: bookphysio uses OTP login, but if they explicitly need a password reset, 
        // we'll treat it as a trigger for the OTP flow to verify identity.
        const cleanPhone = identifier.startsWith('+91') ? identifier : `+91${identifier.replace(/\s/g, '')}`
        const res = await fetch('/api/auth/otp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: cleanPhone }),
        })
        
        if (!res.ok) {
          const data = await res.json().catch(() => ({})) as { message?: string; error?: string }
          setError(data.message || data.error || 'Failed to send OTP')
          return
        }

        const otpStateSaved = savePendingOtp({
          phone: cleanPhone.replace(/^\+/, ''),
          flow: 'login',
          returnTo: '/update-password',
        })

        if (!otpStateSaved) {
          setError('Unable to continue. Please retry.')
          return
        }

        router.push('/verify-otp')
        return
      }
      
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
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
    <div className="bg-white rounded-[40px] p-8 pb-10 sm:p-12 sm:pb-12 max-w-[440px] w-full shadow-2xl shadow-bp-primary/5 border border-bp-border animate-in fade-in slide-in-from-bottom-8 duration-700">
      <BpLogo href="/" />

      {!submitted ? (
        <>
          <h1 className="text-[28px] font-black text-bp-primary mb-2 mt-10 tracking-tighter leading-none">
            Forgot Password?
          </h1>
          <p className="text-[15px] font-bold text-bp-body/40 mb-10">
            Enter your mobile number or email and we&apos;ll help you recover access.
          </p>

          <form onSubmit={handleSubmit} noValidate>
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
                    "w-full pl-12 pr-4 py-4 text-[16px] font-bold text-bp-primary bg-bp-surface rounded-2xl outline-none border-2 transition-all",
                    error ? "border-red-200 bg-red-50/30" : focused ? "border-bp-accent bg-white shadow-xl shadow-bp-primary/5" : "border-transparent hover:border-bp-border"
                  )}
                />
                <KeyRound className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors", focused ? "text-bp-accent" : "text-bp-body/20")} />
              </div>
              {error && (
                <p className="text-[11px] font-bold text-red-500 mt-1.5 ml-1">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full flex items-center justify-center gap-3 py-5 text-[16px] font-black text-white rounded-[24px] transition-all shadow-xl shadow-bp-primary/10 active:scale-[0.98]",
                loading ? "bg-bp-primary/40 cursor-not-allowed" : "bg-bp-primary hover:bg-bp-accent hover:shadow-bp-accent/20"
              )}
            >
              {loading ? 'Sending…' : (
                <>
                  Reset Password
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </>
      ) : (
        <div className="text-center">
          <div className="w-20 h-20 mx-auto rounded-[24px] bg-bp-accent/10 flex items-center justify-center mb-8 animate-bounce">
            <Mail className="w-10 h-10 text-bp-accent" />
          </div>
          <h2 className="text-[28px] font-black text-bp-primary mb-2 mt-4 tracking-tighter leading-none">
            {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier) ? 'Check your inbox' : 'OTP Sent'}
          </h2>
          <p className="text-[15px] font-bold text-bp-body/40 mb-10 leading-relaxed">
            {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier) ? (
              <>
                If an account exists for{' '}
                <span className="text-bp-primary font-black">{identifier}</span>, we have sent instructions to reset your password.
              </>
            ) : (
              <>
                We have sent a verification code to{' '}
                <span className="text-bp-primary font-black">{identifier}</span> to help you access your account.
              </>
            )}
          </p>
          <button
            onClick={handleReset}
            className="text-[14px] font-black text-bp-accent hover:text-bp-primary transition-all flex items-center gap-2 mx-auto focus:outline-none"
          >
            <RotateCcw className="w-4 h-4" />
            Try another email/number
          </button>
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
    </div>
  )
}
