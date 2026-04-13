'use client'

import Image from 'next/image'
import Link from 'next/link'
import useSWR from 'swr'
import { Star, ArrowRight, MapPin } from 'lucide-react'
import type { ProviderCard } from '@/app/api/contracts/provider'
import type { SearchResponse } from '@/app/api/contracts/search'
import { getProviderDisplayName, getProviderInitials } from '@/lib/providers/display-name'

interface SimilarProvidersProps {
  currentProviderId: string
  specialty: string
  city: string | null
}

async function fetcher(url: string): Promise<SearchResponse> {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json() as Promise<SearchResponse>
}

export default function SimilarProviders({ currentProviderId, specialty, city }: SimilarProvidersProps) {
  const params = new URLSearchParams({ limit: '5' })
  if (specialty) params.set('specialty_id', specialty)
  if (city) params.set('city', city)

  const { data, isLoading } = useSWR<SearchResponse>(
    `/api/providers?${params.toString()}`,
    fetcher,
    { revalidateOnFocus: false },
  )

  const providers = (data?.providers ?? [])
    .filter((p) => p.id !== currentProviderId)
    .slice(0, 4)

  if (!isLoading && providers.length === 0) return null

  return (
    <section className="mt-12" aria-label="Similar physiotherapists">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[20px] font-bold text-bp-primary tracking-tight">
            Similar physiotherapists{city ? ` in ${city}` : ''}
          </h2>
          <p className="text-[13px] text-bp-body/60 mt-1">
            Other {specialty.toLowerCase()} specialists you might consider
          </p>
        </div>
        <Link
          href={`/search?specialty=${encodeURIComponent(specialty)}${city ? `&location=${encodeURIComponent(city)}` : ''}`}
          className="text-[13px] font-semibold text-bp-accent hover:text-bp-primary flex items-center gap-1 transition-colors"
        >
          View all
          <ArrowRight size={13} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-bp-border bg-white p-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-bp-border/40 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-bp-border/40 rounded-full w-3/4" />
                  <div className="h-3 bg-bp-border/30 rounded-full w-1/2" />
                </div>
              </div>
            ))
          : providers.map((provider) => (
              <SimilarCard key={provider.id} provider={provider} />
            ))}
      </div>
    </section>
  )
}

function SimilarCard({ provider }: { provider: ProviderCard }) {
  const name = getProviderDisplayName(provider)
  const initials = getProviderInitials(provider.full_name)
  const specialty = provider.specialties[0]?.name ?? 'Physiotherapist'

  return (
    <Link
      href={`/doctor/${provider.id}`}
      className="flex items-center gap-4 rounded-2xl border border-bp-border bg-white p-4 hover:border-bp-accent/30 hover:shadow-md transition-all group"
    >
      <div className="relative w-14 h-14 shrink-0">
        {provider.avatar_url ? (
          <div className="relative w-14 h-14 rounded-xl overflow-hidden">
            <Image src={provider.avatar_url} alt={name} fill className="object-cover" sizes="56px" />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-bp-accent to-bp-primary flex items-center justify-center text-white text-[18px] font-bold">
            {initials}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-bold text-bp-primary truncate group-hover:text-bp-accent transition-colors">
          {name}
        </p>
        <p className="text-[11px] font-bold text-bp-accent mt-0.5 truncate">{specialty}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center gap-1">
            <Star size={11} className="fill-[#F59E0B] text-[#F59E0B]" />
            <span className="text-[11px] font-bold text-bp-primary">
              {(provider.rating_avg ?? 0).toFixed(1)}
            </span>
            <span className="text-[10px] text-bp-body/40">({provider.rating_count ?? 0})</span>
          </div>
          {provider.city && (
            <span className="flex items-center gap-0.5 text-[10px] text-bp-body/50">
              <MapPin size={9} />
              {provider.city}
            </span>
          )}
        </div>
      </div>

      <div className="text-right shrink-0">
        <p className="text-[16px] font-bold text-bp-primary">₹{provider.consultation_fee_inr ?? 0}</p>
        <p className="text-[10px] text-bp-body/40 font-medium mt-0.5">per session</p>
      </div>
    </Link>
  )
}
