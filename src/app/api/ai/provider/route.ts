import { providerModels } from '@/lib/ai-config'
import { streamText } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { createClient } from '@/lib/supabase/server'
import { parseDemoCookie } from '@/lib/demo/session'
import { aiChatRequestSchema } from '@/lib/validations/ai'

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null

const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '1 h'),
    })
  : null

// MOCK KNOWLEDGE BASE (In production, replace with Supabase pgvector)
const CLINICAL_KNOWLEDGE = `
  CLINICAL GUIDELINES (2021-2024):
  - [C1] Rotator Cuff: Manual therapy and progressive exercise recommended. (Cochrane, 2023)
  - [C2] Low Back Pain (LBP): Core stabilization + manual therapy reduces pain intensity in L4-L5 radiculopathy vs rest. (J. Physical Therapy Science, 2021)
  - [C3] Achilles Tendinopathy: Eccentric loading is superior to concentric. (BJSM, 2022)
  - [C4] ACL Post-Op (Phase 2): Emphasize closed kinetic chain exercises (squats) before open chain. (JOSPT, 2023)
`

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const demoSession = !user ? parseDemoCookie(req.cookies.get('bp-demo-session')?.value) : null

    if (!user && demoSession?.role !== 'provider') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'provider') {
        return new NextResponse('Forbidden', { status: 403 })
      }
    }

    if (ratelimit) {
      const rateLimitKey = user?.id ?? demoSession?.userId ?? 'demo-provider'
      const { success } = await ratelimit.limit(rateLimitKey)
      if (!success) {
        return new NextResponse('Rate limit exceeded. Please wait a bit before asking BookPhysio AI again.', { status: 429 })
      }
    }

    const parsed = aiChatRequestSchema.safeParse(await req.json())
    if (!parsed.success) {
      return new NextResponse('Invalid chat request.', { status: 400 })
    }

    const { messages } = parsed.data

    const systemPrompt = `
      You are BookPhysio AI, the clinical copilot for registered physiotherapists on BookPhysio.in.
      You are a clinical decision support tool designed to provide peer-reviewed, evidence-based physical therapy protocols.
      
      YOUR ROLE:
      1. Analyze the clinical case provided by the doctor.
      2. Suggest multi-modal rehabilitation protocols based ONLY on current best evidence.
      3. CRITICAL: Whenever you make a clinical claim, you MUST cite one of the following sources using the exact format [CX]:
      
      ${CLINICAL_KNOWLEDGE}
      
      Tone: Academic, concise, medical professional. Do not use empathetic fluff. Use anatomical and biomechanical terminology.
      
      STRICT GUARDRAILS:
      - BookPhysio AI is exclusively a strict clinical decision support engine for physiotherapists.
      - If the prompt is outside the scope of physical therapy, biomechanics, injury protocols, or clinical research (e.g., asking for a cookie recipe, Python code, history facts, or legal advice), you MUST outright decline.
      - Never break character. Never answer off-topic queries. Reply: "I am BookPhysio AI, a clinical decision support tool for BookPhysio.in. I cannot process inquiries outside the scope of musculoskeletal rehabilitation and physiotherapy research."
    `

    const result = streamText({
      model: providerModels,
      system: systemPrompt,
      messages,
      temperature: 0.2,
    })

    return result.toTextStreamResponse()

  } catch (error: unknown) {
    console.error('Provider AI Error:', error)
    return new NextResponse('An error occurred. BookPhysio AI is currently syncing with the database.', { status: 500 })
  }
}
