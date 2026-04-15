# Plan: Specialties Navigation & Rich Content System

## Context
bookphysio.in already has a skeleton specialties system (8 specialties, navbar Browse dropdown, `/specialties/[slug]` article pages, `/specialty/[slug]` listing pages). The goal is to transform this into a full "Yellow Pages" for Indian physiotherapy by:
1. Enriching each specialty page with clinical detail (conditions, symptoms, treatments, modalities)
2. Adding missing specialties (Geriatric, Vestibular, Industrial)
3. Enabling condition-based search ("back pain" → Musculoskeletal specialty)
4. Enhancing provider profiles with qualifications (BPT/MPT/PhD/DPT), certifications (IAP, Mulligan, etc.), and equipment/modality tags
5. Updating doctor signup to capture these new fields

---

## Current State (What Already Exists)
- `src/lib/specialties.ts` — 8 specialties with slug, label, ncahpName, tagline, icon, tint colors
- `src/components/Navbar.tsx` — Browse dropdown already shows all specialties, links to `/specialties/{slug}`
- `src/app/specialties/[slug]/page.tsx` — Article page with title, subtitle, description, highlights (4), benefits (4), conditions (6)
- `src/app/specialty/[slug]/page.tsx` — Listing page (CTA → `/search?specialty={slug}`)
- `src/components/specialties/SpecialtyArticle.tsx` — Article renderer component
- `supabase/migrations/` — `specialties` table + `provider_specialties` join table
- `src/app/api/contracts/provider.ts` — `ProviderCard` and `ProviderProfile` types
- `src/lib/validations/provider.ts` — Zod provider schema with `specialty_ids`
- `src/app/api/providers/onboard/route.ts` — Onboarding step 2 handles specialty selection

---

## Implementation Phases

### Phase 1 — Expand Specialty Definitions in `src/lib/specialties.ts`
**Goal:** Transform 8 thin specialty objects into rich clinical data objects.

Add to `SpecialtyDef` interface:
```typescript
conditions: { name: string; slug: string; description: string }[]  // searchable conditions
symptoms: string[]          // common presenting symptoms
treatments: string[]        // treatment approaches
modalities: string[]        // equipment/modality tags used
certifications: string[]    // relevant professional certifications
seoTitle: string
seoDescription: string
```

**Specialties to add** (from document):
- `geriatric` — Geriatric Physiotherapy (currently absorbed in Community Rehab, needs its own)
- `vestibular` — Vestibular Rehabilitation (sub-specialty of Neuro, but searchable separately)
- `industrial` — Industrial/Occupational Health Physiotherapy

**Condition examples per specialty** (to seed):
| Specialty | Conditions |
|-----------|-----------|
| Musculoskeletal | Back pain, Knee osteoarthritis, Frozen shoulder, Sciatica, Neck pain, Spondylosis |
| Neurosciences | Stroke, Parkinson's disease, Multiple sclerosis, Spinal cord injury, Cerebral palsy |
| Sports | ACL tear, Rotator cuff injury, Tennis elbow, Ankle sprain, Stress fracture |
| Cardio-Pulmonary | COPD, Asthma, Post-COVID recovery, Post-CABG rehab, Bronchiectasis |
| Paediatrics | Cerebral palsy, Developmental delay, Muscular dystrophy, Torticollis, ADHD |
| Women's Health | Pelvic floor dysfunction, Prenatal back pain, Postnatal recovery, Incontinence |
| Oncology | Lymphedema, Cancer fatigue, Post-mastectomy rehab, Peripheral neuropathy |
| Community Rehab | Geriatric falls, Home-based stroke rehab, Disability management |
| Geriatric | Osteoporosis, Balance disorders, Fall prevention, Hip fracture rehab |
| Vestibular | BPPV, Meniere's disease, Dizziness, Vertigo, Labyrinthitis |
| Industrial | Carpal tunnel, Repetitive strain injury, Ergonomic assessment, Low back pain |

---

### Phase 2 — Enhanced Specialty Article Pages
**Files to modify:**
- `src/components/specialties/SpecialtyArticle.tsx` — Add sections for conditions grid, symptoms list, treatments list, modality tags
- `src/app/specialties/[slug]/page.tsx` — Update metadata (seoTitle, seoDescription from new fields)

