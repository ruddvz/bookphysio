/**
 * Frontend permission checklist — pure helpers for gating UI and choosing data access patterns.
 * RLS is authoritative on the server; these helpers keep React trees honest about what to show.
 *
 * See: docs/planning/FRONTEND-PERMISSIONS.md
 */

import type { DbUserRole, SessionContext } from './types'

export function resolveSessionContext(
  userId: string | null | undefined,
  role: DbUserRole | null | undefined,
): SessionContext {
  if (!userId) {
    return { kind: 'public' }
  }
  if (role == null) {
    return { kind: 'authenticated_profile_pending', userId }
  }
  return { kind: 'authenticated', userId, role }
}

export function isPublicSession(ctx: SessionContext): ctx is { kind: 'public' } {
  return ctx.kind === 'public'
}

export function isRoleKnown(ctx: SessionContext): ctx is Extract<SessionContext, { kind: 'authenticated' }> {
  return ctx.kind === 'authenticated'
}

export function isAuthenticatedSession(
  ctx: SessionContext,
): ctx is Extract<
  SessionContext,
  { kind: 'authenticated' } | { kind: 'authenticated_profile_pending' }
> {
  return ctx.kind === 'authenticated' || ctx.kind === 'authenticated_profile_pending'
}

/** Fully approved provider (has normal provider dashboard + RLS provider_id = auth.uid() on provider rows). */
export function isActiveProviderRole(role: DbUserRole | null | undefined): boolean {
  return role === 'provider'
}

export function isAdminRole(role: DbUserRole | null | undefined): boolean {
  return role === 'admin'
}

export function isPatientRole(role: DbUserRole | null | undefined): boolean {
  return role === 'patient'
}

// --- A) Logged out (public) -------------------------------------------------

/** Screens/data that anonymous users may rely on (discovery + published reviews). */
export function publicDiscoveryAllowed(): true {
  return true
}

export function publicMayReadPublishedReviewsOnly(): true {
  return true
}

export function publicMustNotAccessAppointmentsList(): true {
  return true
}

export function publicMustNotAccessChatOrClinical(): true {
  return true
}

export function publicMustNotAccessSubscriptions(): true {
  return true
}

// --- B) Patient -------------------------------------------------------------

export function patientMayReadOwnUserRow(ctx: SessionContext): boolean {
  return isRoleKnown(ctx) && isPatientRole(ctx.role)
}

export function patientMayReadOwnAppointments(ctx: SessionContext): boolean {
  return isRoleKnown(ctx) && isPatientRole(ctx.role)
}

export function patientMayReadPaymentsForOwnAppointments(ctx: SessionContext): boolean {
  return isRoleKnown(ctx) && isPatientRole(ctx.role)
}

export function patientMayReadOwnClinicalViaOwnership(ctx: SessionContext): boolean {
  return isRoleKnown(ctx) && isPatientRole(ctx.role)
}

export function patientMayReadOwnNotifications(ctx: SessionContext): boolean {
  return isRoleKnown(ctx) && isPatientRole(ctx.role)
}

export function patientMayReadOwnConversations(ctx: SessionContext): boolean {
  return isRoleKnown(ctx) && isPatientRole(ctx.role)
}

/** Cancel/update own appointments (status rules enforced server-side). */
export function patientMayWriteOwnAppointments(ctx: SessionContext): boolean {
  return isRoleKnown(ctx) && isPatientRole(ctx.role)
}

/**
 * Creating a review as patient — prefer API route; DB may not expose direct client INSERT on `reviews`.
 */
export function patientMayCreateReviews(ctx: SessionContext): boolean {
  return isRoleKnown(ctx) && isPatientRole(ctx.role)
}

/** Only if your billing model ties this user to `subscriptions` rows; many flows are provider-billed. */
export function patientMayManageSubscriptionRecords(ctx: SessionContext): boolean {
  return isRoleKnown(ctx) && isPatientRole(ctx.role)
}

export function patientMustNotWriteProviderResources(ctx: SessionContext): boolean {
  return isRoleKnown(ctx) && isPatientRole(ctx.role)
}

// --- C) Provider ------------------------------------------------------------

export function providerMayReadOwnProviderRecord(ctx: SessionContext): boolean {
  return isRoleKnown(ctx) && (isActiveProviderRole(ctx.role) || ctx.role === 'provider_pending')
}

export function providerMayManageScheduleAndSlots(ctx: SessionContext): boolean {
  return isRoleKnown(ctx) && isActiveProviderRole(ctx.role)
}

export function providerMayReadOwnAppointments(ctx: SessionContext): boolean {
  return isRoleKnown(ctx) && isActiveProviderRole(ctx.role)
}

export function providerMayWriteClinicalForManagedPatients(ctx: SessionContext): boolean {
  return isRoleKnown(ctx) && isActiveProviderRole(ctx.role)
}

export function providerMayReplyToReviews(ctx: SessionContext): boolean {
  return isRoleKnown(ctx) && isActiveProviderRole(ctx.role)
}

export function providerMayManageProviderSubscriptions(ctx: SessionContext): boolean {
  return isRoleKnown(ctx) && isActiveProviderRole(ctx.role)
}

/** Pending approval — only pending route + login; not full provider tools. */
export function providerPendingMayOnlyUsePendingFlow(ctx: SessionContext): boolean {
  return isRoleKnown(ctx) && ctx.role === 'provider_pending'
}

// --- D) Admin ---------------------------------------------------------------

export function adminMayUseModerationTools(ctx: SessionContext): boolean {
  return isRoleKnown(ctx) && isAdminRole(ctx.role)
}

export function adminOverrideWherePolicyAllows(ctx: SessionContext): boolean {
  return isRoleKnown(ctx) && isAdminRole(ctx.role)
}
