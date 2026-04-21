# Front-end actions inventory (bookphysio.in)

> **Purpose:** Exhaustive list of **user-visible actions** implied by **`src/app/**` routes** and the **API routes** they trigger, grouped by role. Use this with [`FOLDER-AI-BACKEND-TRUTH.md`](./FOLDER-AI-BACKEND-TRUTH.md) to build per-action Supabase call scripts.
>
> **Note:** Hindi locale (`/hi/...`) mirrors many English static and auth routes — actions are the same unless noted. **Dev/demo** routes are for development only.

---

## Legend

- **Page** = Next.js `page.tsx` route (what the user navigates to).
- **API** = `src/app/api/**/route.ts` (what the client may `fetch`).

---

## 1) Public / logged-out (no session required for entry)

| Action | Where (page or flow) |
|--------|----------------------|
| View marketing home | `/` |
| Search / browse providers (directory) | `/search`, `/patient/search`, `/hi/search` |
| View how-it-works, about, FAQ | `/how-it-works`, `/about`, `/faq` (+ `/hi/...` where present) |
| View legal | `/terms`, `/privacy` (+ `/hi/terms`, `/hi/privacy`) |
| Browse specialties (SEO / landing) | `/specialties/[slug]`, `/specialty/[slug]` |
| Browse by city | `/city/[slug]` |
| View public doctor/teaser profile | `/doctor/[id]` |
| Start booking flow (select slot / confirm as guest or login) | `/book/[id]` |
| Open auth | `/login`, `/signup`, `/verify-otp`, `/verify-email`, `/forgot-password` (+ `/hi/login`, `/hi/signup`, etc.) |
| Provider acquisition / onboarding entry | `/doctor-signup` |
| Preview / demo gate (dev) | `/preview` |
| Dev-only login helpers | `/dev-login` |
| Demo UI experiments | `/demo/footer`, `/demo/beams` |

---

## 2) Authentication & account (any role until role assigned)

| Action | Page / API |
|--------|------------|
| Log in (email / phone flows per UI) | `/login` → `/api/auth/login` |
| Sign up | `/signup` → `/api/auth/signup` |
| Verify OTP | `/verify-otp` → `/api/auth/otp/send`, `/api/auth/otp/verify` |
| Verify email | `/verify-email` → email OTP routes if used |
| OAuth / magic link callback | server `/api/auth/callback` |
| Request magic link | `/api/auth/magic-link` |
| Password reset request / verify | `/forgot-password` → `/api/auth/password-reset`, `/api/auth/password-reset/verify` |
| Email OTP send / verify | `/api/auth/email-otp/send`, `/api/auth/email-otp/verify` |
| Set credentials after invite | `/api/auth/set-credentials` |
| Upload / update avatar | UI → `/api/auth/avatar` (+ Storage; see Folder AI doc) |
| Read onboarding status | `/api/auth/me/onboarding-status` |
| Demo session (preview) | `/api/auth/preview`, `/api/auth/demo-session` |
| Dev signup shortcut | `/api/auth/dev-signup` (non-prod) |

---

## 3) Patient (`role = patient`)

### Pages (primary navigation surfaces)

| Action | Page |
|--------|------|
| Patient dashboard (home) | `/patient/dashboard` |
| Search providers | `/patient/search`, `/search` |
| Book an appointment (chosen provider) | `/book/[id]` |
| List my appointments | `/patient/appointments` |
| View / manage one appointment | `/patient/appointments/[id]` |
| View care records / clinical timeline | `/patient/records` |
| Profile / settings | `/patient/profile` |
| Payments (history / pay flow) | `/patient/payments` |
| Notifications | `/patient/notifications` |
| Messages / chat | `/patient/messages` |
| PAI assistant (patient AI) | `/patient/pai` |
| Motio (patient-facing motio entry if linked) | `/patient/motio` |

### Typical API actions (patient)

| Domain | Actions (endpoints) |
|--------|---------------------|
| Profile | GET/PATCH `/api/profile` |
| Appointments | GET/POST `/api/appointments`; GET/PATCH/DELETE `/api/appointments/[id]` |
| Records (clinical, patient-facing) | GET `/api/patient/records` |
| Payments | GET/POST `/api/payments`; `/api/payments/create-order`, `/api/payments/verify`; refunds via `/api/payments/refund` when applicable |
| Notifications | GET/PATCH `/api/notifications`; POST `/api/notifications/[id]/read` |
| Conversations / messages | GET/POST `/api/conversations`; GET/PATCH `/api/conversations/[user_id]/messages`; POST read `/api/conversations/[user_id]/read` |
| Reviews | POST/GET `/api/reviews`; GET `/api/reviews/recent`; provider listing `/api/providers/[id]/reviews` |
| Providers (discovery) | GET `/api/providers`, `/api/providers/[id]`, `/api/providers/[id]/availability` |
| Subscriptions (if patient-facing billing) | `/api/subscriptions` |
| AI (patient) | `/api/ai/pai` |
| Uploads | POST `/api/upload` |
| Support chat | POST `/api/chat/support` |

---

## 4) Provider (`role = provider`; not `provider_pending`)

