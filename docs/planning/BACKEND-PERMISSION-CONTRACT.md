# Backend permission contract (what the frontend must call)

> **Purpose:** Single reference for **Supabase client** calls that align with **current database RLS**. Use **`createClient()`** (browser) or the same session-based client pattern so the JWT is sent; **`auth.uid()`** is null when logged out and most row policies yield no access or denial.
>
> **Truth source:** RLS in the **deployed** Supabase project. Reconcile this document when policies change (dashboard or migrations). See also [`FRONTEND-PERMISSIONS.md`](./FRONTEND-PERMISSIONS.md) for UI routing and role helpers.

---

## Rule for all calls

Use the **logged-in user session** — normal **`createClient()`** from `@supabase/supabase-js` (cookies / session on web).

- If the user is **not logged in**, **`auth.uid()`** is NULL and **most policies will deny** or return **no rows**.

Where this doc says **“(public)”** on a policy, it refers to how policies are often named in Supabase (e.g. default role); **unauthenticated** requests still only pass checks that do not require `auth.uid()` to match a row (e.g. open catalogs). Involvement-based rules need a **valid JWT**.

---

## `specialties`

| Operation | Who | Contract |
|-----------|-----|----------|
| **SELECT** | Public + authenticated | `from('specialties').select('*')` — no filters required. |
| **INSERT / UPDATE / DELETE** | Admin only | `auth_role() = 'admin'`. Frontend: mutations only for admins. |

---

## `providers`

| Operation | Contract |
|-----------|----------|
| **SELECT** | `(verified = true AND active = true) OR id = auth.uid() OR admin`. Frontend: `from('providers').select('*')` — RLS filters visible rows. |
| **INSERT** | `id = auth.uid()` OR admin. Frontend: insert must set **`id`** to current user id (unless admin). |
| **UPDATE** | `id = auth.uid()` OR admin. Frontend: update targets row where **`id = auth.uid()`** (or admin). |

---

## `users`

| Operation | Contract |
|-----------|----------|
| **SELECT** | `id = auth.uid() OR admin`. Frontend: `from('users').select('*').eq('id', currentUserId)` with **`currentUserId === session user id`**. |
| **UPDATE** | Authenticated; **`id = auth.uid()`**. Frontend: `update(...).eq('id', currentUserId)`. |

---

## `insurances`

| Operation | Contract |
|-----------|----------|
| **SELECT** | Public read. Frontend: `from('insurances').select('*')` — no filters required. |
| **INSERT / UPDATE / DELETE** | Admin only. Frontend: admins only. |

---

## `provider_insurances`

| Operation | Contract |
|-----------|----------|
| **SELECT** | Public read. Frontend: `from('provider_insurances').select('*')`. |
| **INSERT** | Authenticated; **`provider_id = auth.uid()`**. Frontend: insert includes **`provider_id = currentUserProviderId`** (provider’s user id). |
| **DELETE** | Authenticated; **`provider_id = auth.uid()`**. Frontend: `delete().eq('provider_id', currentUserProviderId)`. |

---

## `locations`

| Operation | Contract |
|-----------|----------|
| **SELECT** | Locations whose provider is verified+active **OR** `provider_id = auth.uid()` **OR** admin. Frontend: `from('locations').select('*')` — RLS restricts rows. |
| **UPDATE** | `provider_id = auth.uid() OR admin`. Frontend: `update(...).eq('id', locationId)` where that row’s **`provider_id`** is the current user (or admin). |

---

## `availabilities`

| Operation | Contract |
|-----------|----------|
| **SELECT** | **Unbooked, unblocked** slot **and** provider verified+active **OR** `provider_id = auth.uid()` **OR** admin. Frontend: `from('availabilities').select('*')`. |
| **INSERT** | **`provider_id = auth.uid()`**. Frontend: insert sets **`provider_id`** to current user id (provider). |
| **UPDATE** | Provider or admin **or** narrower rules tied to linked **appointments** (patient/provider + status). Frontend: only update rows you own or that satisfy the linked-appointment conditions (often: load via provider/patient context first). |

*Exact `UPDATE` branches depend on full policy SQL in DB — treat appointment-linked updates as server-sensitive.*

---

## `appointments`

