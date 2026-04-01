'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { User, Smartphone, Mail, Check, Loader2, AlertCircle } from 'lucide-react'

interface ProfileData {
  id: string
  full_name: string
  phone: string | null
  email: string | null
  role: string
  avatar_url: string | null
}

export default function PatientProfile() {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [initialised, setInitialised] = useState(false)

  const { data: profile, isLoading, isError } = useQuery<ProfileData>({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await fetch('/api/profile')
      if (!res.ok) throw new Error('Failed to load')
      return res.json()
    },
    select: (data) => {
      if (!initialised) {
        setName(data.full_name)
        setInitialised(true)
      }
      return data
    },
  })

  const saveMut = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: name }),
      })
      if (!res.ok) throw new Error('Save failed')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })

  if (isLoading) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-12 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#00766C]" />
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-12 flex flex-col items-center gap-4">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-[15px] text-[#666666]">Could not load your profile. Please try again.</p>
      </div>
    )
  }

  const initials = profile.full_name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="max-w-[800px] mx-auto px-6 py-12 animate-in fade-in duration-500 delay-100 fill-mode-both">
      <h1 className="text-[32px] font-bold text-[#333333] tracking-tight mb-8">Profile &amp; Settings</h1>

      <div className="bg-white rounded-[12px] border border-[#E5E5E5] shadow-sm p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#E6F4F3] text-[#00766C] text-xl font-bold shrink-0 overflow-hidden">
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
              : initials
            }
          </div>
          <div>
            <h2 className="text-[20px] font-semibold text-[#333333]">{profile.full_name}</h2>
            <p className="text-[15px] text-[#666666] capitalize">{profile.role} Account</p>
          </div>
        </div>

        <form
          className="flex flex-col gap-6"
          onSubmit={e => { e.preventDefault(); saveMut.mutate() }}
        >
          {/* Full Name */}
          <div className="relative">
            <label className="block text-[14px] font-semibold text-[#333333] mb-2">Full Name</label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-[#E5E5E5] rounded-[8px] bg-white text-[15px] text-[#333333] focus:border-[#00766C] focus:ring-1 focus:ring-[#00766C] outline-none transition-shadow"
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phone — read only */}
            <div className="relative">
              <label className="block text-[14px] font-semibold text-[#333333] mb-2">Mobile Number</label>
              <div className="relative">
                <input
                  type="text"
                  value={profile.phone ?? '—'}
                  disabled
                  className="w-full pl-10 pr-4 py-3 border border-[#E5E5E5] rounded-[8px] bg-[#F9FAFB] text-[15px] text-[#6B7280] cursor-not-allowed outline-none"
                />
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
              </div>
              <p className="mt-1.5 text-[12px] text-[#9CA3AF]">Verified via OTP</p>
            </div>

            {/* Email — read only */}
            <div className="relative">
              <label className="block text-[14px] font-semibold text-[#333333] mb-2">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={profile.email ?? '—'}
                  disabled
                  className="w-full pl-10 pr-4 py-3 border border-[#E5E5E5] rounded-[8px] bg-[#F9FAFB] text-[15px] text-[#6B7280] cursor-not-allowed outline-none"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
              </div>
            </div>
          </div>

          <hr className="border-t border-[#E5E5E5] my-2" />

          <div className="flex items-center justify-between">
            {saveMut.isSuccess && (
              <p className="text-[13px] text-emerald-600 font-medium flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Changes saved
              </p>
            )}
            {saveMut.isError && (
              <p className="text-[13px] text-red-500">Failed to save. Please try again.</p>
            )}
            {!saveMut.isSuccess && !saveMut.isError && <span />}
            <button
              type="submit"
              disabled={saveMut.isPending || name.trim() === profile.full_name}
              className="flex items-center gap-2 px-8 py-3 bg-[#00766C] hover:bg-[#005A52] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-[24px] text-[16px] font-semibold transition-colors duration-200 outline-none"
            >
              {saveMut.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
