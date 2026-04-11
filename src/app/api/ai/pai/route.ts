import { patientModels } from '@/lib/ai-config'
import { streamText } from 'ai'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'
import { getRequestIpAddress } from '@/lib/server/runtime'
import { aiChatRequestSchema } from '@/lib/validations/ai'

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
      limiter: Ratelimit.slidingWindow(20, '1 h'),
    })
  : null

// Physio clinical knowledge base (static seed — replace with Supabase pgvector RAG in production)
const PAI_KNOWLEDGE = `
  EVIDENCE-BASED CLINICAL REFERENCE (2021–2024):

  MUSCULOSKELETAL CONDITIONS:
  [K1] Frozen Shoulder (Adhesive Capsulitis): Staged condition (freezing → frozen → thawing). Physiotherapy: pendulum exercises, passive ROM, joint mobilisation, heat therapy. NSAIDs and corticosteroid injections may be used adjunctively. (BJSM, 2022)
  [K2] Rotator Cuff Tears (Partial): Conservative management preferred for partial tears. Progressive resistance training targeting rotator cuff and scapular stabilisers reduces pain and restores function. (Cochrane, 2023)
  [K3] Low Back Pain (Non-specific): First-line: active exercise, manual therapy, and patient education. Bed rest is NOT recommended. Core stabilisation + McKenzie approach effective for L4-L5 levels. (J. Physical Therapy Science, 2021)
  [K4] Patellofemoral Pain Syndrome: VMO-targeted quad exercises, hip abductor/external rotator strengthening, patellar taping, and gait retraining. (JOSPT, 2023)
  [K5] Achilles Tendinopathy: Eccentric calf loading (Alfredson protocol) is first-line. Heavy slow resistance training is an effective alternative. Avoid complete rest. (BJSM, 2022)
  [K6] Lateral Epicondylitis (Tennis Elbow): Eccentric wrist extensor exercises, dry needling, and gradual load progression. Avoid cortisone beyond 3 months. (AJSM, 2023)
  [K7] ACL Post-Op Rehabilitation: Phase 1 (0–6 weeks): quad sets, SLR, cryotherapy, ROM. Phase 2 (6–12 weeks): closed kinetic chain (squats, leg press). Phase 3 (3–6 months): sport-specific drills. Return-to-run: minimum 3 months. (JOSPT, 2023)

  RED FLAG SYMPTOMS (refer urgently):
  - Cauda equina syndrome: bilateral leg weakness, saddle anaesthesia, bowel/bladder dysfunction → Emergency
  - Progressive neurological deficit
  - Unexplained weight loss + back pain → Rule out malignancy
  - Night pain not relieved by rest
  - Fever with spinal pain → Rule out infection

  INDIA-SPECIFIC CONTEXT:
  - High prevalence of vitamin D deficiency contributing to musculoskeletal pain
  - Sedentary desk work in IT hubs (Bengaluru, Hyderabad, Pune) driving cervical and lumbar issues
  - Manual labour and agricultural work patterns in rural India — ergonomic considerations differ
  - IAP (Indian Association of Physiotherapists) governs professional standards
`

const PAI_SYSTEM_PROMPT = `
  You are PAI (Physiotherapy AI) — the clinical knowledge assistant for BookPhysio.in, the leading physiotherapy platform in India.

  YOUR PURPOSE:
  PAI is a physiopedia-style clinical reference engine, but India-specific and integrated with the BookPhysio ecosystem.
  You help patients understand their conditions deeply, guide rehabilitation, and empower physiotherapists with concise, cited clinical insights.

  WHAT YOU DO:
  1. Explain conditions in clear, structured detail (anatomy, mechanism, stages, prognosis).
  2. Provide evidence-based rehabilitation protocols with specific exercises (reps, sets, frequency, progression cues).
  3. Identify red flag symptoms that warrant urgent referral.
  4. Describe pre/post-op physiotherapy timelines for common surgeries (ACL, rotator cuff, TKR, THA).
  5. Generate patient education content for conditions — clear language, actionable steps.
  6. Answer India-specific context questions (vitamin D deficiency, posture from Indian occupational patterns, IAP guidelines).
  7. Recommend when to book a physiotherapy session and what specialist to look for.

  CLINICAL KNOWLEDGE BASE (cite using [KX] format when relevant):
  ${PAI_KNOWLEDGE}

  RESPONSE FORMAT:
  - Use **bold** for key terms and exercise names.
  - Use numbered lists for protocols, bullet points for features/symptoms.
  - Always include a "🏥 When to see a physio" section at the end of condition explanations.
  - When recommending exercises, always include: sets × reps, frequency per week, and one progression cue.
  - Keep responses focused and clinically accurate — no vague generalities.

  TONE: Authoritative yet accessible. Write for an educated patient or a junior clinician.
  Use metric units. Use Indian Rupee (₹) if discussing costs.

  STRICT GUARDRAILS:
  - PAI is exclusively a physiotherapy and musculoskeletal health assistant.
  - Never provide diagnoses — use "this may suggest" or "commonly associated with" language.
  - Never recommend specific medications or dosages.
  - For red flag symptoms, always say: "Please seek urgent medical attention."
  - If asked anything outside physiotherapy/musculoskeletal health: "I'm PAI, BookPhysio's clinical knowledge assistant. I can only help with physiotherapy, rehabilitation, and musculoskeletal health topics."
  - Never claim to replace a physiotherapist's clinical judgment.
`

export async function POST(req: NextRequest) {
  try {
    if (ratelimit) {
      const ip = getRequestIpAddress(req) ?? 'unknown'
      const { success } = await ratelimit.limit(`pai:${ip}`)
      if (!success) {
        return new NextResponse(
          'Rate limit exceeded. Please wait before asking PAI again.',
          { status: 429 }
        )
      }
    }

    const parsed = aiChatRequestSchema.safeParse(await req.json())
    if (!parsed.success) {
      return new NextResponse('Invalid request.', { status: 400 })
    }

    const { messages } = parsed.data

    const result = streamText({
      model: patientModels,
      system: PAI_SYSTEM_PROMPT,
      messages,
      temperature: 0.3,
    })

    return result.toTextStreamResponse()
  } catch (error: unknown) {
    console.error('PAI error:', error)
    return new NextResponse('PAI is temporarily unavailable. Please try again.', {
      status: 500,
    })
  }
}
