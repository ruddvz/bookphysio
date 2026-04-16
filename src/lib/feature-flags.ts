/**
 * Lightweight feature-flag resolver for the UI v2 redesign rollout.
 *
 * Precedence (highest wins):
 *   1. `NEXT_PUBLIC_UI_V2` env — tri-state. Explicit on/off beats any override.
 *      - on: '1' | 'true' | 'on' | 'yes'
 *      - off: '0' | 'false' | 'off' | 'no'
 *      - unset / any other value: fall through to cookie, then query.
 *   2. `bp_ui=v2` cookie — per-user dogfood override (dashboards).
 *   3. `?ui=v2` query param — short-lived QA override (never persisted here).
 *
 * Server-side: pass `cookieHeader` and `searchParam` from the RSC/route handler.
 * Client-side: call `isUiV2Client()` which reads `document.cookie`.
 *
 * Keep this file dependency-free so it can run in any runtime (Node, Edge, browser).
 */

export type FeatureFlag = 'ui-v2'

const ENV_TRUE = new Set(['1', 'true', 'on', 'yes'])
const ENV_FALSE = new Set(['0', 'false', 'off', 'no'])

/**
 * Parse the env var into a tri-state:
 *   - true  → hard on
 *   - false → hard off
 *   - null  → unset or unknown value; fall through to lower-precedence sources.
 */
function parseEnv(value: string | undefined): boolean | null {
  if (!value) return null
  const v = value.toLowerCase()
  if (ENV_TRUE.has(v)) return true
  if (ENV_FALSE.has(v)) return false
  return null
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function readCookie(cookieHeader: string | undefined, name: string): string | undefined {
  if (!cookieHeader) return undefined
  for (const raw of cookieHeader.split(';')) {
    const [rawKey, ...rawVal] = raw.split('=')
    if (!rawKey) continue
    if (rawKey.trim() === name) {
      return safeDecode(rawVal.join('=').trim())
    }
  }
  return undefined
}

export interface ResolveContext {
  cookieHeader?: string
  searchParam?: string | null
}

export function isUiV2({ cookieHeader, searchParam }: ResolveContext = {}): boolean {
  const envState = parseEnv(process.env.NEXT_PUBLIC_UI_V2)
  if (envState !== null) return envState
  if (readCookie(cookieHeader, 'bp_ui') === 'v2') return true
  if (searchParam && searchParam.toLowerCase() === 'v2') return true
  return false
}

function readQueryParam(name: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    return new URLSearchParams(window.location.search).get(name)
  } catch {
    return null
  }
}

export function isUiV2Client(): boolean {
  const envState = parseEnv(process.env.NEXT_PUBLIC_UI_V2)
  if (envState !== null) return envState
  if (typeof document === 'undefined') return false
  if (readCookie(document.cookie, 'bp_ui') === 'v2') return true
  return readQueryParam('ui')?.toLowerCase() === 'v2'
}
