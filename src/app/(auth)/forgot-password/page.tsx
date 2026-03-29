'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, KeyRound, RotateCcw } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [focused, setFocused] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier) return
    setSubmitted(true)
  }

  return (
    <div className="bg-white rounded-[12px] p-10 max-w-[440px] w-full shadow-lg animate-in fade-in duration-500">
      {!submitted ? (
        <>
          <h1 className="text-[24px] font-bold text-[#333333] mb-3">Forgot Password?</h1>
          <p className="text-[14px] text-[#666666] mb-7 leading-relaxed">
            Enter your mobile number or email address and we&apos;ll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="identifier" className="block text-[13px] text-[#666666] mb-2 font-medium">
                Mobile Number or Email
              </label>
              <div className="relative">
                <input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="e.g. 98765 43210 or name@email.com"
                  className={`w-full pl-10 pr-4 py-3 text-[15px] rounded-[8px] outline-none border-[1.5px] transition-colors ${
                    focused ? 'border-[#00766C]' : 'border-[#E5E5E5]'
                  }`}
                />
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3.5 text-[16px] font-semibold text-white bg-[#00766C] hover:bg-[#005A52] rounded-full cursor-pointer transition-colors outline-none"
            >
              Reset Password
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
            If an account exists for {identifier}, we have sent instructions to reset your password.
          </p>
          <button 
             onClick={() => setSubmitted(false)}
             className="inline-flex items-center gap-2 text-[#00766C] font-semibold text-[14px] bg-transparent border-none cursor-pointer hover:text-[#005A52] transition-colors outline-none"
          >
            <RotateCcw className="w-4 h-4" />
            Try another email/number
          </button>
        </div>
      )}

      <div className="mt-8 text-center border-t border-[#F5F5F5] pt-6">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-[#00766C] font-semibold no-underline text-[14px] hover:text-[#005A52] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
      </div>
    </div>
  )
}
