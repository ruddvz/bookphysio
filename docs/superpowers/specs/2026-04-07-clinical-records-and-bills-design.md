# Clinical Records (SOAP) + Bill PDF Generator — Design Spec

**Date:** 2026-04-07
**Author:** Rudra (via Claude)
**Status:** Approved for implementation

## Context

bookphysio.in does not yet have real bookings — patients discover providers and chat. Providers track their own visits with patients **after the fact**. We need:

1. A clinical records system so providers can write SOAP notes per visit, and patients can see a simplified summary.
2. A real PDF bill generator (current one is print-window screenshot, broken).

Inspiration: `aryanshailech/Physiotherapy-Clinic-Web-Application` (patient history + treatments).

## Scope

### In scope
- DB tables: `patient_clinical_profiles`, `patient_visits`, `clinical_notes`
- Provider patient roster (rewrite of `/provider/patients`)
- Provider patient chart at `/provider/patients/[id]` with profile / visit timeline / bills tabs
- SOAP note panel embedded in `/provider/appointments/[id]` and patient chart
- Patient-facing `/patient/records` showing simplified summaries only
- Bill PDF generator using `@react-pdf/renderer` (server-side, vector PDF)
- "AI Dictate → fill SOAP" UI placeholder (button stub, no API call)

### Out of scope
- Real AI dictation (UI placeholder only)
- Pre-booked appointments (visits are provider-recorded only)
- Multi-provider patient handoff

## Data Model

Visit numbering is **per (provider, patient) pair**. No `appointment_id` coupling — visits stand alone.

```sql
create table patient_clinical_profiles (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references profiles(id) on delete cascade,
  patient_id uuid not null references profiles(id) on delete cascade,
  patient_name text not null,
  patient_phone text,
  patient_age int,
  patient_gender text,
  chief_complaint text,
  medical_history text,
  contraindications text,
  treatment_goals text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(provider_id, patient_id)
);

create table patient_visits (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references profiles(id) on delete cascade,
  patient_id uuid not null references profiles(id) on delete cascade,
  visit_number int not null,
  visit_date date not null default current_date,
  created_at timestamptz default now(),
  unique(provider_id, patient_id, visit_number)
);

create table clinical_notes (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null unique references patient_visits(id) on delete cascade,
  provider_id uuid not null references profiles(id) on delete cascade,
  patient_id uuid not null references profiles(id) on delete cascade,
  subjective text,
  pain_scale int check (pain_scale between 0 and 10),
  range_of_motion text,
  functional_tests text,
  objective_notes text,
  assessment text,
  plan text,
  patient_summary text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

**RLS:** providers full access on their own rows; patients read-only on `clinical_notes` where `patient_id = auth.uid()`. Server API filters to only expose `plan` + `patient_summary` to patients (defense in depth).

**Visit numbering:** computed server-side as `coalesce(max(visit_number), 0) + 1` inside a transaction.

## API Surface

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/provider/patients` | Provider's roster (name, last visit, total visits) |
| POST | `/api/provider/patients` | Add a patient to roster (creates profile) |
| GET | `/api/provider/patients/[id]` | Full chart: profile + visits + SOAP timeline |
| PATCH | `/api/provider/patients/[id]/profile` | Update clinical profile |
| POST | `/api/provider/patients/[id]/visits` | Create new visit (auto-increments visit_number) |
| PUT | `/api/provider/visits/[visitId]/soap` | Upsert SOAP note for a visit |
| GET | `/api/patient/records` | Patient's simplified records (filtered) |
| POST | `/api/provider/bills/generate` | Stream PDF via @react-pdf/renderer |

## Pages

### Provider
- **`/provider/patients`** — searchable roster, "+ Add Patient" modal
- **`/provider/patients/[id]`** — chart with three tabs (Profile / Visits / Bills) + sticky "+ New Visit"
- **`/provider/appointments/[id]`** — extended with inline SOAP panel + "AI Dictate" placeholder
- **`/provider/bills/new`** *(new)* — bill form + iframe preview + Download PDF (replaces broken modal in earnings page)

### Patient
- **`/patient/records`** *(new)* — "Your Care Summary": timeline of visits across providers, only `patient_summary` and `plan` (relabeled "What's next")

## Bill PDF

- Library: `@react-pdf/renderer` (server-side, Node runtime)
- Layout: BookPhysio wordmark header (teal), provider details, patient details, line items table (description / visits / rate / amount), GST toggle, total in teal, footer disclaimer in 7pt #999 gray
- Disclaimer: *"This invoice is issued directly by the healthcare provider. BookPhysio.in facilitates discovery and communication only and is not a party to this transaction."*
- Currency: ₹ integer rupees, no paise
- Returns `Content-Type: application/pdf` stream

## File Layout

```
supabase/migrations/030_clinical_records.sql

src/lib/clinical/
  types.ts                 — shared TS types
  visit-numbering.ts       — server-side helper

src/app/api/provider/patients/route.ts                       — GET, POST
src/app/api/provider/patients/[id]/route.ts                  — GET
src/app/api/provider/patients/[id]/profile/route.ts          — PATCH
src/app/api/provider/patients/[id]/visits/route.ts           — POST
src/app/api/provider/visits/[visitId]/soap/route.ts          — PUT
src/app/api/patient/records/route.ts                         — GET
src/app/api/provider/bills/generate/route.ts                 — POST (PDF stream)

src/components/clinical/
  SoapForm.tsx             — full SOAP form (used in chart + appointment page)
  VisitTimeline.tsx        — visit cards w/ collapsed SOAP
  PatientRosterTable.tsx   — table component
  AddPatientModal.tsx
  ClinicalProfileForm.tsx

src/components/bills/
  BillForm.tsx
  BillPdfDocument.tsx      — react-pdf Document component

src/app/provider/patients/page.tsx                  — rewritten
src/app/provider/patients/[id]/page.tsx             — rewritten
src/app/provider/appointments/[id]/page.tsx        — extended
src/app/provider/bills/new/page.tsx                — new
src/app/patient/records/page.tsx                   — new
```

## Validation

- All inputs Zod-validated at API boundary
- `pain_scale` constrained 0–10
- `visit_date` must not be in future
- `patient_summary` max 1000 chars

## Acceptance Criteria

- [ ] Provider can add a patient, create visits, write SOAP notes
- [ ] Visit number auto-increments per (provider, patient) pair
- [ ] Patient sees only `patient_summary` + `plan` on `/patient/records`
- [ ] Bill PDF downloads as a real vector PDF, not a screenshot
- [ ] Bill PDF has BookPhysio header + line items + light disclaimer footer
- [ ] `rtk npm run build` passes with zero errors
- [ ] Existing 220 tests still pass
