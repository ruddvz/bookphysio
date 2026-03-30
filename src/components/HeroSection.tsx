'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Specialty {
  word: string;
  bg: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const specialties: Specialty[] = [
  { word: 'physiotherapists', bg: '#E6F4F3' },
  { word: 'sports physios', bg: '#DCE9FD' },
  { word: 'neuro physios', bg: '#FFF0BB' },
  { word: 'paediatric physios', bg: '#FFC794' },
  { word: "women's health physios", bg: '#F9F8F7' },
];

const CYCLE_INTERVAL_MS = 3500;
const REFLOW_DELAY_MS = 50;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface SearchBarProps {
  condition: string;
  location: string;
  onConditionChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSubmit: () => void;
}

function SearchBar({
  condition,
  location,
  onConditionChange,
  onLocationChange,
  onSubmit,
}: SearchBarProps) {
  return (
    <div className="mt-8 max-w-[800px] w-full bg-white rounded-[12px] md:rounded-[8px] border border-[#E5E5E5] shadow-lg md:flex md:items-center overflow-hidden">
      {/* Condition field */}
      <div className="flex items-center px-4 py-3 md:py-0 md:h-16 flex-[2] border-b md:border-b-0 md:border-r border-[#E5E5E5]">
        <div className="flex flex-col justify-center w-full">
          <label
            htmlFor="search-condition"
            className="flex items-center gap-1.5 text-[11px] md:text-[12px] font-bold text-[#666666] uppercase tracking-wider mb-0.5"
          >
            <Search className="w-3 h-3 text-[#00766C]" />
            Search
          </label>
          <input
            id="search-condition"
            type="text"
            value={condition}
            onChange={(e) => onConditionChange(e.target.value)}
            placeholder="Injury or name"
            className="text-[16px] text-[#333333] bg-transparent border-none outline-none placeholder:text-[#999999] w-full font-medium"
          />
        </div>
      </div>

      {/* Location field */}
      <div className="flex items-center px-4 py-3 md:py-0 md:h-16 flex-[1.5] border-b md:border-b-0 md:border-r border-[#E5E5E5]">
        <div className="flex flex-col justify-center w-full">
          <label
            htmlFor="search-location"
            className="flex items-center gap-1.5 text-[11px] md:text-[12px] font-bold text-[#666666] uppercase tracking-wider mb-0.5"
          >
            <MapPin className="w-3 h-3 text-[#00766C]" />
            Location
          </label>
          <input
            id="search-location"
            type="text"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            placeholder="City or Area"
            className="text-[16px] text-[#333333] bg-transparent border-none outline-none placeholder:text-[#999999] w-full font-medium"
          />
        </div>
      </div>

      {/* Submit button */}
      <button
        type="button"
        onClick={onSubmit}
        className="w-full md:w-auto h-14 md:h-16 px-8 bg-[#00766C] text-white text-[16px] font-bold hover:bg-[#005A52] transition-colors flex items-center justify-center shrink-0 gap-2"
        aria-label="Find Physio"
      >
        Find Physio
      </button>
    </div>
  );
}

function HeroIllustration() {
  return (
    <div className="hidden lg:flex flex-col gap-6" aria-hidden="true">
      {/* Doctor card */}
      <div className="bg-white rounded-[24px] shadow-xl p-6 flex items-center gap-5 w-[320px] transition-transform hover:scale-105 duration-300">
        <div className="w-16 h-16 rounded-full bg-[#E6F4F3] flex items-center justify-center text-3xl shrink-0">
          👨‍⚕️
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[16px] font-bold text-[#333333] truncate">Dr. Priya Sharma</p>
          <p className="text-[14px] text-[#666666]">Sports Physiotherapist</p>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex text-yellow-400 text-[12px]">★★★★★</div>
            <span className="text-[12px] font-semibold text-[#666666]">4.9 (187)</span>
          </div>
        </div>
      </div>

      {/* Booking confirmation card */}
      <div className="bg-[#00766C] rounded-[20px] shadow-2xl p-5 w-[280px] ml-auto animate-in slide-in-from-right-4 duration-500">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">✅</div>
          <p className="text-white text-[15px] font-bold">Confirmed!</p>
        </div>
        <p className="text-white/90 text-[13px] font-medium">Tomorrow, 10:30 AM</p>
        <p className="text-white/70 text-[12px]">In-clinic · ₹800</p>
      </div>

      {/* Stats pill */}
      <div className="bg-white rounded-full shadow-lg px-6 py-4 flex items-center gap-4 w-fit -ml-10">
        <div className="w-10 h-10 rounded-full bg-[#DCE9FD] flex items-center justify-center text-xl">🏥</div>
        <div>
          <p className="text-[14px] font-bold text-[#333333]">2,000+ Physios</p>
          <p className="text-[12px] text-[#666666]">Across 50+ Indian cities</p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function HeroSection() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [condition, setCondition] = useState('');
  const [location, setLocation] = useState('');

  // Cycle through specialties
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(false);
      const timeout = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % specialties.length);
        setIsAnimating(true);
      }, REFLOW_DELAY_MS);
      return () => clearTimeout(timeout);
    }, CYCLE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const currentSpecialty = specialties[currentIndex];

  const handleSubmit = () => {
    const params = new URLSearchParams({ condition, location });
    router.push(`/search?${params.toString()}`);
  };

  return (
    <section
      className="relative overflow-hidden w-full transition-colors duration-700"
      style={{ backgroundColor: currentSpecialty.bg }}
    >
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/30 rounded-full blur-3xl -mr-64 -mt-64 translate-x-1/2"></div>
      
      <div className="max-w-[1142px] mx-auto px-6 md:px-[60px] pt-12 md:pt-20 pb-20 md:pb-32 relative z-10 text-center md:text-left">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12">
          
          {/* Text content */}
          <div className="flex-1 lg:max-w-[600px]">
            <div className="inline-block px-4 py-1.5 bg-[#00766C]/10 text-[#00766C] rounded-full text-[13px] font-bold uppercase tracking-widest mb-6">
               Book Verification Expert
            </div>
            
            <h1 className="text-[36px] md:text-[56px] lg:text-[64px] font-bold text-[#333333] leading-[1.1] tracking-tight mb-6">
              Book local{' '}
              <span
                className={cn(
                  "inline-block text-[#00766C] italic transition-all duration-300",
                  isAnimating ? "animate-specialty opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}
              >
                {currentSpecialty.word}
              </span>
              <br className="hidden md:block" />
              near you — in minutes
            </h1>
            
            <p className="text-[18px] md:text-[20px] text-[#555555] max-w-[500px] mx-auto md:mx-0 leading-relaxed mb-4">
              Find verified physiotherapists for in-clinic, home visits, and online sessions.
            </p>

            <SearchBar
              condition={condition}
              location={location}
              onConditionChange={setCondition}
              onLocationChange={setLocation}
              onSubmit={handleSubmit}
            />
            
            <div className="mt-8 flex flex-wrap items-center justify-center md:justify-start gap-6 text-[14px] text-[#666666]">
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#00766C]"></div>
                 Verified Credentials
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#00766C]"></div>
                 Transparent Pricing
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#00766C]"></div>
                 Same-day Availability
               </div>
            </div>
          </div>

          {/* Illustration Column */}
          <div className="flex-1 flex justify-center lg:justify-end">
            <HeroIllustration />
          </div>
        </div>
      </div>
    </section>
  );
}
