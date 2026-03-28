'use client';

import { useState, useEffect } from 'react';

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
      className="
        hidden md:flex
        absolute top-0 right-0
        w-[300px] h-[300px]
        rounded-2xl bg-[#00766C] opacity-20
        items-center justify-center
        text-6xl select-none
      "
      aria-hidden="true"
    >
      🤲
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function HeroSection() {
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
    // Navigation / search logic will be wired up by the backend agent
    const params = new URLSearchParams({ condition, location });
    window.location.href = `/search?${params.toString()}`;
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
          <div className="relative flex-[45]">
            <HeroIllustration />
          </div>
        </div>
      </div>
    </section>
  );
}
