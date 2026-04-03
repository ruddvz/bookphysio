const PATIENT_CANCELLATION_NOTICE_HOURS = 4
const PATIENT_CANCELLATION_NOTICE_MS = PATIENT_CANCELLATION_NOTICE_HOURS * 60 * 60 * 1000

export function canPatientCancelAppointment(
  status: string,
  startsAt: string | null | undefined,
  now: Date = new Date(),
) {
  if (status !== 'pending' && status !== 'confirmed') {
    return false
  }

  if (!startsAt) {
    return false
  }

  const startsAtMs = Date.parse(startsAt)

  if (Number.isNaN(startsAtMs)) {
    return false
  }

  return startsAtMs - now.getTime() >= PATIENT_CANCELLATION_NOTICE_MS
}

export { PATIENT_CANCELLATION_NOTICE_HOURS }