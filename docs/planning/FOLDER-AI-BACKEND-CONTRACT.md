# Folder AI backend contract (aligned to front-end action list)

> **Purpose:** Strict **Supabase client** rules for Folder AI when generating calls for the actions in [`FRONTEND-ACTIONS-INVENTORY.md`](./FRONTEND-ACTIONS-INVENTORY.md). Pair with [`FOLDER-AI-BACKEND-TRUTH.md`](./FOLDER-AI-BACKEND-TRUTH.md) and [`BACKEND-PERMISSION-CONTRACT.md`](./BACKEND-PERMISSION-CONTRACT.md).

**Important:** This is derived from **RLS policies + table constraints** as understood at authoring time. Payloads can still fail on **CHECK / NOT NULL / UNIQUE / FK** or **triggers / functions**. The rules below target **common RLS mismatches** (wrong owner ids, wrong appointment linkage, wrong `provider_id`).

---

## 0) Shared “must always do” rules (all roles)

1. **Use the logged-in user session** — all front-end data calls use the **user** Supabase client (`createClient()`), **not** `service_role`.
2. **Derive IDs before writes**
   - **`currentUserId`** = `auth.uid()` from the session.
   - **Provider:** the provider’s profile row uses **`providers.id`** = same user id as **`users.id`** / `auth.uid()` (FK to `users`).
   - **Patient clinical:** **`patient_clinical_profiles.patient_user_id`** must equal **`currentUserId`** when reading/writing patient-owned clinical rows (per policy).
3. **Do not omit ownership keys on writes** — if a policy requires **`provider_id = auth.uid()`**, the payload / target row must satisfy that (insert `WITH CHECK`, update `USING`/`WITH CHECK`).

---

## 1) Public (logged out)

| Surface | Calls |
|---------|--------|
| Home / static / terms / privacy / how-it-works / FAQ | No DB calls unless you load CMS-like data; then use only **public SELECT** paths. |
| **Specialties** (SEO) | `from('specialties').select('*')` — public SELECT. |
| **City / discovery** | `from('providers').select(...)` — RLS shows only **`verified = true AND active = true`** for anonymous (no `auth.uid()` match). |
| **Doctor profile** `doctor/[id]` | `from('providers').select('*').eq('id', doctorId)` — same visibility rules. |
| **Locations** on profile | `from('locations').select('*')` scoped to provider — RLS only if provider is verified+active (or self/admin when logged in). |

---

## 2) Auth & account (before / while role is resolved)

| Area | Rule |
|------|------|
| Signup / login / OTP / email verify / OAuth / magic link | Prefer **Supabase Auth** and **app API routes**; do not invent direct table writes unless product uses them. |
| **`email_otps` / `password_reset_otps`** (if client writes) | Only when **`user_id = auth.uid()`**; **no anonymous** writes. |
| **Avatar (`storage.avatars`)** | INSERT/UPDATE/DELETE only when **`storage.foldername(name)[1] = auth.uid()`** — use object paths like **`/<currentUserId>/<filename>`** (confirm exact `foldername` segment in live Storage policies). |

---

## 3) Provider acquisition / demo

| Action | Contract |
|--------|----------|
| **Doctor signup → `providers`** | **INSERT:** `insert(...)` with **`id = currentUserId`** (or admin). Policy pattern: `providers_self_insert` requires **`id = auth.uid()`** for non-admin. |
| **UPDATE provider row** | **`providers.update(...).eq('id', currentUserId)`** — non-admin must match **`id = auth.uid()`**. |

---

## 4) Patient flows

**Surfaces:** dashboard, search, book, appointments list/detail, records, profile, payments, notifications, messages (see inventory).

### A) Browse providers (search)

- `from('providers').select('*')` — logged-in patient may also see self row via policy; discovery still emphasizes **verified+active**.

### B) Booking `book/[id]`

1. **Select slot** — `availabilities.select` with public rules (unbooked, unblocked, verified+active provider) or provider self.
2. **Create appointment**

   **Critical (this repo):** booking creation is implemented in **`POST /api/appointments`** using **`supabaseAdmin`** (service role) after server-side validation, rate limits, and slot reservation — see `src/app/api/appointments/route.ts`. **Folder AI should call `fetch('/api/appointments', { method: 'POST', ... })` with the validated body**, not `from('appointments').insert()` from the browser, unless you have **explicitly verified** a live **`appointments` INSERT** policy for the anon/authenticated role.

   **Repo migration note:** migration `019_server_only_mutation_policies.sql` **drops** `appointments_patient_insert`; if that migration applied to a DB without a replacement policy, **direct client INSERT would fail**. **Live DB may differ** — verify in Supabase.

3. **Cancel / confirm / update status** — `appointments.update(...)` only for rows where **`patient_id = auth.uid()`** (and status transitions allowed by policy `USING` / `WITH CHECK`). Fetch/update in **patient context** only.

