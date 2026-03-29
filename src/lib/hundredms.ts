import jwt from 'jsonwebtoken'

function createManagementToken(): string {
  const payload = {
    access_key: process.env.HMS_APP_ACCESS_KEY!,
    type: 'management',
    version: 2,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400,
  }
  return jwt.sign(payload, process.env.HMS_APP_SECRET!, { algorithm: 'HS256' })
}

interface HmsRoomResponse {
  id: string
}

export async function createTelehealthRoom(appointmentId: string): Promise<string> {
  const token = createManagementToken()
  const res = await fetch('https://api.100ms.live/v2/rooms', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: `appointment-${appointmentId}`,
      description: 'bookphysio telehealth session',
      template_id: process.env.HMS_TEMPLATE_ID,
    }),
  })
  const data = await res.json() as HmsRoomResponse
  return data.id
}
