import type { LanguageModel } from 'ai'

// Lazy imports to avoid top-level guards breaking test environments
async function getAdminClient() {
  const { supabaseAdmin } = await import('@/lib/supabase/admin')
  return supabaseAdmin
}

async function getAiModel(): Promise<LanguageModel> {
  const { patientModels } = await import('@/lib/ai-config')
  return patientModels
}

/** Fee threshold (in ₹) above which AI analysis is always triggered */
const HIGH_VALUE_BOOKING_THRESHOLD_INR = 5000

/**
 * Booking Anomaly Detection
 *
 * Analyses a newly created booking for suspicious patterns:
 * - Same patient booking many slots in a short window
 * - Unusually high fees compared to provider's standard rate
 * - Provider self-booking or gaming patterns
 *
 * Called asynchronously after a booking is confirmed — does NOT block the booking flow.
 * Flags suspicious bookings for admin review by inserting into `booking_anomalies` table.
 */

export interface AnomalyCheckContext {
  appointmentId: string
  patientId: string
  providerId: string
  feeInr: number
  visitType: string
  bookedAt: string
}

interface PatientBookingHistory {
  recentBookingCount: number
  distinctProviders: number
  totalSpent: number
  bookingsInLastHour: number
}

interface ProviderContext {
  standardFee: number
  totalBookings: number
  verified: boolean
  userId: string | null
}

async function getPatientBookingHistory(patientId: string): Promise<PatientBookingHistory> {
  const admin = await getAdminClient()
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const [
    { data: recentBookings },
    { data: hourBookings },
  ] = await Promise.all([
    admin
      .from('appointments')
      .select('id, provider_id, fee_inr')
      .eq('patient_id', patientId)
      .gte('created_at', oneDayAgo),

    admin
      .from('appointments')
      .select('id')
      .eq('patient_id', patientId)
      .gte('created_at', oneHourAgo),
  ])

  const distinctProviders = new Set(
    (recentBookings ?? []).map(b => b.provider_id as string),
  ).size

  const totalSpent = (recentBookings ?? []).reduce(
    (sum, b) => sum + ((b.fee_inr as number) ?? 0),
    0,
  )

  return {
    recentBookingCount: recentBookings?.length ?? 0,
    distinctProviders,
    totalSpent,
    bookingsInLastHour: hourBookings?.length ?? 0,
  }
}

async function getProviderContext(providerId: string): Promise<ProviderContext> {
  const admin = await getAdminClient()
  const [
    { data: provider, error: providerError },
    { count: bookingCount },
  ] = await Promise.all([
    admin
      .from('providers')
      .select('consultation_fee_inr, verified, user_id')
      .eq('id', providerId)
      .single(),

    admin
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('provider_id', providerId),
  ])

  if (providerError || !provider) {
    throw providerError ?? new Error(`Provider ${providerId} not found for anomaly detection`)
  }

  return {
    standardFee: (provider.consultation_fee_inr as number) ?? 0,
    totalBookings: bookingCount ?? 0,
    verified: (provider.verified as boolean) ?? false,
    userId: (provider.user_id as string) ?? null,
  }
}

function runRuleBasedChecks(
  context: AnomalyCheckContext,
  patientHistory: PatientBookingHistory,
  providerCtx: ProviderContext,
): string[] {
  const flags: string[] = []

  // Rule 1: Rapid booking — 3+ bookings in the last hour
  if (patientHistory.bookingsInLastHour >= 3) {
    flags.push(
      `Rapid booking: Patient made ${patientHistory.bookingsInLastHour} bookings in the last hour`,
    )
  }

  // Rule 2: High daily volume — 5+ bookings in 24 hours
  if (patientHistory.recentBookingCount >= 5) {
    flags.push(
      `High volume: Patient made ${patientHistory.recentBookingCount} bookings in the last 24 hours`,
    )
  }

  // Rule 3: Fee anomaly — booking fee is 2x+ the provider's standard rate
  if (providerCtx.standardFee > 0 && context.feeInr > providerCtx.standardFee * 2) {
    flags.push(
      `Fee anomaly: Booking fee ₹${context.feeInr} is ${Math.round(context.feeInr / providerCtx.standardFee)}x the provider's standard rate of ₹${providerCtx.standardFee}`,
    )
  }

  // Rule 4: Self-booking — patient's user ID matches the provider's user ID (`providers.user_id`)
  if (providerCtx.userId && context.patientId === providerCtx.userId) {
    flags.push('Self-booking: Patient user ID matches the provider\'s user ID')
  }

  // Rule 5: Unverified provider receiving bookings
  if (!providerCtx.verified) {
    flags.push('Unverified provider: Booking made with a provider who is not yet verified')
  }

  return flags
}

