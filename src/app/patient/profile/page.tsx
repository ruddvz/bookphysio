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
  ChevronRight
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
        <Loader2 className="w-8 h-8 animate-spin text-bp-accent" />
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
        <h1 className="text-[32px] md:text-[40px] font-black text-bp-primary tracking-tighter leading-none">
          Patient Profile
        </h1>
        <p className="text-[17px] text-bp-body font-medium tracking-tight">
          Manage your account settings, payments, and personal preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-[24px] md:rounded-[32px] border border-bp-border shadow-sm overflow-hidden p-2">
            <div className="flex flex-col">
              {[
                { icon: User, label: 'Personal Details', active: true },
                { icon: Lock, label: 'Password & Security', active: false },
                { icon: Bell, label: 'Notifications', active: false },
                { icon: CreditCard, label: 'Payment Methods', active: false },
                { icon: Shield, label: 'Privacy Settings', active: false },
              ].map((item, idx) => (
                <button
                  key={idx}
                  className={`flex items-center justify-between px-6 py-4 rounded-[20px] md:rounded-[24px] transition-all duration-200 ${
                    item.active 
                      ? 'bg-bp-accent/10 text-bp-accent' 
                      : 'text-bp-body hover:bg-bp-surface hover:text-bp-primary'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <item.icon className={`w-5 h-5 ${item.active ? 'text-bp-accent' : 'text-bp-body/50'}`} />
                    <span className="text-[16px] font-semibold tracking-tight">{item.label}</span>
                  </div>
                  {item.active && <div className="w-1.5 h-1.5 rounded-full bg-bp-accent" />}
                  {!item.active && <ChevronRight className="w-4 h-4 text-bp-body/50" />}
                </button>
              ))}
              
              <div className="h-px bg-[#E5E5E5] mx-6 my-2" />
              
              <button className="flex items-center gap-4 px-6 py-4 text-[#EF4444] hover:bg-red-50 rounded-[20px] md:rounded-[24px] transition-all duration-200">
                <LogOut className="w-5 h-5" />
                <span className="text-[16px] font-semibold tracking-tight">Logout</span>
              </button>
            </div>
          </div>

          <div className="bg-bp-accent text-white rounded-[24px] md:rounded-[32px] p-8 relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-[20px] font-bold mb-2">Need help?</h3>
              <p className="text-[14px] text-white/80 mb-4 leading-relaxed">
                Our support team is available 24/7 to help you with any questions.
              </p>
              <button className="bg-white text-bp-accent px-6 py-2.5 rounded-full text-[14px] font-bold hover:bg-opacity-90 transition-all">
                Contact Support
              </button>
            </div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-[24px] md:rounded-[40px] border border-bp-border shadow-sm overflow-hidden p-6 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-10 border-b border-bp-border">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="flex items-center justify-center w-24 h-24 md:w-28 md:h-28 rounded-full bg-bp-accent/10 text-bp-accent text-2xl font-black shrink-0 overflow-hidden ring-4 ring-white shadow-md transition-transform duration-300 group-hover:scale-105">
                    {profile.avatar_url
                      ? <Image src={profile.avatar_url} width={112} height={112} alt={profile.full_name} className="w-full h-full object-cover" />
                      : initials
                    }
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 md:w-10 md:h-10 bg-bp-accent text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform ring-4 ring-white">
                    <Camera className="w-4 h-4 md:w-5 h-5" />
                  </button>
                </div>
                <div>
                  <h2 className="text-[24px] md:text-[28px] font-black text-bp-primary tracking-tighter mb-1">
                    {profile.full_name}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-bp-accent/10 text-bp-accent text-[12px] font-black uppercase tracking-wider rounded-full">
                      {profile.role} account
                    </span>
                    <span className="text-[14px] text-bp-body">Member since 2024</span>
                  </div>
                </div>
              </div>
            </div>

            <form
              className="space-y-8"
              onSubmit={e => { e.preventDefault(); saveMut.mutate() }}
            >
              <div className="grid grid-cols-1 gap-8">
                {/* Full Name */}
                <div className="space-y-3">
                  <label className="text-[16px] font-black text-bp-primary tracking-tight block ml-1 uppercase text-[12px]">
                    Full Name
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full pl-12 pr-6 py-4 border-2 border-bp-border rounded-[20px] md:rounded-[24px] bg-white text-[16px] text-bp-primary font-medium focus:border-bp-accent focus:ring-4 focus:ring-bp-accent/5 outline-none transition-all duration-300 placeholder:text-bp-body/50"
                    />
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-bp-body/50 transition-colors group-focus-within:text-bp-accent" />
                  </div>
                  <p className="text-[13px] text-bp-body ml-1">
                    This is how your name will appear on official booking confirmations.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Phone — read only */}
                  <div className="space-y-3">
                    <label className="text-[16px] font-black text-bp-primary tracking-tight block ml-1 uppercase text-[12px]">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={profile.phone ?? '—'}
                        disabled
                        className="w-full pl-12 pr-6 py-4 border-2 border-bp-border rounded-[20px] md:rounded-[24px] bg-bp-surface text-[16px] text-bp-primary font-medium cursor-not-allowed outline-none opacity-80"
                      />
                      <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-bp-body/50" />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-[11px] font-black uppercase">
                        <Check className="w-3 h-3" /> Verified
                      </div>
                    </div>
                  </div>

                  {/* Email — read only */}
                  <div className="space-y-3">
                    <label className="text-[16px] font-black text-bp-primary tracking-tight block ml-1 uppercase text-[12px]">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={profile.email ?? '—'}
                        disabled
                        className="w-full pl-12 pr-6 py-4 border-2 border-bp-border rounded-[20px] md:rounded-[24px] bg-bp-surface text-[16px] text-bp-primary font-medium cursor-not-allowed outline-none opacity-80"
                      />
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-bp-body/50" />
                    </div>
                    {!profile.email && (
                      <button type="button" className="text-[13px] text-bp-accent font-bold hover:underline ml-1">
                        + Add email address
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-10 border-t border-bp-border">
                <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    {saveMut.isSuccess && (
                      <p className="text-[14px] text-emerald-600 font-bold flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2">
                        <Check className="w-4 h-4" /> Changes saved successfully
                      </p>
                    )}
                    {saveMut.isError && (
                      <p className="text-[14px] text-red-500 font-bold flex items-center gap-1.5 animate-in shake">
                        <AlertCircle className="w-4 h-4" /> Failed to save. Please try again.
                      </p>
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={saveMut.isPending || name.trim() === profile.full_name}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-10 py-4 bg-bp-accent hover:bg-bp-primary disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full text-[17px] font-black tracking-tight transform transition-all active:scale-95 shadow-xl shadow-bp-primary/10"
                  >
                    {saveMut.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Check className="w-5 h-5" />
                    )}
                    Update Profile
                  </button>
                </div>
              </div>
            </form>
          </div>
          
          <div className="bg-[#FFF4ED] border border-[#FFD8C2] rounded-[24px] md:rounded-[32px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                <Shield className="w-6 h-6 text-bp-secondary" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[16px] font-black text-[#853C1D] uppercase text-[12px]">Data Privacy</h4>
                <p className="text-[14px] text-[#853C1D]/80 leading-snug">
                  Your data is protected with 128-bit encryption and never shared with third parties.
                </p>
              </div>
            </div>
            <button className="text-[14px] font-black text-bp-secondary hover:underline whitespace-nowrap">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
