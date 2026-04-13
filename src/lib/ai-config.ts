import { createGoogleGenerativeAI } from '@ai-sdk/google'

if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is required in production')
  }
  console.warn('WARNING: GOOGLE_GENERATIVE_AI_API_KEY is not set. AI features will fail.')
}

// 1. Initialize API Providers securely — no dummy fallback
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? '',
})

// 2. Define High-Speed Triage Models (Patient App)
export const patientModels = google('gemini-2.0-flash')

// 3. Define Advanced Clinical Reasoning Models (Provider App)
export const providerModels = google('gemini-2.0-flash')
