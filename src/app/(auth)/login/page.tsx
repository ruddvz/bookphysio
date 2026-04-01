'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { ArrowRight, Smartphone } from 'lucide-react'
import BpLogo from '@/components/BpLogo'
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
          body: JSON.stringify({ phone: cleanPhone }),
        })
        
        if (!res.ok && res.status !== 404) {
          const data = await res.json()
          throw new Error(data.error || 'Failed to send OTP')
        }
        
        const params = new URLSearchParams({ phone: '91' + phone, flow: 'login' })
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
          body: JSON.stringify({ email }),
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
      <div className="bg-white rounded-3xl p-8 sm:p-12 max-w-[440px] w-full shadow-2xl border border-gray-50 animate-in zoom-in-95 duration-500 text-center">
        <div className="w-20 h-20 bg-teal-50 rounded-3xl flex items-center justify-center text-[#00766C] mx-auto mb-8 animate-bounce">
           <Smartphone className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-[#333333] mb-4 tracking-tight">Check your inbox</h2>
        <p className="text-gray-500 font-bold mb-8 leading-relaxed">
          We've sent a magic login link to <span className="text-[#00766C]">{email}</span>. Click the link to sign in instantly.
        </p>
        <button 
          onClick={() => setMagicLinkSent(false)}
          className="text-[14px] font-black text-[#00766C] hover:underline"
        >
          Back to login
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl p-8 sm:p-12 max-w-[440px] w-full shadow-2xl border border-gray-50 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <BpLogo />

      <h1 className="text-[28px] font-black text-[#333333] mb-2 mt-8 tracking-tighter leading-none">
        Welcome back
      </h1>
      <p className="text-[15px] font-bold text-gray-400 mb-8">Access your recovery dashboard</p>

      {/* Segmented Control Mode Switcher */}
      <div className="flex bg-gray-50 p-1.5 rounded-2xl mb-8 border border-gray-100">
        <button
          onClick={() => setLoginMode('phone')}
          className={cn(
            "flex-1 py-3 text-[13px] font-black rounded-xl transition-all",
            loginMode === 'phone' ? "bg-white text-[#00766C] shadow-lg shadow-gray-200/50" : "text-gray-400 hover:text-gray-600"
          )}
        >
          Mobile OTP
        </button>
        <button
          onClick={() => setLoginMode('email')}
          className={cn(
            "flex-1 py-3 text-[13px] font-black rounded-xl transition-all",
            loginMode === 'email' ? "bg-white text-[#00766C] shadow-lg shadow-gray-200/50" : "text-gray-400 hover:text-gray-600"
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
          <div className="mb-8">
            <label className="block text-[12px] font-black text-gray-400 uppercase tracking-widest mb-3">Mobile Number</label>
            <div className={cn(
              "flex border-2 rounded-2xl overflow-hidden transition-all duration-300",
              errors.phone ? 'border-red-200 bg-red-50/30' : inputFocused ? 'border-[#00766C] shadow-lg shadow-teal-50' : 'border-gray-100 bg-gray-50/10'
            )}>
              <span className="px-4 py-4 text-[15px] font-black text-[#333333] bg-gray-50 border-r-2 border-gray-100 flex items-center gap-2">
                +91
              </span>
              <input
                type="tel"
                placeholder="98765 43210"
                maxLength={10}
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                className="flex-1 px-5 py-4 text-[15px] font-black text-[#333333] border-none outline-none bg-transparent"
              />
            </div>
            {errors.phone && <p className="text-[12px] font-bold text-red-500 mt-2 ml-1">{errors.phone}</p>}
          </div>
        ) : (
          <div className="mb-8">
            <label className="block text-[12px] font-black text-gray-400 uppercase tracking-widest mb-3">Email Address</label>
            <div className={cn(
              "flex border-2 rounded-2xl overflow-hidden transition-all duration-300",
              errors.email ? 'border-red-200 bg-red-50/30' : inputFocused ? 'border-[#00766C] shadow-lg shadow-teal-50' : 'border-gray-100 bg-gray-50/10'
            )}>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                className="flex-1 px-5 py-4 text-[15px] font-black text-[#333333] border-none outline-none bg-transparent"
              />
            </div>
            {errors.email && <p className="text-[12px] font-bold text-red-500 mt-2 ml-1">{errors.email}</p>}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={cn(
            "w-full flex items-center justify-center gap-3 py-5 text-[16px] font-black text-white rounded-2xl mb-8 transition-all active:scale-[0.98]",
            loading ? 'bg-gray-200 cursor-not-allowed' : 'bg-[#333333] hover:bg-[#00766C] shadow-xl shadow-teal-900/10'
          )}
        >
          {loading ? 'Sending link...' : (
            <>
              {loginMode === 'phone' ? 'Send OTP' : 'Send Magic Link'}
              <ArrowRight size={18} strokeWidth={3} />
            </>
          )}
        </button>
      </form>


      {/* Divider */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-[#E5E5E5]" />
        <span className="text-[13px] text-[#666666]">or</span>
        <div className="flex-1 h-px bg-[#E5E5E5]" />
      </div>

      {/* Google button */}
      <button
        type="button"
        onClick={() => alert('Google auth coming soon')}
        className="w-full flex items-center justify-center gap-2.5 py-3.5 text-[15px] font-medium text-[#333333] bg-white border-[1.5px] border-[#E5E5E5] rounded-full hover:border-[#D1D5DB] transition-colors cursor-pointer mb-7 outline-none"
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
      <p className="text-center text-[14px] text-[#666666] mb-3">
        New to BookPhysio?{' '}
        <Link href="/signup" className="text-[#00766C] font-semibold no-underline hover:text-[#005A52] transition-colors">
          Create an account
        </Link>
      </p>

      {/* Doctor link */}
      <p className="text-center text-[14px] text-[#666666]">
        Are you a doctor?{' '}
        <Link href="/doctor-signup" className="text-[#00766C] font-semibold no-underline hover:text-[#005A52] transition-colors">
          Join as a doctor →
        </Link>
      </p>
    </div>
  )
}
