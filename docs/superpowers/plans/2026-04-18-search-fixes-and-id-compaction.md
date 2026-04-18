# Search Fixes + ID Compaction — Agent Execution Plan

> **Branch:** `claude/fix-search-mobile-ui-sxKR6`
> **PR:** #103 (plan-only, no code yet)
> **Slices:** 17.1 → 17.5 (execute in order; each = one commit)

---

## Background (read once, skip on subsequent slices)

Five production bugs flagged by user. Migrations must be applied in Supabase after push.
Design tokens: primary teal `#00766C`, surface `#F5F5F5`, body text `#333333`, `₹` integer INR.

---

## Slice 17.1 — Fix: unapproved providers leak into public search

**Root cause:** `searchProvidersWithoutRpc()` in `src/app/api/providers/route.ts:282` only filters `.eq('active', true)`. Providers with `approval_status='pending'` and `verified=false` slip through.

### Files to edit

**`src/app/api/providers/route.ts`**
- Line 282: change `.eq('active', true)` → `.eq('active', true).eq('verified', true).eq('approval_status', 'approved')`
- Create `src/app/api/providers/filters.ts` — export a helper `applyPublicProviderFilters(query: SupabaseQueryBuilder)` that chains all three filters. Call it from the fallback (line 282) and from any future fallback paths in the same file.

**`supabase/migrations/044_search_providers_approval_gate.sql`** (new file)
- `CREATE OR REPLACE FUNCTION search_providers_v2(...)` — copy the function signature + return type verbatim from `supabase/migrations/024_fix_search_providers_v2.sql`, add `AND pr.approval_status = 'approved'` to the WHERE clause. TypeScript types must not change.

### Tests

**`src/app/api/providers/route.test.ts`** — add 2 cases:
1. Provider with `approval_status='pending'`, `verified=false`, `active=true` → mock RPC to succeed → assert result list is empty.
2. Same provider → mock RPC to throw → assert fallback path also returns empty list.

### Commit message
```
fix: tighten provider search to require approval_status=approved (migration 044)
```

---

## Slice 17.2 — Compact search header (mobile viewport recovery)

**Problem:** `Home › India` breadcrumb + multi-line `Top experts found` heading occupy ~35% of the mobile fold before the first card.

### Files to edit

**`src/app/search/SearchContent.tsx`** (lines 229–254)

1. Replace the visible `<nav>` breadcrumb (lines 233–243) with:
   - A `<nav aria-label="Breadcrumb" className="sr-only">` wrapping the existing `<ol>/<li>` links (keep exact same text nodes for screen readers + Google).
   - A `<script type="application/ld+json">` sibling containing a `BreadcrumbList` JSON-LD built from `[{name:"Home",url:"/"}, {name:displayLocation,url:`/search?city=${encodedCity}`}]` (add specialty as third item when present).

2. Replace the `<h1>` (lines 248–250) with:
   ```tsx
   <h1 className="text-base font-medium text-[#333] md:text-xl leading-tight">
     {loading ? 'Finding physios…' : `${total} physios · ${displayLocation}`}
   </h1>
   ```

3. Add a mobile-only collapsed filter trigger (< md breakpoint):
   - Wrap the filter strip container in `<div className="hidden md:block">…</div>`.
   - Before it add `<div className="flex md:hidden items-center gap-2">` containing a single `"Filters"` chip button that opens the existing mobile filter drawer. Show active filter count as `· N` if `activeFilterCount > 0`.

### Tests

**`src/app/search/SearchContent.test.tsx`** (or existing search test file) — add:
1. Renders `BreadcrumbList` JSON-LD `<script>` with correct `@type` and item count.
2. `<nav aria-label="Breadcrumb">` has class `sr-only`.
3. `<h1>` contains count + city in format `"12 physios · Bengaluru"`.

### Commit message
```
feat(search): compact mobile header — sr-only breadcrumb + BreadcrumbList JSON-LD + single-line h1
```

---

## Slice 17.3 — City filter typeahead (replace wall of ~800 cities)

**Problem:** `SearchFilters.tsx:16` renders every city in `INDIA_CITIES` (~800 items) as flat list.

### New file to create

