import { createGoogleGenerativeAI } from '@ai-sdk/google'

// 1. Initialize API Providers securely
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || 'missing-key-google',
})

// 2. Define High-Speed Triage Models (Patient App)
export const patientModels = google('gemini-1.5-flash')

// 3. Define Advanced Clinical Reasoning Models (Provider App)
export const providerModels = google('gemini-1.5-pro')
