'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

type Plan = {
  tier: 'free' | 'pro' | 'max'
  name: string
  price: number
  description: string
  features: readonly string[]
  recommended?: boolean
}

const PLANS: readonly Plan[] = [
  {
    tier: 'free',
    name: 'Free',
    price: 0,
    description: 'Get started with the basics',
    features: [
      '5 booking requests per month',
      'Basic profile listing',
      'Patient messaging',
    ],
  },
  {
    tier: 'pro',
    name: 'Pro',
    price: 100,
    description: 'For growing practices',
    features: [
      'Unlimited booking requests',
      'Priority in search results',
      'Analytics dashboard',
      'All Free features',
    ],
    recommended: true,
  },
  {
    tier: 'max',
    name: 'Max',
    price: 200,
    description: 'For established clinics',
    features: [
      'Featured profile badge',
      'Multiple clinic locations',
      'SMS booking alerts',
      'All Pro features',
    ],
  },
]

interface SubscriptionPlansProps {
  currentTier?: string
}

export function SubscriptionPlans({ currentTier = 'free' }: SubscriptionPlansProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSelect(tier: string, price: number) {
    if (price > 0) {
      setMessage('Paid plans are coming soon. We\'ll notify you when they launch!')
      return
    }
    setLoading(tier)
    setMessage(null)
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      })
      const data = await res.json() as { message?: string; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Failed to update')
      setMessage(data.message ?? 'Plan updated')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isCurrent = plan.tier === currentTier
          return (
            <div
              key={plan.tier}
              className={cn(
                'relative rounded-2xl border p-6 flex flex-col gap-4',
                isCurrent
                  ? 'border-bp-accent bg-bp-accent/10'
                  : 'border-bp-border bg-white',
                plan.recommended && !isCurrent && 'border-bp-accent'
              )}
            >
              {plan.recommended && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-bp-accent text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Recommended
                </span>
              )}
              <div>
                <h3 className="text-lg font-semibold text-bp-primary">{plan.name}</h3>
                <p className="text-sm text-bp-body">{plan.description}</p>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-bold text-bp-primary">
                  {plan.price === 0 ? 'Free' : `₹${plan.price}`}
                </span>
                {plan.price > 0 && (
                  <span className="text-sm text-bp-body mb-1">/month</span>
                )}
              </div>
              <ul className="space-y-2 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-[#555]">
                    <Check className="w-4 h-4 text-bp-accent mt-0.5 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSelect(plan.tier, plan.price)}
                disabled={isCurrent || loading === plan.tier}
                className={cn(
                  'w-full py-2.5 rounded-full text-sm font-semibold transition-colors',
                  isCurrent
                    ? 'bg-bp-accent text-white cursor-default'
                    : plan.price > 0
                    ? 'bg-bp-surface text-bp-body hover:bg-gray-200'
                    : 'bg-bp-accent text-white hover:bg-bp-primary'
                )}
              >
                {isCurrent
                  ? 'Current plan'
                  : loading === plan.tier
                  ? 'Updating...'
                  : plan.price > 0
                  ? 'Coming soon'
                  : `Select ${plan.name}`}
              </button>
            </div>
          )
        })}
      </div>
      {message && (
        <p className="text-sm text-center text-bp-accent">{message}</p>
      )}
    </div>
  )
}
