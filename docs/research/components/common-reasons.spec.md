# CommonReasons Specification

## Overview
- **Target file:** `src/components/CommonReasons.tsx`
- **Screenshot:** `docs/design-references/section-common-reasons.png`
- **Interaction model:** click-driven (category accordions)

## DOM Structure
```
<section> (full width, py-[64px], bg light yellow)
  <div> (container-bp)
    <h2> "Common visit reasons"
    <div> (category tabs row, flex, gap-8px, mb-24px)
      <button> × 4 (Musculoskeletal | Neurological | Post-Surgery | Sports Injury)
    <div> (reasons grid, 4 cols)
      <a> reason link × N (based on active category)
```

## Computed Styles

### Section
- background-color: #FFF0BB
- padding: 64px 0

### h2
- font-size: 24px
- font-weight: 600
- color: #333333
- margin-bottom: 24px

### Category tabs row
- display: flex
- flex-direction: row
- gap: 8px
- margin-bottom: 32px
- flex-wrap: wrap

### Category tab button
- background-color: #FFFFFF
- border: 1.5px solid #CCCCCC
- border-radius: 20px
- padding: 8px 20px
- font-size: 15px
- font-weight: 500
- color: #333333
- cursor: pointer
- transition: all 0.15s ease

### Category tab button (active)
- background-color: #333333
- border-color: #333333
- color: #FFFFFF

### Category tab button hover (inactive)
- border-color: #333333

### Reasons grid
- display: grid
- grid-template-columns: repeat(4, 1fr)
- gap: 8px 24px

### Reason link
- font-size: 14px
- color: #333333
- text-decoration: none
- padding: 8px 0
- border-bottom: 1px solid rgba(0,0,0,0.08)
- display: block
- transition: color 0.15s ease

### Reason link hover
- color: #00766C
- text-decoration: underline

## States & Behaviors
- Default: first category (Musculoskeletal) is active
- Click category tab: switches displayed reasons, active tab style changes
- No animation needed — just swap visible links

## Text Content (bookphysio — physiotherapy visit reasons)

**Category 1 — Musculoskeletal** (16 reasons, 4 cols × 4):
Back Pain | Neck Pain | Shoulder Pain | Knee Pain | Hip Pain | Ankle Sprain | Tennis Elbow | Frozen Shoulder | Sciatica | Plantar Fasciitis | Arthritis | Scoliosis | Carpal Tunnel | Wrist Pain | Foot Pain | Posture Correction

**Category 2 — Neurological**:
Stroke Rehab | Parkinson's Disease | Multiple Sclerosis | Cerebral Palsy | Spinal Cord Injury | Bell's Palsy | Vestibular Disorders | Neuropathy | Head Injury Rehab | Balance Disorders | Guillain-Barré | Ataxia | ALS Physio | Spasticity Management | Cognitive Rehab | Gait Training

**Category 3 — Post-Surgery**:
Knee Replacement | Hip Replacement | ACL Reconstruction | Rotator Cuff Repair | Spinal Fusion | Shoulder Replacement | Ankle Surgery | Foot Surgery | Carpal Tunnel Release | Disc Surgery | Fracture Rehab | Joint Replacement | Tendon Repair | Ligament Surgery | Amputation Rehab | Scar Management

**Category 4 — Sports Injury**:
Muscle Strain | Ligament Sprain | Stress Fracture | Runner's Knee | Shin Splints | Hamstring Tear | Groin Strain | Achilles Tendinopathy | Jumper's Knee | IT Band Syndrome | Rotator Cuff Injury | Sports Concussion | Bursitis | Muscle Cramp | Overuse Injury | Return to Sport

## Responsive Behavior
- **Desktop (1440px):** 4-col reasons grid
- **Tablet (768px):** 2-col grid
- **Mobile (390px):** 1-col grid; category tabs wrap
- **Breakpoint:** ~768px

## Notes for builder
- `'use client'` required (active category state)
- Use `useState<string>` for active category
- All reason links use `href="#"` for MVP
- Run `npx tsc --noEmit` before finishing
