'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Clock3, Home, MapPin, Search, ShieldCheck, Sparkles, Star } from 'lucide-react'

const focusWords = [
  'sports rehab',
  'home visits',
  'post-surgery recovery',
  'neuro care',
  'daily pain relief',
]

const searchTags = ['Back pain', 'Knee rehab', 'Home visit', 'Sports recovery']

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
    <div className="bp-card p-3 md:p-4">
      <div className="grid gap-3 lg:grid-cols-[1.2fr_0.9fr_auto]">
        <label className="flex flex-col gap-2 rounded-[20px] border border-[#E6E8EC] bg-[#FCFDFD] px-4 py-3 transition-shadow focus-within:shadow-[0_0_0_4px_rgba(0,118,108,0.08)]">
          <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            <Search size={14} className="text-[#00766C]" />
            Condition
          </span>
          <input
            type="search"
            value={condition}
            onChange={(event) => onConditionChange(event.target.value)}
            placeholder="Search by condition or injury"
            className="w-full bg-transparent text-[15px] font-medium text-slate-900 outline-none placeholder:text-slate-400"
          />
        </label>

        <label className="flex flex-col gap-2 rounded-[20px] border border-[#E6E8EC] bg-[#FCFDFD] px-4 py-3 transition-shadow focus-within:shadow-[0_0_0_4px_rgba(0,118,108,0.08)]">
          <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            <MapPin size={14} className="text-[#00766C]" />
            Location
          </span>
          <input
            type="text"
            value={location}
            onChange={(event) => onLocationChange(event.target.value)}
            placeholder="City or pincode"
            className="w-full bg-transparent text-[15px] font-medium text-slate-900 outline-none placeholder:text-slate-400"
          />
        </label>

        <button
          onClick={onSubmit}
          className="inline-flex items-center justify-center gap-2 rounded-[20px] bg-[#00766C] px-6 py-4 text-[14px] font-semibold text-white transition-all hover:bg-[#005A52] active:scale-[0.98] lg:min-w-[140px]"
        >
          Find care
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {searchTags.map((tag) => (
          <button
            key={tag}
            onClick={() => onConditionChange(tag)}
            className="bp-chip hover:border-[#00766C] hover:text-[#005A52]"
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
    <div className="relative">
      <div className="absolute -left-8 top-10 hidden h-24 w-24 rounded-full bg-[#E6F4F3] blur-3xl lg:block" />
      <div className="bp-card relative overflow-hidden p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Live preview</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">Matches in Mumbai</h2>
          </div>
          <div className="rounded-full bg-[#E6F4F3] px-3 py-1 text-[12px] font-semibold text-[#005A52]">
            AI-assisted
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {previewRows.map((row) => (
            <div
              key={row.name}
              className="flex items-center gap-4 rounded-[20px] border border-[#E6E8EC] bg-[#FCFDFD] p-4 transition-all hover:border-[#00766C]/20 hover:bg-white"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[#E6F4F3] text-[14px] font-semibold text-[#005A52]">
                {row.initials}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-[15px] font-semibold text-slate-900">{row.name}</p>
                  <ShieldCheck size={14} className="text-[#00766C]" />
                </div>
                <p className="truncate text-[13px] text-slate-500">
                  {row.specialty} · {row.location}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[14px] font-semibold text-slate-900">₹{row.fee}</p>
                <p className="text-[12px] text-[#00766C]">{row.slot}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="bp-stat-card">
            <div className="flex items-center gap-2 text-slate-500">
              <ShieldCheck size={16} className="text-[#00766C]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">Verified</span>
            </div>
            <p className="mt-2 text-[18px] font-semibold text-slate-900">ICP screening</p>
            <p className="text-[13px] leading-6 text-slate-500">Credentials checked before a provider appears in search.</p>
          </div>

          <div className="bp-stat-card">
            <div className="flex items-center gap-2 text-slate-500">
              <Clock3 size={16} className="text-[#00766C]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">Fast booking</span>
            </div>
            <p className="mt-2 text-[18px] font-semibold text-slate-900">Same-day availability</p>
            <p className="text-[13px] leading-6 text-slate-500">See live slots without leaving the search flow.</p>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3 rounded-[20px] border border-[#E6E8EC] bg-[#F9FBFB] px-4 py-3 text-[13px] text-slate-600">
          <Home size={16} className="text-[#00766C]" />
          Home visits and in-clinic sessions appear together, so the choice stays simple.
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
    <section className="relative overflow-hidden border-b border-[#E6E8EC] bg-[radial-gradient(circle_at_top_left,rgba(0,118,108,0.08),transparent_32%),linear-gradient(180deg,#FFFFFF_0%,#F7F8F9_100%)]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#DDE3E8] to-transparent" />
      <div className="bp-shell relative py-16 md:py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="max-w-2xl">
            <div className="bp-kicker mb-6">
              <Sparkles size={13} />
              Trusted physiotherapy discovery
            </div>

            <h1 className="max-w-3xl text-[42px] leading-[1.02] tracking-[-0.05em] text-slate-900 md:text-[64px] lg:text-[72px]">
              Find the right physiotherapist for{' '}
              <span className="text-[#00766C]">{focusWords[currentIndex]}</span>.
            </h1>

            <p className="bp-copy mt-6 max-w-2xl">
              Search by condition, city, or visit type. Compare verified practitioners and book in-clinic or at home without the glossy noise.
            </p>

            <div className="mt-8">
              <SearchBar
                condition={condition}
                location={location}
                onConditionChange={setCondition}
                onLocationChange={setLocation}
                onSubmit={handleSubmit}
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {['Verified registration', 'Home visits', 'Transparent fees'].map((item) => (
                <div key={item} className="bp-chip bg-[#FCFDFD] text-slate-600">
                  <Star size={14} className="text-[#00766C]" />
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="bp-stat-card">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Verified physios</p>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">5,000+</p>
                <p className="mt-1 text-[13px] text-slate-500">Providers screened for registration and credentials.</p>
              </div>
              <div className="bp-stat-card">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Coverage</p>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">18 cities</p>
                <p className="mt-1 text-[13px] text-slate-500">Built for India&apos;s busiest metros and nearby neighborhoods.</p>
              </div>
              <div className="bp-stat-card">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Average rating</p>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">4.9/5</p>
                <p className="mt-1 text-[13px] text-slate-500">Ratings from completed sessions and verified reviews.</p>
              </div>
            </div>
          </div>

          <PreviewPanel />
        </div>
      </div>
    </section>
  )
}