### C) Payments

- **SELECT / UPDATE** `payments` only when **`payments.appointment_id`** links to an **`appointments`** row where **`auth.uid()`** is **`patient_id` or `provider_id`** (or admin). Always carry **`appointmentId`** you already resolved via an **allowed** appointment query.

### D) Records chain (`patient_clinical_profiles` → `patient_visits` → `clinical_notes`)

1. `patient_clinical_profiles.select(...).eq('patient_user_id', currentUserId)`
2. `patient_visits.select(...).in('profile_id', allowedProfileIds)`
3. `clinical_notes.select(...).in('visit_id', allowedVisitIds)`  
   **Never** query arbitrary `visit_id` / `profile_id` without that chain.

### E) PAI / Motio / SOAP-style pages

Treat as **read-only** over the same clinical chain (or dedicated RPC like `get_patient_facing_records` if used) — no extra tables required in contract if UI only aggregates existing rows.

---

## 5) Provider flows (approved provider; not `provider_pending`)

**Surfaces:** dashboard, calendar, availability, appointments, profile, patients, messages, notifications, earnings, bills/new, AI assistant.

### A) Availabilities

- **INSERT:** must set **`provider_id = currentUserId`**.
- **UPDATE:** safest contract — only rows with **`provider_id = currentUserId`** (admin override separate). Some policies allow appointment-linked updates; still prefer **ownership-first**.

### B) Locations & `location_modalities`

- **`locations.update`:** only where **`locations.provider_id = currentUserId`**.
- **`location_modalities` writes:** only when linked **`locations.id`** has **`locations.provider_id = currentUserId`**. **Flow:** select allowed locations → then insert/update/delete modalities for those **`location_id`** values.

### C) Appointments

- **SELECT:** filter **`provider_id = currentUserId`** (or patient) to avoid requesting impossible rows.
- **UPDATE:** provider branch with **status** rules as in live policy.

### D) Reviews (provider reply)

- **`reviews.update`** only where **`provider_id = auth.uid()`** (or admin).

### E) Messages / conversations

- **`conversations.select`:** user is **`user_id_1` or `user_id_2`**.
- **`messages.select`:** user is **`sender_id` or `receiver_id`**.  
  When opening a thread, constrain queries to **known participant pair**.

---

## 6) Provider pending (`/provider/pending`)

App **middleware** restricts most `/provider/*` routes until approved. **RLS** often keys **`provider_id = auth.uid()`** without naming `provider_pending`.

**Folder AI default:** treat **pending** as **read-only / limited** for provider-owned writes until **`role` becomes `provider`**, unless live policies are confirmed to allow otherwise.

---

## 7) Admin flows

- Admin UI must run as **`users.role = admin`** so **`auth_role() = 'admin'`** policies apply.
- Tables such as **`booking_anomalies`**, **`daily_summaries`**, **`audit_log`** — use only **admin-authenticated** session + policy-shaped queries.

---

## 8) Uploads (`documents`)

- **`documents`:** all operations where **`provider_id = auth.uid()` OR admin**. Payload must set **`provider_id = currentUserId`** for provider uploads. **Storage** for non-avatar docs: verify **bucket policies** separately from `avatars`.

---

## 9) Notifications + payments (all roles)

### Notifications

- **SELECT / UPDATE / DELETE:** **`user_id = auth.uid()` OR admin**.
- **INSERT:** **`user_id`** must match **`appointments.patient_id` OR `appointments.provider_id`** for the appointment in **`metadata.appointment_id`** (exact JSON key shape — confirm **`metadata->>'appointment_id'`** in live DB).

### Payments

- Never **update** a payment until the **`appointment_id`** is proven **owned** by the current user via a prior **allowed** appointment read.

---

## 10) Open verification: `appointments` INSERT from browser

**Question:** Does any front-end path call **`from('appointments').insert()`** directly?

- **This codebase:** **No** for the main booking path — **`POST /api/appointments`** uses **`supabaseAdmin`** to **`insert`** into **`appointments`** and **`payments`** after server checks.
- **Folder AI:** generate **`fetch('/api/appointments', { method: 'POST', body })`** for “book appointment”, not a raw table insert, unless product explicitly adds a client-side insert policy.

To lock the contract to **100%** for inserts, re-pull **`pg_policies`** for **`public.appointments`** on the **target Supabase project** and paste **INSERT** policy definitions here.

---

## Related

- [`FRONTEND-ACTIONS-INVENTORY.md`](./FRONTEND-ACTIONS-INVENTORY.md) — action list this contract maps to  
- [`FOLDER-AI-BACKEND-TRUTH.md`](./FOLDER-AI-BACKEND-TRUTH.md) — caveats + storage  
- [`BACKEND-PERMISSION-CONTRACT.md`](./BACKEND-PERMISSION-CONTRACT.md) — per-table matrix  
- `src/app/api/appointments/route.ts` — booking implementation reference
