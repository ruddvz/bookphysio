type MessagingParticipantRole = 'patient' | 'provider'

interface SupabaseAdminLike {
  from: (table: string) => any
}

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