**`src/components/search/CitySearchCombobox.tsx`** (client component)
- Props: `value: string`, `onChange: (city: string) => void`
- Shows 12 popular quick-pick chips at the top (hard-coded array in the file):
  `['Bengaluru', 'Mumbai', 'Delhi', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh', 'Kochi']`
- Below chips: a text input using `useDeferredValue` to filter `INDIA_CITIES` (import from `@/lib/india-locations`). Match order: `startsWith` (case-insensitive) first, then `includes`; cap at 20 results.
- Renders filtered list as buttons; clicking calls `onChange`.
- a11y: `role="combobox"`, `aria-expanded`, `aria-autocomplete="list"`, each option `role="option"`.

### Files to edit

**`src/app/search/SearchFilters.tsx`**
- Remove `const CITIES = INDIA_CITIES.map(...)` (line 16).
- Replace the city dropdown/grid (lines 216 and 370 respectively) with `<CitySearchCombobox value={currentCityFilter} onChange={handleCityChange} />`. Pass through the same callback that updates URL params.
- Import `CitySearchCombobox` from `@/components/search/CitySearchCombobox`.

### Tests

**`src/components/search/CitySearchCombobox.test.tsx`** (new):
1. Popular chips render — confirm all 12 cities appear without any input.
2. Typing `"pune"` narrows list to Pune (case-insensitive).
3. `startsWith` results appear before `includes` results.
4. List is capped at 20 items.
5. Clicking a chip calls `onChange` with the correct city string.
6. `role="combobox"` present on the input.

### Commit message
```
feat(search): replace flat city list with CitySearchCombobox (popular chips + typeahead)
```

---

## Slice 17.4 — Mobile reels snap-scroll (ui-v2 only)

**Gate:** renders only when `useUiV2()` is `true` AND viewport `< md`. Desktop layout is untouched.

### New files to create

**`src/components/DoctorCardCompact.tsx`** (client component)
- Props: same shape as `DoctorCard` props — pull the type from `src/components/DoctorCard.tsx`.
- Layout target: ≤ 85dvh so snap boundary is always visible.
- Elements: avatar `h-20 w-20`, name + badge, star rating, city + distance chip, specialty chip row (max 3), consultation fee `₹N`, primary `<Link>Book</Link>` CTA (teal), secondary `View profile` link.
- `role="article"` on root; no lazy-loading (result sets ≤ 30).

**`src/app/search/SearchResultsReels.tsx`** (client component)
- Props: `results: SearchProviderRpcRow[]`
- Container: `<div className="fixed inset-0 z-40 bg-white overflow-y-scroll snap-y snap-mandatory overscroll-contain">` to occlude navbar + footer in reels mode.
- Each slide: `<div className="h-[100dvh] snap-start snap-always flex flex-col justify-center px-4" role="article" aria-label={`Result ${i+1} of ${results.length}`}>` wrapping `<DoctorCardCompact />`.
- Fixed counter top-right: `<div className="fixed top-4 right-4 z-50 text-sm text-[#666]">{current}/{total}</div>`. Track `current` with `IntersectionObserver` on each slide.
- Keyboard: listen for `PageDown`/`ArrowDown` → scroll to next snap slide; `PageUp`/`ArrowUp` → previous.

### Files to edit

**`src/app/search/SearchContent.tsx`**
- Import `SearchResultsReels` and `useUiV2`.
- In the results render section (find the `{results.map(...)` or flex-col grid block):
  ```tsx
  {isV2 ? (
    <div className="block md:hidden">
      <SearchResultsReels results={results} />
    </div>
  ) : null}
  <div className={isV2 ? 'hidden md:block' : ''}>
    {/* existing flex-col results grid — unchanged */}
  </div>
  ```
  Desktop (`md+`) always uses the existing grid regardless of `isV2`.

### Tests

**`src/app/search/SearchResultsReels.test.tsx`** (new):
1. Renders correct number of slides for given results array.
2. Each slide has `role="article"` and `aria-label="Result N of M"`.
3. Each slide root has CSS classes `snap-start` and `snap-always`.
4. Component is `null` when `useUiV2()` returns `false` (mock the hook).

### Commit message
```
feat(search): mobile reels snap-scroll (ui-v2 only) — SearchResultsReels + DoctorCardCompact
```

