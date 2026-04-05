'use client'

import Image from 'next/image'
import { User, Briefcase, Award, Globe, ShieldCheck, Check, MapPin, Navigation, Info, ArrowRight, Activity } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { getProviderDisplayName, getProviderInitials } from '@/lib/providers/display-name'

type ProviderTitle = 'Dr.' | 'PT' | 'BPT' | 'MPT'

interface ProfileForm {
  full_name: string
  bio: string
  consultation_fee_inr: string
  experience_years: string
  avatar_url: string | null
  title: ProviderTitle | null
  icp_registration_no: string | null
}

interface ProfileResponse {
  full_name?: string | null
  bio?: string | null
  consultation_fee_inr?: number | null
  experience_years?: number | null
  avatar_url?: string | null
  title?: ProviderTitle | null
  icp_registration_no?: string | null
}

const EMPTY_FORM: ProfileForm = {
  full_name: '',
  bio: '',
  consultation_fee_inr: '',
  experience_years: '',
  avatar_url: null,
  title: null,
  icp_registration_no: null,
}

function toFormState(data: ProfileResponse): ProfileForm {
  return {
    full_name: data.full_name ?? '',
    bio: data.bio ?? '',
    consultation_fee_inr:
      data.consultation_fee_inr !== null && data.consultation_fee_inr !== undefined
        ? String(data.consultation_fee_inr)
        : '',
    experience_years:
      data.experience_years !== null && data.experience_years !== undefined
        ? String(data.experience_years)
        : '',
    avatar_url: data.avatar_url ?? null,
    title: data.title ?? null,
    icp_registration_no: data.icp_registration_no ?? null,
  }
}

function parseOptionalInteger(value: string): number | undefined {
  const trimmed = value.trim()
  if (!trimmed) {
    return undefined
  }

  const parsed = Number(trimmed)
  if (!Number.isFinite(parsed)) {
    return undefined
  }

  return parsed
}

async function resizeImage(file: File, maxPx = 400): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new window.Image()
    const objectUrl = URL.createObjectURL(file)

    image.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(image.width, image.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(image.width * scale)
      canvas.height = Math.round(image.height * scale)

      const context = canvas.getContext('2d')
      if (!context) {
        URL.revokeObjectURL(objectUrl)
        reject(new Error('Canvas context unavailable'))
        return
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(objectUrl)

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Image conversion failed'))
          return
        }

        resolve(blob)
      }, 'image/jpeg', 0.88)
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Image load failed'))
    }

    image.src = objectUrl
  })
}

