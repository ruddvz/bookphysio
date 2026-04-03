'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, MapPin, Search, Sparkles } from 'lucide-react'

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
    <section className="relative overflow-hidden border-b border-bp-border bg-bp-surface/40" aria-label="Hero">
      <div className="absolute left-1/2 top-0 h-[500px] w-full -translate-x-1/2 bg-[radial-gradient(circle_at_center,rgba(18,179,160,0.08),transparent_70%)]" />
      <div className="bp-shell relative flex min-h-[calc(100vh-5rem)] flex-col justify-center py-16 md:py-24 lg:py-32">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mx-auto mb-8 inline-flex">
            <div className="rounded-full border border-bp-border bg-white/60 px-5 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-bp-accent backdrop-blur-sm">
              <Sparkles size={14} className="mr-2 inline-block" />
              India's premium physiotherapy network
            </div>
          </div>

          <h1 className="mx-auto max-w-4xl text-[54px] font-bold leading-[1.02] tracking-[-0.05em] text-bp-primary md:text-[82px] lg:text-[96px]">
            Book verified physiotherapists in India for <br className="hidden md:block" />
            <span className="relative inline-flex min-h-[1.05em] items-end overflow-hidden align-baseline pb-[0.06em] text-bp-accent">
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

          <div className="mt-16 flex flex-wrap justify-center gap-10 transition-all">
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