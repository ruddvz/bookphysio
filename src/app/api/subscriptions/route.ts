import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

const SUBSCRIPTION_PLANS = {
  free: {
    tier: 'free',
    name: 'Free',
    price_inr: 0,
    booking_requests_limit: 5,
    features: [
      '5 booking requests per month',
      'Basic profile listing',
      'Patient messaging',
    ],
  },
  pro: {
    tier: 'pro',
    name: 'Pro',
    price_inr: 100,
    booking_requests_limit: null, // unlimited
    features: [
      'Unlimited booking requests',
      'Priority in search results',
      'Analytics dashboard',
      'All Free features',
    ],
  },
  max: {
    tier: 'max',
    name: 'Max',
    price_inr: 200,
    booking_requests_limit: null, // unlimited
    features: [
      'Featured profile badge',
      'Multiple clinic locations',
      'SMS booking alerts',
      'All Pro features',
    ],
  },
} as const

export type SubscriptionTier = keyof typeof SUBSCRIPTION_PLANS

/** GET /api/subscriptions — returns current provider subscription + plan details */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch subscription (provider must exist)
  const { data: subscription, error } = await supabase
    .from('provider_subscriptions')
    .select('*')
    .eq('provider_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: 'Failed to load subscription' }, { status: 500 })
  }

  // If no subscription row yet, default to free
  const current = subscription ?? {
    tier: 'free',
    status: 'active',
    booking_requests_used: 0,
    booking_requests_limit: 5,
  }

  return NextResponse.json({
    subscription: current,
    plans: SUBSCRIPTION_PLANS,
  })
}

/** POST /api/subscriptions — select a plan (free only for now, paid will require Razorpay) */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const tier = body?.tier as SubscriptionTier | undefined

  if (!tier || !SUBSCRIPTION_PLANS[tier]) {
    return NextResponse.json({ error: 'Invalid subscription tier' }, { status: 400 })
  }

  const plan = SUBSCRIPTION_PLANS[tier]

  if (plan.price_inr > 0) {
    // Paid plans will be wired to Razorpay later
    return NextResponse.json({
      error: 'Paid subscriptions coming soon. Payment integration in progress.',
    }, { status: 503 })
  }

  // Downgrade to free is always allowed
  const { error } = await supabaseAdmin
    .from('provider_subscriptions')
    .upsert({
      provider_id: user.id,
      tier: 'free',
      status: 'active',
      booking_requests_limit: 5,
      current_period_start: new Date().toISOString(),
      current_period_end: null,
    }, { onConflict: 'provider_id' })

  if (error) return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })

  return NextResponse.json({ message: 'Switched to Free plan', tier: 'free' })
}