export default function ProviderProfile() {
  const { user } = useAuth()
  const [formData, setFormData] = useState<ProfileForm>(EMPTY_FORM)
  const [savedFormData, setSavedFormData] = useState<ProfileForm>(EMPTY_FORM)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview)
      }
    }
  }, [avatarPreview])

  const loadProfile = useCallback(async () => {
    setLoadingProfile(true)
    setLoadError(null)

    try {
      const response = await fetch('/api/profile')
      if (!response.ok) {
        throw new Error('Failed to load profile')
      }

      const data = await response.json() as ProfileResponse
      const nextForm = toFormState(data)

      setFormData(nextForm)
      setSavedFormData(nextForm)
      setSaveStatus('idle')
    } catch {
      setLoadError('Live profile sync is unavailable right now.')
    } finally {
      setLoadingProfile(false)
    }
  }, [])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  const updateFormField = useCallback(<K extends keyof ProfileForm>(field: K, value: ProfileForm[K]) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }))
    setSaveStatus('idle')
  }, [])

  const handleAvatarFile = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    if (!user?.id) {
      setAvatarError('Sign in again to update your profile photo.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image must be under 5 MB.')
      return
    }

    const previewUrl = URL.createObjectURL(file)
    setAvatarPreview(previewUrl)
    setAvatarError(null)
    setSaveStatus('saving')

    try {
      const blob = await resizeImage(file)
      const supabase = createClient()
      const path = `${user.id}/avatar-${Date.now()}.jpg`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, blob, {
          cacheControl: '3600',
          contentType: 'image/jpeg',
          upsert: false,
        })

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const publicUrl = data.publicUrl

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: publicUrl }),
      })

      if (!response.ok) {
        throw new Error('Failed to persist avatar URL')
      }

      setFormData((current) => ({ ...current, avatar_url: publicUrl }))
      setSavedFormData((current) => ({ ...current, avatar_url: publicUrl }))
      setAvatarPreview(null)
      setSaveStatus('saved')
    } catch {
      setAvatarPreview(null)
      setAvatarError('Upload failed. Please try again.')
      setSaveStatus('error')
    } finally {
      event.target.value = ''
    }
  }, [user?.id])

  const handleSave = useCallback(async () => {
    setSaveStatus('saving')

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name.trim(),
          bio: formData.bio.trim(),
          consultation_fee_inr: parseOptionalInteger(formData.consultation_fee_inr),
          experience_years: parseOptionalInteger(formData.experience_years),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save profile')
      }

      setSavedFormData(formData)
      setSaveStatus('saved')
    } catch {
      setSaveStatus('error')
    }
  }, [formData])

  const handleDiscard = useCallback(() => {
    setFormData(savedFormData)
    setAvatarError(null)
    setLoadError(null)
    setSaveStatus('idle')
  }, [savedFormData])

  const displayName = formData.full_name.trim()
    ? getProviderDisplayName({ full_name: formData.full_name, title: formData.title })
    : 'Your Name'
  const initials = getProviderInitials(displayName === 'Your Name' ? 'Your Name' : displayName)
  const avatarSrc = avatarPreview ?? formData.avatar_url
  const expertiseLabel = formData.experience_years
    ? `${formData.experience_years}+ years experience`
    : 'Provider profile'
  const canSave = formData.full_name.trim().length >= 2 && saveStatus !== 'saving' && !loadingProfile

  return (
    <div className="max-w-[1040px] mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 border-b border-bp-border pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-bp-accent flex items-center justify-center text-white shadow-xl shadow-bp-accent/20 transform -rotate-3">
              <Briefcase size={24} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-bp-accent">Registry Management</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-bold text-emerald-600">Active Listing</span>
              </div>
            </div>
          </div>
          <h1 className="text-[42px] lg:text-[48px] font-bold text-bp-primary tracking-tighter leading-none">
            Practice <span className="text-bp-accent">Profile</span>
          </h1>
          <p className="text-[16px] font-medium text-bp-body max-w-xl leading-relaxed">
            Manage your professional presence, specialty credentials, and service area coverage.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-bp-surface p-2 rounded-[24px] border border-bp-border">
          <button type="button" className="px-6 py-3 text-[13px] font-bold text-bp-accent bg-white rounded-[18px] shadow-sm transform active:scale-95 transition-all">Public View</button>
          <button type="button" className="px-6 py-3 text-[13px] font-bold text-bp-body hover:text-bp-primary transition-colors rounded-[18px]">Analytics</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* ── Left Column: Form ── */}
        <div className="lg:col-span-2 space-y-12">
          <section className="bg-white rounded-[40px] border border-bp-border shadow-sm p-10 group/section">
            <h3 className="text-[22px] font-bold text-bp-primary tracking-tight mb-8 flex items-center gap-3">
              <User size={22} className="text-bp-accent" />
              Personal Details
            </h3>

            <div className="space-y-8">
              <div className="flex items-center gap-6 mb-4">
                <div className="relative group/avatar">
                  {avatarSrc ? (
                    <div className="w-24 h-24 rounded-[32px] border-4 border-white shadow-xl overflow-hidden bg-bp-surface">
                      <Image
                        src={avatarSrc}
                        alt={displayName}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                        sizes="96px"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-[32px] bg-bp-accent/10 text-bp-accent flex items-center justify-center text-2xl font-bold border-4 border-white shadow-xl group-hover/avatar:scale-105 transition-transform">
                      {initials}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 w-10 h-10 bg-bp-primary text-white rounded-2xl flex items-center justify-center border-4 border-white shadow-lg hover:bg-black transition-colors"
                    title="Change Avatar"
                  >
                    <User size={16} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    aria-label="Upload profile photo"
                    className="sr-only"
                    onChange={handleAvatarFile}
                  />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[18px] font-bold text-bp-primary">{displayName}</h4>
                  <p className="text-[13px] font-bold text-bp-body/40 uppercase tracking-widest">{expertiseLabel}</p>
                  {avatarError ? <p className="text-[12px] font-bold text-rose-500">{avatarError}</p> : null}
                  {!avatarError && loadError ? <p className="text-[12px] font-bold text-amber-600">{loadError}</p> : null}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label htmlFor="full-name" className="text-[12px] font-bold text-bp-body/40 uppercase tracking-widest ml-1">Full Name</label>
                  <input
                    id="full-name"
                    type="text"
                    value={formData.full_name}
                    onChange={(event) => updateFormField('full_name', event.target.value)}
                    className="w-full px-6 py-4 bg-bp-surface border border-bp-border rounded-[20px] text-[15px] font-bold text-bp-primary focus:bg-white focus:border-bp-accent outline-none transition-all"
                    placeholder="Enter full name"
                    disabled={loadingProfile}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="consultation-fee" className="text-[12px] font-bold text-bp-body/40 uppercase tracking-widest ml-1">Consultation Fee (₹)</label>
                  <input
                    id="consultation-fee"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    value={formData.consultation_fee_inr}
                    onChange={(event) => updateFormField('consultation_fee_inr', event.target.value)}
                    className="w-full px-6 py-4 bg-bp-surface border border-bp-border rounded-[20px] text-[15px] font-bold text-bp-primary focus:bg-white focus:border-bp-accent outline-none transition-all"
                    placeholder="e.g. 900"
                    disabled={loadingProfile}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label htmlFor="experience-years" className="text-[12px] font-bold text-bp-body/40 uppercase tracking-widest ml-1">Experience Years</label>
                  <input
                    id="experience-years"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    value={formData.experience_years}
                    onChange={(event) => updateFormField('experience_years', event.target.value)}
                    className="w-full px-6 py-4 bg-bp-surface border border-bp-border rounded-[20px] text-[15px] font-bold text-bp-primary focus:bg-white focus:border-bp-accent outline-none transition-all"
                    placeholder="e.g. 8"
                    disabled={loadingProfile}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="icp-registration" className="text-[12px] font-bold text-bp-body/40 uppercase tracking-widest ml-1">ICP Registration</label>
                  <input
                    id="icp-registration"
                    type="text"
                    value={formData.icp_registration_no ?? ''}
                    readOnly
                    className="w-full px-6 py-4 bg-bp-surface border border-bp-border rounded-[20px] text-[15px] font-bold text-bp-primary/70 outline-none transition-all"
                    placeholder="Verification pending"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="professional-bio" className="text-[12px] font-bold text-bp-body/40 uppercase tracking-widest ml-1">Professional Bio</label>
                <textarea
                  id="professional-bio"
                  rows={4}
                  className="w-full p-6 bg-bp-surface border border-bp-border rounded-[24px] text-[15px] font-medium text-bp-primary leading-relaxed focus:bg-white focus:border-bp-accent outline-none transition-all resize-none"
                  value={formData.bio}
                  onChange={(event) => updateFormField('bio', event.target.value)}
                  placeholder="Tell patients about your specific experience and approach..."
                  disabled={loadingProfile}
                />
              </div>
            </div>
          </section>

          {/* ── Service Area (8.9 Target) ── */}
          <section className="bg-bp-primary rounded-[48px] p-10 text-white relative overflow-hidden group/area">
            <div className="absolute right-0 top-0 w-[400px] h-full bg-bp-accent opacity-10 translate-x-1/2 rounded-full blur-[100px] group-hover/area:opacity-20 transition-opacity duration-1000" />

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-xl text-emerald-400 border border-white/5 backdrop-blur-md">
                    <Navigation size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Service Boundary</span>
                  </div>
                  <h3 className="text-[28px] font-bold tracking-tight leading-none">Coverage Area</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right mr-2 hidden sm:block">
                    <p className="text-[11px] font-bold text-bp-body uppercase tracking-widest">Efficiency</p>
                    <p className="text-[14px] font-bold text-emerald-400">High Density</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                    <MapPin size={22} className="text-emerald-400" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <p className="text-[15px] text-bp-body/40 font-medium leading-relaxed">
                    Coverage editing will unlock once live service-area sync ships. Until then, home-visit boundaries stay managed in onboarding and operations review.
                  </p>

                  <div className="relative">
                    <label htmlFor="pincode-input" className="sr-only">Enter Pincode</label>
                    <input
                      id="pincode-input"
                      type="text"
                      placeholder="Coverage sync coming soon"
                      disabled
                      className="w-full pl-6 pr-32 py-5 bg-white/5 border border-white/10 rounded-[20px] text-white/70 text-[16px] font-bold placeholder:text-bp-body outline-none transition-all disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      disabled
                      className="absolute right-2 top-2 bottom-2 px-6 bg-bp-accent/50 text-white text-[12px] font-bold rounded-xl transition-all uppercase tracking-widest disabled:cursor-not-allowed"
                    >
                      Soon
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-4">
                    <p className="text-[12px] font-bold text-bp-body text-center w-full py-4 border-2 border-dashed border-white/5 rounded-[24px]">No synced home-visit pincodes yet</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-white/5 rounded-[32px] border border-white/10 relative overflow-hidden group/metrics">
                    <div className="flex items-center justify-between mb-8">
                      <span className="text-[11px] font-bold text-bp-body uppercase tracking-widest">Active Corridors</span>
                      <Activity size={16} className="text-bp-accent" />
                    </div>
                    <div className="space-y-6">
                      <div className="flex justify-between items-end">
                        <span className="text-[13px] font-bold text-bp-body/40">Coverage Sync</span>
                        <span className="text-[18px] font-bold">Preview</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-bp-accent/50 w-[28%] rounded-full" />
                      </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[12px] font-bold">Live sync pending</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase text-bp-accent tracking-widest">Preview</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 flex items-center gap-4 p-5 bg-bp-accent/20 rounded-[28px] border border-bp-accent/30 backdrop-blur-sm">
                <div className="w-10 h-10 bg-bp-accent rounded-xl flex items-center justify-center shadow-lg"><Info size={20} /></div>
                <p className="text-[13px] font-medium text-emerald-100/80 leading-snug">
                  Coverage zones will appear here once availability and operations sync finish wiring to your live provider profile.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* ── Right Column: Credentials & Help ── */}
        <div className="space-y-8">
          <section className="bg-white rounded-[40px] border border-bp-border shadow-sm p-8 group/card">
            <div className="w-14 h-14 bg-bp-accent/10 rounded-2xl flex items-center justify-center text-bp-accent mb-6 group-hover/card:scale-110 group-hover/card:rotate-3 transition-transform">
              <ShieldCheck size={28} strokeWidth={2.5} />
            </div>
            <h4 className="text-[20px] font-bold text-bp-primary tracking-tight mb-3">Verification Hub</h4>
            <p className="text-[14px] font-medium text-bp-body/40 leading-relaxed mb-8">
              Your medical registration is the primary trust signal for patients.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 p-4 bg-bp-surface rounded-2xl border border-bp-border group/item transition-all hover:bg-white hover:shadow-lg">
                <Award size={20} className="text-bp-accent" />
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-bp-primary">ICP Medical ID</span>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                    {formData.icp_registration_no ? 'Verified ✓' : 'Pending'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-bp-secondary/10/50 rounded-2xl border border-bp-secondary/20 group/item transition-all">
                <Info size={20} className="text-bp-secondary" />
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-bp-secondary">GST Registration</span>
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Required for Payouts</span>
                </div>
              </div>
            </div>

            <button type="button" className="w-full py-4 bg-bp-primary hover:bg-black text-white text-[12px] font-bold rounded-2xl transition-all uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-gray-200">
              Update Documents <ArrowRight size={14} />
            </button>
          </section>

          <section className="bg-emerald-50 rounded-[40px] p-8 border border-emerald-100">
            <h4 className="text-[18px] font-bold text-bp-accent tracking-tight mb-4 flex items-center gap-2">
              <Globe size={18} />
              Global Status
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-emerald-100/50">
                <span className="text-[13px] font-bold text-bp-accent/70">Profile Strength</span>
                <span className="text-[13px] font-bold text-bp-accent">Live soon</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-emerald-100/50">
                <span className="text-[13px] font-bold text-bp-accent/70">Search Visibility</span>
                <span className="text-[13px] font-bold text-bp-accent">Preview</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-[13px] font-bold text-bp-accent/70">City Hub</span>
                <span className="text-[13px] font-bold text-bp-accent">After sync</span>
              </div>
            </div>
            <button type="button" className="w-full mt-6 py-4 bg-white hover:bg-emerald-100 text-bp-accent text-[12px] font-bold rounded-2xl transition-all uppercase tracking-widest border border-emerald-200">
              View Public Profile
            </button>
          </section>
        </div>
      </div>

      {/* ── Action Footer ── */}
      <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-8 p-8 bg-white rounded-[40px] border border-bp-border shadow-2xl shadow-gray-200/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Check size={24} strokeWidth={3} />
          </div>
          <div>
            <p className="text-[15px] font-bold text-bp-primary">
              {saveStatus === 'saved'
                ? 'Changes saved'
                : saveStatus === 'error'
                  ? 'Save failed - try again'
                  : loadingProfile
                    ? 'Loading live profile'
                    : 'Unsaved changes'}
            </p>
            <p className="text-[12px] font-bold text-bp-body/40 uppercase tracking-widest">
              {saveStatus === 'saving'
                ? 'Saving...'
                : loadError
                  ? loadError
                  : 'Auto-saves on Push Updates'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleDiscard}
            disabled={saveStatus === 'saving' || loadingProfile}
            className="flex-1 sm:flex-none px-10 py-5 border-2 border-bp-border rounded-[24px] text-[14px] font-bold text-bp-body/40 hover:bg-bp-surface transition-all active:scale-95 disabled:opacity-60"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={() => {
              void handleSave()
            }}
            disabled={!canSave}
            className="flex-1 sm:flex-none px-12 py-5 bg-bp-primary hover:bg-bp-accent text-white rounded-[24px] text-[14px] font-bold transition-all shadow-2xl shadow-bp-primary/10 active:scale-95 disabled:opacity-60"
          >
            {saveStatus === 'saving' ? 'Saving...' : 'Push Updates Live'}
          </button>
        </div>
      </div>
    </div>
  )
}

