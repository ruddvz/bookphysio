# BookPhysio — Pages Codemap

> Every route in the application, what it renders, and which agent owns it.

## Public Pages (owner: `bp-ui-public`)

| Route | File | Type | Key Components | Notes |
|-------|------|------|----------------|-------|
| `/` | `app/page.tsx` | Server | Navbar, HeroSection, TopSpecialties, HowItWorks, AppSection, ProviderCTA, HealthSystems, CityLinks, CommonReasons, JobsCTA, Footer | Homepage — 11 sections |
| `/search` | `app/search/page.tsx` | Server | Navbar, SearchFilters (client), DoctorCard, Footer | Reads searchParams, fetches `/api/providers` |
| `/search` | `app/search/SearchFilters.tsx` | Client | — | Filter sidebar: specialty, city, visit type, availability, fee range |
| `/doctor/[id]` | `app/doctor/[id]/page.tsx` | Server | Navbar, BookingCard (client), Footer | Fetches `/api/providers/[id]` |
| `/doctor/[id]` | `app/doctor/[id]/BookingCard.tsx` | Client | — | Visit type tabs, date picker, time slots, "Book Session" CTA |
| `/book/[id]` | `app/book/[id]/page.tsx` | Client | Navbar, StepConfirm, StepPayment, StepSuccess | 3-step booking wizard |
| `/specialty/[slug]` | `app/specialty/[slug]/page.tsx` | Server | Navbar, DoctorCard, Footer | Specialty landing |
| `/city/[slug]` | `app/city/[slug]/page.tsx` | Server | Navbar, DoctorCard, Footer | City landing |
| `/about` | `app/about/page.tsx` | Server | Navbar, Footer | Static: mission, team, stats |
| `/faq` | `app/faq/page.tsx` | Server | Navbar, Footer | Accordion FAQ |
| `/how-it-works` | `app/how-it-works/page.tsx` | Server | Navbar, Footer | 3-step illustrated flow |
| `/privacy` | `app/privacy/page.tsx` | Server | Navbar, Footer | Privacy policy |
| `/terms` | `app/terms/page.tsx` | Server | Navbar, Footer | Terms of service |
| 404 | `app/not-found.tsx` | Server | Navbar | Friendly 404 with "Go home" CTA |

## Auth Pages (owner: `bp-ui-public`)

| Route | File | Type | Notes |
|-------|------|------|-------|
| `/login` | `app/(auth)/login/page.tsx` | Client | Phone + OTP, Google OAuth option |
| `/signup` | `app/(auth)/signup/page.tsx` | Client | Name, phone, email, Send OTP |
| `/verify-otp` | `app/(auth)/verify-otp/page.tsx` | Client | 6-digit OTP input, resend timer |
| `/doctor-signup` | `app/(auth)/doctor-signup/page.tsx` | Client | 5-step form: personal, professional, practice, pricing, OTP verify |
| `/forgot-password` | `app/(auth)/forgot-password/page.tsx` | Client | Password reset flow |
| Layout | `app/(auth)/layout.tsx` | Server | Centered card layout |

## Patient Dashboard (owner: `bp-ui-patient`)

| Route | File | Type | Notes |
|-------|------|------|-------|
| `/patient/dashboard` | `app/patient/dashboard/page.tsx` | Server | Welcome, upcoming appointment, quick actions, past appointments |
| `/patient/appointments` | `app/patient/appointments/page.tsx` | Server | Tabs: Upcoming / Past |
| `/patient/appointments/[id]` | `app/patient/appointments/[id]/page.tsx` | Server | Full appointment detail |
| `/patient/profile` | `app/patient/profile/page.tsx` | Client | Form: name, phone, email, DOB, city, pincode |
| `/patient/payments` | `app/patient/payments/page.tsx` | Server | Table: Date, Doctor, Amount ₹, GST, Total, Status |
| `/patient/notifications` | `app/patient/notifications/page.tsx` | Server | Notification list with unread dots |
| `/patient/messages` | `app/patient/messages/page.tsx` | Client | Message threads (stub) |
| `/patient/search` | `app/patient/search/page.tsx` | Client | In-dashboard provider search — reuses `SearchContent` (`variant="patient"`) + v2 `PatientSearchFiltersRail` when ui-v2 |
| Layout | `app/patient/layout.tsx` | Server | SidebarNav + header |

## Provider Portal (owner: `bp-ui-provider`)

| Route | File | Type | Notes |
|-------|------|------|-------|
| `/provider/dashboard` | `app/provider/dashboard/page.tsx` | Server | Today's summary stats + schedule timeline |
| `/provider/calendar` | `app/provider/calendar/page.tsx` | Client | 7-day grid; ui-v2: `ProviderCalendarV2Chrome` + per-cell booking `Badge` |
| `/provider/appointments` | `app/provider/appointments/page.tsx` | Server | Table: Patient, Date, Time, Type, Status |
| `/provider/appointments/[id]` | `app/provider/appointments/[id]/page.tsx` | Server | Appointment detail |
| `/provider/patients` | `app/provider/patients/page.tsx` | Server | Patient list with search |
| `/provider/patients/[id]` | `app/provider/patients/[id]/page.tsx` | Server | Patient detail + visit history |
| `/provider/availability` | `app/provider/availability/page.tsx` | Client | Weekday toggles, slot duration; ui-v2: `ProviderAvailabilityV2Chrome` + day window `Badge` |
| `/provider/earnings` | `app/provider/earnings/page.tsx` | Server | Monthly ₹ total, GST, payouts, transactions |
| `/provider/profile` | `app/provider/profile/page.tsx` | Client | Practice profile form |
| `/provider/messages` | `app/provider/messages/page.tsx` | Client | Message threads (stub) |
| `/provider/notifications` | `app/provider/notifications/page.tsx` | Server | Notifications (stub) |
| Layout | `app/provider/layout.tsx` | Server | SidebarNav + header |

## Admin Panel (owner: `bp-ui-admin`)

| Route | File | Type | Notes |
|-------|------|------|-------|
| `/admin` | `app/admin/page.tsx` | Server | Platform overview: providers, pending, patients, GMV |
| `/admin/listings` | `app/admin/listings/page.tsx` | Server | Provider approval queue table |
| `/admin/users` | `app/admin/users/page.tsx` | Server | Tabs: Patients / Providers, search + table |
| `/admin/analytics` | `app/admin/analytics/page.tsx` | Server | Analytics stub |
| Layout | `app/admin/layout.tsx` | Server | SidebarNav + header |

## Root Layout

| File | Type | What It Does |
|------|------|-------------|
| `app/layout.tsx` | Server | `<html>`, `<body>`, Inter font, global metadata |

## Middleware

| File | What It Does |
|------|-------------|
| `middleware.ts` | Protects `/patient/*`, `/provider/*`, `/admin/*`, `/dashboard/*`, `/appointments/*`, `/book/*`, `/profile/*`, `/notifications/*`, `/schedule/*`, `/patients/*`, `/reviews/*`, `/settings/*`, `/onboarding/*` |
