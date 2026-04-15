#!/usr/bin/env node
/**
 * Validates required environment variables before build.
 *
 * Exits 0 if all required vars are present.
 * Exits 1 with a grouped list of missing/invalid vars if not.
 *
 * Run manually: `npm run check:env`
 * Runs automatically: `npm run build` (via prebuild hook).
 */

const REQUIRED_ALWAYS = {
  'Supabase': [
    ['NEXT_PUBLIC_SUPABASE_URL', 'URL of your Supabase project (https://xxx.supabase.co)'],
    ['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'Supabase anon/public key'],
    ['SUPABASE_SERVICE_ROLE_KEY', 'Supabase service-role key (server-only; grants admin access)'],
  ],
  'App URLs': [
    ['NEXT_PUBLIC_APP_URL', 'Runtime origin (e.g. https://bookphysio.in in prod, http://localhost:3000 in dev)'],
    ['NEXT_PUBLIC_SITE_URL', 'Canonical site URL for SEO metadata'],
  ],
  'Resend (email)': [
    ['RESEND_API_KEY', 'Resend API key (re_xxxx)'],
    ['RESEND_FROM_EMAIL', 'Verified sender address (e.g. noreply@bookphysio.in)'],
  ],
  'MSG91 (SMS)': [
    ['MSG91_AUTH_KEY', 'MSG91 auth key for transactional SMS'],
    ['MSG91_SMS_SENDER_ID', 'DLT-registered sender id (6 chars, e.g. BKPHYS)'],
    ['MSG91_SMS_TEMPLATE_REMINDER', 'DLT template id for appointment reminders'],
    ['MSG91_SMS_TEMPLATE_CONFIRM', 'DLT template id for booking confirmations'],
    ['MSG91_SMS_TEMPLATE_RESCHEDULE', 'DLT template id for reschedule notifications'],
  ],
  'Upstash (rate limiting)': [
    ['UPSTASH_REDIS_REST_URL', 'Upstash Redis REST URL'],
    ['UPSTASH_REDIS_REST_TOKEN', 'Upstash Redis REST token'],
  ],
  'Gemini (AI)': [
    ['GOOGLE_GENERATIVE_AI_API_KEY', 'Google Generative AI API key (for patient/provider AI features)'],
  ],
  'Cron + Admin': [
    ['CRON_SECRET', 'Shared secret authenticating Vercel cron calls. Generate with: openssl rand -hex 32'],
    ['ADMIN_EMAIL', 'Admin recipient for daily AI summary reports'],
  ],
  'Auth cookie secrets': [
    ['OTP_PENDING_COOKIE_SECRET', 'Signing secret for the pending-OTP cookie. Generate with: openssl rand -base64 32'],
  ],
}

/** Conditionally required vars, keyed by the feature flag that activates them. */
const REQUIRED_CONDITIONAL = [
  {
    flag: 'ENABLE_PUBLIC_PREVIEW_GATE',
    flagValue: 'true',
    group: 'Preview gate',
    vars: [
      ['PREVIEW_PASSWORD', 'User-visible shared password for the preview gate'],
      ['PREVIEW_TOKEN_SECRET', 'HMAC signing secret for preview tokens (or set DEMO_COOKIE_SECRET)'],
    ],
    accept: ({ vars, env }) => {
      // PREVIEW_TOKEN_SECRET may be substituted by DEMO_COOKIE_SECRET — accept either.
      const missing = []
      for (const [name, desc] of vars) {
        if (name === 'PREVIEW_TOKEN_SECRET' && env.DEMO_COOKIE_SECRET) continue
        if (!env[name]) missing.push([name, desc])
      }
      return missing
    },
  },
  {
    flag: 'NEXT_PUBLIC_ENABLE_DEMO',
    flagValue: 'true',
    group: 'Demo mode',
    vars: [
      ['DEMO_COOKIE_SECRET', 'HMAC signing secret for demo session cookies. Generate with: openssl rand -base64 32'],
    ],
  },
]

/** Razorpay is archived (payments temporarily disabled); mark optional but warn when present so users know. */
const OPTIONAL_NOTE = [
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'RAZORPAY_WEBHOOK_SECRET',
  'MSG91_WHATSAPP_INTEGRATED_NUMBER',
  'INDEXNOW_KEY',
]

function validate(env) {
  const missing = []

  for (const [group, vars] of Object.entries(REQUIRED_ALWAYS)) {
    const groupMissing = vars.filter(([name]) => !env[name])
    if (groupMissing.length > 0) missing.push([group, groupMissing])
  }

  for (const rule of REQUIRED_CONDITIONAL) {
    if (env[rule.flag] !== rule.flagValue) continue
    const groupMissing = rule.accept
      ? rule.accept({ vars: rule.vars, env })
      : rule.vars.filter(([name]) => !env[name])
    if (groupMissing.length > 0) missing.push([`${rule.group} (${rule.flag}=${rule.flagValue})`, groupMissing])
  }

  return missing
}

function main() {
  const missing = validate(process.env)

  if (missing.length === 0) {
    console.log('[check-env] All required environment variables are set.')
    return
  }

  console.error('\n[check-env] Missing required environment variables:\n')
  for (const [group, vars] of missing) {
    console.error(`  ${group}`)
    for (const [name, desc] of vars) {
      console.error(`    - ${name}`)
      console.error(`      ${desc}`)
    }
    console.error('')
  }
  console.error('Set the missing variables in .env.local (dev) or your hosting provider\'s environment settings (prod).')
  console.error('See .env.example for the full list and descriptions.\n')
  process.exit(1)
}

main()
