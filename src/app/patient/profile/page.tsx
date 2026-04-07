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
  Bell,
  Lock,
  CreditCard,
  Shield,
  LogOut,
  Camera,
  ChevronRight,
  X
} from 'lucide-react'

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
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-12 flex flex-col items-center gap-4">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-[15px] text-bp-body">Could not load your profile. Please try again.</p>
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
    <div className="max-w-[1142px] mx-auto px-4 md:px-6 py-8 md:py-12 animate-in fade-in duration-500 delay-100 fill-mode-both">
      <div className="flex flex-col gap-2 mb-8 md:mb-12">
        <h1 className="text-[32px] md:text-[40px] font-bold text-slate-900 tracking-tight leading-none">
          My Profile
        </h1>
        <p className="text-[15px] text-slate-500">
          Manage your account settings and personal preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-2">
            <div className="flex flex-col">
              {[
                { icon: User, label: 'Personal Details', active: true },
                { icon: Lock, label: 'Password & Security', active: false },
                { icon: Bell, label: 'Notifications', active: false },
                { icon: CreditCard, label: 'Payment Methods', active: false },
                { icon: Shield, label: 'Privacy Settings', active: false },
              ].map((item, idx) => (
                <button
                  type="button"
                  key={idx}
                  className={`flex items-center justify-between px-5 py-3.5 rounded-xl transition-all duration-200 ${
                    item.active
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-5 h-5 ${item.active ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="text-[15px] font-semibold">{item.label}</span>
                  </div>
                  {item.active && <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                  {!item.active && <ChevronRight className="w-4 h-4 text-slate-400" />}
                </button>
              ))}

              <div className="h-px bg-slate-100 mx-5 my-2" />

              <button type="button" className="flex items-center gap-3 px-5 py-3.5 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200">
                <LogOut className="w-5 h-5" />
                <span className="text-[15px] font-semibold">Logout</span>
              </button>
            </div>
          </div>

          <div className="bg-blue-600 text-white rounded-2xl p-6 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-[18px] font-bold mb-1">Need help?</h3>
              <p className="text-[13px] text-white/80 mb-4 leading-relaxed">
                Our support team is here to help with any questions.
              </p>
              <button
                type="button"
                onClick={() => {
                  setShowSupport(true)
                  setSupportSubmitted(false)
                  setSupportSubject('')
                  setSupportMessage('')
                }}
                className="bg-white text-blue-600 px-5 py-2 rounded-full text-[13px] font-semibold hover:bg-blue-50 transition-colors"
              >
                Contact Support
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-8 border-b border-slate-100">
              <div className="flex items-center gap-5">
                <div className="relative group">
                  <div className="flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-blue-50 text-blue-600 text-xl font-bold shrink-0 overflow-hidden ring-4 ring-white shadow-sm">
                    {profile.avatar_url
                      ? <Image src={profile.avatar_url} width={96} height={96} alt={profile.full_name} className="w-full h-full object-cover" />
                      : initials
                    }
                  </div>
                  <button type="button" aria-label="Change profile photo" title="Change profile photo" className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform ring-2 ring-white">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h2 className="text-[22px] md:text-[26px] font-bold text-slate-900 tracking-tight mb-1">
                    {profile.full_name}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 text-[11px] font-semibold uppercase tracking-wider rounded-full">
                      {profile.role}
                    </span>
                    <span className="text-[13px] text-slate-400">Member since 2024</span>
                  </div>
                </div>
              </div>
            </div>

            <form
              className="space-y-8"
              onSubmit={e => { e.preventDefault(); saveMut.mutate() }}
            >
              <div className="grid grid-cols-1 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label htmlFor="profile-name" className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Full Name
                  </label>
                  <div className="relative group">
                    <input
                      id="profile-name"
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl bg-white text-[15px] text-slate-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
                    />
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500" />
                  </div>
                  <p className="text-[12px] text-slate-400">
                    This name appears on your booking confirmations.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone — read only */}
                  <div className="space-y-2">
                    <label htmlFor="profile-phone" className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <input
                        id="profile-phone"
                        type="text"
                        value={profile.phone ?? '—'}
                        disabled
                        className="w-full pl-11 pr-6 py-3.5 border border-slate-200 rounded-xl bg-slate-50 text-[15px] text-slate-900 cursor-not-allowed outline-none opacity-80"
                      />
                      <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase">
                        <Check className="w-3 h-3" /> Verified
                      </div>
                    </div>
                  </div>

                  {/* Email — read only */}
                  <div className="space-y-2">
                    <label htmlFor="profile-email" className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        id="profile-email"
                        type="email"
                        value={profile.email ?? '—'}
                        disabled
                        className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl bg-slate-50 text-[15px] text-slate-900 cursor-not-allowed outline-none opacity-80"
                      />
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                    {!profile.email && (
                      <button type="button" className="text-[13px] text-blue-600 font-semibold hover:underline">
                        + Add email address
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    {saveMut.isSuccess && (
                      <p className="text-[13px] text-emerald-600 font-semibold flex items-center gap-1.5 animate-in fade-in">
                        <Check className="w-4 h-4" /> Changes saved
                      </p>
                    )}
                    {saveMut.isError && (
                      <p className="text-[13px] text-red-500 font-semibold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" /> Failed to save. Please try again.
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={saveMut.isPending || name.trim() === profile.full_name}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full text-[14px] font-semibold transition-colors active:scale-95"
                  >
                    {saveMut.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Update Profile
                  </button>
                </div>
              </div>
            </form>
          </div>
          
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[12px] font-semibold text-blue-800 uppercase tracking-wider">Data Privacy</h4>
                <p className="text-[13px] text-blue-700/80 leading-snug">
                  Your data is protected with encryption and never shared with third parties.
                </p>
              </div>
            </div>
            <button type="button" className="text-[13px] font-semibold text-blue-600 hover:underline whitespace-nowrap">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Support Dialog */}
      {showSupport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 relative animate-in zoom-in-95 duration-200">
            <button
              type="button"
              aria-label="Close support dialog"
              onClick={() => setShowSupport(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-[18px] font-bold text-slate-900 mb-1">Contact Support</h3>
            <p className="text-[13px] text-slate-500 mb-5">We will get back to you within 24 hours.</p>

            {supportSubmitted ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                  <Check className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-[15px] font-semibold text-slate-900 mb-1">Message sent</p>
                <p className="text-[13px] text-slate-500">Our team will respond shortly.</p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setSupportSubmitted(true)
                }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label htmlFor="support-subject" className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
                    Subject
                  </label>
                  <input
                    id="support-subject"
                    type="text"
                    required
                    value={supportSubject}
                    onChange={(e) => setSupportSubject(e.target.value)}
                    placeholder="What do you need help with?"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-[14px] text-slate-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="support-message" className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
                    Message
                  </label>
                  <textarea
                    id="support-message"
                    required
                    rows={4}
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    placeholder="Describe your issue or question..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-[14px] text-slate-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none placeholder:text-slate-400"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSupport(false)}
                    className="px-5 py-2.5 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!supportSubject.trim() || !supportMessage.trim()}
                    className="px-6 py-2.5 bg-blue-600 text-white text-[13px] font-semibold rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Submit
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
