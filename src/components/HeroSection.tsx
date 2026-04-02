'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Clock3, Home, MapPin, Search, ShieldCheck, Sparkles, Star, Stethoscope } from 'lucide-react'

const focusWords = [
  'sports rehab',
  'home visits',
  'post-surgery recovery',
  'neuro care',
  'daily pain relief',
]

const searchTags = ['Back pain', 'Knee rehab', 'Home visit', 'Sports recovery']

const heroStats = [
  { label: 'Verified providers', value: '5,000+' },
  { label: 'Cities covered', value: '18' },
  { label: 'Average rating', value: '4.9/5' },
  { label: 'Visit formats', value: 'Clinic + home' },
]

const previewRows = [
  {
    initials: 'PS',
    name: 'Dr. Priya Sharma',
    specialty: 'Sports physiotherapy',
    location: 'Mumbai',
    fee: 900,
    slot: 'Today · 6:30 PM',
    badge: 'Home visit',
  },
  {
    initials: 'RV',
    name: 'Dr. Rahul Verma',
    specialty: 'Orthopedic rehab',
    location: 'Delhi',
    fee: 800,
    slot: 'Tomorrow · 9:00 AM',
    badge: 'In-clinic',
  },
  {
    initials: 'AK',
    name: 'Dr. Ayesha Khan',
    specialty: 'Neuro physiotherapy',
    location: 'Bengaluru',
    fee: 1100,
    slot: 'Today · 8:15 PM',
    badge: 'Verified',
  },
]

