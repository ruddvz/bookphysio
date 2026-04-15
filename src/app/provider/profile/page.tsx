"use client"

import Image from 'next/image'
import {
  User,
  ShieldCheck,
  Check,
  MapPin,
  Globe,
  Activity,
  Award,
  Info,
  Save,
  Eye,
  Trash2,
  Loader2,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { getProviderDisplayName, getProviderInitials } from '@/lib/providers/display-name'
import { cn } from '@/lib/utils'
import {
  PageHeader,
  SectionCard,
} from '@/components/dashboard/primitives'

type ProviderTitle = 'Dr.' | 'PT' | 'BPT' | 'MPT'

interface ProfileForm {
  full_name: string
  bio: string
  consultation_fee_inr: string
  experience_years: string
  avatar_url: string | null
  title: ProviderTitle | null
  iap_registration_no: string | null
}

interface ProfileResponse {
  full_name?: string | null
  bio?: string | null
  consultation_fee_inr?: number | null
  experience_years?: number | null
  avatar_url?: string | null
  title?: ProviderTitle | null
  iap_registration_no?: string | null
}

const EMPTY_FORM: ProfileForm = {
  full_name: '',
  bio: '',
  consultation_fee_inr: '',
  experience_years: '',
  avatar_url: null,
  title: null,
  iap_registration_no: null,
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
    iap_registration_no: data.iap_registration_no ?? null,
  }
}

