'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { ArrowRight, Smartphone } from 'lucide-react'
import BpLogo from '@/components/BpLogo'
import { DemoAccessPanel } from '@/components/auth/DemoAccessPanel'
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

  useEffect(() => {
    const returnTo = sanitizeReturnPath(new URLSearchParams(window.location.search).get('return'))
    if (returnTo) {
      setSignupHref(`/signup?return=${encodeURIComponent(returnTo)}`)
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
      const returnTo = sanitizeReturnPath(typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('return'))

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
          body: JSON.stringify({ phone: cleanPhone }),
        })
        
        if (!res.ok && res.status !== 404) {
          const data = await res.json()
          throw new Error(data.error || 'Failed to send OTP')
        }
        
        const params = new URLSearchParams({ phone: '91' + phone, flow: 'login' })
        if (returnTo) {
          params.set('return', returnTo)
        }
        router.push('/verify-otp?' + params.toString())
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
    } catch (err: any) {
      setErrors({ general: err.message })
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
          We've sent a magic login link to <span className="text-bp-accent">{email}</span>. Click the link to sign in instantly.
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
    <div className="bg-white rounded-[40px] p-8 sm:p-12 max-w-[440px] w-full shadow-2xl shadow-bp-primary/5 border border-bp-border animate-in fade-in slide-in-from-bottom-8 duration-700">
      <BpLogo />

      <h1 className="text-[28px] font-black text-bp-primary mb-2 mt-10 tracking-tighter leading-none">
        Welcome back
      </h1>
      <p className="text-[15px] font-bold text-bp-body/40 mb-10">Access your recovery dashboard</p>

      {/* Segmented Control Mode Switcher */}
      <div className="flex bg-bp-surface p-1.5 rounded-2xl mb-10 border border-bp-border">
        <button
          onClick={() => setLoginMode('phone')}
          className={cn(
            "flex-1 py-3.5 text-[13px] font-black rounded-xl transition-all",
            loginMode === 'phone' ? "bg-white text-bp-accent shadow-lg shadow-bp-primary/5" : "text-bp-body/40 hover:text-bp-primary"
          )}
        >
          Mobile OTP
        </button>
        <button
          onClick={() => setLoginMode('email')}
          className={cn(
            "flex-1 py-3.5 text-[13px] font-black rounded-xl transition-all",
            loginMode === 'email' ? "bg-white text-bp-accent shadow-lg shadow-bp-primary/5" : "text-bp-body/40 hover:text-bp-primary"
          )}
        >
          Magic Link
        </button>
      </div>

      {errors.general && (
        <div className="mb-6 rounded-2xl bg-red-50 border border-red-100 px-5 py-4 text-[13px] font-bold text-red-600">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {loginMode === 'phone' ? (
          <div className="mb-10">
            <label htmlFor="phone" className="block text-[10px] font-black text-bp-primary/40 uppercase tracking-[0.2em] mb-3 ml-1">Mobile Number</label>
            <div className={cn(
              "flex border-2 rounded-2xl overflow-hidden transition-all duration-300",
              errors.phone ? 'border-red-200 bg-red-50/30' : inputFocused ? 'border-bp-accent shadow-xl shadow-bp-accent/5' : 'border-bp-border bg-bp-surface/30'
            )}>
              <span className="px-5 py-4 text-[15px] font-black text-bp-primary bg-bp-surface/50 border-r-2 border-bp-border flex items-center gap-2">
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
                className="flex-1 px-5 py-4 text-[15px] font-black text-bp-primary border-none outline-none bg-transparent placeholder:text-bp-body/20"
              />
            </div>
            {errors.phone && <p className="text-[12px] font-bold text-red-500 mt-2 ml-1">{errors.phone}</p>}
          </div>
        ) : (
          <div className="mb-10">
            <label className="block text-[10px] font-black text-bp-primary/40 uppercase tracking-[0.2em] mb-3 ml-1">Email Address</label>
            <div className={cn(
              "flex border-2 rounded-2xl overflow-hidden transition-all duration-300",
              errors.email ? 'border-red-200 bg-red-50/30' : inputFocused ? 'border-bp-accent shadow-xl shadow-bp-accent/5' : 'border-bp-border bg-bp-surface/30'
            )}>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                className="flex-1 px-5 py-4 text-[15px] font-black text-bp-primary border-none outline-none bg-transparent placeholder:text-bp-body/20"
              />
            </div>
            {errors.email && <p className="text-[12px] font-bold text-red-500 mt-2 ml-1">{errors.email}</p>}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={cn(
            "w-full flex items-center justify-center gap-3 py-5 text-[16px] font-black text-white rounded-2xl mb-10 transition-all active:scale-[0.98]",
            loading ? 'bg-bp-border cursor-not-allowed' : 'bg-bp-primary hover:bg-bp-primary/95 shadow-xl shadow-bp-primary/10'
          )}
        >
          {loading ? 'Sending link...' : (
            <>
              {loginMode === 'phone' ? 'Send OTP' : 'Send Magic Link'}
              <ArrowRight size={18} strokeWidth={3} className="text-bp-accent" />
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
      <p className="text-center text-[14px] text-bp-body/60">
        Are you a doctor?{' '}
        <Link href="/doctor-signup" className="text-bp-accent font-bold no-underline hover:text-bp-accent/80 transition-colors">
          Join as a doctor →
        </Link>
      </p>
    </div>
  )
}
