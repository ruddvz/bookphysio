'use client'

import Image from 'next/image'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, ArrowRight, ChevronDown, Shield, Clock, Home } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SPECIALTIES } from '@/lib/specialties'
import { INDIA_CITIES } from '@/lib/india-locations'
import { useUiV2 } from '@/hooks/useUiV2'
import { HeroTrustStrip } from '@/components/hero/HeroTrustStrip'

// SPECIALTIES is used for the options list only (not the removed chip rail).

const ROTATING_WORDS = [
  'sports rehab',
  'home visits',
  'post-surgery care',
  'neuro rehab',
  'back pain relief',
  'joint mobility',
]

const SPECIALTY_OPTIONS = SPECIALTIES.map((s) => s.label)

const CITY_OPTIONS = INDIA_CITIES.map((c) => `${c.city}, ${c.state}`)

const TRUST_STATS = [
  { value: 'IAP',    label: 'Verified providers'   },
  { value: '15+',    label: 'Cities live'           },
  { value: 'Free',   label: 'To list your practice' },
  { value: '60s',    label: 'To book a session'     },
]

function SearchField({
  label, id, icon: Icon, value, onChange, placeholder,
  options, onSelect, showOptions, onOpenOptions, onCloseOptions,
  className = '',
}: {
  label: string; id: string; icon: typeof Search
  value: string; onChange: (v: string) => void; placeholder: string
  options: string[]; onSelect: (v: string) => void
  showOptions: boolean; onOpenOptions: () => void; onCloseOptions: () => void
  className?: string;
}) {
  const ref      = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onCloseOptions()
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [onCloseOptions])

  const filtered = value
    ? options.filter(o => o.toLowerCase().includes(value.toLowerCase()))
    : options
  const listboxId = `${id}-options`

  return (
    <div ref={ref} className="relative flex-1">
      <div
        onClick={() => { onOpenOptions(); inputRef.current?.focus() }}
        className={`flex flex-col gap-1 px-6 py-4 cursor-text transition-all duration-150 ${showOptions ? 'bg-white' : 'bg-transparent hover:bg-slate-50/50'} ${className}`}
      >
        <label
          htmlFor={id}
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#6B7BF5] cursor-text"
        >
          <Icon size={12} strokeWidth={3} />
          {label}
        </label>
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            id={id}
            type="text"
            role="combobox"
            aria-controls={listboxId}
            aria-expanded={showOptions}
            aria-autocomplete="list"
            aria-haspopup="listbox"
            value={value}
            onChange={e => { onChange(e.target.value); onOpenOptions() }}
            onFocus={onOpenOptions}
            placeholder={placeholder}
            className="flex-1 text-[16px] font-semibold text-[#1A1C29] bg-transparent outline-none placeholder:text-slate-400 placeholder:font-medium"
          />
          <ChevronDown
            size={16}
            className={`text-slate-400 shrink-0 transition-transform duration-200 ${showOptions ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {showOptions && filtered.length > 0 && (
        <div id={listboxId} role="listbox" className="absolute top-full left-0 right-0 mt-3 bg-white rounded-[var(--sq-xl)] border border-slate-100 shadow-2xl shadow-indigo-900/15 max-h-[260px] overflow-y-auto z-50 p-3 animate-slide-down">
          {filtered.slice(0, 10).map(opt => (
            <button
              key={opt}
              type="button"
              role="option"
              aria-selected={opt === value}
              onClick={() => { onSelect(opt); onCloseOptions() }}
              className="w-full text-left px-5 py-3.5 text-[15px] font-semibold text-slate-700 hover:bg-[#EEF0FD] hover:text-[#6B7BF5] rounded-[var(--sq-sm)] transition-colors"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function HeroSection() {
  const router = useRouter()
  const [wordIdx, setWordIdx] = useState(0)
  const [wordVisible, setWordVisible] = useState(true)
  const [specialty, setSpecialty] = useState('')
  const [city, setCity]           = useState('')
  const [showSpecialties, setShowSpecialties] = useState(false)
  const [showCities, setShowCities]           = useState(false)
  const uiV2 = useUiV2()

  useEffect(() => {
    let nestedTimeout: ReturnType<typeof setTimeout> | undefined
    const id = setInterval(() => {
      setWordVisible(false)
      nestedTimeout = setTimeout(() => {
        setWordIdx(i => (i + 1) % ROTATING_WORDS.length)
        setWordVisible(true)
      }, 500)
    }, 3000)
    return () => {
      clearInterval(id)
      if (nestedTimeout !== undefined) clearTimeout(nestedTimeout)
    }
  }, [])

  const handleSearch = (overrideSpecialty?: string) => {
    const params = new URLSearchParams()
    const s = overrideSpecialty ?? specialty
    if (s.trim()) params.set('specialty', s.trim())
    if (city.trim()) params.set('city', city.split(',')[0]?.trim() ?? city.trim())
    router.push(params.toString() ? `/search?${params}` : '/search')
  }

  return (
    <section
      className="relative min-h-[100svh] flex flex-col justify-center"
      style={{ background: 'linear-gradient(155deg, #F0EEFF 0%, #E8F8F7 40%, #FFF5F8 75%, #FFF8F0 100%)' }}
      aria-label="Hero section"
    >
      {/* Decorative container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Soft blob decorations */}
        <div
          className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-40 animate-blob"
          style={{ background: 'radial-gradient(circle, #C4B5E8 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full opacity-30 animate-blob"
          style={{ background: 'radial-gradient(circle, #7DCFC9 0%, transparent 70%)', animationDelay: '3s' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(ellipse, #F4AABB 0%, transparent 70%)' }}
        />

        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, #8B9BD8 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Male physio character — desktop only */}
        <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-[200px] z-[5] select-none">
          <Image
            src="/images/characters/physio-male-pointing.png"
            alt=""
            width={200}
            height={300}
            priority
            className="object-contain"
            aria-hidden="true"
          />
        </div>

        {/* Female physio character — desktop only */}
        <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-[220px] z-[5] select-none">
          <Image
            src="/images/characters/physio-female-welcoming.png"
            alt=""
            width={220}
            height={340}
            priority
            className="object-contain"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Content — z-30 so the search-field dropdown (z-50 within this context)
          floats above any section rendered below the hero. */}
      <div className="bp-container relative z-30 pt-24 pb-28">
        <div className="max-w-3xl mx-auto text-center">

          {/* Headline */}
          <h1 className="mb-5 animate-fade-up delay-100" style={{ color: '#2D2B55' }}>
            Book verified physios
            <br />
            for{' '}
            <span className="relative inline-flex items-end">
              <span
                className={cn(
                  'text-gradient-lavender inline-block transition-all duration-500',
                  wordVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-[-8px]',
                )}
              >
                {ROTATING_WORDS[wordIdx]}
              </span>
              <span style={{ color: '#C4B5E8' }}>.</span>
            </span>
          </h1>

          {/* Subheading — two distinct lines */}
          <p className="text-[18px] leading-relaxed max-w-2xl mx-auto mb-8 animate-fade-up delay-200" style={{ color: '#5A5880' }}>
            Find IAP-verified physiotherapists for a clinic visit or a session at home.
            <br className="hidden sm:block" />
            {' '}Pick a time, confirm with an OTP, and you are done.
          </p>

          {/* Search bar */}
          <div className="mt-10 animate-fade-up delay-300 mb-10">
            <form
              onSubmit={e => { e.preventDefault(); handleSearch() }}
              className="flex flex-col lg:flex-row bg-white/90 backdrop-blur-md rounded-[2.5rem] lg:rounded-full overflow-visible border border-indigo-100 max-w-2xl mx-auto shadow-xl shadow-indigo-200/40 p-2"
            >
              <SearchField
                className="rounded-[2rem] lg:rounded-full"
                label="Specialty"
                id="hero-specialty"
                icon={Search}
                value={specialty}
                onChange={setSpecialty}
                placeholder="e.g. Orthopaedic, Sports, Neuro..."
                options={SPECIALTY_OPTIONS}
                onSelect={setSpecialty}
                showOptions={showSpecialties}
                onOpenOptions={() => { setShowSpecialties(true); setShowCities(false) }}
                onCloseOptions={() => setShowSpecialties(false)}
              />

              <div className="hidden lg:block w-px bg-indigo-50 my-3 self-stretch" />
              <div className="lg:hidden h-px bg-indigo-50 mx-5" />

              <SearchField
                className="rounded-[2rem] lg:rounded-full"
                label="City"
                id="hero-city"
                icon={MapPin}
                value={city}
                onChange={setCity}
                placeholder="e.g. Mumbai, Surat, Delhi..."
                options={CITY_OPTIONS}
                onSelect={setCity}
                showOptions={showCities}
                onOpenOptions={() => { setShowCities(true); setShowSpecialties(false) }}
                onCloseOptions={() => setShowCities(false)}
              />

              <div className="pt-2 lg:pt-0">
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 h-full w-full lg:w-auto lg:px-8 font-bold text-[15px] rounded-full px-6 py-4 active:scale-[0.97] transition-all duration-150 group text-white"
                  style={{
                    background: 'linear-gradient(135deg, #8B9BD8, #7DCFC9)',
                    boxShadow: '0 4px 16px rgba(139,155,216,0.40)',
                  }}
                >
                  Find care
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </form>
          </div>

          {/* v2 premium trust strip — live micro-stat with sparkline */}
          {uiV2 ? (
            <div className="flex justify-center mb-6 animate-fade-up delay-350">
              <HeroTrustStrip delta={8} />
            </div>
          ) : null}

          {/* Trust stats */}
          <div className="flex flex-wrap justify-center gap-8 animate-fade-up delay-400">
            {TRUST_STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-[24px] font-bold tracking-tight leading-none" style={{ color: '#2D2B55' }}>{value}</div>
                <div className="text-[12px] font-medium mt-1 uppercase tracking-wider" style={{ color: '#9290B0' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Trust badges — inline below stats so they never overlap */}
          <div className="hidden lg:flex justify-center items-center gap-3 mt-8 animate-fade-up delay-500">
            {[
              { icon: Shield, label: 'IAP/State Council Verified' },
              { icon: Home,   label: 'Home Visits Available'      },
              { icon: Clock,  label: 'Same-Day Slots'             },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-4 py-2.5 rounded-[var(--sq-sm)] backdrop-blur-sm border text-[12px] font-medium"
                style={{ background: 'rgba(255,255,255,0.75)', borderColor: '#E0DFEE', color: '#5A5880' }}
              >
                <Icon size={14} className="text-indigo-400" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to top, #F8F7FF, transparent)' }} />
    </section>
  )
}
