'use client'

import { useSyncExternalStore } from 'react'
import { isUiV2Client } from '@/lib/feature-flags'

/**
 * No-op subscribe. The flag resolves from env / cookie / query and we
 * don't mutate any of those at runtime inside the app — if a dogfood
 * tester flips `bp_ui` in DevTools, a hard refresh is expected. Returning
 * `() => () => {}` keeps React happy without subscribing to anything.
 */
function subscribe(): () => void {
  return () => {}
}

function getSnapshot(): boolean {
  return isUiV2Client()
}

function getServerSnapshot(): boolean {
  return false
}

/**
 * Reads the `ui-v2` flag in a hydration-safe way. Returns `false` on the
 * server and during the first client render, then switches to the real
 * value on the second render. This avoids `react-hooks/set-state-in-effect`
 * violations we'd hit with a `useState` + `useEffect(() => setX(...), [])`
 * pattern.
 */
export function useUiV2(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
