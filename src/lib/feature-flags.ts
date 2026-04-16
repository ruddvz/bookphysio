/**
 * Lightweight feature-flag resolver for the UI v2 redesign rollout.
 *
 * Read order:
 *   1. `NEXT_PUBLIC_UI_V2` env — hard on/off for CI and preview builds.
 *   2. `bp_ui=v2` cookie — per-user dogfood override (dashboards).
 *   3. `?ui=v2` query param — short-lived QA override (never persisted here).
 *
 * Server-side: pass `cookieHeader` and `searchParams` from the RSC/route handler.
 * Client-side: call `isUiV2Client()` which reads `document.cookie`.
 *
 * Keep this file dependency-free so it can run in any runtime (Node, Edge, browser).
 */

export type FeatureFlag = 'ui-v2'

const ENV_TRUE = new Set(['1', 'true', 'on', 'yes'])

function parseEnv(value: string | undefined): boolean {
  if (!value) return false
  return ENV_TRUE.has(value.toLowerCase())
}

function readCookie(cookieHeader: string | undefined, name: string): string | undefined {
  if (!cookieHeader) return undefined
  for (const raw of cookieHeader.split(';')) {
    const [rawKey, ...rawVal] = raw.split('=')
    if (!rawKey) continue
    if (rawKey.trim() === name) {
      return decodeURIComponent(rawVal.join('=').trim())
    }
  }
  return undefined
}

export interface ResolveContext {
  cookieHeader?: string
  searchParam?: string | null
}

export function isUiV2({ cookieHeader, searchParam }: ResolveContext = {}): boolean {
  if (parseEnv(process.env.NEXT_PUBLIC_UI_V2)) return true
  if (searchParam && searchParam.toLowerCase() === 'v2') return true
  const cookie = readCookie(cookieHeader, 'bp_ui')
  return cookie === 'v2'
}

export function isUiV2Client(): boolean {
  if (parseEnv(process.env.NEXT_PUBLIC_UI_V2)) return true
  if (typeof document === 'undefined') return false
  return readCookie(document.cookie, 'bp_ui') === 'v2'
}
