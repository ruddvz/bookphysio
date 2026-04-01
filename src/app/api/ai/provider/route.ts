import { providerModels } from '@/lib/ai-config'
import { streamText } from 'ai'
import { NextRequest, NextResponse } from 'next/server'

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
    const { messages } = await req.json()

    const systemPrompt = `
      You are Motio Research AI, built for BookPhysio.in's registered physiotherapists.
      You are a clinical decision support tool designed to provide peer-reviewed, evidence-based physical therapy protocols.
      
      YOUR ROLE:
      1. Analyze the clinical case provided by the doctor.
      2. Suggest multi-modal rehabilitation protocols based ONLY on current best evidence.
      3. CRITICAL: Whenever you make a clinical claim, you MUST cite one of the following sources using the exact format [CX]:
      
      ${CLINICAL_KNOWLEDGE}
      
      Tone: Academic, concise, medical professional. Do not use empathetic fluff. Use anatomical and biomechanical terminology.
      
      STRICT GUARDRAILS:
      - Motio Research AI is exclusively a strict clinical decision support engine for Physiotherapists.
      - If the prompt is outside the scope of physical therapy, biomechanics, injury protocols, or clinical research (e.g., asking for a cookie recipe, Python code, history facts, or legal advice), you MUST outright decline.
      - Never break character. Never answer off-topic queries. Reply: "I am a clinical decision support tool for BookPhysio.in. I cannot process inquiries outside the scope of musculoskeletal rehabilitation and physiotherapy research."
    `

    const result = streamText({
      model: providerModels,
      system: systemPrompt,
      messages,
      temperature: 0.2,
    })

    return result.toTextStreamResponse()

  } catch (error: any) {
    console.error('Provider AI Error:', error)
    return new NextResponse('An error occurred. Motio is currently syncing with the database.', { status: 500 })
  }
}
