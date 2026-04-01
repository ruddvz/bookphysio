'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Sparkles, TrendingUp, CheckCircle2, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Specialty {
  word: string;
  gradient: string;
}

interface ActivityItem {
  id: number;
  doctor: string;
  location: string;
  service: string;
  emoji: string;
}

const specialties: Specialty[] = [
  { word: 'Physiotherapists', gradient: 'from-[#00766C] to-emerald-400' },
  { word: 'Sports Physios', gradient: 'from-teal-600 to-emerald-500' },
  { word: 'Neuro Physios', gradient: 'from-blue-700 to-cyan-500' },
  { word: 'Paediatric Physios', gradient: 'from-emerald-600 to-teal-400' },
  { word: "Women's Health", gradient: 'from-[#005A52] to-teal-300' },
];

const activities: ActivityItem[] = [
  { id: 1, doctor: "Dr. Priya Sharma", location: "Mumbai", service: "Sports Recovery", emoji: "👩‍⚕️" },
  { id: 2, doctor: "Dr. Rahul Verma", location: "Delhi", service: "Back Pain Rehab", emoji: "👨‍⚕️" },
  { id: 3, doctor: "Dr. Ananya Nair", location: "Bangalore", service: "Neuro Assessment", emoji: "👩‍⚕️" },
  { id: 4, doctor: "Dr. Sameer Khan", location: "Pune", service: "ACL Post-Op", emoji: "👨‍⚕️" },
];

const TRENDING = ['Back Pain', 'ACL Rehab', 'Sports Massage', 'Posture Fix'];
const CYCLE_INTERVAL_MS = 3000;
const REFLOW_DELAY_MS = 80;

interface SearchBarProps {
  condition: string;
  location: string;
  onConditionChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSubmit: () => void;
}

