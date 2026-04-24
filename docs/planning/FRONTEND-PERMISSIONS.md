# Frontend permissions (bookphysio.in)

This document is the human-readable reference for **who may see which UI and which Supabase/API patterns to use**. **Postgres RLS remains authoritative**; the API routes enforce business rules again. Use this file when building new screens so you do not rely on hidden client-side assumptions.

For **per-table Supabase client calls** aligned with RLS (select/update/insert expectations), see **[`BACKEND-PERMISSION-CONTRACT.md`](./BACKEND-PERMISSION-CONTRACT.md)**.

For **Folder AI** / codegen (“backend truth” package, non-RLS caveats, avatar storage, action-list stub), see **[`FOLDER-AI-BACKEND-TRUTH.md`](./FOLDER-AI-BACKEND-TRUTH.md)**.

## Where the code lives

- **Route guarding:** `src/middleware.ts` + `src/lib/auth/access.ts` — redirects by path prefix and `users.role`.
- **Permission helpers (checklist as functions):** `src/lib/permissions/` — import from `@/lib/permissions` for feature-level gates (show/hide buttons, choose copy).
- **DB roles:** `public.users.role` — see [Roles](#roles) below.

## Roles

| `public.users.role` | Meaning |
|---------------------|--------|
| `patient` | Book visits, patient dashboard, own appointments and records. |
| `provider` | Approved provider; full `/provider/*` except where business rules say otherwise. |
| `provider_pending` | Signed up as provider, not approved yet — **only** `/provider/pending` (and auth) per middleware; not full provider tools. |
| `admin` | `/admin/*` and admin API routes where policies check admin. |

**Logged out** users have no JWT: treat as **public** (no `auth.uid()` in the database).

## Session context in React

Build a small `SessionContext` value for permission helpers:

```ts
import { resolveSessionContext } from '@/lib/permissions'

// userId from Supabase auth; role from public.users (e.g. profile fetch or API)
const ctx = resolveSessionContext(user?.id ?? null, profile?.role ?? null)
```

- If `userId` is missing → `{ kind: 'public' }`.
- If JWT exists but `role` is not loaded yet → `{ kind: 'authenticated_profile_pending', userId }` — **do not** assume patient vs provider; show loading or minimal chrome until `role` is known.
- When `role` is loaded → `{ kind: 'authenticated', userId, role }`.

Use `isRoleKnown(ctx)` (or `ctx.kind === 'authenticated'`) before calling role-specific helpers like `patientMayReadOwnAppointments`.

## A) Logged out (public)

**May use (read/browse only)**

- Provider discovery: **`providers`** where product rules say verified + active (see RLS).
- **`specialties`**
- **`locations`** for verified + active providers
- **`availabilities`**: unbooked, unblocked, verified + active provider (RLS-aligned)
- **`reviews`** with **`is_published = true`** only

**Must not**

- List or act on **appointments** without being a participant (requires login).
- **Chat** (**conversations**, **messages**) — no anonymous conversation scope.
- **Clinical** tables — no access.
- **Subscriptions** — no access.
- **Writes** on profile, bookings, reviews, subscriptions, etc. — require authentication (and often API routes).

## B) Authenticated as `patient`

**Read (scope with `patient_id` / `patient_user_id` = you)**

- **`users`**: own row
- **`appointments`**: where `patient_id = auth.uid()`
- **`payments`**: via appointments involving you
- **Clinical**: profiles with `patient_user_id = auth.uid()`; visits/notes via that chain (often **RPC** `get_patient_facing_records()` — see API)
- **`notifications`**: `user_id = auth.uid()`
- **Messages/conversations**: only where you are a participant

**Write**

- Own appointments (cancel/update) — **status rules** on server
- Reviews — create with your patient id; **prefer POST `/api/reviews`** (or similar); direct `reviews.insert` from the browser may be blocked by RLS
- Subscriptions — only if your product ties this user to `subscriptions` rows (many flows are provider-billed)

**Must not write**

- Provider scheduling resources (**locations**, **availabilities**, provider profile management) unless the user is also an approved `provider`.

## C) Authenticated as `provider`

**`provider` (approved)**

- Read/manage own **provider** row, **provider_specialties**, **locations**, modalities, insurances links, certifications
- **availabilities** (own slots)
- **appointments** where `provider_id = auth.uid()`
- **Clinical** for managed patients (`patient_clinical_profiles`, visits, notes) per RLS
- **Reviews**: reply (`UPDATE` as provider)

**`provider_pending`**

- Not a full provider for RLS/dashboard purposes — middleware keeps them on the **pending** flow; do not show full calendar/clinical tools until role becomes `provider`.

## D) Admin (`role === 'admin'`)

- Enable **admin** navigation and tools (**booking anomalies**, **daily summaries**, user listings, etc.).
- Each table’s RLS still defines exact admin powers — the UI only exposes routes; **server routes** call `requireAdmin()` or equivalent.

## E) Quick UI rules

| Session | Show |
|---------|------|
| Public | Discovery + published reviews only |
| Patient | Patient home, appointments, payments, records, chat, notifications — scoped to self |
| Provider | Provider dashboard, schedule, slots, clinical, review replies, subscriptions as designed |
| `provider_pending` | Pending approval UX only |
| Admin | Admin moderation surfaces |

## Implementation notes

1. **Repo migrations are not automatically the live database.** The **deployed** Supabase project is the source of truth for RLS. If staging/prod was migrated differently, or policies were edited in the dashboard, or later SQL re-created policies, what `supabase/migrations` says can **diverge** from production. Treat any “migrations dropped X” story as **historic unless verified** against the project you are debugging.

2. **Dashboard “Roles: public” on policies** in Supabase usually means the default policy role that applies to **both** `anon` and `authenticated` request roles unless you used `TO authenticated` explicitly—it does **not** by itself mean “unlogged users can read everything.” RLS still evaluates `auth.uid()`; anonymous requests typically see **no rows** for involvement-based policies.

3. **Prefer API routes** for **appointments**, **messages**, and **reviews** when you want one server-side place for validation—but direct `select()` from the browser can still work if live policies allow it for the authenticated user.

4. **Middleware** already enforces prefix vs role; use `@/lib/permissions` for **component-level** gates (e.g. hide “Manage slots” for patients).

5. **`auth_role()` in SQL** reads `users.role` for RLS; keep app role and DB role in sync (onboarding promote `provider_pending` → `provider` when approved).

### When something “breaks,” check in order

1. **Same project?** `SUPABASE_URL` / anon key must match the DB you inspected in the dashboard.
2. **JWT present?** Anonymous client vs session; wrong or expired token ⇒ empty or permission errors.
3. **Empty vs error:** empty often means RLS allowed the query but **no rows** matched (`patient_id` / `provider_id` vs `auth.uid()`); hard errors often mean missing grants or missing policy for that operation.
4. **Table vs RPC:** Functions run as definer or invoker with their own rules; do not assume table policies apply the same way.
