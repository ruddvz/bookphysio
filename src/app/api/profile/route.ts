import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDemoProfileById, getDemoSessionFromCookies } from '@/lib/demo/session'
import { mutationRatelimit } from '@/lib/upstash'
import { z } from 'zod'

const avatarUrlSchema = z.string().url().max(2048).refine((value) => {
  try {
    const parsed = new URL(value)
    return ['http:', 'https:'].includes(parsed.protocol)
      && parsed.pathname.includes('/storage/v1/object/public/avatars/')
  } catch {
    return false
  }
}, 'Avatar URL must point to the public avatars bucket')

const updateSchema = z.object({
  full_name: z.string().trim().min(2).max(100).optional(),
  avatar_url: avatarUrlSchema.nullable().optional(),
  bio: z.string().trim().max(2000).optional(),
  experience_years: z.number().int().min(0).max(80).optional(),
  consultation_fee_inr: z.number().int().min(0).max(100000).optional(),
})

type UserProfileRow = {
  id: string
  full_name: string
  phone: string | null
  role: 'patient' | 'provider' | 'admin'
  avatar_url: string | null
  created_at: string
}

type ProviderProfileRow = {
  title: string | null
  bio: string | null
  experience_years: number | null
  consultation_fee_inr: number | null
  iap_registration_no: string | null
}

async function getProfilePayload(supabase: Awaited<ReturnType<typeof createClient>>, user: { id: string; email?: string | null }) {
  // Check if this is a demo user
  const demoProfile = getDemoProfileById(user.id)
  if (demoProfile) {
    return {
      id: demoProfile.id,
      full_name: demoProfile.fullName,
      phone: demoProfile.phone,
      role: demoProfile.role,
      avatar_url: demoProfile.avatarUrl,
      created_at: demoProfile.createdAt,
      email: demoProfile.email,
      title: demoProfile.role === 'provider' ? 'Senior Physiotherapist' : null,
      bio: demoProfile.role === 'provider' ? 'Experienced physiotherapist specializing in sports rehab and recovery.' : null,
      experience_years: demoProfile.role === 'provider' ? 8 : null,
      consultation_fee_inr: demoProfile.role === 'provider' ? 800 : null,
      iap_registration_no: demoProfile.role === 'provider' ? 'IAP-DEMO-123' : null,
    }
  }

  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, phone, role, avatar_url, created_at')
    .eq('id', user.id)
    .single()

  if (error || !data) {
    return null
  }

  const userProfile = data as UserProfileRow
  let providerProfile: ProviderProfileRow | null = null

  if (userProfile.role === 'provider') {
    const { data: providerData, error: providerError } = await supabase
      .from('providers')
      .select('title, bio, experience_years, consultation_fee_inr, iap_registration_no')
      .eq('id', user.id)
      .maybeSingle()

    if (providerError) {
      throw providerError
    }

    providerProfile = (providerData as ProviderProfileRow | null) ?? null
  }

  return {
    ...userProfile,
    email: user.email ?? null,
    title: providerProfile?.title ?? null,
    bio: providerProfile?.bio ?? null,
    experience_years: providerProfile?.experience_years ?? null,
    consultation_fee_inr: providerProfile?.consultation_fee_inr ?? null,
    iap_registration_no: providerProfile?.iap_registration_no ?? null,
  }
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    // Fallback to demo session
    const cookieStore = await cookies()
    const demoSession = await getDemoSessionFromCookies({ get: (name: string) => cookieStore.get(name) })
    
    if (demoSession) {
      const profile = await getProfilePayload(supabase, { 
        id: demoSession.userId, 
        email: getDemoProfileById(demoSession.userId)?.email 
      })
      if (profile) return NextResponse.json(profile)
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let profile = null

  try {
    profile = await getProfilePayload(supabase, user)
  } catch {
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 })
  }

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  return NextResponse.json(profile)
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { success } = await mutationRatelimit.limit(`profile:${user.id}`)
    if (!success) {
      return NextResponse.json({ error: 'Too many updates. Please wait before trying again.' }, { status: 429 })
    }
  } catch {
    // Rate limiter unavailable — allow through
  }

  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  let profile = null

  try {
    profile = await getProfilePayload(supabase, user)
  } catch {
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 })
  }

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const userPatch: { full_name?: string; avatar_url?: string | null } = {}
  const providerPatch: {
    bio?: string
    experience_years?: number
    consultation_fee_inr?: number
  } = {}

  if (parsed.data.full_name !== undefined) {
    userPatch.full_name = parsed.data.full_name
  }

  if (parsed.data.avatar_url !== undefined) {
    userPatch.avatar_url = parsed.data.avatar_url
  }

  if (parsed.data.bio !== undefined) {
    providerPatch.bio = parsed.data.bio
  }

  if (parsed.data.experience_years !== undefined) {
    providerPatch.experience_years = parsed.data.experience_years
  }

  if (parsed.data.consultation_fee_inr !== undefined) {
    providerPatch.consultation_fee_inr = parsed.data.consultation_fee_inr
  }

  const hasUserPatch = Object.keys(userPatch).length > 0
  const hasProviderPatch = Object.keys(providerPatch).length > 0

  if (!hasUserPatch && (!hasProviderPatch || profile.role !== 'provider')) {
    return NextResponse.json({ error: 'No valid fields' }, { status: 400 })
  }

  if (hasUserPatch) {
    const { error } = await supabase
      .from('users')
      .update(userPatch)
      .eq('id', user.id)

    if (error) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }
  }

  if (profile.role === 'provider' && hasProviderPatch) {
    const { error } = await supabase
      .from('providers')
      .update(providerPatch)
      .eq('id', user.id)

    if (error) {
      if (hasUserPatch) {
        await supabase
          .from('users')
          .update({
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
          })
          .eq('id', user.id)
      }

      return NextResponse.json({ error: 'Failed to update provider profile' }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}
