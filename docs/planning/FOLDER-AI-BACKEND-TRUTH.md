# “Backend truth” for Folder AI (and human reference)

> **Purpose:** Package for generating **Supabase JS** front-end calls that align with **current RLS** and app roles. Pair with [`BACKEND-PERMISSION-CONTRACT.md`](./BACKEND-PERMISSION-CONTRACT.md) (per-table detail) and [`FRONTEND-PERMISSIONS.md`](./FRONTEND-PERMISSIONS.md) (routes + `src/lib/permissions`).

> **Strict action-level rules** (ownership chains, public vs auth, appointment INSERT caveat, storage paths): **[`FOLDER-AI-BACKEND-CONTRACT.md`](./FOLDER-AI-BACKEND-CONTRACT.md)**.

---

## Why this is not a 100% guarantee (read first)

Even with **all visible RLS policies** and schemas, generated front-end code can still fail unless we also account for:

| Gap | Risk |
|-----|------|
| **DB constraints** | `NOT NULL`, `CHECK`, foreign-key shape — writes can fail even when RLS passes. |
| **Non-RLS behavior** | Triggers, functions, `SECURITY DEFINER` RPCs, generated columns, `upsert` semantics. |
| **App roles vs `auth.uid()`** | `public.users.role` (`patient`, `provider`, `provider_pending`, `admin`) drives product behavior; RLS may use `auth_role()` / admin — **wrong role row** or **wrong ownership ids** ⇒ empty results or denied writes. |
| **Environment drift** | Staging vs prod policies differ from repo migrations. |

