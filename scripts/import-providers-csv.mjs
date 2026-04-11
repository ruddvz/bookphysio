#!/usr/bin/env node
/**
 * Real-provider CSV importer for BookPhysio.
 *
 * Imports vetted physiotherapists from a CSV file into production:
 *   - Creates a Supabase Auth user (email + temporary password) if missing
 *   - Upserts the providers row (verified=false / active=false unless
 *     --auto-approve is passed; admin still approves through the panel)
 *   - Inserts the locations row
 *   - Links provider_specialties by slug match against the existing taxonomy
 *
 * The script is idempotent on email — re-running with the same CSV will
 * skip existing auth users and upsert providers. It does NOT replace
 * locations or specialty links; rerun against an empty DB or clean those
 * tables manually if you need a true reset.
 *
 * --- Usage ---
 *
 *   NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=<service-role> \
 *   BOOKPHYSIO_IMPORT_CONFIRM=import-providers \
 *   BOOKPHYSIO_IMPORT_PASSWORD='<temp-password-12+chars>' \
 *   node scripts/import-providers-csv.mjs --csv data/providers.csv [--dry-run] [--auto-approve]
 *
 * --- CSV columns (header row required, order-independent) ---
 *
 *   full_name              required, 2-100 chars
 *   email                  required, unique per row
 *   phone                  required, +91XXXXXXXXXX or 10-digit Indian mobile
 *   title                  optional, one of "Dr." / "PT" / "BPT" / "MPT" (default "Dr.")
 *   bio                    optional, ≤1000 chars
 *   experience_years       required, integer 0-60
 *   consultation_fee_inr   required, integer rupees
 *   specialty_slugs        required, pipe-separated slugs e.g. "sports|orthopaedic"
 *   icp_registration_no    required, free text (e.g. "MH/PT/2014/5892")
 *   clinic_name            required, 2-200 chars
 *   address                required, 5-500 chars
 *   city                   required
 *   state                  optional
 *   pincode                required, 6 digits, no leading 0
 *   lat                    optional float
 *   lng                    optional float
 *   visit_types            required, pipe-separated subset of "in_clinic|home_visit"
 *
 * Lines beginning with # are treated as comments.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

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
    // .env may not exist — env vars passed inline are also fine.
  }
}
loadEnv()

// ── CLI args ───────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
function flag(name) {
  return args.includes(name)
}
function value(name) {
  const idx = args.indexOf(name)
  return idx >= 0 && idx < args.length - 1 ? args[idx + 1] : null
}

const CSV_PATH = value('--csv')
const DRY_RUN = flag('--dry-run')
const AUTO_APPROVE = flag('--auto-approve')

if (!CSV_PATH) {
  console.error('❌ Missing --csv <path>. See scripts/import-providers-csv.mjs header for usage.')
  process.exit(1)
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const IMPORT_PASSWORD = process.env.BOOKPHYSIO_IMPORT_PASSWORD
const IMPORT_CONFIRM = process.env.BOOKPHYSIO_IMPORT_CONFIRM

if (!SUPABASE_URL || !SERVICE_KEY || SUPABASE_URL.includes('placeholder')) {
  console.error('❌ Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (in .env or inline).')
  process.exit(1)
}

if (!DRY_RUN && (!IMPORT_PASSWORD || IMPORT_PASSWORD.length < 12)) {
  console.error('❌ Set BOOKPHYSIO_IMPORT_PASSWORD to a strong 12+ char password (used as the temporary password for newly created provider accounts).')
  process.exit(1)
}

if (!DRY_RUN && IMPORT_CONFIRM !== 'import-providers') {
  console.error('❌ Set BOOKPHYSIO_IMPORT_CONFIRM=import-providers to confirm a write run. Use --dry-run to validate without writes.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── Tiny RFC-4180-ish CSV parser (handles quoted fields, escaped quotes) ──
function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const c = text[i]

    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
      continue
    }

    if (c === '"') {
      inQuotes = true
      continue
    }

    if (c === ',') {
      row.push(field)
      field = ''
      continue
    }

    if (c === '\r') continue

    if (c === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      continue
    }

    field += c
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  // Drop empty trailing rows + comment lines (#-prefixed first column)
  return rows.filter((r) => {
    if (r.length === 0) return false
    if (r.length === 1 && r[0].trim() === '') return false
    if (r[0].trim().startsWith('#')) return false
    return true
  })
}

// ── Row validation ─────────────────────────────────────────────────────────
const PINCODE_RE = /^[1-9][0-9]{5}$/
const PHONE_RE = /^\+91[6-9]\d{9}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizePhone(raw) {
  const digits = String(raw ?? '').replace(/\D/g, '')
  if (digits.length === 10) return `+91${digits}`
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`
  return String(raw ?? '').trim()
}

function parseVisitTypes(raw) {
  return String(raw ?? '')
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean)
}

function validateRow(row, rowNum) {
  const errors = []

  if (!row.full_name || row.full_name.length < 2 || row.full_name.length > 100) {
    errors.push('full_name must be 2-100 chars')
  }
  if (!EMAIL_RE.test(row.email ?? '')) {
    errors.push('email invalid')
  }

  const phone = normalizePhone(row.phone)
  if (!PHONE_RE.test(phone)) {
    errors.push('phone must be a valid Indian mobile (+91XXXXXXXXXX)')
  }
  row.phone = phone

  const exp = Number.parseInt(row.experience_years, 10)
  if (!Number.isFinite(exp) || exp < 0 || exp > 60) {
    errors.push('experience_years must be integer 0-60')
  }
  row.experience_years = exp

  const fee = Number.parseInt(row.consultation_fee_inr, 10)
  if (!Number.isFinite(fee) || fee < 0 || fee > 1_000_000) {
    errors.push('consultation_fee_inr must be a non-negative integer ≤ 1,000,000')
  }
  row.consultation_fee_inr = fee

  if (!row.icp_registration_no || row.icp_registration_no.length < 2) {
    errors.push('icp_registration_no required')
  }

  if (!row.clinic_name || row.clinic_name.length < 2 || row.clinic_name.length > 200) {
    errors.push('clinic_name must be 2-200 chars')
  }
  if (!row.address || row.address.length < 5 || row.address.length > 500) {
    errors.push('address must be 5-500 chars')
  }
  if (!row.city) {
    errors.push('city required')
  }
  if (!PINCODE_RE.test(row.pincode ?? '')) {
    errors.push('pincode must be 6 digits, no leading 0')
  }

  const lat = row.lat ? Number.parseFloat(row.lat) : null
  const lng = row.lng ? Number.parseFloat(row.lng) : null
  if (row.lat && !Number.isFinite(lat)) errors.push('lat must be a number')
  if (row.lng && !Number.isFinite(lng)) errors.push('lng must be a number')
  row.lat = Number.isFinite(lat) ? lat : null
  row.lng = Number.isFinite(lng) ? lng : null

  const specialties = String(row.specialty_slugs ?? '')
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean)
  if (specialties.length === 0) {
    errors.push('specialty_slugs required (pipe-separated)')
  }
  row.specialty_slugs = specialties

  const visitTypes = parseVisitTypes(row.visit_types)
  if (visitTypes.length === 0 || visitTypes.some((v) => v !== 'in_clinic' && v !== 'home_visit')) {
    errors.push('visit_types must be a pipe-separated subset of "in_clinic|home_visit"')
  }
  row.visit_types = visitTypes

  if (!row.title) row.title = 'Dr.'
  if (row.bio && row.bio.length > 1000) errors.push('bio max 1000 chars')

  if (errors.length > 0) {
    console.error(`   ❌ Row ${rowNum} (${row.email || '<no email>'}): ${errors.join('; ')}`)
    return false
  }
  return true
}

// ── Auth user upsert ───────────────────────────────────────────────────────
async function findOrCreateAuthUser(email, fullName, phone) {
  // listUsers paginates; for the import volumes we expect (10s-100s) the
  // first page is enough. If you import thousands, switch to a paged loop.
  const { data: existing } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const found = existing?.users?.find((u) => u.email === email)

  if (found) {
    return { id: found.id, created: false }
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: IMPORT_PASSWORD,
    phone,
    email_confirm: true,
    phone_confirm: true,
    user_metadata: { full_name: fullName, role: 'provider' },
  })

  if (error) {
    throw new Error(`createUser(${email}): ${error.message}`)
  }
  return { id: data.user.id, created: true }
}

function slugify(name) {
  return String(name)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  const csvPath = resolve(process.cwd(), CSV_PATH)
  console.log(`📄 Reading ${csvPath}`)
  const text = readFileSync(csvPath, 'utf-8')
  const rows = parseCsv(text)
  if (rows.length < 2) {
    console.error('❌ CSV must contain a header row plus at least one data row.')
    process.exit(1)
  }

  const header = rows[0].map((h) => h.trim())
  const records = rows.slice(1).map((r) => {
    const obj = {}
    header.forEach((h, i) => {
      obj[h] = (r[i] ?? '').trim()
    })
    return obj
  })

  console.log(`🔍 Parsed ${records.length} data rows`)
  console.log(`   Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'WRITE'}`)
  console.log(`   Approval: ${AUTO_APPROVE ? 'auto-approve (verified=true, active=true)' : 'pending admin review (verified=false, active=false)'}`)
  console.log()

  // Validate all rows up front so we fail loud before any writes.
  let validCount = 0
  for (let i = 0; i < records.length; i++) {
    if (validateRow(records[i], i + 2)) validCount++
  }
  console.log(`✅ ${validCount}/${records.length} rows valid`)
  if (validCount === 0) {
    console.error('❌ No valid rows to import. Aborting.')
    process.exit(1)
  }
  if (validCount < records.length) {
    console.error(`❌ ${records.length - validCount} rows failed validation. Fix and rerun.`)
    process.exit(1)
  }

  if (DRY_RUN) {
    console.log()
    console.log('━'.repeat(60))
    console.log('Dry run complete — no writes performed.')
    console.log('━'.repeat(60))
    return
  }

  // Fetch the specialty taxonomy once.
  const { data: specs, error: specErr } = await supabase
    .from('specialties')
    .select('id, slug, name')
  if (specErr) {
    console.error('❌ Failed to load specialties table:', specErr.message)
    process.exit(1)
  }
  const specBySlug = new Map()
  for (const s of specs ?? []) {
    if (s.slug) specBySlug.set(s.slug, s.id)
  }

  console.log()
  console.log(`🩺 Importing ${validCount} providers...`)
  console.log()

  let created = 0
  let skipped = 0
  let failed = 0

  for (const row of records) {
    try {
      const { id: userId, created: wasCreated } = await findOrCreateAuthUser(
        row.email,
        row.full_name,
        row.phone,
      )
      if (wasCreated) created++
      else skipped++

      // Resolve specialty IDs (skip unknown slugs but keep going).
      const specialtyIds = row.specialty_slugs
        .map((slug) => specBySlug.get(slug))
        .filter(Boolean)
      if (specialtyIds.length === 0) {
        console.error(`   ⚠️  ${row.full_name}: none of [${row.specialty_slugs.join(', ')}] match a known specialty slug — skipping specialty link, provider still created`)
      }

      // Upsert provider profile
      const { error: provErr } = await supabase.from('providers').upsert(
        {
          id: userId,
          slug: slugify(row.full_name),
          title: row.title,
          bio: row.bio || null,
          experience_years: row.experience_years,
          consultation_fee_inr: row.consultation_fee_inr,
          specialty_ids: specialtyIds,
          icp_registration_no: row.icp_registration_no,
          verified: AUTO_APPROVE,
          active: AUTO_APPROVE,
          onboarding_step: 4,
        },
        { onConflict: 'id' },
      )
      if (provErr) throw new Error(`providers upsert: ${provErr.message}`)

      // Insert location (do not dedupe — assume one CSV row = one location).
      const { error: locErr } = await supabase.from('locations').insert({
        provider_id: userId,
        name: row.clinic_name,
        address: row.address,
        city: row.city,
        state: row.state || null,
        pincode: row.pincode,
        lat: row.lat,
        lng: row.lng,
        visit_type: row.visit_types,
      })
      if (locErr) throw new Error(`locations insert: ${locErr.message}`)

      // Link specialties via the join table (in addition to providers.specialty_ids).
      if (specialtyIds.length > 0) {
        await supabase.from('provider_specialties').delete().eq('provider_id', userId)
        const { error: linkErr } = await supabase
          .from('provider_specialties')
          .insert(specialtyIds.map((sid) => ({ provider_id: userId, specialty_id: sid })))
        if (linkErr) throw new Error(`provider_specialties insert: ${linkErr.message}`)
      }

      console.log(`   ✅ ${row.title} ${row.full_name} — ${row.city} — ${row.specialty_slugs.join('+')}${wasCreated ? '' : ' (auth user already existed)'}`)
    } catch (err) {
      failed++
      console.error(`   ❌ ${row.full_name} (${row.email}):`, err.message)
    }
  }

  console.log()
  console.log('━'.repeat(60))
  console.log(`Import complete:`)
  console.log(`   ${created} new auth users created`)
  console.log(`   ${skipped} auth users already existed (provider profile re-upserted)`)
  console.log(`   ${failed} rows failed`)
  if (!AUTO_APPROVE) {
    console.log()
    console.log('   Providers were imported as INACTIVE (verified=false, active=false).')
    console.log('   Approve them in the admin panel before they appear in /search.')
  }
  console.log('━'.repeat(60))

  if (failed > 0) process.exit(2)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
