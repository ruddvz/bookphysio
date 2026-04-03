export interface AppointmentPatientSummary {
  full_name: string | null
  phone: string | null
  avatar_url: string | null
}

export interface AppointmentProviderSummary {
  id: string
  users: {
    full_name: string | null
    avatar_url: string | null
  } | null
  specialties: Array<{ name: string }>
}

interface SupabaseAdminLike {
  from: (table: string) => any
}

interface PatientSummaryRow {
  id: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
}

interface ProviderSummaryRow {
  id: string
  specialty_ids: string[] | null
  users:
    | {
        full_name: string | null
        avatar_url: string | null
      }
    | Array<{
        full_name: string | null
        avatar_url: string | null
      }>
    | null
}

interface SpecialtyRow {
  id: string
  name: string
}

function uniqueIds(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))]
}

function normalizeProviderUser(
  users: ProviderSummaryRow['users'],
): AppointmentProviderSummary['users'] {
  const user = Array.isArray(users) ? (users[0] ?? null) : users

  if (!user) {
    return null
  }

  return {
    full_name: user.full_name ?? null,
    avatar_url: user.avatar_url ?? null,
  }
}

export async function fetchPatientSummaryMap(
  supabaseAdmin: SupabaseAdminLike,
  patientIds: string[],
): Promise<Map<string, AppointmentPatientSummary>> {
  const ids = uniqueIds(patientIds)

  if (ids.length === 0) {
    return new Map()
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, full_name, phone, avatar_url')
    .in('id', ids)

  if (error || !Array.isArray(data)) {
    console.error('[appointments] Failed to load patient summaries:', error)
    return new Map()
  }

  return new Map(
    (data as PatientSummaryRow[]).map((row) => [
      row.id,
      {
        full_name: row.full_name ?? null,
        phone: row.phone ?? null,
        avatar_url: row.avatar_url ?? null,
      },
    ]),
  )
}

export async function fetchProviderSummaryMap(
  supabaseAdmin: SupabaseAdminLike,
  providerIds: string[],
): Promise<Map<string, AppointmentProviderSummary>> {
  const ids = uniqueIds(providerIds)

  if (ids.length === 0) {
    return new Map()
  }

  const { data, error } = await supabaseAdmin
    .from('providers')
    .select('id, specialty_ids, users!inner (full_name, avatar_url)')
    .in('id', ids)

  if (error || !Array.isArray(data)) {
    console.error('[appointments] Failed to load provider summaries:', error)
    return new Map()
  }

  const providerRows = data as ProviderSummaryRow[]
  const specialtyIds = uniqueIds(providerRows.flatMap((provider) => provider.specialty_ids ?? []))
  let specialtyNameById = new Map<string, string>()

  if (specialtyIds.length > 0) {
    const { data: specialties, error: specialtiesError } = await supabaseAdmin
      .from('specialties')
      .select('id, name')
      .in('id', specialtyIds)

    if (specialtiesError || !Array.isArray(specialties)) {
      console.error('[appointments] Failed to load provider specialties:', specialtiesError)
    } else {
      specialtyNameById = new Map(
        (specialties as SpecialtyRow[]).map((specialty) => [specialty.id, specialty.name]),
      )
    }
  }

  return new Map(
    providerRows.map((provider) => [
      provider.id,
      {
        id: provider.id,
        users: normalizeProviderUser(provider.users),
        specialties: (provider.specialty_ids ?? [])
          .map((specialtyId) => specialtyNameById.get(specialtyId))
          .filter((name): name is string => Boolean(name))
          .map((name) => ({ name })),
      },
    ]),
  )
}