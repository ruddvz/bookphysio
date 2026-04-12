const SUPPORT_DEFAULT_REPLY = [
  "BookPhysio.in helps patients book IAP-verified physiotherapists across India for in-clinic sessions and home visits.",
  'You can ask me about booking, pricing, home visits, providers, cancellations, dashboards, messages, or platform support.',
  'Tell me what you need help with and I’ll guide you to the right next step.',
].join(' ')

function includesAny(text: string, phrases: string[]) {
  return phrases.some((phrase) => text.includes(phrase))
}

export function buildSupportFallbackReply(question: string): string {
  const normalized = question.trim().toLowerCase()

  if (!normalized) {
    return SUPPORT_DEFAULT_REPLY
  }

  if (includesAny(normalized, ['book', 'booking', 'appointment', 'session', 'consult'])) {
    return [
      'You can book a session on BookPhysio.in by searching for a physiotherapist, opening their profile, and choosing an available slot.',
      'Appointments can be managed from the patient dashboard after booking.',
      'If you want, ask me about home visits, pricing, or what to expect before your first session.',
    ].join(' ')
  }

  if (includesAny(normalized, ['home visit', 'home care', 'at home', 'visit at home'])) {
    return [
      'Yes — BookPhysio.in supports home-visit physiotherapy where providers offer that service.',
      'You can filter by visit type during search and choose a provider with home visits enabled.',
      'Travel charges, if any, are set by the physiotherapist and shown during booking.',
    ].join(' ')
  }

  if (includesAny(normalized, ['price', 'pricing', 'fee', 'fees', 'cost', 'subscription', 'plan'])) {
    return [
      'BookPhysio.in pricing is shown in ₹ and usually depends on the provider, visit type, and city.',
      'First sessions are commonly in the ₹500–₹1500 range, and some providers may offer discounted bundles or subscription-style packages.',
      'You can check provider pages or the pricing section for exact details before booking.',
    ].join(' ')
  }

  if (includesAny(normalized, ['cancel', 'reschedule', 'change slot', 'change appointment'])) {
    return [
      'You can manage bookings from the patient dashboard on BookPhysio.in.',
      'There you can review appointment details and cancel or reschedule eligible sessions.',
      'If a specific booking is blocked or failing, support@bookphysio.in can help.',
    ].join(' ')
  }

  if (includesAny(normalized, ['provider', 'physio', 'doctor', 'verified', 'iap', 'registration'])) {
    return [
      'BookPhysio.in lists physiotherapists and verifies provider credentials before approval.',
      'Patients can search by city, specialty, and visit type to find the right provider.',
      'If you want help choosing between clinic and home-visit options, ask me and I’ll narrow it down.',
    ].join(' ')
  }

  if (includesAny(normalized, ['dashboard', 'patient', 'provider', 'admin', 'message', 'chat', 'notification', 'profile', 'payment'])) {
    return [
      'BookPhysio.in has separate patient, provider, and admin dashboards for appointments, records, messages, payments, and operational tasks.',
      'If something is not loading or not connected correctly, tell me which dashboard section you are using and I’ll guide you.',
    ].join(' ')
  }

  if (includesAny(normalized, ['motio', 'ai', 'support', 'bookphysio.in', 'bookphysio'])) {
    return [
      'BookPhysio.in includes support and AI-assisted flows for booking and recovery guidance.',
      'This support chat is for platform help such as booking, pricing, dashboards, and provider availability.',
      'For symptom triage or recovery guidance, use Motio AI inside the patient area.',
    ].join(' ')
  }

  return SUPPORT_DEFAULT_REPLY
}
