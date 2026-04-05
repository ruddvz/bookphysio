'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, MapPin, Search, ChevronDown } from 'lucide-react'

const focusWords = [
  'sports rehab',
  'home visits',
  'post-surgery recovery',
  'neuro care',
  'daily pain relief',
]

const CONDITIONS = [
  'Back Pain', 'Knee Rehab', 'Sports Injury', 'Post-Surgery',
  'Neck Pain', 'Shoulder Pain', 'Neuro Care', 'Geriatric Care',
  "Women's Health", 'Pediatric Care', 'Arthritis', 'Spinal Cord Injury'
]

const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad', 'Howrah', 'Ranchi', 'Gwalior', 'Jabalpur', 'Coimbatore', 'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur', 'Kota', 'Guwahati', 'Chandigarh', 'Gurgaon', 'Noida'
]

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
  const [showConditions, setShowConditions] = useState(false)
  const [showCities, setShowCities] = useState(false)
  
  const conditionRef = useRef<HTMLDivElement>(null)
  const cityRef = useRef<HTMLDivElement>(null)
  const conditionInputRef = useRef<HTMLInputElement>(null)
  const cityInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (conditionRef.current && !conditionRef.current.contains(event.target as Node)) {
        setShowConditions(false)
      }
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) {
        setShowCities(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredCities = location 
    ? CITIES.filter(c => c.toLowerCase().startsWith(location.toLowerCase()))
    : CITIES
    
  const filteredConditions = condition
    ? CONDITIONS.filter(c => c.toLowerCase().includes(condition.toLowerCase()))
    : CONDITIONS

  return (
    <div className="relative mx-auto w-full max-w-5xl overflow-visible px-2 md:px-0">
      <form
        className="flex flex-col items-stretch gap-2.5 rounded-[32px] border border-white/70 bg-white/78 p-2 shadow-[0_22px_55px_-28px_rgba(24,49,45,0.34)] ring-1 ring-bp-primary/5 backdrop-blur-2xl transition-all lg:flex-row lg:items-center"
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit()
        }}
      >
        
        {/* CONDITION SELECTOR */}
        <div ref={conditionRef} className="relative flex-1 w-full lg:w-auto h-full">
          <div 
            onClick={() => {
              setShowConditions(true)
              conditionInputRef.current?.focus()
            }}
            className="flex h-full flex-col gap-1 rounded-[28px] border border-white/80 bg-[#fdfbf7]/92 px-6 py-3 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] focus-within:bg-white focus-within:ring-2 ring-bp-accent/30 cursor-text"
          >
            <label htmlFor="hero-condition-input" className="flex cursor-text items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-bp-accent/80">
              <Search size={12} className="text-bp-accent" />
              Condition
            </label>
            <div className="flex items-center justify-between">
              <input
                id="hero-condition-input"
                ref={conditionInputRef}
                type="text"
                role="combobox"
                aria-expanded={showConditions ? 'true' : 'false'}
                aria-controls="hero-condition-options"
                aria-autocomplete="list"
                value={condition}
                onChange={(event) => {
                  onConditionChange(event.target.value)
                  setShowConditions(true)
                }}
                onFocus={() => setShowConditions(true)}
                placeholder="Search condition..."
                className="w-full bg-transparent text-[16px] font-bold text-bp-primary outline-none placeholder:text-bp-primary/40 truncate"
              />
              <ChevronDown size={16} className="text-bp-primary/40 ml-2 shrink-0" />
            </div>
          </div>
          
          {showConditions && (
            <div
              id="hero-condition-options"
              role="listbox"
              className="absolute top-full left-0 right-0 mt-3 max-h-[300px] overflow-y-auto rounded-[24px] border border-white bg-white/95 backdrop-blur-2xl p-3 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)] ring-1 ring-bp-primary/5 z-50 custom-scrollbar text-left animate-in fade-in slide-in-from-top-2 duration-200"
            >
              {filteredConditions.length > 0 ? (
                filteredConditions.map((c) => (
                  <button
                    key={c}
                    type="button"
                    role="option"
                    aria-selected={condition === c ? 'true' : 'false'}
                    onClick={() => {
                      onConditionChange(c)
                      setShowConditions(false)
                    }}
                    className="w-full text-left px-4 py-3.5 text-[15px] font-bold text-bp-primary/80 hover:bg-white/50 hover:text-bp-accent rounded-xl transition-all"
                  >
                    {c}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-[14px] text-bp-body/60 text-left font-medium">No conditions found</div>
              )}
            </div>
          )}
        </div>

        {/* LOCATION SELECTOR */}
        <div ref={cityRef} className="relative flex-1 w-full lg:w-auto h-full">
          <div 
             onClick={() => {
               setShowCities(true)
               cityInputRef.current?.focus()
             }}
             className="flex h-full flex-col gap-1 rounded-[28px] border border-white/80 bg-[#fdfbf7]/92 px-6 py-3 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] focus-within:bg-white focus-within:ring-2 ring-bp-accent/30 cursor-text"
          >
            <label htmlFor="hero-location-input" className="flex cursor-text items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-bp-accent/80">
              <MapPin size={12} className="text-bp-accent" />
              Location
            </label>
            <div className="flex items-center justify-between">
              <input
                id="hero-location-input"
                ref={cityInputRef}
                type="text"
                role="combobox"
                aria-expanded={showCities ? 'true' : 'false'}
                aria-controls="hero-city-options"
                aria-autocomplete="list"
                value={location}
                onChange={(event) => {
                  onLocationChange(event.target.value)
                  setShowCities(true)
                }}
                onFocus={() => setShowCities(true)}
                placeholder="City name..."
                className="w-full bg-transparent text-[16px] font-bold text-bp-primary outline-none placeholder:text-bp-primary/40 truncate"
              />
              <ChevronDown size={16} className="text-bp-primary/40 ml-2 shrink-0" />
            </div>
          </div>
          
           {showCities && (
            <div
              id="hero-city-options"
              role="listbox"
              className="absolute top-full left-0 right-0 mt-3 max-h-[300px] overflow-y-auto rounded-[24px] border border-white bg-white/95 backdrop-blur-2xl p-3 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)] ring-1 ring-bp-primary/5 z-50 custom-scrollbar text-left animate-in fade-in slide-in-from-top-2 duration-200"
            >
              {filteredCities.length > 0 ? (
                filteredCities.map((c) => (
                  <button
                    key={c}
                    type="button"
                    role="option"
                    aria-selected={location === c ? 'true' : 'false'}
                    onClick={() => {
                      onLocationChange(c)
                      setShowCities(false)
                    }}
                    className="w-full text-left px-4 py-3.5 text-[15px] font-bold text-bp-primary/80 hover:bg-white/50 hover:text-bp-accent rounded-xl transition-all"
                  >
                    {c}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-[14px] text-bp-body/60 text-left font-medium">Not found in our network</div>
              )}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="flex h-[64px] w-full shrink-0 items-center justify-center gap-2 rounded-[28px] bg-bp-primary px-8 font-bold text-white shadow-[0_18px_36px_-20px_rgba(24,49,45,0.62)] transition-all hover:bg-bp-accent hover:shadow-xl hover:shadow-bp-primary/20 active:scale-[0.98] group lg:w-auto lg:min-w-[176px]"
        >
          Find care
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </form>
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
    <section className="relative border-b border-bp-border bg-bp-surface/40 overflow-visible" aria-label="Hero">
      <div className="absolute left-1/2 top-0 h-[540px] max-w-full w-full -translate-x-1/2 bg-[radial-gradient(circle_at_center,rgba(18,179,160,0.12),transparent_70%)] overflow-hidden" />
      <div className="bp-shell relative flex min-h-[100svh] flex-col justify-center pt-2 pb-10 md:pt-4 md:pb-12 lg:pt-6 lg:pb-14">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="mx-auto max-w-4xl text-[clamp(2.4rem,7vw,5.5rem)] font-bold leading-[1.02] tracking-[-0.05em] text-bp-primary">
            Book verified physiotherapists in India for <br className="hidden md:block" />
            <span className="relative inline-flex min-h-[1.05em] items-end overflow-hidden align-baseline pb-[0.06em] text-bp-accent pr-8">
              <span key={currentIndex} className="animate-specialty inline-block">
                {focusWords[currentIndex]}.
              </span>
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-4xl text-[18px] leading-relaxed text-bp-body/80 md:text-[22px]">
            Book verified physiotherapists for home visits or in-clinic care in under 60 seconds.
          </p>

          <div className="mt-7 md:mt-8">
            <SearchBar
              condition={condition}
              location={location}
              onConditionChange={setCondition}
              onLocationChange={setLocation}
              onSubmit={handleSubmit}
            />
          </div>

          <div className="mt-7 flex flex-wrap justify-center gap-6 transition-all md:mt-8 md:gap-10">
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