function parseOptionalInteger(value: string): number | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const parsed = Number(trimmed)
  if (!Number.isFinite(parsed)) return undefined
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
  const [profileError, setProfileError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith('blob:')) URL.revokeObjectURL(avatarPreview)
    }
  }, [avatarPreview])

  const loadProfile = useCallback(async () => {
    setLoadingProfile(true)
    setProfileError(null)
    try {
      const response = await fetch('/api/profile')
      if (!response.ok) throw new Error('Failed to load profile')
      const data = await response.json() as ProfileResponse
      const nextForm = toFormState(data)
      setFormData(nextForm)
      setSavedFormData(nextForm)
      setSaveStatus('idle')
      setSaveError(null)
    } catch {
      setProfileError('We couldn\'t load your practice profile. Please retry.')
    } finally {
      setLoadingProfile(false)
    }
  }, [])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  const updateFormField = useCallback(<K extends keyof ProfileForm>(field: K, value: ProfileForm[K]) => {
    setFormData((current) => ({ ...current, [field]: value }))
    setSaveStatus('idle')
  }, [])

  const handleAvatarFile = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user?.id) return
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

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const publicUrl = data.publicUrl

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: publicUrl }),
      })

      if (!response.ok) throw new Error('Failed to persist avatar URL')

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
    setSaveError(null)
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

      if (!response.ok) throw new Error('Failed to save profile')
      setSavedFormData(formData)
      setSaveStatus('saved')
    } catch {
      setSaveStatus('error')
      setSaveError('We couldn\'t save your profile. Please try again.')
    }
  }, [formData])

  const handleDiscard = useCallback(() => {
    setFormData(savedFormData)
    setAvatarError(null)
    setSaveStatus('idle')
  }, [savedFormData])

  const displayName = formData.full_name.trim()
    ? getProviderDisplayName({ full_name: formData.full_name, title: formData.title })
    : 'New Provider'
  const initials = getProviderInitials(displayName)
  const avatarSrc = avatarPreview ?? formData.avatar_url
  const canSave = formData.full_name.trim().length >= 2 && saveStatus !== 'saving' && !loadingProfile && !profileError && JSON.stringify(formData) !== JSON.stringify(savedFormData)

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">
      <PageHeader
        role="provider"
        kicker="PRACTICE CONFIG"
        title="Practice Profile"
        subtitle="Manage your clinical identity, credentials, and visibility"
        action={{
          label: saveStatus === 'saving' ? 'Applying...' : 'Push Updates Live',
          icon: saveStatus === 'saving' ? Loader2 : Save,
          onClick: handleSave,
          disabled: !canSave
        }}
      />

      {loadingProfile ? (
        <div className="flex items-center gap-3 rounded-[var(--sq-sm)] border border-slate-200 bg-slate-50 px-5 py-3 text-slate-500">
          <Loader2 size={18} className="animate-spin" />
          <p className="text-[13px] font-bold">Loading your practice profile...</p>
        </div>
      ) : null}

      {profileError ? (
        <div className="flex flex-col gap-3 rounded-[var(--sq-sm)] border border-rose-100 bg-rose-50 px-5 py-4 text-rose-700 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] font-bold">{profileError}</p>
          <button
            type="button"
            onClick={() => void loadProfile()}
            className="rounded-full bg-white px-4 py-2 text-[12px] font-bold uppercase tracking-widest text-rose-600 transition-colors hover:bg-rose-100"
          >
            Retry Load
          </button>
        </div>
      ) : null}

      {saveError ? (
        <div className="rounded-[var(--sq-sm)] border border-rose-100 bg-rose-50 px-5 py-3 text-rose-700">
          <p className="text-[13px] font-bold">{saveError}</p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr,340px] gap-6">
        <div className="space-y-6 lg:space-y-8">
          {/* Clinical Identity Section */}
          <SectionCard role="provider" title="Clinical Identity">
            <div className="space-y-8">
              {/* Avatar Upload Hub */}
              <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-slate-50/50 rounded-[var(--sq-lg)] border border-slate-100">
                <div className="relative">
                  <div className="w-24 h-24 rounded-[var(--sq-lg)] bg-white border border-slate-200 overflow-hidden flex items-center justify-center">
                    {avatarSrc ? (
                      <Image
                        src={avatarSrc}
                        alt={displayName}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[24px] font-bold text-[var(--color-pv-primary)]">{initials}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Upload profile photo"
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-[var(--color-pv-ink)] text-white rounded-[var(--sq-xs)] border-2 border-white flex items-center justify-center hover:bg-[var(--color-pv-primary)] transition-all shadow-lg"
                  >
                    <User size={14} />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" aria-label="Profile photo upload" onChange={handleAvatarFile} />
                </div>
                
                <div className="flex-1 text-center md:text-left space-y-1">
                  <h4 className="text-[16px] font-bold text-slate-900">{displayName}</h4>
                  <p className="text-[12px] text-slate-400 font-bold uppercase tracking-widest">
                    {formData.experience_years ? `${formData.experience_years}+ Years Experience` : 'Provider Profile'}
                  </p>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-1.5 bg-white border border-slate-200 rounded-full text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-all"
                    >
                      Change Photo
                    </button>
                    {avatarError && <p className="text-[11px] font-bold text-rose-500">{avatarError}</p>}
                  </div>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="provider-full-name" className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input
                    id="provider-full-name"
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => updateFormField('full_name', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[var(--sq-sm)] text-[14px] font-bold text-slate-900 focus:bg-white focus:border-[var(--color-pv-primary)] outline-none transition-all"
                    placeholder="e.g. Dr. Jane Smith"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="provider-consultation-fee" className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Consultation Fee</label>
                  <input
                    id="provider-consultation-fee"
                    type="number"
                    value={formData.consultation_fee_inr}
                    onChange={(e) => updateFormField('consultation_fee_inr', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[var(--sq-sm)] text-[14px] font-bold text-slate-900 focus:bg-white focus:border-[var(--color-pv-primary)] outline-none transition-all"
                    placeholder="e.g. 1000"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="provider-years-of-practice" className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Years of Practice</label>
                  <input
                    id="provider-years-of-practice"
                    type="number"
                    value={formData.experience_years}
                    onChange={(e) => updateFormField('experience_years', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[var(--sq-sm)] text-[14px] font-bold text-slate-900 focus:bg-white focus:border-[var(--color-pv-primary)] outline-none transition-all"
                    placeholder="e.g. 12"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="provider-registration-number" className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Council Registration</label>
                  <div className="relative">
                    <input
                      id="provider-registration-number"
                      type="text"
                      value={formData.iap_registration_no ?? ''}
                      readOnly
                      className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-[var(--sq-sm)] text-[14px] font-bold text-slate-500 cursor-not-allowed"
                      placeholder="Verified Credential"
                    />
                    <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="provider-biography" className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Provider Biography</label>
                <textarea
                  id="provider-biography"
                  rows={5}
                  value={formData.bio}
                  onChange={(e) => updateFormField('bio', e.target.value)}
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-[var(--sq-lg)] text-[14px] font-bold text-slate-900 focus:bg-white focus:border-[var(--color-pv-primary)] outline-none transition-all resize-none leading-relaxed"
                  placeholder="Tell your clinical story..."
                />
              </div>
            </div>
          </SectionCard>

          {/* Coverage Section */}
          <SectionCard role="provider" title="Coverage Area" kicker="SERVICE REACH">
            <div className="grid grid-cols-1 md:grid-cols-[1fr,240px] gap-8">
              <div className="space-y-6">
                <div className="p-6 bg-[var(--color-pv-track-bg)] border border-slate-100 rounded-[var(--sq-lg)]">
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin className="text-[var(--color-pv-primary)]" size={18} />
                    <h5 className="text-[14px] font-bold text-slate-900">Verified Service Zone</h5>
                  </div>
                  <p className="text-[12px] text-slate-500 leading-relaxed italic mb-6">
                    Home-visit zones are strictly restricted to your verified service area. Manual adjustments are disabled during operations review.
                  </p>
                  <div className="relative opacity-50">
                    <input type="text" disabled placeholder="Syncing city clusters..." className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-[var(--sq-sm)] text-[12px] font-bold" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-slate-100 text-[9px] font-bold uppercase tracking-widest rounded-md">Locked</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-[var(--sq-sm)]">
                  <Activity size={18} className="text-indigo-500" />
                  <p className="text-[12px] font-bold text-indigo-700">Coverage sync alternates automatically based on your live availability status.</p>
                </div>
              </div>
              <div className="h-full bg-slate-50 border border-dashed border-slate-200 rounded-[var(--sq-lg)] flex flex-col items-center justify-center text-center p-6 grayscale">
                <Globe className="text-slate-300 mb-4" size={32} />
                <h6 className="text-[13px] font-bold text-slate-400 mb-1">Interactive Map</h6>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Pending Sync</p>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard role="provider" title="Registry Status">
            <div className="space-y-4">
              {[
                { label: 'Council ID', status: formData.iap_registration_no ? 'Verified' : 'Pending', icon: ShieldCheck, ok: !!formData.iap_registration_no },
                { label: 'KYC Sync', status: 'Active', icon: Award, ok: true },
                { label: 'GST Logic', status: 'Required', icon: Info, ok: false }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-[var(--sq-sm)] hover:border-slate-200 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-9 h-9 rounded-[var(--sq-xs)] flex items-center justify-center",
                      item.ok ? "bg-emerald-50 text-emerald-500" : "bg-amber-50 text-amber-500"
                    )}>
                      <item.icon size={18} />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-slate-900">{item.label}</div>
                      <div className={cn("text-[10px] font-bold uppercase tracking-widest", item.ok ? "text-emerald-600" : "text-amber-600")}>{item.status}</div>
                    </div>
                  </div>
                  {item.ok && <Check size={14} className="text-emerald-500" />}
                </div>
              ))}
              <button className="w-full py-3.5 bg-[var(--color-pv-ink)] text-white rounded-[var(--sq-sm)] text-[12px] font-bold uppercase tracking-widest hover:bg-[var(--color-pv-primary)] transition-all">
                Manage Credentials
              </button>
            </div>
          </SectionCard>

          <SectionCard role="provider" title="Public Metadata">
            <div className="space-y-4">
              {[
                { label: 'Profile Rank', value: 'Prime' },
                { label: 'Response Rate', value: '100%' },
                { label: 'Registry ID', value: user?.id?.slice(0, 8) || '---' }
              ].map((row, idx) => (
                <div key={idx} className="flex justify-between items-center py-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{row.label}</span>
                  <span className="text-[13px] font-bold text-slate-900">{row.value}</span>
                </div>
              ))}
              <div className="pt-4 border-t border-slate-50">
                <button className="flex items-center justify-center gap-2 w-full py-3 bg-slate-50 border border-slate-100 rounded-[var(--sq-sm)] text-[12px] font-bold text-slate-600 hover:bg-slate-100 transition-all">
                  <Eye size={14} />
                  Public Preview
                </button>
              </div>
            </div>
          </SectionCard>

          {saveStatus !== 'idle' && (
            <button
               onClick={handleDiscard}
               className="flex items-center justify-center gap-2 w-full py-3 text-rose-500 text-[12px] font-bold uppercase tracking-widest hover:bg-rose-50 rounded-[var(--sq-sm)] transition-all"
            >
               <Trash2 size={14} />
               Discard Draft
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
