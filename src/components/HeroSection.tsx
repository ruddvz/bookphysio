'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search, MapPin, ArrowRight, ChevronDown, ShieldCheck, Clock, Home, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

const ROTATING_WORDS = [
  'sports rehab',
  'home visits',
  'post-surgery care',
  'neuro rehab',
  'back pain relief',
  'joint mobility',
]

const HERO_CHIP_ROWS = [
  ['Back pain', 'Neck pain', 'Shoulder pain', 'Knee pain', 'Hip pain', 'Heel pain', 'Joint stiffness'],
  ['Sports injury', 'Post-surgery care', 'Home visit', 'Slip disc', 'Sciatica', 'Balance issues', 'Posture issues'],
  ['Stroke recovery', 'Kids physio', 'Pregnancy pain', 'Elderly care', 'Ankle sprain', 'Hand pain', 'Wrist pain'],
]

const CONDITIONS = HERO_CHIP_ROWS.flat()

const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata',
  'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh', 'Gurgaon',
  'Noida', 'Surat', 'Nagpur', 'Indore', 'Bhopal', 'Vadodara',
]

const TRUST_STATS = [
  { value: 'IAP',     label: 'Verified providers'  },
  { value: '10+',     label: 'Cities supported'    },
  { value: 'Free',    label: 'To list your practice'},
  { value: '60s',     label: 'To book a session'   },
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
    // Use 'click' (not 'mousedown') so the listener fires AFTER the trigger's
    // own onClick has run — otherwise opening one field would race with
    // closing it on the same gesture and the dropdown would never appear.
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
        className={`flex flex-col gap-1 px-5 py-3.5 cursor-text transition-all duration-150 ${showOptions ? 'bg-white' : 'bg-transparent hover:bg-slate-50/50'} ${className}`}
      >
        <label
          htmlFor={id}
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#00766C] cursor-text"
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
            className="flex-1 text-[15px] font-semibold text-[#1A1C29] bg-transparent outline-none placeholder:text-slate-400 placeholder:font-normal"
          />
          <ChevronDown
            size={15}
            className={`text-slate-400 shrink-0 transition-transform duration-200 ${showOptions ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {showOptions && filtered.length > 0 && (
        <div id={listboxId} role="listbox" className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-100 shadow-2xl shadow-teal-900/10 max-h-[260px] overflow-y-auto z-50 p-2">
          {filtered.slice(0, 10).map(opt => (
            <button
              key={opt}
              type="button"
              role="option"
              aria-selected={opt === value}
              onClick={() => { onSelect(opt); onCloseOptions() }}
              className="w-full text-left px-4 py-3 text-[14px] font-medium text-slate-700 hover:bg-[#E6F4F3] hover:text-[#00766C] rounded-xl transition-colors"
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
  const [condition, setCondition] = useState('')
  const [location, setLocation]   = useState('')
  const [showConditions, setShowConditions] = useState(false)
  const [showCities, setShowCities]         = useState(false)

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

  const handleSearch = (overrideCondition?: string) => {
    const params = new URLSearchParams()
    const c = overrideCondition ?? condition
    if (c.trim()) params.set('condition', c.trim())
    if (location.trim())  params.set('location',  location.trim())
    router.push(params.toString() ? `/search?${params}` : '/search')
  }

  return (
    <section
      className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #F0FBF9 0%, #FFFFFF 45%, #F5F8FF 100%)' }}
      aria-label="Hero section"
    >
      {/* Decorative background shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, #B2D8D5 0%, transparent 65%)' }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-[550px] h-[550px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #A5C8F0 0%, transparent 70%)' }}
        />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'radial-gradient(circle, #00766C 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
      </div>

      {/* Main content grid */}
      <div className="bp-container relative z-10 pt-24 pb-16">
        <div className="grid lg:grid-cols-[1fr_320px] gap-8 lg:gap-16 items-center max-w-[1142px] mx-auto">

          {/* Left column — copy + search */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.16em] mb-6 animate-fade-up"
              style={{ background: '#E6F4F3', color: '#00766C', border: '1px solid #B2D8D5' }}>
              <ShieldCheck size={12} strokeWidth={3} />
              IAP-Verified physiotherapists
            </div>

            {/* Headline */}
            <h1 className="mb-5 animate-fade-up delay-100 text-[#1A1C29] leading-[1.1]">
              Book verified physios
              <br />
              for{' '}
              <span className="relative inline-flex items-end">
                <span
                  className={cn(
                    'text-gradient-teal inline-block transition-all duration-500',
                    wordVisible
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-[-8px]',
                  )}
                >
                  {ROTATING_WORDS[wordIdx]}
                </span>
                <span className="text-[#00766C]">.</span>
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-[17px] leading-relaxed max-w-xl mb-8 animate-fade-up delay-200 text-slate-500 lg:max-w-none">
              Find IAP-verified physiotherapists for a clinic visit or a session at home. Pick a time, confirm with an OTP, and you are done.
            </p>

            {/* Search bar */}
            <div className="animate-fade-up delay-300 mb-7">
              <form
                onSubmit={e => { e.preventDefault(); handleSearch() }}
                className="flex flex-col sm:flex-row bg-white rounded-2xl overflow-visible border border-slate-200 shadow-[0_8px_40px_rgba(0,118,108,0.10)] p-2 max-w-2xl lg:max-w-none"
              >
                <SearchField
                  className="rounded-xl"
                  label="Condition"
                  id="hero-condition"
                  icon={Search}
                  value={condition}
                  onChange={setCondition}
                  placeholder="e.g. Back pain, Sports injury..."
                  options={CONDITIONS}
                  onSelect={setCondition}
                  showOptions={showConditions}
                  onOpenOptions={() => { setShowConditions(true); setShowCities(false) }}
                  onCloseOptions={() => setShowConditions(false)}
                />

                <div className="hidden sm:block w-px bg-slate-100 my-2 self-stretch" />
                <div className="sm:hidden h-px bg-slate-100 mx-3 my-1" />

                <SearchField
                  className="rounded-xl"
                  label="Location"
                  id="hero-location"
                  icon={MapPin}
                  value={location}
                  onChange={setLocation}
                  placeholder="City name..."
                  options={CITIES}
                  onSelect={setLocation}
                  showOptions={showCities}
                  onOpenOptions={() => { setShowCities(true); setShowConditions(false) }}
                  onCloseOptions={() => setShowCities(false)}
                />

                <div className="p-1">
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3.5 font-bold text-[15px] rounded-xl text-white active:scale-[0.97] transition-all duration-150 group whitespace-nowrap"
                    style={{
                      background: 'linear-gradient(135deg, #00766C, #005A52)',
                      boxShadow: '0 4px 20px rgba(0,118,108,0.35)',
                    }}
                  >
                    Find care
                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </form>
            </div>

            {/* Condition chip marquee */}
            <div className="-mx-4 pb-2 animate-fade-up delay-400">
              <div
                role="group"
                aria-label="Browse common conditions"
                className="flex flex-col gap-2.5"
              >
                {HERO_CHIP_ROWS.map((row, rowIndex) => {
                  const isReverse = rowIndex === 1
                  const delays = ['-8s', '-14s', '-4s']
                  return (
                    <div
                      key={`hero-chip-row-${rowIndex}`}
                      data-chip-row
                      className="overflow-hidden"
                    >
                      <div
                        className={cn(
                          'flex gap-2.5',
                          isReverse ? 'animate-chip-marquee-reverse' : 'animate-chip-marquee',
                        )}
                        style={{
                          animationDuration: `${28 + rowIndex * 4}s`,
                          animationDelay: delays[rowIndex],
                        }}
                      >
                        {row.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => { setCondition(tag); handleSearch(tag) }}
                            className="bp-hero-chip min-w-[132px] shrink-0 px-4 py-2 text-[13px] font-semibold"
                          >
                            {tag}
                          </button>
                        ))}
                        <span aria-hidden="true" className="contents">
                          {row.map((tag) => (
                            <button
                              key={`dup-${tag}`}
                              type="button"
                              tabIndex={-1}
                              onClick={() => { setCondition(tag); handleSearch(tag) }}
                              className="bp-hero-chip min-w-[132px] shrink-0 px-4 py-2 text-[13px] font-semibold"
                            >
                              {tag}
                            </button>
                          ))}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Trust stats */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 mt-8 animate-fade-up delay-500">
              {TRUST_STATS.map(({ value, label }) => (
                <div key={label} className="text-center lg:text-left">
                  <div className="text-[22px] font-bold tracking-tight leading-none text-[#1A1C29]">{value}</div>
                  <div className="text-[11px] font-medium mt-0.5 uppercase tracking-wider text-slate-400">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column — physio character (desktop only) */}
          <div className="hidden lg:flex flex-col items-center relative" aria-hidden="true">
            {/* Background circle */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full"
              style={{ background: 'linear-gradient(145deg, #E6F4F3 0%, #B2D8D5 100%)' }}
              aria-hidden="true"
            />

            <div className="absolute top-4 -left-4 bg-white rounded-2xl px-3 py-2 shadow-lg shadow-teal-900/10 border border-slate-100 flex items-center gap-2 z-20">
              <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <Star size={13} className="text-amber-500 fill-amber-400" />
              </div>
              <div>
                <div className="text-[12px] font-bold text-[#1A1C29] leading-none">4.9★</div>
                <div className="text-[10px] text-slate-400 leading-none mt-0.5">Avg rating</div>
              </div>
            </div>

            <div className="absolute bottom-12 -right-4 bg-white rounded-2xl px-3 py-2 shadow-lg shadow-teal-900/10 border border-slate-100 flex items-center gap-2 z-20">
              <div className="w-7 h-7 rounded-full bg-[#E6F4F3] flex items-center justify-center shrink-0">
                <ShieldCheck size={13} className="text-[#00766C]" />
              </div>
              <div>
                <div className="text-[12px] font-bold text-[#1A1C29] leading-none">Verified</div>
                <div className="text-[10px] text-slate-400 leading-none mt-0.5">By our team</div>
              </div>
            </div>

            <div className="absolute top-14 -right-6 bg-[#00766C] rounded-2xl px-3 py-2 shadow-lg shadow-teal-900/20 flex items-center gap-2 z-20">
              <Clock size={13} className="text-white shrink-0" />
              <div className="text-[12px] font-bold text-white leading-none">Book in 60s</div>
            </div>

            {/* Physio character */}
            <div className="relative z-10 mt-8">
              <Image
                src="/images/physio-female.png"
                alt=""
                aria-hidden="true"
                width={260}
                height={380}
                className="object-contain object-bottom drop-shadow-2xl"
                sizes="(min-width: 1024px) 260px, 0px"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom trust badges — desktop */}
      <div className="hidden lg:flex absolute bottom-8 left-1/2 -translate-x-1/2 items-center gap-3 z-10 animate-fade-up delay-500">
        {[
          { icon: ShieldCheck, label: 'IAP/State Council Verified' },
          { icon: Home,        label: 'Home Visits Available'      },
          { icon: Clock,       label: 'Same-Day Slots'             },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-sm border text-[12px] font-medium"
            style={{ background: 'rgba(255,255,255,0.85)', borderColor: '#D1E8E6', color: '#374151' }}
          >
            <Icon size={13} className="text-[#00766C]" />
            {label}
          </div>
        ))}
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-20 pointer-events-none"
        style={{ background: 'linear-gradient(to top, #F7F8F9, transparent)' }} />
    </section>
  )
}
