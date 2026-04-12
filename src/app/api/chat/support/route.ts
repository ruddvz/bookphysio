import { patientModels } from '@/lib/ai-config'
import { generateText } from 'ai'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'
import { getRequestIpAddress } from '@/lib/server/runtime'
import { aiChatRequestSchema } from '@/lib/validations/ai'
import { buildSupportFallbackReply } from '@/lib/support-chat'

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null

const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(15, '1 h'),
    })
  : null

const SUPPORT_SYSTEM_PROMPT = `
  You are the BookPhysio Support Assistant — a friendly, concise helper for bookphysio.in, India's physiotherapy booking platform.

  ABOUT BOOKPHYSIO:
  - India's first physiotherapy-only booking platform
  - Connects patients with IAP-verified (Indian Association of Physiotherapists) physiotherapists
  - Offers both in-clinic sessions and home visits across major Indian cities
  - Transparent pricing, real-time availability, same-day slots available

  WHAT YOU HELP WITH:
  1. What a physio session involves and what to expect
  2. How to book in-clinic or home visit sessions
  3. Pricing and subscription plans overview
  4. How to find physiotherapists near them by city or specialty
  5. Cancellation and rescheduling policies
  6. What to bring / prepare for a session
  7. How BookPhysio verifies its physiotherapists (IAP credential check)
  8. Technical support for booking issues (escalate to support@bookphysio.in)

  KEY FACTS:
  - Prices are displayed in Indian Rupees (₹) — first session typically ₹500–₹1500 depending on provider and visit type
  - Home visits may have a small additional travel charge set by the physiotherapist
  - Patients can search by city, specialty, or condition at bookphysio.in/search
  - Subscription plans offer discounted session bundles — see bookphysio.in/pricing
  - All appointments can be booked, modified, or cancelled from the patient dashboard

  TONE: Friendly, warm, and concise. Use short paragraphs and bullet points. Always end with a clear next step or CTA.

  ESCALATION: If the user has a billing dispute, urgent medical concern, or technical issue you cannot resolve, say:
  "For this, please email support@bookphysio.in or call us — our team will help within 24 hours."

  STRICT GUARDRAILS:
  - Only answer questions related to BookPhysio's services, physiotherapy, booking, and pricing.
  - Do not provide medical diagnoses or treatment advice — direct those questions to the Motio AI at bookphysio.in/patient/motio.
  - Do not discuss competitors, politics, or unrelated topics.
  - If asked something outside your scope, reply: "I'm the BookPhysio Support Assistant and I'm best suited to help with booking, sessions, and pricing. For clinical questions, try Motio AI at bookphysio.in/patient/motio."
`

export async function POST(req: NextRequest) {
  let latestUserMessage = ''

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return new NextResponse('Invalid request.', { status: 400 })
  }

  try {
    if (ratelimit) {
      const ip = getRequestIpAddress(req) ?? 'unknown'
      const { success } = await ratelimit.limit(`support:${ip}`)
      if (!success) {
        return new NextResponse(
          'Too many requests. Please wait a moment before asking again.',
          { status: 429 }
        )
      }
    }

    const parsed = aiChatRequestSchema.safeParse(body)
    if (!parsed.success) {
      return new NextResponse('Invalid request.', { status: 400 })
    }

    const { messages } = parsed.data
    latestUserMessage = [...messages]
      .reverse()
      .find((message) => message.role === 'user')
      ?.content ?? ''

    const result = await generateText({
      model: patientModels,
      system: SUPPORT_SYSTEM_PROMPT,
      messages,
      temperature: 0.4,
      maxOutputTokens: 512,
    })

    const text = result.text.trim()

    return new NextResponse(
      text.length > 0
        ? text
        : buildSupportFallbackReply(latestUserMessage),
      {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      },
    )
  } catch (error: unknown) {
    console.error('Support chat error:', error)
    return new NextResponse(buildSupportFallbackReply(latestUserMessage), {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    })
  }
}
