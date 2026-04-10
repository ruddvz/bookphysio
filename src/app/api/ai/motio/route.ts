import { patientModels } from '@/lib/ai-config'
import { streamText } from 'ai'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'
import { getRequestIpAddress } from '@/lib/server/runtime'
import { aiChatRequestSchema } from '@/lib/validations/ai'
import { createClient } from '@/lib/supabase/server'
import { getDemoSessionFromCookies } from '@/lib/demo/session'

// Safely initialize the rate limiter if environment variables exist
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null

const ratelimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(20, '1 h'), // 20 requests per hour per user/IP
    })
  : null

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check — require a valid session (real user or demo)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const demoSession = !user ? await getDemoSessionFromCookies(req.cookies) : null

    if (!user && !demoSession) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // 2. Rate Limiting — key by user ID or IP
    if (ratelimit) {
      const rateLimitKey = user?.id ?? demoSession?.userId ?? getRequestIpAddress(req) ?? 'anonymous'
      const { success } = await ratelimit.limit(rateLimitKey)

      if (!success) {
        return new NextResponse("Rate limit exceeded. Please wait a bit before asking BookPhysio AI again.", { status: 429 })
      }
    }

    // 3. Read and validate the messages from the frontend
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return new NextResponse('Invalid chat request.', { status: 400 })
    }

    const parsed = aiChatRequestSchema.safeParse(body)
    if (!parsed.success) {
      return new NextResponse('Invalid chat request.', { status: 400 })
    }

    const { messages } = parsed.data

    // 4. System Persona Prompt
    const systemPrompt = `
      You are BookPhysio AI, an empathetic and highly professional personal recovery companion built for BookPhysio.in, an Indian physiotherapy platform.
      
      YOUR ROLE:
      1. Triage patient symptoms gently (ask clarifying questions about their pain, like "Is it a sharp catch or a dull ache?").
      2. Provide general advice, but ALWAYS insist they see a professional for a true diagnosis.
      3. Keep responses concise, warm, and highly readable (use bullet points and bold text where helpful).
      4. DO NOT provide medical diagnoses or tell them to take medication. You are a triage and guidance assistant.
      
      When the user describes their pain, validate their experience, ask one follow-up question, and offer a general tip (e.g., "R.I.C.E. for swelling") while recommending they book a consultation on the platform.
      
      STRICT GUARDRAILS:
      - You are exclusively a Physiotherapy and Recovery AI for BookPhysio.in.
      - If a user asks ANYTHING outside of musculoskeletal health, physiotherapy, injury recovery, or biomechanics (for example: coding help, general knowledge, a recipe for cookies, political opinions), you MUST completely refuse to answer.
      - Reply politely but firmly: "I am BookPhysio AI, a specialized physical recovery assistant. I cannot assist with [topic], but I am ready to help you triage any physical pain or injuries you might have."
    `

    // 5. Connect to Google Gemini (or any LLM) and stream the response
    const result = streamText({
      model: patientModels, 
      system: systemPrompt,
      messages,
      temperature: 0.5,
    })

    return result.toTextStreamResponse()
    
  } catch (error: unknown) {
    console.error('BookPhysio AI Error:', error)
      return new NextResponse('An error occurred during triage. Please try again later.', { status: 500 })
  }
}
