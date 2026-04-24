import { getActiveBookingAppointmentHoldKey, redis, releaseRedisLockIfOwned } from '@/lib/upstash'

/** Clears Redis keys used for booking IP ↔ appointment holds (same logic as patient cancel). */
export async function clearActiveBookingHold(appointmentId: string): Promise<void> {
  try {
    const appointmentHoldKey = getActiveBookingAppointmentHoldKey(appointmentId)
    const activeIpHoldKey = await redis.get<string>(appointmentHoldKey)

    if (typeof activeIpHoldKey === 'string' && activeIpHoldKey.trim()) {
      await releaseRedisLockIfOwned(activeIpHoldKey, appointmentId)
    }

    await redis.del(appointmentHoldKey)
  } catch (error) {
    console.error('[booking] Failed to clear active booking hold:', error)
  }
}