**New sections to render:**
1. **Conditions Treated** — Clickable condition cards (name + short description), links to `/search?condition={slug}`
2. **Common Symptoms** — Bullet list (patient-friendly language)
3. **Treatment Methods** — How physiotherapy helps (methods/approaches)
4. **Equipment & Modalities** — Tag chips showing what equipment specialists use
5. **Relevant Certifications** — What certifications to look for in a provider
6. **Find a Specialist CTA** — Links to `/search?specialty={slug}`

---

### Phase 3 — Condition-Based Search
**Goal:** "back pain" in search bar → finds Musculoskeletal specialists.

**Files to modify:**
- `src/lib/specialties.ts` — `conditions[]` array (already planned in Phase 1)
- `src/lib/conditions.ts` — NEW: flat map of `conditionSlug → specialtySlug` for fast lookup
- `src/app/api/providers/route.ts` — Add `condition` query param; resolve condition slug → specialty slug → filter
- `src/app/search/page.tsx` — Pass `condition` param from URL to API
- `src/components/SearchBar.tsx` (or equivalent) — Add condition autocomplete suggestions

**Search logic:**
```
/search?condition=back-pain
  → lookup conditions map → specialty = 'musculoskeletal'
  → /api/providers?specialty_id={musculoskeletal_uuid}
```

---

### Phase 4 — Provider Profile: Qualifications & Certifications
**Goal:** Doctors can declare BPT/MPT/PhD/DPT, IAP membership, technique certifications.

**DB Migration** (`038_provider_qualifications.sql`):
```sql
-- qualification, certifications, equipment_tags go on providers (non-sensitive, public metadata)
ALTER TABLE providers
  ADD COLUMN qualification text CHECK (qualification IN ('BPT','MPT','PhD','DPT')),
  ADD COLUMN certifications text[],   -- e.g. ['Mulligan', 'McKenzie', 'Maitland']
  ADD COLUMN equipment_tags text[];   -- e.g. ['TENS', 'Ultrasound', 'Traction']

-- iap_member_id is personal data (DPDPA) and MUST NOT go on the providers table.
-- The providers_public_read RLS policy exposes entire rows for verified+active providers,
-- so adding iap_member_id there would make it world-readable.
-- Instead: store it in a separate table with restrictive RLS (admin + owning provider only).
CREATE TABLE provider_iap_members (
  provider_id uuid PRIMARY KEY REFERENCES providers(id) ON DELETE CASCADE,
  iap_member_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Only admin and the owning provider may read/write
ALTER TABLE provider_iap_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY provider_iap_members_owner ON provider_iap_members
  FOR ALL TO authenticated
  USING (
    provider_id = auth.uid()
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Audit trigger: log create/update/delete on provider_iap_members
-- (References existing audit_log table or creates one if absent — confirm during implementation)
CREATE OR REPLACE FUNCTION audit_provider_iap_members()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO audit_log (table_name, operation, row_id, actor_id, changed_at)
  VALUES (
    'provider_iap_members',
    TG_OP,
    COALESCE(NEW.provider_id, OLD.provider_id),
    auth.uid(),
    now()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_audit_provider_iap_members
AFTER INSERT OR UPDATE OR DELETE ON provider_iap_members
FOR EACH ROW EXECUTE FUNCTION audit_provider_iap_members();
```

**TypeScript changes:**
- `src/app/api/contracts/provider.ts` — Add `qualification`, `iap_member_id`, `certifications[]`, `equipment_tags[]` to `ProviderProfile`
- `src/lib/validations/provider.ts` — Add Zod fields for the above
- `src/components/DoctorCard.tsx` — Show qualification badge (BPT/MPT/PhD/DPT) next to name
- `src/app/provider/[id]/page.tsx` — Show certifications + equipment tags in profile

---

### Phase 5 — Doctor Signup: Capture New Fields
**Files to modify:**
- `src/app/(auth)/doctor-signup/page.tsx` (or relevant onboarding step)
- `src/app/api/providers/onboard/route.ts` — Step 2 (specialty/credentials step)
- `src/app/provider/settings/page.tsx` — Allow editing qualifications post-signup

