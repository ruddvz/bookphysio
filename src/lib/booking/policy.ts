export type VisitType = 'in_clinic' | 'home_visit'

const HOME_VISIT_MULTIPLIER = 1.3
const BOOKING_META_START = '[BookPhysioMeta]'
const BOOKING_META_END = '[/BookPhysioMeta]'
const APPOINTMENT_NOTES_SCHEMA = 'bookphysio-appointment-notes-v1'

export interface ParsedAppointmentNotes {
  homeVisitAddress: string | null
  patientReason: string | null
  providerNotes: string | null
  legacyNotes: string | null
}

interface SerializedAppointmentNotes {
  __bookphysio: typeof APPOINTMENT_NOTES_SCHEMA
  homeVisitAddress?: string | null
  patientReason?: string | null
  providerNotes?: string | null
  legacyNotes?: string | null
}

function normalizeText(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function isSerializedAppointmentNotes(value: unknown): value is SerializedAppointmentNotes {
  return Boolean(
    value &&
      typeof value === 'object' &&
      '__bookphysio' in value &&
      (value as { __bookphysio?: unknown }).__bookphysio === APPOINTMENT_NOTES_SCHEMA,
  )
}

function serializeAppointmentNotes(input: ParsedAppointmentNotes): string | null {
  const homeVisitAddress = normalizeText(input.homeVisitAddress)
  const patientReason = normalizeText(input.patientReason)
  const providerNotes = normalizeText(input.providerNotes)
  const legacyNotes = normalizeText(input.legacyNotes)

  if (!homeVisitAddress && !patientReason && !providerNotes && !legacyNotes) {
    return null
  }

  return JSON.stringify({
    __bookphysio: APPOINTMENT_NOTES_SCHEMA,
    homeVisitAddress,
    patientReason,
    providerNotes,
    legacyNotes,
  } satisfies SerializedAppointmentNotes)
}

export function isVisitType(value: string | null | undefined): value is VisitType {
  return value === 'in_clinic' || value === 'home_visit'
}

export function collectVisitTypes(
  locations: Array<{ visit_type?: readonly string[] | null }> | null | undefined,
): VisitType[] {
  const visitTypeOrder: VisitType[] = ['in_clinic', 'home_visit']
  const collected = new Set<VisitType>()

  for (const location of locations ?? []) {
    for (const visitType of location.visit_type ?? []) {
      if (isVisitType(visitType)) {
        collected.add(visitType)
      }
    }
  }

  return visitTypeOrder.filter((visitType) => collected.has(visitType))
}

export function getVisitTypeConsultationFee(
  baseFeeInr: number | null | undefined,
  visitType: VisitType | string | null | undefined,
): number {
  const normalizedBaseFee = Number.isFinite(baseFeeInr) ? Math.max(0, Math.round(baseFeeInr ?? 0)) : 0

  if (visitType === 'home_visit') {
    return Math.round(normalizedBaseFee * HOME_VISIT_MULTIPLIER)
  }

  return normalizedBaseFee
}

export function parseAppointmentNotes(notes: string | null | undefined): ParsedAppointmentNotes {
  const rawNotes = normalizeText(notes)

  if (!rawNotes) {
    return {
      homeVisitAddress: null,
      patientReason: null,
      providerNotes: null,
      legacyNotes: null,
    }
  }

  try {
    const parsedNotes = JSON.parse(rawNotes) as unknown

    if (isSerializedAppointmentNotes(parsedNotes)) {
      return {
        homeVisitAddress: normalizeText(parsedNotes.homeVisitAddress ?? null),
        patientReason: normalizeText(parsedNotes.patientReason ?? null),
        providerNotes: normalizeText(parsedNotes.providerNotes ?? null),
        legacyNotes: normalizeText(parsedNotes.legacyNotes ?? null),
      }
    }
  } catch {
    // Fall through to legacy parsing for pre-existing rows.
  }

  if (!rawNotes.startsWith(BOOKING_META_START)) {
    return {
      homeVisitAddress: null,
      patientReason: null,
      providerNotes: null,
      legacyNotes: rawNotes,
    }
  }

  const metadataEndIndex = rawNotes.indexOf(BOOKING_META_END)
  if (metadataEndIndex < 0) {
    return {
      homeVisitAddress: null,
      patientReason: null,
      providerNotes: null,
      legacyNotes: rawNotes,
    }
  }

  const metadataJson = rawNotes.slice(BOOKING_META_START.length, metadataEndIndex).trim()
  const providerNotes = normalizeText(rawNotes.slice(metadataEndIndex + BOOKING_META_END.length))

  try {
    const metadata = JSON.parse(metadataJson) as {
      homeVisitAddress?: string
      patientReason?: string
    }

    return {
      homeVisitAddress: normalizeText(metadata.homeVisitAddress),
      patientReason: normalizeText(metadata.patientReason),
      providerNotes,
      legacyNotes: null,
    }
  } catch {
    return {
      homeVisitAddress: null,
      patientReason: null,
      providerNotes: null,
      legacyNotes: rawNotes,
    }
  }
}

export function buildAppointmentNotes(input: {
  visitType: VisitType | string
  notes?: string | null
  patientAddress?: string | null
}): string | null {
  return serializeAppointmentNotes({
    homeVisitAddress: input.visitType === 'home_visit' ? input.patientAddress ?? null : null,
    patientReason: input.notes ?? null,
    providerNotes: null,
    legacyNotes: null,
  })
}

export function updateProviderAppointmentNotes(
  existingNotes: string | null | undefined,
  providerNotes: string | null | undefined,
): string | null {
  const parsed = parseAppointmentNotes(existingNotes)

  return serializeAppointmentNotes({
    homeVisitAddress: parsed.homeVisitAddress,
    patientReason: parsed.patientReason,
    providerNotes: providerNotes ?? null,
    legacyNotes: parsed.legacyNotes,
  })
}