async function runAiAnomalyCheck(
  context: AnomalyCheckContext,
  patientHistory: PatientBookingHistory,
  providerCtx: ProviderContext,
  ruleFlags: string[],
): Promise<{ isAnomaly: boolean; severity: 'low' | 'medium' | 'high'; reason: string }> {
  const prompt = `You are a fraud detection analyst for BookPhysio.in, a physiotherapy booking platform in India.

Analyze this booking for suspicious patterns. Be conservative — only flag genuinely suspicious activity.

BOOKING DETAILS:
- Appointment ID: ${context.appointmentId}
- Visit type: ${context.visitType}
- Fee: ₹${context.feeInr}
- Booked at: ${context.bookedAt}

PATIENT HISTORY (last 24 hours):
- Bookings made: ${patientHistory.recentBookingCount}
- Distinct providers booked: ${patientHistory.distinctProviders}
- Total spent: ₹${patientHistory.totalSpent}
- Bookings in last hour: ${patientHistory.bookingsInLastHour}

PROVIDER CONTEXT:
- Standard consultation fee: ₹${providerCtx.standardFee}
- Total bookings received: ${providerCtx.totalBookings}
- Verified: ${providerCtx.verified}

RULE-BASED FLAGS ALREADY DETECTED:
${ruleFlags.length > 0 ? ruleFlags.map(f => `- ${f}`).join('\n') : '- None'}

Respond with JSON only (no markdown, no code fences):
{
  "isAnomaly": true/false,
  "severity": "low" | "medium" | "high",
  "reason": "Brief explanation of why this is or isn't suspicious"
}`

  try {
    const { generateText } = await import('ai')
    const model = await getAiModel()
    const { text } = await generateText({
      model,
      prompt,
      temperature: 0.1,
      maxOutputTokens: 300,
    })

    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const result = JSON.parse(cleaned) as {
      isAnomaly: boolean
      severity: 'low' | 'medium' | 'high'
      reason: string
    }

    return {
      isAnomaly: Boolean(result.isAnomaly),
      severity: ['low', 'medium', 'high'].includes(result.severity) ? result.severity : 'low',
      reason: typeof result.reason === 'string' ? result.reason : 'Unknown',
    }
  } catch (error) {
    console.error('[anomaly-detection] AI check failed:', error)
    // If AI fails, fall back to rule-based flags only
    return {
      isAnomaly: ruleFlags.length > 0,
      severity: ruleFlags.length >= 3 ? 'high' : ruleFlags.length >= 1 ? 'medium' : 'low',
      reason: ruleFlags.length > 0
        ? `Rule-based detection: ${ruleFlags.join('; ')}`
        : 'No anomalies detected',
    }
  }
}

async function storeAnomaly(
  context: AnomalyCheckContext,
  severity: string,
  reason: string,
  ruleFlags: string[],
): Promise<void> {
  const admin = await getAdminClient()
  const { error } = await admin
    .from('booking_anomalies')
    .insert({
      appointment_id: context.appointmentId,
      patient_id: context.patientId,
      provider_id: context.providerId,
      severity,
      reason,
      rule_flags: ruleFlags,
      reviewed: false,
      created_at: new Date().toISOString(),
    })

  if (error) {
    // Table may not exist yet — log but don't break
    console.warn('[anomaly-detection] Failed to store anomaly (table may not exist):', error.message)
  }
}

/**
 * Check a newly created booking for anomalies.
 * This function is designed to be called fire-and-forget after booking creation.
 * It never throws — all errors are caught and logged.
 */
export async function checkBookingAnomaly(context: AnomalyCheckContext): Promise<void> {
  try {
    const [patientHistory, providerCtx] = await Promise.all([
      getPatientBookingHistory(context.patientId),
      getProviderContext(context.providerId),
    ])

    // Step 1: Rule-based checks (fast, no API call)
    const ruleFlags = runRuleBasedChecks(context, patientHistory, providerCtx)

    // Step 2: AI-enhanced analysis (only if rule flags exist OR high-value booking)
    const shouldRunAi = ruleFlags.length > 0 || context.feeInr > HIGH_VALUE_BOOKING_THRESHOLD_INR
    let aiResult: { isAnomaly: boolean; severity: 'low' | 'medium' | 'high'; reason: string } = {
      isAnomaly: false,
      severity: 'low',
      reason: 'No anomalies detected',
    }

    if (shouldRunAi) {
      aiResult = await runAiAnomalyCheck(context, patientHistory, providerCtx, ruleFlags)
    } else if (ruleFlags.length > 0) {
      aiResult = {
        isAnomaly: true,
        severity: ruleFlags.length >= 3 ? 'high' : 'medium',
        reason: ruleFlags.join('; '),
      }
    }

    // Step 3: Store anomaly if detected
    if (aiResult.isAnomaly || ruleFlags.length > 0) {
      await storeAnomaly(context, aiResult.severity, aiResult.reason, ruleFlags)
      console.warn(
        `[anomaly-detection] Anomaly detected for appointment ${context.appointmentId}: ` +
        `severity=${aiResult.severity}, reason=${aiResult.reason}`,
      )
    }
  } catch (error) {
    // Never let anomaly detection crash the booking flow
    console.error('[anomaly-detection] Check failed (non-blocking):', error)
  }
}
