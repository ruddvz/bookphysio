'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Sparkles, TrendingUp, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
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
  { word: 'Physiotherapists', gradient: 'from-[#00766C] to-emerald-500' },
  { word: 'Sports Physios', gradient: 'from-blue-600 to-indigo-500' },
  { word: 'Neuro Physios', gradient: 'from-amber-600 to-orange-500' },
  { word: 'Paediatric Physios', gradient: 'from-rose-600 to-pink-500' },
  { word: "Women's Health", gradient: 'from-purple-600 to-violet-500' },
];

const activities: ActivityItem[] = [
  { id: 1, doctor: "Dr. Priya Sharma", location: "Indiranagar", service: "Sports Recovery", emoji: "👩‍⚕️" },
  { id: 2, doctor: "Dr. Rahul Verma", location: "Koramangala", service: "Back Pain Rehab", emoji: "👨‍⚕️" },
  { id: 3, doctor: "Dr. Ananya Nair", location: "Whitefield", service: "Neuro Assessment", emoji: "👩‍⚕️" },
  { id: 4, doctor: "Dr. Sameer Khan", location: "Jayanagar", service: "ACL Post-Op", emoji: "👨‍⚕️" },
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
    <div className="mt-10 group relative max-w-[850px] w-full">
      <div className="absolute -inset-1 bg-gradient-to-r from-teal-100 to-emerald-100 rounded-[32px] blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
      <div className="relative bg-white rounded-[28px] border-2 border-white shadow-2xl p-2.5 md:flex items-center gap-2">
        <div className="flex-[1.5] flex items-center px-6 py-4 md:py-0 md:h-16">
          <div className="w-full">
            <label className="flex items-center gap-2 text-[11px] font-black text-teal-600 uppercase tracking-widest mb-1">
              <Search size={14} className="stroke-[3]" />
              What&apos;s hurting?
            </label>
            <input
              type="text"
              value={condition}
              onChange={(e) => onConditionChange(e.target.value)}
              placeholder="E.g. Knee pain, Back rehab"
              className="w-full bg-transparent text-[18px] font-black text-[#333333] outline-none placeholder:text-gray-300 placeholder:font-bold"
            />
          </div>
        </div>

        <div className="hidden md:block w-px h-10 bg-gray-100"></div>

        <div className="flex-1 flex items-center px-6 py-4 md:py-0 md:h-16">
          <div className="w-full">
            <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">
              <MapPin size={14} className="stroke-[3]" />
              Where?
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              placeholder="City or Postcode"
              className="w-full bg-transparent text-[18px] font-black text-[#333333] outline-none placeholder:text-gray-300 placeholder:font-bold"
            />
          </div>
        </div>

        <button
          onClick={onSubmit}
          className="w-full md:w-auto px-10 h-16 bg-[#00766C] text-white text-[17px] font-black rounded-[20px] shadow-xl shadow-teal-100 hover:bg-[#005A52] hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center justify-center gap-3 shrink-0"
        >
          Find Physios
          <Sparkles size={20} className="fill-white/20" />
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 md:gap-5 px-4">
        <div className="flex items-center gap-2 text-[13px] font-black text-gray-400 uppercase tracking-tighter">
          <TrendingUp size={14} className="text-[#FF6B35]" />
          Trending:
        </div>
        {TRENDING.map((tag) => (
          <button
            key={tag}
            onClick={() => onConditionChange(tag)}
            className="text-[14px] font-bold text-gray-500 hover:text-[#00766C] hover:bg-teal-50 px-3 py-1 rounded-full transition-colors border border-transparent hover:border-teal-100 bg-white/50"
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
      <div className="relative w-[480px] h-[560px] group">
        <div className="absolute -inset-10 bg-teal-100/30 rounded-[60px] blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
        <div className="absolute top-1/2 -right-20 w-40 h-40 bg-orange-100/30 rounded-full blur-[60px]"></div>

        {/* Main Card — gradient background instead of broken image */}
        <div className="relative h-full w-full bg-gradient-to-br from-[#E6F4F3] via-[#F0FAF9] to-[#DBEAFE] rounded-[48px] border-8 border-white shadow-[0_48px_96px_-24px_rgba(0,0,0,0.12)] overflow-hidden transition-all duration-1000 ease-out group-hover:scale-[1.01] flex items-center justify-center">
          
          {/* Decorative circles */}
          <div className="absolute -top-16 -left-16 w-48 h-48 bg-teal-200/30 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-blue-200/20 rounded-full blur-2xl"></div>
          
          {/* Centre icon */}
          <div className="relative flex flex-col items-center gap-4 z-10">
            <div className="w-28 h-28 bg-white rounded-[40px] shadow-2xl flex items-center justify-center text-6xl">
              🏥
            </div>
            <div className="px-6 py-2 bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-white">
              <p className="text-[15px] font-black text-[#00766C]">Expert Physiotherapy</p>
              <p className="text-[12px] font-bold text-gray-400 text-center">In-clinic · Home · Online</p>
            </div>
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>

          {/* Live Activity Card */}
          <div key={cur.id} className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-2xl p-5 rounded-[28px] border border-white shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-6 fade-in duration-700">
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-2xl shadow-sm">{cur.emoji}</div>
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-black text-[#333333] tracking-tight truncate">{cur.doctor} just booked</p>
              <p className="text-[12px] font-bold text-gray-400 truncate">{cur.service} · {cur.location}</p>
            </div>
            <div className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full tracking-widest shrink-0">LIVE</div>
          </div>

          {/* Float Badge 1 */}
          <div className="absolute top-8 left-8 bg-[#00766C] p-3 px-5 rounded-[20px] shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-left-8 duration-1000 delay-300">
            <CheckCircle2 size={16} className="text-white" />
            <p className="text-[14px] font-black text-white tracking-tight">Verified Practitioners</p>
          </div>

          {/* Float Badge 2 - Rating */}
          <div className="absolute top-24 right-8 bg-white/90 backdrop-blur-md p-3 px-5 rounded-[20px] shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-right-8 duration-1000 delay-700">
            <div className="flex -space-x-2">
              {[1,2,3].map(i => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-gray-100 shadow-sm overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+10}`} alt="User" />
                </div>
              ))}
            </div>
            <div>
              <p className="text-[13px] font-black text-[#333333] leading-none mb-0.5">4.9/5 Average</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">by 12k+ Patients</p>
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
    <section className="relative overflow-hidden w-full bg-[#FCFDFD]">
      {/* Background Ornaments */}
      <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-teal-50/50 rounded-full blur-[120px] opacity-40"></div>
      <div className="absolute top-[60%] -right-[5%] w-[30%] h-[30%] bg-orange-50/40 rounded-full blur-[100px] opacity-30"></div>

      <div className="max-w-[1240px] mx-auto px-6 md:px-[60px] pt-20 md:pt-28 pb-16 md:pb-24 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

          {/* Text content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white border border-gray-100 shadow-sm rounded-2xl text-[13px] font-black uppercase tracking-[0.15em] text-[#00766C] mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
              <ShieldCheck size={16} className="text-[#059669]" strokeWidth={3} />
              Verify. Book. Recover.
              <div className="h-4 w-px bg-gray-100 ml-2"></div>
              <Zap size={14} className="fill-[#FF6B35] text-[#FF6B35] animate-pulse ml-1" />
              <span className="text-gray-400">Trusted in 12 Cities</span>
            </div>

            {/* Heading — fixed height span prevents layout shift on word swap */}
            <h1 className="text-[52px] md:text-[80px] lg:text-[88px] font-black text-[#333333] leading-[1] tracking-tighter mb-8 text-balance">
              Find the Best<br />
              <span
                className={cn(
                  'inline-block bg-gradient-to-r bg-clip-text text-transparent transition-opacity duration-300',
                  currentSpecialty.gradient,
                  isAnimating ? 'opacity-100' : 'opacity-0'
                )}
                style={{ minHeight: '1.1em', display: 'inline-block' }}
              >
                {currentSpecialty.word}
              </span>
              <br />
              near you.
            </h1>

            <p className="text-[18px] md:text-[22px] font-bold text-gray-500 max-w-[580px] mx-auto lg:mx-0 leading-relaxed mb-8 text-balance">
              Skip the waiting room. Connect with India&apos;s highest-verified physiotherapy experts for in-clinic or home-visit care in minutes.
            </p>

            <SearchBar
              condition={condition}
              location={location}
              onConditionChange={setCondition}
              onLocationChange={setLocation}
              onSubmit={handleSubmit}
            />

            <div className="mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-10">
              <div className="flex flex-col gap-1">
                <span className="text-[24px] font-black text-[#333333] tracking-tighter">5,000+</span>
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Experts</span>
              </div>
              <div className="h-10 w-px bg-gray-100 hidden sm:block"></div>
              <div className="flex flex-col gap-1">
                <span className="text-[24px] font-black text-[#333333] tracking-tighter">1M+</span>
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Appointments</span>
              </div>
              <div className="h-10 w-px bg-gray-100 hidden sm:block"></div>
              <div className="flex flex-col gap-1">
                <span className="text-[24px] font-black text-[#333333] tracking-tighter">4.9/5</span>
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">App Rating</span>
              </div>
            </div>
          </div>

          {/* Illustration Column */}
          <div className="flex-1 w-full lg:w-auto">
            <HeroActivity />
          </div>
        </div>
      </div>
    </section>
  );
}
