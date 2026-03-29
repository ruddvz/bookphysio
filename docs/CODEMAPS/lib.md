# BookPhysio — Lib Codemap

> All files in `src/lib/`. Owner: `bp-backend`.

## Service Clients

| File | Service | API Key Env Var | Used By |
|------|---------|-----------------|---------|
| `supabase/client.ts` | Supabase browser client | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client components (auth state) |
| `supabase/server.ts` | Supabase server client (cookie-based) | Same + reads cookies | API routes, Server Components |
| `supabase/admin.ts` | Supabase admin client (service role) | `SUPABASE_SERVICE_ROLE_KEY` | Admin-only operations, never client-side |
| `razorpay.ts` | Razorpay payment gateway | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | `/api/payments/*` routes |
| `msg91.ts` | MSG91 SMS/OTP (India) | `MSG91_AUTH_KEY`, `MSG91_TEMPLATE_ID` | `/api/auth/otp/*` routes |
| `resend.ts` | Resend transactional email | `RESEND_API_KEY` | Booking confirmation, notifications |
| `hundredms.ts` | 100ms telehealth video | `HMS_ACCESS_KEY`, `HMS_SECRET` | `/api/telehealth/room` |
| `mapbox.ts` | Mapbox geocoding | `MAPBOX_ACCESS_TOKEN` | Provider onboarding (address → lat/lng) |
| `upstash.ts` | Upstash Redis rate limiting | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | `middleware.ts` |
| `utils.ts` | Utility: `cn()` classname merge | — | All UI components |

## Validation Schemas (`src/lib/validations/`)

| File | Key Schemas | India-Specific Rules |
|------|-------------|---------------------|
| `auth.ts` | signupSchema, loginSchema, otpSendSchema, otpVerifySchema | Phone: `/^\+91[6-9]\d{9}$/`, OTP: 6 digits |
| `booking.ts` | createAppointmentSchema, slotSelectSchema | Fee in integer INR, GST 18% |
| `payment.ts` | createOrderSchema, webhookPayloadSchema | Amount in INR, Razorpay signature verification |
| `provider.ts` | providerProfileSchema, onboardingSchema | ICP number, pincode `/^[1-9][0-9]{5}$/` |
| `review.ts` | createReviewSchema | Rating 1-5, text required |
| `search.ts` | searchParamsSchema | City dropdown (10 Indian cities), visit_type enum |

## Database Migrations (`supabase/migrations/`)

| File | What It Does |
|------|-------------|
| `001_initial_schema.sql` | Creates 14 tables: users, providers, specialties, locations, insurances, provider_insurances, availabilities, appointments, payments, subscriptions, reviews, documents, notifications |
| `002_rls_policies.sql` | Row-level security: patients=own data, providers=own+patients, admins=all |
| `003_indexes.sql` | Performance indexes on foreign keys + search columns |

## Environment Variables (documented in `.env.example`)

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Razorpay (India payments)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# MSG91 (India SMS/OTP)
MSG91_AUTH_KEY=
MSG91_TEMPLATE_ID=
MSG91_SENDER_ID=

# Resend (email)
RESEND_API_KEY=

# 100ms (telehealth)
HMS_ACCESS_KEY=
HMS_SECRET=

# Mapbox (geocoding)
MAPBOX_ACCESS_TOKEN=
NEXT_PUBLIC_MAPBOX_TOKEN=

# Upstash (rate limiting)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