function SearchBar({
  condition,
  location,
  onConditionChange,
  onLocationChange,
  onSubmit,
}: {
  condition: string
  location: string
  onConditionChange: (value: string) => void
  onLocationChange: (value: string) => void
  onSubmit: () => void
}) {
  return (
    <div className="bp-card relative mx-auto w-full max-w-4xl overflow-hidden p-6 md:p-8">
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-bp-primary via-bp-accent to-bp-secondary" />
      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr_auto]">
        <label className="flex flex-col gap-2 rounded-[22px] border border-bp-border bg-white px-5 py-4 transition-all focus-within:ring-4 focus-within:ring-bp-accent/10">
          <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-bp-body/60">
            <Search size={14} className="text-bp-accent" />
            Condition
          </span>
          <input
            type="search"
            value={condition}
            onChange={(event) => onConditionChange(event.target.value)}
            placeholder="Search by condition or injury"
            className="w-full bg-transparent text-[16px] font-medium text-bp-primary outline-none placeholder:text-bp-body/40"
          />
        </label>

        <label className="flex flex-col gap-2 rounded-[22px] border border-bp-border bg-white px-5 py-4 transition-all focus-within:ring-4 focus-within:ring-bp-accent/10">
          <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-bp-body/60">
            <MapPin size={14} className="text-bp-accent" />
            Location
          </span>
          <input
            type="text"
            value={location}
            onChange={(event) => onLocationChange(event.target.value)}
            placeholder="City or pincode"
            className="w-full bg-transparent text-[16px] font-medium text-bp-primary outline-none placeholder:text-bp-body/40"
          />
        </label>

        <button
          onClick={onSubmit}
          className="inline-flex items-center justify-center gap-2 rounded-[22px] bg-bp-primary px-8 py-4 text-[15px] font-bold text-white transition-all hover:bg-bp-accent active:scale-[0.98] lg:min-w-[160px]"
        >
          Find care
          <ArrowRight size={18} />
        </button>
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-3">
        {searchTags.map((tag) => (
          <button
            key={tag}
            onClick={() => onConditionChange(tag)}
            className="bp-chip hover:border-bp-accent hover:text-bp-accent"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  )
}

function PreviewPanel() {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="bp-card relative overflow-hidden p-6 md:p-7">
        <div className="absolute right-6 top-6 rounded-full border border-[#d7cec1] bg-[#fff7ec] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8d5a42]">
          Search preview
        </div>
        <div className="flex items-start justify-between gap-4 pr-20">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7d8a85]">What appears after search</p>
            <h2 className="mt-2 text-[32px] font-semibold tracking-tight text-[#18312d]">Matches in Mumbai</h2>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {previewRows.map((row) => (
            <div
              key={row.name}
              className="flex items-center gap-4 rounded-[22px] border border-[#e2d8cb] bg-[#fffaf4] p-4 transition-all hover:border-[#0f7668]/20 hover:bg-white"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-[#dcefe9] text-[14px] font-semibold text-[#18312d]">
                {row.initials}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-[15px] font-semibold text-[#18312d]">{row.name}</p>
                  <ShieldCheck size={14} className="text-[#0f7668]" />
                </div>
                <p className="truncate text-[13px] text-[#66706b]">
                  {row.specialty} · {row.location}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[14px] font-semibold text-[#18312d]">₹{row.fee}</p>
                <p className="text-[12px] text-[#0f7668]">{row.slot}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        <div className="bp-card-soft p-6 md:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7d8a85]">Why this works</p>
          <h3 className="mt-3 text-[28px] font-semibold tracking-[-0.04em] text-[#18312d]">The search does the heavy lifting.</h3>
          <div className="mt-6 space-y-4">
            {[
              { icon: ShieldCheck, title: 'Verified first', text: 'Registration and trust cues appear before the booking decision.' },
              { icon: Clock3, title: 'Slots visible', text: 'You can spot same-day availability without opening extra screens.' },
              { icon: Home, title: 'Visit mode in-line', text: 'Home visits and clinic visits are comparable from the same result list.' },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-[22px] border border-[#e2d8cb] bg-[#fffaf4] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[#18312d] text-white">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-[#18312d]">{title}</p>
                    <p className="text-[13px] leading-6 text-[#66706b]">{text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-[#244540]/10 bg-[#18312d] p-6 text-white shadow-[0_28px_65px_-42px_rgba(24,49,45,0.5)]">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-white/10">
              <Stethoscope size={20} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">Search promise</p>
              <p className="text-[22px] font-semibold tracking-[-0.04em] text-white">Pick the care format first, not after the search.</p>
            </div>
          </div>
          <p className="mt-4 text-[14px] leading-7 text-white/72">
            The homepage should feel like a confident intake surface. Search at the center, trust next, proof after that.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function HeroSection() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [condition, setCondition] = useState('')
  const [location, setLocation] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((previous) => (previous + 1) % focusWords.length)
    }, 3200)

    return () => clearInterval(interval)
  }, [])

  const handleSubmit = () => {
    const params = new URLSearchParams()

    if (condition.trim()) {
      params.set('condition', condition.trim())
    }

    if (location.trim()) {
      params.set('location', location.trim())
    }

    router.push(params.toString() ? `/search?${params.toString()}` : '/search')
  }

  return (
    <section className="relative overflow-hidden border-b border-bp-border bg-bp-surface/40">
      <div className="absolute left-1/2 top-0 h-[500px] w-full -translate-x-1/2 bg-[radial-gradient(circle_at_center,rgba(18,179,160,0.08),transparent_70%)]" />
      <div className="bp-shell relative py-16 md:py-24 lg:py-32">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mx-auto mb-8 inline-flex">
            <div className="rounded-full border border-bp-border bg-white/60 px-5 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-bp-accent backdrop-blur-sm">
              <Sparkles size={14} className="mr-2 inline-block" />
              India's premium physiotherapy network
            </div>
          </div>

          <h1 className="mx-auto max-w-4xl text-[54px] font-bold leading-[1.02] tracking-[-0.05em] text-bp-primary md:text-[82px] lg:text-[96px]">
            Expert care for <br className="hidden md:block" />
            <span className="relative inline-block overflow-hidden align-top text-bp-accent">
              <span key={currentIndex} className="animate-specialty inline-block">
                {focusWords[currentIndex]}
              </span>
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-[18px] leading-relaxed text-bp-body/80 md:text-[22px]">
            Book verified physiotherapists for home visits or in-clinic care in under 60 seconds.
          </p>

          <div className="mt-12">
            <SearchBar
              condition={condition}
              location={location}
              onConditionChange={setCondition}
              onLocationChange={setLocation}
              onSubmit={handleSubmit}
            />
          </div>

          <div className="mt-16 flex flex-wrap justify-center gap-10 opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0">
            {heroStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-[20px] font-bold text-bp-primary">{stat.value}</p>
                <p className="text-[12px] font-medium uppercase tracking-wider text-bp-body/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}