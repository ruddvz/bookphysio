/**
 * Values stored in `public.users.role` (Postgres CHECK + app conventions).
 * `provider_pending` is onboarding; RLS often treats only `provider` as an active provider id on `providers.id`.
 */
export type DbUserRole = 'patient' | 'provider' | 'provider_pending' | 'admin'

export type SessionContext =
  | { kind: 'public' }
  /** JWT present but `public.users.role` not loaded yet — avoid gated UI until role is known. */
  | { kind: 'authenticated_profile_pending'; userId: string }
  | { kind: 'authenticated'; userId: string; role: DbUserRole }