---

## Slice 17.5 — Shorten display IDs (migration 045)

**Current:** providers get 8-digit IDs (`10000000+`), patients get 9-digit IDs (`900000000+`).
**Target:** providers 6-digit (`100000+`), patients 7-digit (`1000000+`).

### New file to create

**`supabase/migrations/045_shorter_display_ids.sql`**

```sql
-- Safe shortening: only changes sequences for new users.
-- Existing display_ids (if any) are never rewritten.

DO $$
DECLARE
  existing_count integer;
BEGIN
  SELECT COUNT(*) INTO existing_count FROM users WHERE display_id IS NOT NULL;

  IF existing_count = 0 THEN
    -- Clean slate: reset sequences to new ranges.
    ALTER SEQUENCE provider_display_id_seq RESTART WITH 100000;
    ALTER SEQUENCE patient_display_id_seq  RESTART WITH 1000000;
  ELSE
    -- Already seeded: move sequence pointers forward into the new range
    -- only if they haven't already passed it.
    IF (SELECT last_value FROM provider_display_id_seq) < 100000 THEN
      ALTER SEQUENCE provider_display_id_seq RESTART WITH 100000;
    END IF;
    IF (SELECT last_value FROM patient_display_id_seq) < 1000000 THEN
      ALTER SEQUENCE patient_display_id_seq RESTART WITH 1000000;
    END IF;
    -- Note: existing IDs keep their current values. Both ranges co-exist.
    -- See memories/repo/id-scheme.md for the dual-range explanation.
  END IF;
END $$;
```

### Files to check (no edits expected but verify)

Run `grep -rn "display_id" src/` and scan every render site for hard-coded digit-count assumptions (e.g. zero-padding to 8/9 digits). Fix any found. Likely candidates:
- `src/app/patient/profile/` — profile page display
- `src/app/provider/profile/` — provider profile display
- `src/app/admin/users/` — user registry table

### Tests

Add a test in **`supabase/migrations/__tests__/`** (or a Vitest helper) that:
1. After `045` is applied in a clean DB, inserts a `provider` role user → asserts `display_id` is exactly 6 digits.
2. Inserts a `patient` role user → asserts `display_id` is exactly 7 digits.

If the Supabase test harness is not set up, document the manual verification steps in the CHANGELOG entry instead and skip the automated test.

### Commit message
```
feat(db): migration 045 — shorter display IDs (6-digit providers, 7-digit patients)
```

---

## Verification checklist (run after all 5 slices)

- [ ] `rtk npm run build` — zero TS errors
- [ ] `rtk npm test` — no regressions; new tests green
- [ ] Unapproved provider (no OTP, no admin approval) → `/search` returns 0 results
- [ ] `/search?city=Bengaluru` page source contains `BreadcrumbList` JSON-LD
- [ ] `<h1>` reads `"N physios · City"` not `"Top experts found"`
- [ ] City filter shows 12 popular chips before any typing
- [ ] `?ui=v2` + iPhone 12 viewport in DevTools → one card per swipe, snap works
- [ ] Desktop view unchanged (no reels, existing grid visible)
- [ ] New provider signup → `display_id` is 6 digits
- [ ] New patient signup → `display_id` is 7 digits
- [ ] Parallel review: `code-reviewer` + `security-reviewer` + `database-reviewer` on migrations 044 + 045

## Key reference files

| File | What it contains |
|------|-----------------|
| `src/app/api/providers/route.ts:267–310` | `searchProvidersWithoutRpc()` — fallback filter logic |
| `supabase/migrations/024_fix_search_providers_v2.sql` | Current RPC function (copy signature for 044) |
| `supabase/migrations/042_provider_approval_state.sql` | `approval_status` enum + backfill (read before 044) |
| `supabase/migrations/006_numeric_display_ids.sql` | Existing sequences + `handle_new_user()` trigger |
| `src/app/search/SearchContent.tsx:229–254` | Search header — breadcrumb + h1 |
| `src/app/search/SearchFilters.tsx:16,216,370` | City filter — `CITIES` const + render sites |
| `src/components/DoctorCard.tsx` | Source of truth for card prop types |
| `src/hooks/useUiV2.ts` | Feature flag hook |
