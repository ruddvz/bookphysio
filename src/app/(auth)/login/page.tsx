'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { ArrowRight, Smartphone } from 'lucide-react'

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
    <div className="bg-white rounded-[12px] p-10 max-w-[440px] w-full shadow-lg animate-in fade-in duration-500">
      <BpLogo />

      <h1 className="text-[24px] font-bold text-[#333333] mb-1.5">
        Log in to BookPhysio
      </h1>
      <p className="text-[14px] text-[#666666] mb-7">Welcome back</p>

      <form onSubmit={handleSubmit} noValidate>
        {/* Mobile Number */}
        <div className="mb-6">
          <label
            htmlFor="phone"
            className="block text-[13px] text-[#666666] mb-1.5 font-medium"
          >
            Mobile Number
          </label>
          <div
            className={`flex border-[1.5px] rounded-[8px] overflow-hidden transition-colors ${
              errors.phone
                ? 'border-[#DC2626]'
                : phoneFocused
                ? 'border-[#00766C]'
                : 'border-[#E5E5E5]'
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
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              onFocus={() => setPhoneFocused(true)}
              onBlur={() => setPhoneFocused(false)}
              className="flex-1 px-3.5 py-2.5 text-[15px] text-[#333333] border-none outline-none bg-white"
              autoComplete="tel"
            />
          </div>
          {errors.phone && (
            <p className="text-[12px] text-[#DC2626] mt-1">
              {errors.phone}
            </p>
          )}
        </div>

        {/* Send OTP button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 py-3.5 text-[16px] font-semibold text-white rounded-full mb-6 transition-colors outline-none ${
            loading
              ? 'bg-[#4aada6] cursor-not-allowed'
              : 'bg-[#00766C] hover:bg-[#005A52] cursor-pointer'
          }`}
        >
          {loading ? 'Sending…' : (
            <>
              Send OTP
              <ArrowRight className="w-4 h-4" />
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
