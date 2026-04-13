import { createGoogleGenerativeAI } from '@ai-sdk/google'

if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && process.env.NODE_ENV === 'production') {
  throw new Error(
    '[ai-config] GOOGLE_GENERATIVE_AI_API_KEY must be set in production.'
  )
}

// 1. Initialize API Providers securely
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || 'placeholder-ai-key',
})

// 2. Define High-Speed Triage Models (Patient App)
export const patientModels = google('gemini-2.0-flash')

// 3. Define Advanced Clinical Reasoning Models (Provider App)
export const providerModels = google('gemini-2.0-flash')
