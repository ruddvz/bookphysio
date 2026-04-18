/**
 * Public provider listing filters — must match search RPC + product rules:
 * active, phone-verified, and admin-approved only.
 *
 * Typed loosely so Postgrest generic chains do not hit TS2589 (excessively deep instantiation).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyPublicProviderFilters(query: any): any {
  return query.eq('active', true).eq('verified', true).eq('approval_status', 'approved')
}
