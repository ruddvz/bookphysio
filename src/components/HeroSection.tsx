'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
    <div
      className="flex items-center mt-8 max-w-[800px] rounded-[8px] border border-[#E5E5E5] bg-white"
      style={{
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        height: '64px',
      }}
    >
      {/* Condition field */}
      <div className="flex flex-col justify-center flex-[2] px-4 h-full border-r border-[#E5E5E5] min-w-0">
        <label
          htmlFor="search-condition"
          className="block text-[12px] font-medium text-[#666666] mb-1 whitespace-nowrap"
        >
          Search
        </label>
        <input
          id="search-condition"
          type="text"
          value={condition}
          onChange={(e) => onConditionChange(e.target.value)}
          placeholder="Condition, injury or physio name"
          className="text-[16px] text-[#333333] bg-transparent border-none outline-none placeholder:text-[#999999] truncate"
        />
      </div>

      {/* Location field */}
      <div className="flex flex-col justify-center flex-[1.5] px-4 h-full border-r border-[#E5E5E5] min-w-0">
        <label
          htmlFor="search-location"
          className="block text-[12px] font-medium text-[#666666] mb-1"
        >
          Location
        </label>
        <input
          id="search-location"
          type="text"
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          placeholder="Mumbai, MH"
          className="text-[16px] text-[#333333] bg-transparent border-none outline-none placeholder:text-[#999999]"
        />
      </div>

      {/* Submit button */}
      <button
        type="button"
        onClick={onSubmit}
        className="flex items-center gap-2 px-6 h-full rounded-r-[8px] text-[16px] font-semibold text-white bg-[#00766C] border-none cursor-pointer transition-colors duration-150 hover:bg-[#005A52] shrink-0"
        aria-label="Find Physio"
      >
        <span aria-hidden="true">🔍</span>
        Find Physio
      </button>
    </div>
  );
}

function HeroIllustration() {
  return (
    <div
      className="hidden md:flex flex-col gap-3 ml-8 mt-2"
      aria-hidden="true"
    >
      {/* Doctor card */}
      <div className="bg-white rounded-2xl shadow-lg p-5 flex items-center gap-4 w-[280px]">
        <div className="w-14 h-14 rounded-full bg-[#E6F4F3] flex items-center justify-center text-2xl shrink-0">
          👨‍⚕️
        </div>
        <div>
          <p className="text-[14px] font-bold text-[#333333]">Dr. Priya Sharma</p>
          <p className="text-[12px] text-[#666666]">Sports Physiotherapist</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-yellow-400 text-[12px]">★★★★★</span>
            <span className="text-[11px] text-[#666666]">4.9 (120 reviews)</span>
          </div>
        </div>
      </div>

      {/* Booking confirmation card */}
      <div className="bg-[#00766C] rounded-2xl shadow-lg p-4 w-[260px] ml-auto">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg">✅</div>
          <p className="text-white text-[13px] font-semibold">Appointment Confirmed</p>
        </div>
        <p className="text-white/80 text-[12px]">Tomorrow, 10:30 AM · In-clinic</p>
        <p className="text-white/80 text-[12px]">Dr. Priya Sharma · ₹800</p>
      </div>

      {/* Stats pill */}
      <div className="bg-white rounded-full shadow-md px-5 py-2.5 flex items-center gap-3 w-fit">
        <span className="text-xl">🏥</span>
        <div>
          <p className="text-[13px] font-bold text-[#333333]">2,000+ Physios</p>
          <p className="text-[11px] text-[#666666]">Across 50+ cities in India</p>
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
      // Remove the animation class to reset
      setIsAnimating(false);

      // Wait one tick for the DOM to reflow, then re-apply class + update word
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
      className="relative overflow-hidden w-full"
      style={{
        backgroundColor: currentSpecialty.bg,
        transition: 'background-color 0.5s ease',
      }}
    >
      <div
        className="container-bp"
        style={{ paddingTop: '70px', paddingBottom: '120px' }}
      >
        <div className="flex flex-row items-start">
          {/* Text column — 55% */}
          <div className="flex-[55] min-w-0">
            <h1
              style={{
                fontSize: '44px',
                lineHeight: '60px',
                fontWeight: 600,
                color: '#333333',
                maxWidth: '560px',
              }}
              className="text-[32px] md:text-[44px] leading-[44px] md:leading-[60px]"
            >
              Book local{' '}
              <span
                className={isAnimating ? 'animate-specialty' : ''}
                style={{
                  color: '#00766C',
                  fontStyle: 'italic',
                  display: 'inline-block',
                }}
              >
                {currentSpecialty.word}
              </span>
              <br />
              near you — book in minutes
            </h1>

            <SearchBar
              condition={condition}
              location={location}
              onConditionChange={setCondition}
              onLocationChange={setLocation}
              onSubmit={handleSubmit}
            />
          </div>

          {/* Illustration column — 45% (desktop only) */}
          <div className="flex-[45] flex items-center justify-center pt-4">
            <HeroIllustration />
          </div>
        </div>
      </div>
    </section>
  );
}
