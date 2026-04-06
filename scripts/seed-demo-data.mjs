#!/usr/bin/env node
/**
 * Seed script for BookPhysio demo data.
 *
 * Creates 12 providers, 3 patients, 1 admin — all with real Supabase Auth
 * accounts so login, search, dashboards, and booking all work end-to-end.
 *
 * Usage:
 *   node scripts/seed-demo-data.mjs
 *
 * Requires env vars (reads from .env automatically):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const INDIA_UTC_OFFSET_MS = 5.5 * 60 * 60 * 1000
const indiaDateKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Kolkata',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})
const indiaWeekdayFormatter = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  weekday: 'short',
})

// ── Load .env ──────────────────────────────────────────────────────────────
function loadEnv() {
  try {
    const envPath = resolve(__dirname, '..', '.env')
    const content = readFileSync(envPath, 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIndex = trimmed.indexOf('=')
      if (eqIndex === -1) continue
      const key = trimmed.slice(0, eqIndex).trim()
      const value = trimmed.slice(eqIndex + 1).trim()
      if (!process.env[key]) process.env[key] = value
    }
  } catch {
    // .env may not exist — that's fine if env vars are set
  }
}
loadEnv()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const DEMO_PASSWORD = process.env.BOOKPHYSIO_DEMO_PASSWORD
const SEED_CONFIRMATION = process.env.BOOKPHYSIO_DEMO_SEED_CONFIRM

if (!SUPABASE_URL || !SERVICE_KEY || SUPABASE_URL.includes('placeholder')) {
  console.error('❌ Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

if (!DEMO_PASSWORD || DEMO_PASSWORD.length < 12) {
  console.error('❌ Set BOOKPHYSIO_DEMO_PASSWORD to a strong password before seeding demo users.')
  process.exit(1)
}

if (SEED_CONFIRMATION !== 'seed-demo-users') {
  console.error('❌ Set BOOKPHYSIO_DEMO_SEED_CONFIRM=seed-demo-users to confirm seeding real auth users.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── Demo Data ──────────────────────────────────────────────────────────────

const PROVIDERS = [
  {
    email: 'dr.arjun.mehta@demo.bookphysio.in',
    full_name: 'Arjun Mehta',
    title: 'Dr.',
    bio: 'Fellowship-trained sports physiotherapist specializing in ACL rehabilitation, rotator cuff injuries, and athlete return-to-play protocols. Former physio for IPL team.',
    experience_years: 12,
    fee: 1200,
    city: 'Mumbai',
    state: 'Maharashtra',
    address: '302, Physio Plus Clinic, Bandra West',
    pincode: '400050',
    lat: 19.0596,
    lng: 72.8295,
    visit_types: ['in_clinic', 'home_visit'],
    specialtySlug: 'sports',
    icp: 'MH/PT/2014/5892',
  },
  {
    email: 'dr.priya.sharma@demo.bookphysio.in',
    full_name: 'Priya Sharma',
    title: 'Dr.',
    bio: 'Neurological physiotherapy expert with advanced training in stroke recovery, Parkinson\'s management, and spinal cord injury rehabilitation.',
    experience_years: 9,
    fee: 1000,
    city: 'Delhi',
    state: 'Delhi',
    address: '114, NeuroRehab Centre, Saket',
    pincode: '110017',
    lat: 28.5245,
    lng: 77.2066,
    visit_types: ['in_clinic', 'home_visit'],
    specialtySlug: 'neurological',
    icp: 'DL/PT/2017/3201',
  },
  {
    email: 'dr.rahul.nair@demo.bookphysio.in',
    full_name: 'Rahul Nair',
    title: 'MPT',
    bio: 'Orthopaedic physiotherapist focusing on joint replacements, fracture rehabilitation, and chronic pain management. Evidence-based manual therapy practitioner.',
    experience_years: 7,
    fee: 800,
    city: 'Bangalore',
    state: 'Karnataka',
    address: '45, OrthoFit Studio, Koramangala',
    pincode: '560034',
    lat: 12.9352,
    lng: 77.6245,
    visit_types: ['in_clinic'],
    specialtySlug: 'orthopaedic',
    icp: 'KA/PT/2019/7845',
  },
  {
    email: 'dr.ananya.iyer@demo.bookphysio.in',
    full_name: 'Ananya Iyer',
    title: 'Dr.',
    bio: 'Paediatric physiotherapy specialist working with children with developmental delays, cerebral palsy, and sports injuries in young athletes.',
    experience_years: 8,
    fee: 900,
    city: 'Chennai',
    state: 'Tamil Nadu',
    address: '78, Little Steps Physio, Anna Nagar',
    pincode: '600040',
    lat: 13.0878,
    lng: 80.2085,
    visit_types: ['in_clinic', 'home_visit'],
    specialtySlug: 'paediatric',
    icp: 'TN/PT/2018/2156',
  },
  {
    email: 'dr.vikram.singh@demo.bookphysio.in',
    full_name: 'Vikram Singh',
    title: 'BPT',
    bio: 'Geriatric physiotherapist dedicated to elderly mobility, fall prevention, and post-hip-replacement recovery programs.',
    experience_years: 15,
    fee: 700,
    city: 'Hyderabad',
    state: 'Telangana',
    address: '201, SilverCare Physio, Jubilee Hills',
    pincode: '500033',
    lat: 17.4326,
    lng: 78.4071,
    visit_types: ['home_visit'],
    specialtySlug: 'geriatric',
    icp: 'TS/PT/2011/1498',
  },
  {
    email: 'dr.kavitha.reddy@demo.bookphysio.in',
    full_name: 'Kavitha Reddy',
    title: 'Dr.',
    bio: 'Women\'s health physiotherapist specializing in prenatal/postnatal care, pelvic floor rehabilitation, and PCOD-related musculoskeletal issues.',
    experience_years: 10,
    fee: 1100,
    city: 'Pune',
    state: 'Maharashtra',
    address: '56, FemPhysio Clinic, Koregaon Park',
    pincode: '411001',
    lat: 18.5362,
    lng: 73.8939,
    visit_types: ['in_clinic'],
    specialtySlug: 'womens-health',
    icp: 'MH/PT/2016/6734',
  },
  {
    email: 'dr.suresh.patel@demo.bookphysio.in',
    full_name: 'Suresh Patel',
    title: 'MPT',
    bio: 'Spine and back pain specialist with expertise in McKenzie Method, dry needling, and chronic low back pain management.',
    experience_years: 11,
    fee: 950,
    city: 'Ahmedabad',
    state: 'Gujarat',
    address: '89, SpineCare Physio, CG Road',
    pincode: '380006',
    lat: 23.0225,
    lng: 72.5714,
    visit_types: ['in_clinic', 'home_visit'],
    specialtySlug: 'spine',
    icp: 'GJ/PT/2015/4521',
  },
  {
    email: 'dr.deepa.menon@demo.bookphysio.in',
    full_name: 'Deepa Menon',
    title: 'Dr.',
    bio: 'Post-surgical rehabilitation expert focusing on knee replacements, ACL reconstruction recovery, and shoulder arthroscopy rehab.',
    experience_years: 6,
    fee: 850,
    city: 'Kochi',
    state: 'Kerala',
    address: '23, RecoverWell Physio, Edappally',
    pincode: '682024',
    lat: 10.0261,
    lng: 76.3125,
    visit_types: ['in_clinic', 'home_visit'],
    specialtySlug: 'post-surgical',
    icp: 'KL/PT/2020/8912',
  },
  {
    email: 'dr.amit.joshi@demo.bookphysio.in',
    full_name: 'Amit Joshi',
    title: 'Dr.',
    bio: 'Cardiopulmonary physiotherapist working with post-cardiac surgery patients, COPD management, and respiratory rehabilitation programs.',
    experience_years: 13,
    fee: 1300,
    city: 'Jaipur',
    state: 'Rajasthan',
    address: '167, HeartLung Physio, MI Road',
    pincode: '302001',
    lat: 26.9124,
    lng: 75.7873,
    visit_types: ['in_clinic'],
    specialtySlug: 'cardiopulmonary',
    icp: 'RJ/PT/2013/3267',
  },
  {
    email: 'dr.sneha.das@demo.bookphysio.in',
    full_name: 'Sneha Das',
    title: 'BPT',
    bio: 'Home visit physiotherapy specialist providing doorstep rehabilitation services for elderly patients, post-surgical recovery, and bed-ridden care.',
    experience_years: 5,
    fee: 600,
    city: 'Kolkata',
    state: 'West Bengal',
    address: '34, HomeCare Physio, Salt Lake',
    pincode: '700091',
    lat: 22.5726,
    lng: 88.4375,
    visit_types: ['home_visit'],
    specialtySlug: 'home-visit',
    icp: 'WB/PT/2021/1045',
  },
  {
    email: 'dr.manish.gupta@demo.bookphysio.in',
    full_name: 'Manish Gupta',
    title: 'Dr.',
    bio: 'Sports injury rehabilitation specialist and certified strength & conditioning coach. Works with professional cricketers and football players.',
    experience_years: 14,
    fee: 1500,
    city: 'Mumbai',
    state: 'Maharashtra',
    address: '501, Elite Sports Physio, Andheri West',
    pincode: '400053',
    lat: 19.1364,
    lng: 72.8296,
    visit_types: ['in_clinic'],
    specialtySlug: 'sports',
    icp: 'MH/PT/2012/2890',
  },
  {
    email: 'dr.ritu.kapoor@demo.bookphysio.in',
    full_name: 'Ritu Kapoor',
    title: 'MPT',
    bio: 'Orthopaedic and manual therapy specialist with certification in Mulligan and Maitland techniques. Expert in frozen shoulder and tennis elbow treatment.',
    experience_years: 8,
    fee: 900,
    city: 'Delhi',
    state: 'Delhi',
    address: '22, Joint Care Physio, Greater Kailash',
    pincode: '110048',
    lat: 28.5494,
    lng: 77.2434,
    visit_types: ['in_clinic', 'home_visit'],
    specialtySlug: 'orthopaedic',
    icp: 'DL/PT/2018/5678',
  },
]

const PATIENTS = [
  { email: 'patient.demo1@demo.bookphysio.in', full_name: 'Rajesh Kumar', phone: '+919876543210' },
  { email: 'patient.demo2@demo.bookphysio.in', full_name: 'Meera Nair', phone: '+919876543211' },
  { email: 'patient.demo3@demo.bookphysio.in', full_name: 'Aditya Verma', phone: '+919876543212' },
]

const ADMIN = { email: 'admin@demo.bookphysio.in', full_name: 'BookPhysio Admin' }

// Sample reviews per provider (patient_name is cosmetic — we assign real patient IDs)
const REVIEW_TEMPLATES = [
  { rating: 5, comment: 'Excellent treatment! My back pain reduced significantly after just 3 sessions.' },
  { rating: 5, comment: 'Very professional and knowledgeable. Highly recommend for sports injuries.' },
  { rating: 4, comment: 'Good experience overall. The exercises really helped with my recovery.' },
  { rating: 4, comment: 'Thorough assessment and clear explanation of the treatment plan.' },
  { rating: 5, comment: 'Best physiotherapist I have visited. Very patient and skilled.' },
  { rating: 3, comment: 'Treatment was helpful but the clinic was a bit crowded.' },
  { rating: 5, comment: 'Remarkable improvement in my mobility after knee surgery rehab.' },
  { rating: 4, comment: 'Professional setup, good equipment, and caring staff.' },
  { rating: 5, comment: 'Home visit was very convenient. The therapist was punctual and thorough.' },
  { rating: 4, comment: 'Helped my mother recover from hip replacement. Very grateful.' },
]

// ── Helpers ────────────────────────────────────────────────────────────────

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
}

function formatIndiaDateKey(date) {
  const parts = indiaDateKeyFormatter.formatToParts(date)
  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  const day = parts.find((part) => part.type === 'day')?.value

  if (!year || !month || !day) {
    throw new RangeError('Unable to format India date key')
  }

  return `${year}-${month}-${day}`
}

function buildIndiaDate(dateKey, hour, minute) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day, hour, minute) - INDIA_UTC_OFFSET_MS)
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 BookPhysio — Seeding demo data...\n')

  // 1. Fetch specialty IDs
  const { data: specialties, error: specErr } = await supabase
    .from('specialties')
    .select('id, slug')

  if (specErr || !specialties?.length) {
    console.error('❌ No specialties found. Run seed.sql first.')
    process.exit(1)
  }

  const specMap = Object.fromEntries(specialties.map((s) => [s.slug, s.id]))
  console.log(`✅ Found ${specialties.length} specialties\n`)

  // 2. Create admin account
  console.log('👑 Creating admin account...')
  const adminId = await createAuthUser(ADMIN.email, ADMIN.full_name, 'admin')
  if (adminId) console.log(`   ✅ Admin: ${ADMIN.email}\n`)

  // 3. Create patient accounts
  console.log('🧑 Creating patient accounts...')
  const patientIds = []
  for (const p of PATIENTS) {
    const id = await createAuthUser(p.email, p.full_name, 'patient', p.phone)
    if (id) {
      patientIds.push(id)
      console.log(`   ✅ ${p.full_name}: ${p.email}`)
    }
  }
  console.log()

  // 4. Create provider accounts + profiles + locations + availability
  console.log('🩺 Creating provider accounts...')
  const providerIds = []
  for (const prov of PROVIDERS) {
    const specId = specMap[prov.specialtySlug]
    if (!specId) {
      console.error(`   ⚠️ Specialty slug "${prov.specialtySlug}" not found — skipping ${prov.full_name}`)
      continue
    }

    // Create auth user
    const userId = await createAuthUser(prov.email, prov.full_name, 'provider')
    if (!userId) continue

    providerIds.push(userId)

    // Create provider profile
    const { error: provErr } = await supabase.from('providers').upsert({
      id: userId,
      slug: slugify(prov.full_name),
      title: prov.title,
      bio: prov.bio,
      experience_years: prov.experience_years,
      consultation_fee_inr: prov.fee,
      specialty_ids: [specId],
      icp_registration_no: prov.icp,
      verified: true,
      active: true,
      onboarding_step: 4,
    }, { onConflict: 'id' })

    if (provErr) {
      console.error(`   ❌ Provider profile for ${prov.full_name}:`, provErr.message)
      continue
    }

    // Create location
    const { data: locData, error: locErr } = await supabase.from('locations').insert({
      provider_id: userId,
      name: prov.address.split(',').pop()?.trim() || 'Main Clinic',
      address: prov.address,
      city: prov.city,
      state: prov.state,
      pincode: prov.pincode,
      lat: prov.lat,
      lng: prov.lng,
      visit_type: prov.visit_types,
    }).select('id').single()

    if (locErr) {
      console.error(`   ❌ Location for ${prov.full_name}:`, locErr.message)
      continue
    }

    // Create availability slots for next 14 days
    const today = buildIndiaDate(formatIndiaDateKey(new Date()), 0, 0)
    const slots = []

    for (let dayOffset = 1; dayOffset <= 14; dayOffset++) {
      const day = addDays(today, dayOffset)
      const dayKey = formatIndiaDateKey(day)

      if (indiaWeekdayFormatter.format(day) === 'Sun') continue

      // Morning slots: 9 AM - 1 PM (8 × 30-min slots)
      for (let hour = 9; hour < 13; hour++) {
        for (const min of [0, 30]) {
          const start = buildIndiaDate(dayKey, hour, min)
          const end = new Date(start.getTime() + 30 * 60 * 1000)
          slots.push({
            provider_id: userId,
            location_id: locData.id,
            starts_at: start.toISOString(),
            ends_at: end.toISOString(),
            slot_duration_mins: 30,
            buffer_mins: 5,
            is_booked: false,
            is_blocked: false,
          })
        }
      }

      // Afternoon slots: 3 PM - 6 PM (6 × 30-min slots)
      for (let hour = 15; hour < 18; hour++) {
        for (const min of [0, 30]) {
          const start = buildIndiaDate(dayKey, hour, min)
          const end = new Date(start.getTime() + 30 * 60 * 1000)
          slots.push({
            provider_id: userId,
            location_id: locData.id,
            starts_at: start.toISOString(),
            ends_at: end.toISOString(),
            slot_duration_mins: 30,
            buffer_mins: 5,
            is_booked: false,
            is_blocked: false,
          })
        }
      }
    }

    // Insert in batches of 100
    for (let i = 0; i < slots.length; i += 100) {
      const batch = slots.slice(i, i + 100)
      const { error: slotErr } = await supabase.from('availabilities').insert(batch)
      if (slotErr) {
        console.error(`   ❌ Availability for ${prov.full_name} batch ${i}:`, slotErr.message)
      }
    }

    console.log(`   ✅ ${prov.title} ${prov.full_name} — ${prov.city} — ${prov.specialtySlug} — ${slots.length} slots`)
  }
  console.log()

  // 5. Create reviews (3-4 per provider)
  if (patientIds.length > 0 && providerIds.length > 0) {
    console.log('⭐ Creating reviews...')
    let reviewCount = 0

    for (let pi = 0; pi < providerIds.length; pi++) {
      const providerId = providerIds[pi]
      const numReviews = 3 + (pi % 2) // alternating 3 and 4 reviews

      // We need availability_id for appointments → reviews
      // Get some slots for this provider
      const { data: provSlots } = await supabase
        .from('availabilities')
        .select('id')
        .eq('provider_id', providerId)
        .eq('is_booked', false)
        .limit(numReviews)

      if (!provSlots || provSlots.length === 0) continue

      for (let ri = 0; ri < numReviews && ri < provSlots.length; ri++) {
        const patientId = patientIds[ri % patientIds.length]
        const template = REVIEW_TEMPLATES[(pi * 3 + ri) % REVIEW_TEMPLATES.length]
        const slotId = provSlots[ri].id

        // Mark slot as booked
        await supabase
          .from('availabilities')
          .update({ is_booked: true })
          .eq('id', slotId)

        // Create appointment (completed)
        const { data: apptData, error: apptErr } = await supabase.from('appointments').insert({
          patient_id: patientId,
          provider_id: providerId,
          availability_id: slotId,
          visit_type: 'in_clinic',
          status: 'completed',
          fee_inr: PROVIDERS[pi]?.fee || 800,
        }).select('id').single()

        if (apptErr || !apptData) continue

        // Create review
        const { error: revErr } = await supabase.from('reviews').insert({
          appointment_id: apptData.id,
          patient_id: patientId,
          provider_id: providerId,
          rating: template.rating,
          comment: template.comment,
          is_published: true,
        })

        if (!revErr) reviewCount++
      }
    }
    console.log(`   ✅ Created ${reviewCount} reviews\n`)
  }

  // 6. Create a few upcoming appointments for demo patients
  if (patientIds.length > 0 && providerIds.length >= 3) {
    console.log('📅 Creating sample appointments...')
    const today = buildIndiaDate(formatIndiaDateKey(new Date()), 0, 0)
    const tomorrow = addDays(today, 1)
    const dayAfter = addDays(today, 2)
    const nextWeek = addDays(today, 5)

    const sampleAppointments = [
      { patientIdx: 0, providerIdx: 0, day: tomorrow, status: 'confirmed' },
      { patientIdx: 0, providerIdx: 3, day: nextWeek, status: 'pending' },
      { patientIdx: 1, providerIdx: 1, day: dayAfter, status: 'confirmed' },
      { patientIdx: 2, providerIdx: 5, day: nextWeek, status: 'confirmed' },
    ]

    for (const sa of sampleAppointments) {
      const patientId = patientIds[sa.patientIdx]
      const providerId = providerIds[sa.providerIdx]
      if (!patientId || !providerId) continue

      // Find an available slot on the target day
      const dayKey = formatIndiaDateKey(sa.day)
      const dayStart = buildIndiaDate(dayKey, 0, 0)
      const dayEnd = new Date(buildIndiaDate(dayKey, 23, 59).getTime() + 59 * 1000 + 999)

      const { data: slot } = await supabase
        .from('availabilities')
        .select('id, location_id')
        .eq('provider_id', providerId)
        .eq('is_booked', false)
        .gte('starts_at', dayStart.toISOString())
        .lte('starts_at', dayEnd.toISOString())
        .limit(1)
        .single()

      if (!slot) continue

      await supabase
        .from('availabilities')
        .update({ is_booked: true })
        .eq('id', slot.id)

      const fee = PROVIDERS[sa.providerIdx]?.fee || 800

      const { error: aErr } = await supabase.from('appointments').insert({
        patient_id: patientId,
        provider_id: providerId,
        availability_id: slot.id,
        location_id: slot.location_id,
        visit_type: 'in_clinic',
        status: sa.status,
        fee_inr: fee,
        notes: 'Demo appointment',
      })

      if (!aErr) {
        console.log(`   ✅ ${PATIENTS[sa.patientIdx].full_name} → ${PROVIDERS[sa.providerIdx].full_name} (${sa.status})`)
      }
    }

    // Create payments for confirmed appointments
    const { data: confirmedAppts } = await supabase
      .from('appointments')
      .select('id, fee_inr')
      .eq('status', 'confirmed')
      .limit(10)

    if (confirmedAppts) {
      for (const appt of confirmedAppts) {
        const gst = Math.round(appt.fee_inr * 0.18)
        await supabase.from('payments').insert({
          appointment_id: appt.id,
          amount_inr: appt.fee_inr,
          gst_amount_inr: gst,
          status: 'paid',
          razorpay_order_id: `order_demo_${appt.id.slice(0, 8)}`,
          razorpay_payment_id: `pay_demo_${appt.id.slice(0, 8)}`,
        })
      }
      console.log(`   ✅ Created ${confirmedAppts.length} payment records`)
    }
    console.log()
  }

  // 7. Print summary
  console.log('━'.repeat(60))
  console.log('🎉 Seed complete!\n')
  console.log('📋 Login Credentials (all use the same password):')
  console.log('   Password: use the value you provided in BOOKPHYSIO_DEMO_PASSWORD\n')
  console.log('   👑 Admin:')
  console.log(`      ${ADMIN.email}`)
  console.log()
  console.log('   🧑 Patients:')
  for (const p of PATIENTS) {
    console.log(`      ${p.email} (${p.full_name})`)
  }
  console.log()
  console.log('   🩺 Providers:')
  for (const p of PROVIDERS) {
    console.log(`      ${p.email} (${p.title} ${p.full_name} — ${p.city})`)
  }
  console.log()
  console.log('━'.repeat(60))
}

async function createAuthUser(email, fullName, role, phone) {
  // Check if user already exists
  const { data: existing } = await supabase.auth.admin.listUsers()
  const found = existing?.users?.find((u) => u.email === email)

  if (found) {
    console.log(`   ⏭️  ${fullName} already exists (${found.id})`)
    return found.id
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: fullName, role },
    ...(phone ? { phone } : {}),
  })

  if (error) {
    console.error(`   ❌ Auth user ${email}:`, error.message)
    return null
  }

  return data.user.id
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