| Operation | Contract |
|-----------|----------|
| **SELECT** | `patient_id = auth.uid() OR provider_id = auth.uid() OR admin`. Frontend: optionally narrow with `.or('patient_id.eq.<uid>,provider_id.eq.<uid>')` so the query only asks for rows you may see. |
| **UPDATE** | Patient: own row and **status** in allowed set (e.g. pending/confirmed). Provider: own row + status rules. **WITH CHECK** may allow transitions to cancelled, etc. Frontend: always filter/update rows already scoped to the user. |

---

## `payments`

| Operation | Contract |
|-----------|----------|
| **SELECT** | Exists **appointment** where `payments.appointment_id = appointments.id` and `auth.uid()` is **`appointments.patient_id` or `appointments.provider_id`**. |
| **UPDATE** | Same appointment tie + patient or provider or admin. |

---

## `clinical_notes`

| Operation | Contract |
|-----------|----------|
| **SELECT** | Authenticated; visit belongs to profile where **`patient_clinical_profiles.patient_user_id = auth.uid()`**. Frontend: resolve **profile / visit** context first, then query notes (not arbitrary ids). |

---

## `patient_clinical_profiles`

| Operation | Contract |
|-----------|----------|
| **SELECT** | **`patient_user_id = auth.uid()`**. Frontend: `from('patient_clinical_profiles').select('*').eq('patient_user_id', currentUserId)`. |

---

## `patient_visits`

| Operation | Contract |
|-----------|----------|
| **SELECT** | **`profile_id`** belongs to a profile where **`patient_user_id = auth.uid()`**. Frontend: query visits **after** you have allowed **profile_id(s)** (derived from patient’s profiles). |

---

## `provider_certifications`

| Operation | Contract |
|-----------|----------|
| **SELECT / INSERT / UPDATE / DELETE** | **`provider_id = auth.uid()` OR admin**. Frontend: writes target **`provider_id = currentUserId`** (unless admin). |

---

## `location_modalities`

| Operation | Contract |
|-----------|----------|
| **SELECT / INSERT / UPDATE / DELETE** | Linked **`locations`** row has **`locations.provider_id = auth.uid()`** OR admin. Frontend: only after you have **location ids** the provider owns. |

---

## `messages`

| Operation | Contract |
|-----------|----------|
| **SELECT** | **`auth.uid() = sender_id OR auth.uid() = receiver_id`**. Frontend: scope by known conversation participants / filters so you are not pulling unrelated rows. |

---

## `conversations`

| Operation | Contract |
|-----------|----------|
| **SELECT** | **`auth.uid()` = `user_id_1` OR `user_id_2`** (e.g. `conversations_user_read`). Frontend: only request conversations where the current user is a participant. |

---

## `booking_anomalies`

| Operation | Contract |
|-----------|----------|
| **SELECT / INSERT / UPDATE / DELETE** | **Admin** (`users.role = 'admin'`) **OR** row linked to an **appointment** where **`patient_id = auth.uid()` OR `provider_id = auth.uid()`**. Frontend: tie operations to an appointment the user can access. |

---

## `reviews`

| Operation | Contract |
|-----------|----------|
| **INSERT** | Authenticated; **`patient_id = auth.uid()`**. |
| **UPDATE** | **`provider_id = auth.uid()` OR admin** (e.g. provider reply). |
| **SELECT** | **`is_published = true`** OR row matches patient/provider **OR** admin. |

---

## `documents`

| Operation | Contract |
|-----------|----------|
| **ALL** | **`provider_id = auth.uid()` OR admin**. Frontend: **`provider_id`** = current provider user id (unless admin). |

---

## `notifications`

| Operation | Contract |
|-----------|----------|
| **SELECT / UPDATE / DELETE** | **`user_id = auth.uid()` OR admin**. |
| **INSERT** | **`user_id`** aligns with appointment participants when **`metadata.appointment_id`** is set (patient or provider on that appointment) **OR** admin. |

---

## Optional next step: UI → call scripts

To turn this into a **numbered “call #1 / call #2”** list (exact `.select().eq()` chains only), list the **5–10 UI actions** you care about most (e.g. patient books, provider edits location, provider replies to review). Then map each to the minimal table operations above.

---

## Related

- [`FRONTEND-PERMISSIONS.md`](./FRONTEND-PERMISSIONS.md) — roles, middleware, `src/lib/permissions` helpers.
- Live verification: Supabase Dashboard → **Authentication** session + **Table Editor** with RLS, or SQL against `pg_policies`.
