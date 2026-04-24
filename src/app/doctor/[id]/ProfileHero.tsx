import Image from 'next/image'
import Link from 'next/link'
import {
  GraduationCap,
  Star,
  ChevronRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Home,
  Award,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProviderProfile } from '@/app/api/contracts/provider'

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={cn(
            i < Math.floor(rating)
              ? 'text-[#F5A623] fill-[#F5A623]'
              : i < rating
                ? 'text-[#F5A623] fill-[#F5A623] opacity-50'
                : 'text-[#E5E7EB] fill-[#E5E7EB]'
          )}
        />
      ))}
    </div>
  )
}

interface ProfileHeroProps {
  provider: ProviderProfile
  nameWithTitle: string
  initials: string
  verificationSource: string
  hasRegistration: boolean
}

export default function ProfileHero({
  provider,
  nameWithTitle,
  initials,
  verificationSource,
  hasRegistration,
}: ProfileHeroProps) {
  return (
    <>
      {/* Breadcrumbs */}
      <nav className="max-w-[1142px] mx-auto px-6 py-6 flex items-center gap-3 text-[12px] text-bp-body/60 font-bold uppercase tracking-widest">
        <Link href="/" className="hover:text-bp-primary transition-colors">Home</Link>
        <ChevronRight size={12} className="text-bp-border" strokeWidth={3} />
        <Link href="/search" className="hover:text-bp-primary transition-colors">Specialists</Link>
        <ChevronRight size={12} className="text-bp-border" strokeWidth={3} />
        <span className="text-bp-primary truncate max-w-[200px]">{nameWithTitle}</span>
      </nav>

      {/* Hero Card */}
      <div className="p-0 bg-transparent border-none shadow-none mb-10 overflow-visible">
        {/* Visual Cover Layer */}
        <div className="h-40 md:h-56 bg-bp-primary relative rounded-[var(--sq-lg)] shadow-2xl shadow-bp-primary/5 overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-bp-accent/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute left-10 bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />

          {provider.verified && (
            <div className="absolute top-6 left-6 bg-white/10 backdrop-blur-xl border border-white/20 text-white px-4 py-2 rounded-[var(--sq-lg)] flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase shadow-lg">
              <Sparkles size={14} className="text-bp-accent animate-bounce" />
              Verified Provider Profile
            </div>
          )}
        </div>

        <div className="px-4 md:px-10 -mt-20 md:-mt-24 relative z-10">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-end">
            {/* Avatar with Ring */}
            <div className="relative group">
              <div className="absolute inset-0 bg-bp-accent rounded-[var(--sq-lg)] blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-700" />
              {provider.avatar_url ? (
                <div className="relative p-1.5 bg-white rounded-[var(--sq-lg)] shadow-2xl border border-bp-border/40">
                  <Image
                    src={provider.avatar_url}
                    alt={nameWithTitle}
                    width={160}
                    height={160}
                    className="w-28 h-28 md:w-40 md:h-40 rounded-[var(--sq-lg)] object-cover bg-bp-surface border-4 border-white"
                    priority
                  />
                </div>
              ) : (
                <div className="relative p-1.5 bg-white rounded-[var(--sq-lg)] shadow-2xl border border-bp-border/40">
                  <div className="w-28 h-28 md:w-40 md:h-40 rounded-[var(--sq-lg)] bg-gradient-to-br from-bp-surface to-bp-border/20 text-bp-primary flex items-center justify-center text-[40px] md:text-[56px] font-bold border-4 border-white shrink-0 shadow-inner" aria-hidden="true">
                    {initials}
                  </div>
                </div>
              )}

              {provider.verified && (
                <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-[var(--sq-lg)] shadow-xl border border-bp-border/30 transform hover:scale-110 transition-transform">
                  <div className="w-8 h-8 rounded-[var(--sq-sm)] bg-bp-primary flex items-center justify-center text-white">
                    <CheckCircle2 size={18} strokeWidth={3} />
                  </div>
                </div>
              )}
            </div>

            {/* Info Header */}
            <div className="flex-1 pb-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-[36px] md:text-[52px] font-bold text-bp-primary tracking-tighter leading-none mb-3">
                    {nameWithTitle}
                  </h1>
                  <p className="text-bp-primary font-bold text-[16px] flex items-center gap-2">
                    <GraduationCap size={18} className="text-bp-accent" />
                    {provider.verified
                      ? `${verificationSource} Verified physiotherapist`
                      : hasRegistration
                        ? `${verificationSource} registration under review`
                        : 'Physiotherapy provider'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-bp-primary text-white font-bold rounded-[var(--sq-sm)] border border-bp-primary/10 text-[14px] shadow-lg shadow-bp-primary/10">
                  <Award size={16} strokeWidth={3} className="text-bp-accent" />
                  {provider.specialties[0]?.name ?? 'Physiotherapist'}
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-[var(--sq-sm)] border border-bp-border/40 shadow-sm">
                  <StarRating rating={provider.rating_avg ?? 0} size={15} />
                  <span className="text-[15px] font-bold text-bp-primary">{(provider.rating_avg ?? 0).toFixed(1)}</span>
                  <span className="text-[12px] text-bp-body/40 font-bold uppercase tracking-widest leading-none pt-0.5">({provider.rating_count ?? 0})</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-10 mt-12 pb-12">
          <div className="bg-[#FBFCFD] p-6 rounded-[var(--sq-lg)] border border-bp-border/10 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.05)] flex flex-col items-center lg:items-start group hover:border-bp-primary/40 hover:bg-white transition-all duration-500 hover:-translate-y-1">
            <div className="w-12 h-12 bg-white rounded-[var(--sq-lg)] flex items-center justify-center text-bp-primary mb-5 shadow-sm group-hover:bg-bp-primary group-hover:text-white transition-all duration-500"><Sparkles size={22} strokeWidth={2.5} /></div>
            <p className="text-[11px] font-bold text-bp-body/30 uppercase tracking-[0.2em] leading-none mb-2.5">Experience</p>
            <p className="text-[22px] font-bold text-bp-primary tracking-tighter leading-none">{provider.experience_years != null ? `${provider.experience_years}+` : 'N/A'} <span className="text-[14px] text-bp-body/40 tracking-normal font-bold">{provider.experience_years != null ? 'Years' : ''}</span></p>
          </div>
          <div className="bg-[#FBFCFD] p-6 rounded-[var(--sq-lg)] border border-bp-border/10 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.05)] flex flex-col items-center lg:items-start group hover:border-bp-primary/40 hover:bg-white transition-all duration-500 hover:-translate-y-1">
            <div className="w-12 h-12 bg-white rounded-[var(--sq-lg)] flex items-center justify-center text-bp-primary mb-5 shadow-sm group-hover:bg-bp-primary group-hover:text-white transition-all duration-500"><Home size={22} strokeWidth={2.5} /></div>
            <p className="text-[11px] font-bold text-bp-body/30 uppercase tracking-[0.2em] leading-none mb-2.5">Visit Types</p>
            <p className="text-[22px] font-bold text-bp-primary tracking-tighter leading-none">
              {(provider.visit_types ?? []).length > 0 ? (provider.visit_types ?? []).length : '—'}
              {' '}
              <span className="text-[14px] text-bp-body/40 tracking-normal font-bold">
                {(provider.visit_types ?? []).includes('home_visit') ? 'incl. Home' : (provider.visit_types ?? []).length === 1 ? 'Type' : 'Types'}
              </span>
            </p>
          </div>
          <div className="bg-[#FBFCFD] p-6 rounded-[var(--sq-lg)] border border-bp-border/10 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.05)] flex flex-col items-center lg:items-start group hover:border-bp-primary/40 hover:bg-white transition-all duration-500 hover:-translate-y-1">
            <div className="w-12 h-12 bg-white rounded-[var(--sq-lg)] flex items-center justify-center text-bp-primary mb-5 shadow-sm group-hover:bg-bp-primary group-hover:text-white transition-all duration-500"><Star size={22} strokeWidth={2.5} /></div>
            <p className="text-[11px] font-bold text-bp-body/30 uppercase tracking-[0.2em] leading-none mb-2.5">Rating</p>
            <p className="text-[22px] font-bold text-bp-primary tracking-tighter leading-none">
              {(provider.rating_avg ?? 0).toFixed(1)}
              {' '}
              <span className="text-[14px] text-bp-body/40 tracking-normal font-bold">
                / 5 ({provider.rating_count > 0 ? provider.rating_count : 'No'} {provider.rating_count === 1 ? 'review' : 'reviews'})
              </span>
            </p>
          </div>
          <div className="bg-[#FBFCFD] p-6 rounded-[var(--sq-lg)] border border-bp-border/10 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.05)] flex flex-col items-center lg:items-start group hover:border-bp-primary/40 hover:bg-white transition-all duration-500 hover:-translate-y-1">
            <div className="w-12 h-12 bg-emerald-50 rounded-[var(--sq-lg)] flex items-center justify-center text-emerald-600 mb-5 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500"><Clock size={22} strokeWidth={2.5} /></div>
            <p className="text-[11px] font-bold text-bp-body/30 uppercase tracking-[0.2em] leading-none mb-2.5">Availability</p>
            <p className="text-[22px] font-bold text-emerald-600 tracking-tighter leading-none">{provider.next_available_slot ? 'Slots' : 'Check'} <span className="text-[14px] opacity-60 tracking-normal font-bold">{provider.next_available_slot ? 'Open' : 'Schedule'}</span></p>
          </div>
        </div>
      </div>
    </>
  )
}
