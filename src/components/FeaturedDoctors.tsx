'use client'

import Image from 'next/image'
import Link from 'next/link'
import useSWR from 'swr'
import { Star } from 'lucide-react'
import type { ProviderCard } from '@/app/api/contracts/provider'
import type { SearchResponse } from '@/app/api/contracts/search'
import { getProviderDisplayName, getProviderInitials } from '@/lib/providers/display-name'

const FEATURED_PROVIDERS_URL = '/api/providers?limit=4'
const FEATURED_PROVIDER_COUNT = 4

async function fetcher(url: string): Promise<SearchResponse> {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch featured providers')
  return res.json() as Promise<SearchResponse>
}

function FeaturedSkeleton() {
  return (
    <div
      data-testid="featured-skeleton"
      className="animate-pulse bg-white rounded-[var(--sq-lg)] border border-bp-border p-4 flex items-center gap-3"
    >
      <div className="w-[52px] h-[52px] rounded-[var(--sq-sm)] bg-bp-border/40 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-bp-border/40 rounded-full w-3/4" />
        <div className="h-2.5 bg-bp-border/30 rounded-full w-1/2" />
        <div className="h-2.5 bg-bp-border/20 rounded-full w-2/5" />
      </div>
    </div>
  )
}

interface FeaturedCardProps {
  provider: ProviderCard
}

function FeaturedCard({ provider }: FeaturedCardProps) {
  const initials = getProviderInitials(provider.full_name)
  const nameWithTitle = getProviderDisplayName(provider)
  const specialty = provider.specialties[0]?.name ?? 'Physiotherapist'

  return (
    <Link
      href={`/doctor/${provider.id}`}
      className="bg-white rounded-[var(--sq-lg)] border border-bp-border p-4 flex items-center gap-3 hover:border-bp-accent/30 hover:shadow-md transition-all duration-200 group"
    >
      <div className="relative w-[52px] h-[52px] shrink-0">
        {provider.avatar_url ? (
          <div className="relative w-[52px] h-[52px] rounded-[var(--sq-sm)] overflow-hidden">
            <Image
              src={provider.avatar_url}
              alt={nameWithTitle}
              fill
              className="object-cover"
              sizes="52px"
            />
          </div>
        ) : (
          <div className="w-[52px] h-[52px] rounded-[var(--sq-sm)] bg-gradient-to-br from-bp-accent to-bp-primary flex items-center justify-center text-white text-[18px] font-bold">
            {initials}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-bold text-bp-primary truncate group-hover:text-bp-accent transition-colors">
          {nameWithTitle}
        </p>
        <p className="text-[11px] font-bold text-bp-accent mt-0.5 truncate">{specialty}</p>
        <div className="flex items-center gap-1 mt-1">
          <Star size={11} className="fill-[#F59E0B] text-[#F59E0B]" />
          <span className="text-[11px] font-bold text-bp-primary">
            {(provider.rating_avg ?? 0).toFixed(1)}
          </span>
          <span className="text-[10px] text-bp-body/40 font-medium">
            ({provider.rating_count ?? 0})
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function FeaturedDoctors() {
  const { data, error, isLoading } = useSWR<SearchResponse>(
    FEATURED_PROVIDERS_URL,
    fetcher,
    { revalidateOnFocus: false }
  )

  const providers = (data?.providers ?? [])
    .slice()
    .sort((a, b) => (b.rating_avg ?? 0) - (a.rating_avg ?? 0))
    .slice(0, FEATURED_PROVIDER_COUNT)

  if (error || (!isLoading && providers.length === 0)) {
    return null
  }

  return (
    <div className="mt-4 rounded-[28px] border border-bp-border bg-bp-surface/40 p-6">
      <div className="flex items-center gap-3 mb-4">
        <Star size={14} className="fill-[#F59E0B] text-[#F59E0B]" />
        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-bp-body/40">
          Top-rated on BookPhysio
        </h2>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {isLoading
          ? Array.from({ length: FEATURED_PROVIDER_COUNT }).map((_, index) => (
              <FeaturedSkeleton key={index} />
            ))
          : providers.map((p) => <FeaturedCard key={p.id} provider={p} />)}
      </div>
    </div>
  )
}
