'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  User,
  Smartphone,
  Mail,
  Check,
  Loader2,
  AlertCircle,
  Shield,
  Camera,
  X,
  Lock,
} from 'lucide-react'
import {
  PageHeader,
  SectionCard,
  EmptyState,
} from '@/components/dashboard/primitives'

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
  const [showSupport, setShowSupport] = useState(false)
  const [supportSubject, setSupportSubject] = useState('')
  const [supportMessage, setSupportMessage] = useState('')
  const [supportSubmitted, setSupportSubmitted] = useState(false)

  const { data: profile, isLoading, isError, refetch } = useQuery<ProfileData>({
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
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-pt-primary)]" />
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EmptyState
          role="patient"
          icon={AlertCircle}
          title="Couldn't load profile"
          description="There was an error fetching your account details."
          cta={{ label: 'Retry', onClick: refetch }}
        />
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
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">
      <PageHeader
        role="patient"
        kicker="SETTINGS"
        title="Account profile"
        subtitle="Manage your personal information and security preferences"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <SectionCard role="patient" title="Personal details">
            <div className="flex items-center gap-6 mb-8">
              <div className="relative group">
                <div className="flex items-center justify-center w-24 h-24 rounded-2xl bg-[var(--color-pt-tile-1-bg)] text-[var(--color-pt-primary)] text-2xl font-bold overflow-hidden ring-4 ring-white shadow-sm">
                  {profile.avatar_url
                    ? <Image src={profile.avatar_url} width={96} height={96} alt={profile.full_name} className="w-full h-full object-cover" />
                    : initials
                  }
                </div>
                <button type="button" className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border border-slate-200 text-slate-400 rounded-lg flex items-center justify-center shadow-sm hover:text-[var(--color-pt-primary)] transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h3 className="text-[18px] font-bold text-slate-900 mb-1">{profile.full_name}</h3>
                <p className="text-[13px] text-slate-500">Patient Account · Member since 2024</p>
              </div>
            </div>

            <form
              onSubmit={e => { e.preventDefault(); saveMut.mutate() }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Full Name
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] text-slate-900 focus:bg-white focus:ring-2 focus:ring-[var(--color-pt-primary)] transition-all outline-none"
                  />
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[var(--color-pt-primary)]" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={profile.phone ?? '—'}
                      disabled
                      className="w-full pl-11 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-[14px] text-slate-400 cursor-not-allowed outline-none"
                    />
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 uppercase">
                      Verified
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={profile.email ?? '—'}
                      disabled
                      className="w-full pl-11 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-[14px] text-slate-400 cursor-not-allowed outline-none"
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <div className="h-4">
                  {saveMut.isSuccess && (
                     <p className="text-[12px] text-emerald-600 font-bold flex items-center gap-1.5 animate-in fade-in">
                       <Check size={14} /> Changes saved
                     </p>
                  )}
                  {saveMut.isError && (
                     <p className="text-[12px] text-rose-600 font-bold flex items-center gap-1.5 animate-in fade-in">
                       <AlertCircle size={14} /> Failed to save
                     </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={saveMut.isPending || name.trim() === profile.full_name}
                  className="px-8 py-2.5 bg-[var(--color-pt-primary)] text-white text-[13px] font-bold rounded-full hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {saveMut.isPending && <Loader2 size={16} className="animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </SectionCard>

          <SectionCard role="patient" title="Security">
            <div className="flex items-center justify-between py-2">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <Lock size={18} />
                </div>
                <div>
                  <h4 className="text-[14px] font-semibold text-slate-900 mb-0.5">Account Password</h4>
                  <p className="text-[12px] text-slate-500">Last changed 3 months ago</p>
                </div>
              </div>
              <button disabled className="px-6 py-2 bg-slate-50 text-slate-400 border border-slate-200 rounded-full text-[12px] font-bold">
                 Change
              </button>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard role="patient" title="Trust & Privacy">
            <div className="space-y-6">
              <div className="flex gap-3">
                <Shield className="h-5 w-5 text-emerald-600 shrink-0" />
                <div className="text-[13px] text-slate-600 leading-relaxed">
                  Your data is protected by industry-standard encryption and will never be shared without your consent.
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                 <h4 className="text-[12px] font-bold text-slate-900 mb-2">Need help?</h4>
                 <p className="text-[12px] text-slate-500 leading-relaxed mb-4">
                   Facing issues with your account or bookings? Our team is here to assist.
                 </p>
                 <button
                   onClick={() => {
                     setShowSupport(true)
                     setSupportSubmitted(false)
                   }}
                   className="w-full py-2 bg-white text-[var(--color-pt-primary)] border border-[var(--color-pt-primary)] rounded-full text-[12px] font-bold hover:bg-[var(--color-pt-tile-1-bg)] transition-colors"
                 >
                    Contact Support
                 </button>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Support Dialog */}
      {showSupport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
               <h3 className="text-[16px] font-bold text-slate-900">Support Request</h3>
               <button onClick={() => setShowSupport(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>

            <div className="p-6">
              {supportSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h4 className="text-[16px] font-bold text-slate-900 mb-1">Message received</h4>
                  <p className="text-[13px] text-slate-500">We will get back to you within 24 hours.</p>
                  <button onClick={() => setShowSupport(false)} className="mt-8 px-8 py-2.5 bg-[var(--color-pt-primary)] text-white rounded-full text-[13px] font-bold">
                     Close
                  </button>
                </div>
              ) : (
                <form onSubmit={e => { e.preventDefault(); setSupportSubmitted(true) }} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Subject</label>
                    <input
                      type="text"
                      required
                      value={supportSubject}
                      onChange={e => setSupportSubject(e.target.value)}
                      placeholder="e.g., Booking issue, App error"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:bg-white focus:ring-2 focus:ring-[var(--color-pt-primary)] outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Message</label>
                    <textarea
                      required
                      rows={4}
                      value={supportMessage}
                      onChange={e => setSupportMessage(e.target.value)}
                      placeholder="How can we help?"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:bg-white focus:ring-2 focus:ring-[var(--color-pt-primary)] outline-none resize-none"
                    />
                  </div>
                  <div className="pt-4 flex justify-end gap-3">
                    <button type="button" onClick={() => setShowSupport(false)} className="px-6 py-2 text-[13px] font-bold text-slate-500 hover:text-slate-700">Cancel</button>
                    <button type="submit" className="px-8 py-2 bg-[var(--color-pt-primary)] text-white text-[13px] font-bold rounded-full hover:opacity-90">Send Message</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
