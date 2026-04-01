import { SDK as HMSSDK } from '@100mslive/server-sdk'

function getClient() {
  return new HMSSDK(
    process.env.HMS_APP_ACCESS_KEY || 'dummy_key',
    process.env.HMS_APP_SECRET || 'dummy_secret',
  )
}

export async function createTelehealthRoom(appointmentId: string): Promise<string> {
  const hms = getClient()
  const room = await hms.rooms.create({
    name: `appointment-${appointmentId}`,
    description: 'bookphysio telehealth session',
    template_id: process.env.HMS_TEMPLATE_ID,
  })
  return room.id
}

export async function createAuthToken(roomId: string, userId: string, role = 'guest'): Promise<string> {
  const hms = getClient()
  const { token } = await hms.auth.getAuthToken({ roomId, userId, role })
  return token
}

/** Returns an existing enabled room code for the role, or creates one. */
export async function getOrCreateRoomCode(roomId: string, role: string): Promise<string> {
  const hms = getClient()
  for await (const code of hms.roomCodes.list(roomId, { role, enabled: true })) {
    return code.code
  }
  const code = await hms.roomCodes.createForRole(roomId, role)
  return code.code
}
