'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { ArrowRight, Smartphone } from 'lucide-react'
import BpLogo from '@/components/BpLogo'
import { DemoAccessPanel } from '@/components/auth/DemoAccessPanel'
import { savePendingOtp } from '@/lib/auth/pending-otp'
import { sanitizeReturnPath } from '@/lib/demo/session'
import { cn } from '@/lib/utils'


const loginSchema = z.object({
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
})

interface LoginErrors {
  phone?: string
  general?: string
}

export default function LoginPage() {
  const router = useRouter()
  const [loginMode, setLoginMode] = useState<'phone' | 'email'>('phone')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<LoginErrors & { email?: string }>({})
  const [loading, setLoading] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [signupHref, setSignupHref] = useState('/signup')
  const [returnTo, setReturnTo] = useState<string | null>(null)

  useEffect(() => {
    const returnPath = sanitizeReturnPath(new URLSearchParams(window.location.search).get('return'))
    if (returnPath) {
      setSignupHref(`/signup?return=${encodeURIComponent(returnPath)}`)
      setReturnTo(returnPath)
    }
  }, [])

  function handlePhoneChange(value: string) {
    setPhone(value.replace(/\D/g, ''))
    if (errors.phone || errors.general) setErrors({})
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      if (loginMode === 'phone') {
        const result = loginSchema.safeParse({ phone })
        if (!result.success) {
          setErrors({ phone: result.error.issues[0].message })
          setLoading(false)
          return
        }
        
        const rawPhone = phone.replace(/\D/g, '')
        const cleanPhone = rawPhone.length === 10 ? `+91${rawPhone}` : (rawPhone.startsWith('91') && rawPhone.length === 12 ? `+${rawPhone}` : `+91${rawPhone}`)
        
        const res = await fetch('/api/auth/otp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: cleanPhone, flow: 'login' }),
        })
        
        if (!res.ok) {
          const data = await res.json().catch(() => ({})) as { error?: string }
          throw new Error(data.error || 'Failed to send OTP')
        }

        const otpStateSaved = savePendingOtp({
          phone: '91' + phone,
          flow: 'login',
          returnTo,
        })

        if (!otpStateSaved) {
          throw new Error('Unable to continue. Please retry.')
        }

        router.push('/verify-otp')
      } else {
        // Magic Link Logic
        if (!email || !email.includes('@')) {
          setErrors({ email: 'Please enter a valid email address' })
          setLoading(false)
          return
        }

        const res = await fetch('/api/auth/magic-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(returnTo ? { email, returnTo } : { email }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Failed to send magic link')
        }

        setMagicLinkSent(true)
      }
    } catch (err: unknown) {
      setErrors({ general: err instanceof Error ? err.message : 'Unable to continue right now.' })
    } finally {
      setLoading(false)
    }
  }

  if (magicLinkSent) {
    return (
      <div className="bg-white rounded-[40px] p-8 sm:p-12 max-w-[440px] w-full shadow-2xl shadow-bp-primary/5 border border-bp-border animate-in zoom-in-95 duration-500 text-center">
        <div className="w-20 h-20 bg-bp-accent/10 rounded-[24px] flex items-center justify-center text-bp-accent mx-auto mb-8 animate-bounce">
           <Smartphone className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-bp-primary mb-4 tracking-tight">Check your inbox</h2>
        <p className="text-bp-body/60 font-bold mb-8 leading-relaxed">
          If an account exists for <span className="text-bp-accent">{email}</span>, a magic login link is on its way.
        </p>
        <button 
          onClick={() => setMagicLinkSent(false)}
          className="text-[14px] font-black text-bp-accent hover:underline"
        >
          Back to login
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-[40px] p-8 pb-10 sm:p-12 sm:pb-12 max-w-[440px] w-full shadow-2xl shadow-bp-primary/5 border border-bp-border animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex justify-center">
        <BpLogo href="/" size="auth" linkClassName="mx-auto" />
      </div>

      <h1 className="text-[32px] font-black text-bp-primary mb-2 mt-10 tracking-tighter leading-none">
        Welcome back
      </h1>
      <p className="text-[16px] font-bold text-bp-body/40 mb-10">Access your recovery dashboard</p>

      {/* Segmented Control Mode Switcher */}
      <div className="flex bg-bp-surface p-1.5 rounded-3xl mb-10 border border-bp-border shadow-inner">
        <button
          onClick={() => setLoginMode('phone')}
          className={cn(
            "flex-1 py-4 text-[13px] font-black rounded-[20px] transition-all duration-300",
            loginMode === 'phone' ? "bg-white text-bp-accent shadow-xl shadow-bp-primary/5 ring-1 ring-black/5" : "text-bp-body/40 hover:text-bp-body"
          )}
        >
          Mobile OTP
        </button>
        <button
          onClick={() => setLoginMode('email')}
          className={cn(
            "flex-1 py-4 text-[13px] font-black rounded-[20px] transition-all duration-300",
            loginMode === 'email' ? "bg-white text-bp-accent shadow-xl shadow-bp-primary/5 ring-1 ring-black/5" : "text-bp-body/40 hover:text-bp-body"
          )}
        >
          Magic Link
        </button>
      </div>

      {errors.general && (
        <div className="mb-8 rounded-3xl bg-red-50 border border-red-100 p-5 text-[13px] font-bold text-red-600 flex items-center gap-3 animate-in fade-in zoom-in-95">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        {loginMode === 'phone' ? (
          <div>
            <label htmlFor="phone" className="block text-[11px] font-black text-bp-body/40 uppercase tracking-[0.2em] mb-3 ml-1">Mobile Number</label>
            <div className={cn(
              "flex border-2 rounded-[24px] overflow-hidden transition-all duration-500 group bg-bp-surface/50",
              errors.phone ? 'border-red-100 bg-red-50/30' : inputFocused ? 'border-bp-accent bg-white shadow-2xl shadow-bp-primary/5' : 'border-bp-border hover:border-bp-border'
            )}>
              <span className="px-6 py-5 text-[17px] font-black text-bp-primary bg-bp-surface border-r-2 border-bp-border flex items-center gap-2 group-focus-within:text-bp-accent transition-colors">
                +91
              </span>
              <input
                id="phone"
                type="tel"
                placeholder="98765 43210"
                maxLength={10}
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                className="flex-1 px-6 py-5 text-[18px] font-black text-bp-primary border-none outline-none bg-transparent placeholder:text-bp-body/30 tracking-tight"
              />
            </div>
            {errors.phone && <p className="text-[12px] font-bold text-red-500 mt-3 ml-2 animate-in slide-in-from-top-2">{errors.phone}</p>}
          </div>
        ) : (
          <div>
            <label htmlFor="email" className="block text-[11px] font-black text-bp-body/40 uppercase tracking-[0.2em] mb-3 ml-1">Email Address</label>
            <div className={cn(
              "flex border-2 rounded-[24px] overflow-hidden transition-all duration-500 group bg-bp-surface/50",
              errors.email ? 'border-red-100 bg-red-50/30' : inputFocused ? 'border-bp-accent bg-white shadow-2xl shadow-bp-primary/5' : 'border-bp-border hover:border-bp-border'
            )}>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                className="flex-1 px-6 py-5 text-[18px] font-black text-bp-primary border-none outline-none bg-transparent placeholder:text-bp-body/30"
              />
            </div>
            {errors.email && <p className="text-[12px] font-bold text-red-500 mt-3 ml-2 animate-in slide-in-from-top-2">{errors.email}</p>}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={cn(
            "w-full flex items-center justify-center gap-3 py-5 text-[16px] font-black text-white rounded-[24px] transition-all active:scale-[0.98] relative overflow-hidden group shadow-xl",
            loading ? 'bg-gray-200 cursor-not-allowed' : 'bg-[#111111] hover:bg-bp-accent shadow-bp-primary/10'
          )}
        >
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Authenticating...</span>
            </div>
          ) : (
            <>
              <span className="relative z-10">{loginMode === 'phone' ? 'Secure Login' : 'Send Magic Link'}</span>
              <ArrowRight size={18} strokeWidth={3} className="text-bp-accent/70 group-hover:translate-x-1 transition-transform relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-bp-accent to-bp-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </>
          )}
        </button>
      </form>
      {/* Divider */}
      <div className="mb-8">
        <DemoAccessPanel />
      </div>

      {/* Signup link */}
      <p className="text-center text-[14px] text-bp-body/60 mb-4">
        New to BookPhysio?{' '}
        <Link href={signupHref} className="text-bp-accent font-bold no-underline hover:text-bp-accent/80 transition-colors">
          Create an account
        </Link>
      </p>

      {/* Doctor link */}
      <p className="flex items-center justify-center gap-1 text-center text-[14px] text-bp-body/60">
        Are you a doctor?{' '}
        <Link href="/doctor-signup" className="inline-flex items-center gap-1 text-bp-accent font-bold no-underline hover:text-bp-accent/80 transition-colors">
          Join as a doctor
          <ArrowRight className="h-4 w-4" />
        </Link>
      </p>
    </div>
  )
}
