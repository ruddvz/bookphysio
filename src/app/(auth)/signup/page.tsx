'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { ArrowRight, Smartphone, User } from 'lucide-react'
import BpLogo from '@/components/BpLogo'
import { DemoAccessPanel } from '@/components/auth/DemoAccessPanel'
import { sanitizeReturnPath } from '@/lib/demo/session'

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
})

interface SignupFormState {
  name: string
  phone: string
}

interface SignupErrors {
  name?: string
  phone?: string
  general?: string
}

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState<SignupFormState>({ name: '', phone: '' })
  const [errors, setErrors] = useState<SignupErrors>({})
  const [loading, setLoading] = useState(false)
  const [nameFocused, setNameFocused] = useState(false)
  const [phoneFocused, setPhoneFocused] = useState(false)
  const [loginHref, setLoginHref] = useState('/login')

  useEffect(() => {
    const returnTo = sanitizeReturnPath(new URLSearchParams(window.location.search).get('return'))
    if (returnTo) {
      setLoginHref(`/login?return=${encodeURIComponent(returnTo)}`)
    }
  }, [])

  function handleChange(field: keyof SignupFormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof SignupErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }))
    }
  }

  function handleBlur(field: keyof SignupFormState) {
    const value = form[field]
    if (!value) return
    const singleField = signupSchema.pick({ [field]: true } as Record<typeof field, true>)
    const result = singleField.safeParse({ [field]: value })
    if (!result.success) {
      setErrors((prev) => ({ ...prev, [field]: result.error.issues[0].message }))
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const result = signupSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: SignupErrors = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof SignupErrors
        fieldErrors[field] = issue.message
      }
      setErrors(fieldErrors)
      return
    }
    setLoading(true)
    const rawPhone = form.phone.replace(/\D/g, '')
    const cleanPhone = rawPhone.length === 10 ? `+91${rawPhone}` : (rawPhone.startsWith('91') && rawPhone.length === 12 ? `+${rawPhone}` : `+91${rawPhone}`)
    const returnTo = sanitizeReturnPath(typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('return'))

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string }
        // On static export (GitHub Pages), API routes don't exist — still allow navigation
        if (res.status === 404) {
          const params = new URLSearchParams({ phone: '91' + form.phone, name: form.name, flow: 'signup' })
          if (returnTo) {
            params.set('return', returnTo)
          }
          router.push('/verify-otp?' + params.toString())
          return
        }
        setErrors({ general: data.error ?? 'Failed to send OTP. Try again.' })
        return
      }
      const params = new URLSearchParams({
        phone: '91' + form.phone,
        name: form.name,
        flow: 'signup',
      })
      if (returnTo) {
        params.set('return', returnTo)
      }
      router.push('/verify-otp?' + params.toString())
    } catch {
      // Network error on static export — still navigate to OTP page
      const params = new URLSearchParams({ phone: '91' + form.phone, name: form.name, flow: 'signup' })
      if (returnTo) {
        params.set('return', returnTo)
      }
      router.push('/verify-otp?' + params.toString())
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-[12px] p-10 max-w-[440px] w-full shadow-lg animate-in fade-in duration-500">
      <BpLogo />

      <h1 className="text-[24px] font-bold text-[#333333] mb-1.5">
        Create your account
      </h1>
      <p className="text-[14px] text-[#666666] mb-7">Find and book physios near you</p>

      {errors.general && (
        <div className="mb-4 rounded-[8px] bg-red-50 border border-red-200 px-4 py-3 text-[13px] text-red-600">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Full Name */}
        <div className="mb-5">
          <label htmlFor="name" className="block text-[13px] text-[#666666] mb-1.5 font-medium">
            Full Name
          </label>
          <div className="relative">
            <input
              id="name"
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              onFocus={() => setNameFocused(true)}
              onBlur={() => { setNameFocused(false); handleBlur('name') }}
              className={`w-full pl-10 pr-4 py-2.5 text-[15px] text-[#333333] bg-white rounded-[8px] outline-none border-[1.5px] transition-colors ${
                errors.name ? 'border-[#DC2626]' : nameFocused ? 'border-[#00766C]' : 'border-[#E5E5E5]'
              }`}
              autoComplete="name"
            />
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          </div>
          {errors.name && <p className="text-[12px] text-[#DC2626] mt-1">{errors.name}</p>}
        </div>

        {/* Mobile Number */}
        <div className="mb-6">
          <label htmlFor="phone" className="block text-[13px] text-[#666666] mb-1.5 font-medium">
            Mobile Number
          </label>
          <div
            className={`flex border-[1.5px] rounded-[8px] overflow-hidden transition-colors ${
              errors.phone ? 'border-[#DC2626]' : phoneFocused ? 'border-[#00766C]' : 'border-[#E5E5E5]'
            }`}
          >
            <span className="px-3 py-2.5 text-[15px] text-[#333333] bg-[#F5F5F5] border-r-[1.5px] border-[#E5E5E5] whitespace-nowrap leading-relaxed flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-[#9CA3AF]" />
              +91
            </span>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              pattern="[6-9][0-9]{9}"
              placeholder="98765 43210"
              maxLength={10}
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, ''))}
              onFocus={() => setPhoneFocused(true)}
              onBlur={() => { setPhoneFocused(false); handleBlur('phone') }}
              className="flex-1 px-3.5 py-2.5 text-[15px] text-[#333333] border-none outline-none bg-white"
              autoComplete="tel"
            />
          </div>
          {errors.phone && <p className="text-[12px] text-[#DC2626] mt-1">{errors.phone}</p>}
        </div>

        {/* Send OTP button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 py-3.5 text-[16px] font-semibold text-white rounded-full mb-6 transition-colors outline-none ${
            loading ? 'bg-[#a0cdc9] cursor-not-allowed' : 'bg-[#00766C] hover:bg-[#005A52] cursor-pointer'
          }`}
        >
          {loading ? 'Sending OTP…' : (
            <>
              Send OTP
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mb-6">
        <DemoAccessPanel />
      </div>

      {/* Login link */}
      <p className="text-center text-[14px] text-[#666666]">
        Already have an account?{' '}
        <Link href={loginHref} className="text-[#00766C] font-semibold no-underline hover:text-[#005A52] transition-colors">
          Log in
        </Link>
      </p>
    </div>
  )
}