**New form fields:**
- Qualification dropdown: BPT / MPT / PhD / DPT
- IAP Member ID (text, optional)
- Certifications: multi-select checkboxes (Mulligan, McKenzie, Maitland, NDT, etc.)
- Equipment/Modalities: multi-select (TENS, IFT, Ultrasound, SWD, Traction, LASER, etc.)

---

### Phase 6 — Search Filters Enhancement
**Goal:** Add qualification and certification filters to search page.

**Files to modify:**
- `src/app/search/page.tsx` — Add filter chips for `qualification`, `certifications`
- `src/app/api/providers/route.ts` — Handle new filter params
- `src/lib/validations/search.ts` — Add `qualification`, `certification` to searchFiltersSchema

### Docs & Memory (after search filter implementation)
- [ ] Update `docs/CODEMAPS/api.md` and `docs/CODEMAPS/lib.md`
- [ ] Tick completed phases in `docs/planning/EXECUTION-PLAN.md`
- [ ] Update `docs/planning/ACTIVE.md` with next steps

---

## Critical Files (summary)
| File | Change |
|------|--------|
| `src/lib/specialties.ts` | Add conditions[], symptoms[], treatments[], modalities[], certifications[], seoTitle, seoDescription; add 3 new specialties |
| `src/lib/conditions.ts` | NEW: flat condition→specialty map |
| `src/components/specialties/SpecialtyArticle.tsx` | Add conditions grid, symptoms, treatments, modality tags, certifications sections |
| `src/app/specialties/[slug]/page.tsx` | Use new seoTitle/seoDescription fields |
| `src/app/api/providers/route.ts` | Support `condition` query param |
| `src/app/api/contracts/provider.ts` | Add qualification, certifications, equipment_tags fields |
| `src/lib/validations/provider.ts` | Add Zod schema for new provider fields |
| `src/lib/validations/search.ts` | Add qualification, certification filter params |
| `src/app/api/providers/onboard/route.ts` | Save new qualification/certification fields |
| `src/components/DoctorCard.tsx` | Show qualification badge |
| `supabase/migrations/038_provider_qualifications.sql` | NEW: Add qualification/certifications/equipment_tags to providers; create provider_iap_members table with RLS + audit trigger |

---

## Sequencing (What to Build First)
1. **Phase 1** — Enrich `specialties.ts` (foundation; everything reads from this)
2. **Phase 2** — Enhanced article pages (visible immediate win, no DB changes)
3. **Phase 3** — Condition-based search (patient-facing value)
4. **Phase 4 + 5** — DB migration + provider qualifications (doctor-facing value)
5. **Phase 6** — Search filters for qualifications (completes the loop)

---

## Verification
- `rtk npm run build` — Zero TypeScript errors after each phase
- Visit `/specialties/musculoskeletal` — See conditions grid, symptoms, treatments, modality tags
- Search "back pain" on homepage → routed to Musculoskeletal specialists
- Doctor signup step 2 shows qualification + certification fields
- Provider profile card shows MPT/BPT badge

---

## Notes
- The user will provide more clinical details for each specialty content. Phase 1 will use the document-extracted data as the seed; we can update later.
- No changes to the navbar are needed — the Browse dropdown already works.
- All new specialties (Geriatric, Vestibular, Industrial) need corresponding DB rows in the `specialties` table + a new migration.
- DPDPA compliance: `iap_member_id` is a professional identifier and personal data under DPDPA.
  It is stored in the **separate `provider_iap_members` table** (not on `providers`) because the
  `providers_public_read` RLS policy exposes entire provider rows to the public — adding `iap_member_id`
  to `providers` would make it world-readable, violating DPDPA access controls.
  Retention: retained for provider account lifetime, deleted on account deletion (cascades via FK).
  Access: restricted to admin role and the owning provider via a dedicated RLS policy on `provider_iap_members`.
  Logging: an audit trigger on `provider_iap_members` records create/update/delete operations in `audit_log`.
  Certifications and equipment tags are professional metadata, not personal data, and remain on `providers`.
