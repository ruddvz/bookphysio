'use client'

import Image from 'next/image'
import Link from 'next/link'
import { getProviderInitials } from '@/lib/providers/display-name'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/dashboard/primitives/Badge'
import { MapPin, Star } from 'lucide-react'
import type { Doctor } from '@/components/DoctorCard'

export function DoctorCardCompact({
  doctor,
  className,
}: {
  doctor: Doctor
  className?: string
}) {
  const initials = getProviderInitials(doctor.name)
  const specialties = doctor.credentials
    ? doctor.credentials.split(',').map((s) => s.trim()).filter(Boolean)
    : []
  const specialtyChips = [doctor.specialty, ...specialties].filter((s, i, a) => a.indexOf(s) === i).slice(0, 3)

  const profileHref = doctor.profileHref ?? `/doctor/${doctor.id}`

  return (
    <article
      role="article"
      className={cn(
        'mx-auto flex max-h-[85dvh] w-full max-w-md flex-col justify-center gap-4 rounded-[var(--sq-lg)] border border-[#E5E7EB] bg-white p-5 shadow-sm',
        className,
      )}
    >
      <div className="flex gap-4">
        {doctor.avatarUrl ? (
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[var(--sq-lg)]">
            <Image src={doctor.avatarUrl} alt={doctor.name} fill className="object-cover" sizes="80px" />
          </div>
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[var(--sq-lg)] bg-[#E6F4F3] text-[22px] font-semibold text-[#00766C]">
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-[18px] font-bold leading-tight text-[#00766C]">{doctor.name}</h3>
          <div className="mt-1 inline-flex items-center gap-1 rounded-full border border-[#E5E7EB] bg-white px-2 py-0.5 text-[12px] font-bold text-[#333]">
            <Star size={12} className="fill-[#F59E0B] text-[#F59E0B]" />
            {doctor.rating.toFixed(1)}
            <span className="font-medium text-[#666]">({doctor.reviewCount})</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="soft" role="provider" tone={2}>
          <MapPin size={10} />
          {doctor.location}
        </Badge>
        {doctor.distance ? (
          <Badge variant="soft" role="provider" tone={2}>
            {doctor.distance}
          </Badge>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {specialtyChips.map((label) => (
          <span
            key={label}
            className="rounded-full border border-[#E5E7EB] bg-[#F7F8F9] px-2.5 py-1 text-[11px] font-semibold text-[#333]"
          >
            {label}
          </span>
        ))}
      </div>

      <p className="text-[22px] font-bold text-[#00766C]">
        ₹{doctor.fee}
        <span className="text-[12px] font-medium text-[#666]"> / consult</span>
      </p>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Link
          href={profileHref}
          className="inline-flex flex-1 items-center justify-center rounded-full bg-[#00766C] px-5 py-2.5 text-center text-[14px] font-bold text-white transition-colors hover:bg-[#005A52]"
        >
          Book
        </Link>
        <Link
          href={profileHref}
          className="inline-flex flex-1 items-center justify-center rounded-full border border-[#E5E7EB] bg-white px-5 py-2.5 text-center text-[14px] font-semibold text-[#333] hover:border-[#00766C]/40"
        >
          View profile
        </Link>
      </div>
    </article>
  )
}