function SearchBar({ condition, location, onConditionChange, onLocationChange, onSubmit }: SearchBarProps) {
  return (
    <div className="mt-12 group relative max-w-[850px] w-full animate-in zoom-in-95 duration-700 delay-300 fill-mode-both">
      <div className="absolute -inset-1.5 bg-[#00766C]/5 rounded-[36px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative bg-white rounded-[32px] border border-gray-100 shadow-2xl p-3 md:flex items-center gap-2">
        <div className="flex-[1.5] flex items-center px-6 py-4 md:py-0 md:h-16">
          <div className="w-full">
            <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1.5">
              <Search size={14} className="text-[#00766C]" />
              Symptom / Condition
            </label>
            <input
              type="text"
              value={condition}
              onChange={(e) => onConditionChange(e.target.value)}
              placeholder="E.g. Knee pain, Back rehab"
              className="w-full bg-transparent text-[17px] font-bold text-[#333333] outline-none placeholder:text-gray-200"
            />
          </div>
        </div>

        <div className="hidden md:block w-px h-10 bg-gray-100"></div>

        <div className="flex-1 flex items-center px-6 py-4 md:py-0 md:h-16">
          <div className="w-full">
            <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1.5">
              <MapPin size={14} className="text-[#00766C]" />
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              placeholder="City or Postcode"
              className="w-full bg-transparent text-[17px] font-bold text-[#333333] outline-none placeholder:text-gray-200"
            />
          </div>
        </div>

        <button
          onClick={onSubmit}
          className="w-full md:w-auto px-10 h-16 bg-[#333333] text-white text-[15px] font-black rounded-2xl hover:bg-[#00766C] transition-all flex items-center justify-center gap-3 shrink-0 active:scale-95 shadow-xl shadow-gray-200"
        >
          Find Experts
          <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
            <Sparkles size={14} className="fill-white/20" />
          </div>
        </button>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4 px-4 overflow-hidden">
        <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest whitespace-nowrap">Popular:</span>
        {TRENDING.map((tag) => (
          <button
            key={tag}
            onClick={() => onConditionChange(tag)}
            className="text-[13px] font-bold text-gray-500 hover:text-[#00766C] px-4 py-1.5 rounded-full transition-all border border-gray-100 hover:border-[#00766C]/20 bg-white shadow-sm"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}

function HeroActivity() {
  const [activityIndex, setActivityIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivityIndex((prev) => (prev + 1) % activities.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const cur = activities[activityIndex];

  return (
    <div className="hidden lg:flex flex-col items-center gap-8 relative z-20">
      <div className="relative w-[520px] h-[600px] group">
        <div className="absolute -inset-20 bg-teal-50/20 rounded-[80px] blur-[120px] opacity-40 group-hover:opacity-60 transition-opacity duration-1000"></div>

        {/* Main Card — refined shadow and roundedness */}
        <div className="relative h-full w-full bg-white rounded-[64px] border border-gray-100 shadow-[0_64px_128px_-32px_rgba(0,0,0,0.08)] overflow-hidden transition-all duration-1000 ease-out flex items-center justify-center">
          
          <div className="absolute inset-0 bg-gradient-to-br from-teal-50/30 via-white to-blue-50/20"></div>
          
          {/* Centre icon with premium glass effect */}
          <div className="relative flex flex-col items-center gap-6 z-10">
            <div className="w-32 h-32 bg-white rounded-[48px] shadow-2xl flex items-center justify-center text-6xl animate-pulse duration-[4000ms]">
               <ShieldCheck size={64} className="text-[#00766C]" strokeWidth={1} />
            </div>
            <div className="px-8 py-3 bg-white/90 backdrop-blur-xl rounded-[24px] shadow-xl border border-white">
              <p className="text-[16px] font-black text-[#333333] tracking-tighter">Verified Clinical Care</p>
              <div className="flex items-center justify-center gap-2 mt-1">
                 <div className="w-2 h-2 rounded-full bg-emerald-500" />
                 <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Registration Active</p>
              </div>
            </div>
          </div>

          {/* Live Activity Card - Refined */}
          <div key={cur.id} className="absolute bottom-10 left-10 right-10 bg-[#333333] p-6 rounded-[32px] shadow-2xl flex items-center gap-5 animate-in slide-in-from-bottom-12 fade-in duration-1000">
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-3xl shadow-inner border border-white/5">{cur.emoji}</div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-[#333333] rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-black text-white tracking-tight truncate">{cur.doctor} just booked</p>
              <p className="text-[12px] font-bold text-gray-400 truncate tracking-wide">{cur.service} · {cur.location}</p>
            </div>
            <div className="w-10 h-10 border border-white/10 rounded-2xl flex items-center justify-center text-white/40">
               <ArrowRight size={20} />
            </div>
          </div>

          {/* Float Badge: Quality */}
          <div className="absolute top-10 right-10 bg-white/90 backdrop-blur-md p-4 px-6 rounded-[28px] shadow-2xl border border-white flex items-center gap-4">
            <div className="flex -space-x-2.5">
              {[1,2,3].map(i => (
                <div key={i} className="w-9 h-9 rounded-full border-2 border-white bg-gray-100 shadow-lg overflow-hidden ring-4 ring-teal-50/30">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=physio${i}`} alt="User" />
                </div>
              ))}
            </div>
            <div>
              <p className="text-[14px] font-black text-[#333333] leading-none mb-1 tracking-tighter">4.9/5 Rating</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.14em] leading-none">by 12k+ Sessions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HeroSection() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [condition, setCondition] = useState('');
  const [location, setLocation] = useState('');

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
    <section className="relative overflow-hidden w-full bg-[#FCFDFD] min-h-[90vh] flex items-center">
      {/* Refined Background Elements */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent"></div>
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-teal-50/40 rounded-full blur-[100px] -z-10"></div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-20 pb-24 relative z-10 w-full">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-8">

          {/* Text content */}
          <div className="max-w-[800px] text-center lg:text-left flex flex-col items-center lg:items-start">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-teal-50 border border-teal-100/50 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-[#00766C] mb-10 animate-in fade-in slide-in-from-top-6 duration-1000">
              <Zap size={14} className="fill-[#00766C]" strokeWidth={3} />
              India&apos;s Premium Recovery Network
            </div>

            <h1 className="text-[56px] md:text-[88px] lg:text-[96px] font-black text-[#333333] leading-[0.88] tracking-[-0.06em] mb-10">
              Find Expert<br />
              <div className="h-[1.1em] overflow-hidden flex justify-center lg:justify-start items-center">
                <span
                  key={currentSpecialty.word}
                  className={cn(
                    'bg-gradient-to-r bg-clip-text text-transparent transition-all duration-700 animate-in slide-in-from-bottom-8 fade-in',
                    currentSpecialty.gradient
                  )}
                >
                  {currentSpecialty.word}
                </span>
              </div>
              at home.
            </h1>

            <p className="text-[18px] md:text-[21px] font-bold text-gray-400 max-w-[620px] leading-relaxed mb-12 text-balance lg:mr-auto">
              Skip the clinic waiting list. Connect with the country&apos;s most verified physiotherapy specialists for in-person or online recovery in minutes.
            </p>

            <SearchBar
              condition={condition}
              location={location}
              onConditionChange={setCondition}
              onLocationChange={setLocation}
              onSubmit={handleSubmit}
            />

            <div className="mt-20 flex flex-wrap items-center justify-center lg:justify-start gap-12 md:gap-16 opacity-60">
              <div className="flex flex-col gap-1.5">
                <span className="text-[32px] font-black text-[#333333] tracking-tight">5,000+</span>
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Verify Experts</span>
              </div>
              <div className="w-px h-10 bg-gray-100 hidden sm:block"></div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[32px] font-black text-[#333333] tracking-tight">1M+</span>
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Bookings</span>
              </div>
              <div className="w-px h-10 bg-gray-100 hidden sm:block"></div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[32px] font-black text-[#333333] tracking-tight">4.9/5</span>
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Patient Rating</span>
              </div>
            </div>
          </div>

          {/* Right: Immersive Card */}
          <HeroActivity />
        </div>
      </div>
    </section>
  );
}