### Pages

| Action | Page |
|--------|------|
| Provider dashboard | `/provider/dashboard` |
| Calendar view | `/provider/calendar` |
| Manage availability / slots | `/provider/availability` |
| List provider appointments | `/provider/appointments` |
| Appointment detail | `/provider/appointments/[id]` |
| Provider profile (practice) | `/provider/profile` |
| Patient list | `/provider/patients` |
| Patient detail (clinical / visits) | `/provider/patients/[id]` |
| Messages | `/provider/messages` |
| Notifications | `/provider/notifications` |
| Earnings | `/provider/earnings` |
| Create bill / invoice flow | `/provider/bills/new` |
| AI assistant (provider) | `/provider/ai-assistant` |

### Typical API actions (provider)

| Domain | Actions (endpoints) |
|--------|---------------------|
| Profile | GET/PATCH `/api/profile` |
| Providers (self / public) | GET/PATCH `/api/providers/[id]`; listing onboarding `/api/providers/onboard`, `/api/providers/onboard-signup` |
| Availability | GET/POST/PATCH/DELETE `/api/provider/availability` |
| Schedule | GET `/api/provider/schedule` |
| Appointments | Same as patient where role is provider |
| Patients & visits | GET/POST `/api/provider/patients`; GET `/api/provider/patients/[id]`; visits `/api/provider/patients/[id]/visits`; profile `/api/provider/patients/[id]/profile`; SOAP `/api/provider/visits/[visitId]/soap` |
| Bills | POST `/api/provider/bills/generate` |
| Reviews | Reply flows via `/api/reviews` / provider review routes |
| Payments | As involved provider on `/api/payments` |
| Notifications / messages / conversations | Same family as patient |
| AI (provider) | `/api/ai/provider`, `/api/ai/motio` |
| Uploads | `/api/upload` |

---

## 5) Provider pending (`role = provider_pending`)

| Action | Page |
|--------|------|
| Wait / complete verification | `/provider/pending` only (middleware restricts other `/provider/*`) |

---

## 6) Admin (`role = admin`)

| Action | Page |
|--------|------|
| Admin home | `/admin` |
| User management | `/admin/users` |
| Listings / provider moderation | `/admin/listings` |
| Analytics | `/admin/analytics` |

### API (admin)

| Action | Endpoint |
|--------|----------|
| User admin | `/api/admin/users` |
| Listings moderation | `/api/admin/listings` |
| Stats / analytics / AI insights | `/api/admin/stats`, `/api/admin/analytics`, `/api/admin/ai-insights` |

---

## 7) Chat / messages / conversations (patient & provider)

| Action | Page | API |
|--------|------|-----|
| List conversations | `/patient/messages`, `/provider/messages` | GET `/api/conversations` |
| Open thread, load messages | same | GET `/api/conversations/[user_id]/messages` |
| Send message | same | POST `/api/conversations/[user_id]/messages` |
| Mark conversation read | same | POST `/api/conversations/[user_id]/read` |
| Legacy/alternate message API | — | POST/GET `/api/messages` (if still used) |

---

## 8) Notifications & payments (cross-role)

| Domain | Actions |
|--------|---------|
| **Notifications** | List: `/api/notifications` (GET); mark read: `/api/notifications/[id]/read` (POST); drawer in `Navbar` |
| **Payments** | Create intent / order: `/api/payments/create-order`; verify: `/api/payments/verify`; list/update: `/api/payments`; webhook (server): `/api/payments/webhook`; refund (authorized): `/api/payments/refund` |

---

## 9) Discovery & content (mixed / SEO)

| Action | Page |
|--------|------|
| Provider detail (public) | `/doctor/[id]` |
| Specialty pages | `/specialties/[slug]`, `/specialty/[slug]` |
| City hubs | `/city/[slug]` |
| Locale switcher static | `/hi/...` equivalents |

---

## 10) Internal / infra (not end-user product actions)

| Endpoint | Purpose |
|----------|---------|
| `/api/revalidate` | ISR / cache |
| `/api/stats` | Platform stats |
| `/api/cron/*` | Cron (reminders, daily summary, review prompts) — server-only |
| `/api/payments/webhook` | Razorpay webhook |

---

## 11) How to tighten this into “Folder AI scripts”

1. Pick a **role** (patient / provider / admin).
2. Pick an **action** row above.
3. Map to **tables + operations** in [`BACKEND-PERMISSION-CONTRACT.md`](./BACKEND-PERMISSION-CONTRACT.md).
4. **Prefer existing `/api/*` handlers** in this repo — they already encode validation and often **service-role** paths where RLS alone is not enough.

When in doubt, grep the page for **`fetch('/api/`** to see the exact endpoint.

---

## Related docs

- [`FOLDER-AI-BACKEND-TRUTH.md`](./FOLDER-AI-BACKEND-TRUTH.md) — RLS + caveats  
- [`BACKEND-PERMISSION-CONTRACT.md`](./BACKEND-PERMISSION-CONTRACT.md) — per-table client contract  
- [`FRONTEND-PERMISSIONS.md`](./FRONTEND-PERMISSIONS.md) — role gating & middleware