**Conclusion:** This file is the best **RLS-aligned call contract** we can document without also auditing **constraints + triggers + real payloads** for each screen. To go stricter, provide a **list of screens/actions** (see [Minimal ask](#minimal-ask-for-a-stricter-folder-ai-checklist) below).

---

## 0) Hard rules (must follow)

1. **Never** use **`service_role`** keys in the browser or any user-facing bundle. Always use the **user session** (normal **`createClient()`** from `@supabase/supabase-js`).
2. **Every write** must include **ownership / linkage fields** that satisfy RLS **`USING` / `WITH CHECK`** (examples in section 2).
3. If the user is **not logged in**, **`auth.uid()`** is **NULL** → writes fail; many **SELECT**s return **no rows** or error depending on policy.

---

## 1) Auth model (how the backend decides patient / provider / admin)

From **`public.users`**:

- **`users.role`** must be one of: **`patient`**, **`provider`**, **`provider_pending`**, **`admin`**.

From policies (typical patterns):

- **Admin:** `auth_role() = 'admin'` (reads **`users.role`** for `auth.uid()`).
- **Provider ownership:** **`provider_id = auth.uid()`** (provider’s user id equals `providers.id` in this schema).

**Folder AI / front end** must ensure the **profile row** matches the real session (existing auth/onboarding flow). **`provider_pending`** users are **not** full providers for scheduling/clinical surfaces until promoted to **`provider`**.

---

## 2) Table call contract (RLS-aligned)

Abbreviated patterns; see [`BACKEND-PERMISSION-CONTRACT.md`](./BACKEND-PERMISSION-CONTRACT.md) for fuller notes.

### `public.specialties`

- **SELECT:** allowed broadly (public catalog). `from('specialties').select('*')`
- **Write:** admin-only via `auth_role() = 'admin'`. Front end must not expose writes to non-admins.

### `public.providers`

- **SELECT:** `(verified=true AND active=true) OR id=auth.uid() OR admin` — `from('providers').select('*')`
- **INSERT:** `id = auth.uid()` OR admin — insert must set **`id`** to current user when self-registering as provider.
- **UPDATE:** `id = auth.uid()` OR admin

### `public.users`

- **SELECT:** `id = auth.uid()` OR admin — `from('users').select('*').eq('id', currentUserId)`
- **UPDATE:** `id = auth.uid()` — `update(...).eq('id', currentUserId)`

### `public.insurances`

- **SELECT:** catalog — `from('insurances').select('*')`
- **Write:** admin-only (`insurances_admin_write`); front end restricts mutations to admins.

### `public.provider_insurances`

- **SELECT:** public — `from('provider_insurances').select('*')`
- **INSERT / DELETE:** `provider_id = auth.uid()` — include/filter **`provider_id = currentUserId`** (where current user is the provider). Admin grants may vary; verify live policies if admin manages links.

### `public.locations`

- **SELECT:** verified+active provider’s locations OR `provider_id = auth.uid()` OR admin — `from('locations').select('*')`
- **UPDATE:** `provider_id = auth.uid()` OR admin — update only rows the provider owns (fetch/filter by **`provider_id`** first).

### `public.availabilities`

- **SELECT:** unbooked, unblocked, verified+active provider **OR** `provider_id = auth.uid()` **OR** admin — `from('availabilities').select('*')`
- **INSERT:** **`provider_id = auth.uid()`** only
- **UPDATE:** owner provider, admin, and/or policies tied to **appointments** + **status** — provider users must only mutate rows with their **`provider_id`** unless policy allows appointment-linked updates.

### `public.appointments`

- **SELECT:** `patient_id = auth.uid() OR provider_id = auth.uid() OR admin` — scope queries to the current user’s context.
- **UPDATE:** patient vs provider branches with **status** constraints; **WITH CHECK** may allow e.g. **cancelled**. Do not send **disallowed status transitions** or wrong ownership.

### `public.payments`

- **SELECT / UPDATE:** tied to **`appointments`** where **`auth.uid()`** is patient or provider on that appointment (or admin). Only touch payments for **appointments you can access**.

### `public.patient_clinical_profiles`

- **SELECT:** **`patient_user_id = auth.uid()`** — `select().eq('patient_user_id', currentUserId)`

### `public.patient_visits`

- **SELECT:** via **`profile_id`** on profiles where **`patient_user_id = auth.uid()`** — do not query arbitrary **`profile_id`** values.

### `public.clinical_notes`

- **SELECT:** patient path through **visit → profile** for **`auth.uid()`** — fetch notes in context of allowed visits, not random **`visit_id`**.

### `public.provider_certifications`

- **ALL:** `provider_id = auth.uid()` OR admin — use provider-owned rows.

### `public.location_modalities`

- **ALL:** only when referenced **`locations.provider_id = auth.uid()`** OR admin — mutate only for **locations the provider owns**.

### `public.reviews`

- **INSERT:** **`patient_id = auth.uid()`**
- **UPDATE:** **`provider_id = auth.uid()` OR admin** (e.g. reply)
- **SELECT:** published OR participant OR admin

### `public.documents`

- **ALL:** **`provider_id = auth.uid()` OR admin** — set **`provider_id`** to current provider user id.

### `public.notifications`

- **SELECT / UPDATE / DELETE:** **`user_id = auth.uid()` OR admin**
- **INSERT:** **`metadata.appointment_id`** (or equivalent) consistent with **`user_id`** matching appointment **patient** or **provider** as required by policy; verify exact **`metadata`** shape in live DB.

### `public.messages`

- **SELECT:** **`auth.uid()`** = **`sender_id` OR `receiver_id`**

### `public.conversations`

- **SELECT:** **`auth.uid()`** = **`user_id_1` OR `user_id_2`**

### `public.booking_anomalies`

- **ALL:** **admin** (`users.role = 'admin'`) **OR** linked **appointment** where **`patient_id = auth.uid() OR provider_id = auth.uid()`** — tie actions to an accessible appointment.

---

## 3) Storage contract (avatars — pattern from visible policies)

Typical pattern for bucket **`avatars`**:

- **SELECT:** may allow public read for objects whose path has a non-null first folder segment (policy-dependent).
- **INSERT / UPDATE / DELETE:** **authenticated** users may only write where the **first path segment** (folder) equals **`auth.uid()`** — e.g. **`<uid>/filename`**.

**Folder AI** must upload/delete avatars under **`auth.uid()`** as the first path segment. **Re-verify** exact expression in Supabase Storage policies for your project.

---

## 4) What is still needed for Folder-AI “strict” mode

RLS allows **many** query shapes; **constraints** can still reject inserts/updates. To tighten generated code:

1. List **real screens/actions** (or point to existing API routes).
2. For each action, specify **minimum payload** and **columns touched**.

---

## Minimal ask for a stricter Folder AI checklist

A **full inventory from this repo’s routes** is in **[`FRONTEND-ACTIONS-INVENTORY.md`](./FRONTEND-ACTIONS-INVENTORY.md)** (pages + API families by role). Use that as the starting list; trim or extend for your deployment.

You can also paste or summarize actions such as:

| Area | Example actions |
|------|------------------|
| **Patient** | list providers, book appointment, cancel appointment, view clinical notes |
| **Provider** | edit locations, create availability, confirm appointment, reply to review |
| **Chat** | list conversations, send message |
| **Other** | notifications insert/update, payment mark paid, etc. |

**Output artifact:** per action: **table**, **operation** (select/insert/update/delete), **required filters/keys**, **required metadata** (e.g. notifications), and **notes on status transitions**.

This can be appended as **Section 5** here or as `docs/planning/FOLDER-AI-ACTION-SCRIPTS.md` once the list exists.

---

## Related docs

- [`BACKEND-PERMISSION-CONTRACT.md`](./BACKEND-PERMISSION-CONTRACT.md) — per-table contract  
- [`FRONTEND-PERMISSIONS.md`](./FRONTEND-PERMISSIONS.md) — UI gates and roles  
- `src/lib/auth/access.ts`, `src/lib/permissions/` — TypeScript helpers
