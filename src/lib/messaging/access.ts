type MessagingParticipantRole = 'patient' | 'provider'

interface MaybeSingleResult {
  data: { id: string } | null
  error: { code?: string } | null
}

interface AppointmentRelationshipQuery {
  eq: (column: string, value: string) => AppointmentRelationshipQuery
  limit: (value: number) => AppointmentRelationshipQuery
  in: (column: string, values: string[]) => AppointmentRelationshipQuery
  maybeSingle: () => PromiseLike<MaybeSingleResult>
}

interface SupabaseAdminLike {
  from: (table: string) => {
    select: (columns: string) => AppointmentRelationshipQuery
  }
}

export type { SupabaseAdminLike }

export async function hasMessagingCareRelationship(
  supabaseAdmin: SupabaseAdminLike,
  currentUserId: string,
  currentUserRole: MessagingParticipantRole,
  otherUserId: string,
  otherUserRole: MessagingParticipantRole,
  options?: { includeHistorical?: boolean },
) {
  if (currentUserRole === otherUserRole) {
    return false
  }

  const patientId = currentUserRole === 'patient' ? currentUserId : otherUserId
  const providerId = currentUserRole === 'provider' ? currentUserId : otherUserId

  let query = supabaseAdmin
    .from('appointments')
    .select('id')
    .eq('patient_id', patientId)
    .eq('provider_id', providerId)
    .limit(1)

  if (!options?.includeHistorical) {
    query = query.in('status', ['pending', 'confirmed', 'completed'])
  }

  const { data, error } = await query.maybeSingle()

  if (error) {
    if (error.code === 'PGRST116') {
      return false
    }

    throw error
  }

  return Boolean(data)
}