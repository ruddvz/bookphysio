# HealthSystems Specification

## Overview
- **Target file:** `src/components/HealthSystems.tsx`
- **Screenshot:** `docs/design-references/section-health-systems.png`
- **Interaction model:** static

## DOM Structure
```
<section> (full width, py-[64px], bg beige)
  <div> (container-bp, text-center)
    <p> label "bookphysio for health systems"
    <h2> "We're trusted by top health networks"
    <div> (logo grid, 6 cols, gap-24px, mt-40px)
      <div> logo placeholder × 6
    <a> CTA button "Partner with bookphysio"
```

## Computed Styles

### Section
- background-color: #F9F8F7
- padding: 64px 0

### Container
- text-align: center

### Label p
- font-size: 14px
- font-weight: 600
- color: #00766C
- text-transform: uppercase
- letter-spacing: 0.05em
- margin-bottom: 16px

### h2
- font-size: 32px
- line-height: 44px
- font-weight: 700
- color: #333333
- margin-bottom: 0

### Logo grid
- display: grid
- grid-template-columns: repeat(6, 1fr)
- gap: 24px
- margin-top: 40px
- margin-bottom: 40px
- align-items: center

### Logo card
- background-color: #FFFFFF
- border: 1px solid #E5E5E5
- border-radius: 8px
- padding: 20px 16px
- display: flex
- align-items: center
- justify-content: center
- height: 80px
- font-size: 13px
- font-weight: 600
- color: #666666
- text-align: center

### CTA button
- background-color: #00766C
- color: #FFFFFF
- font-size: 16px
- font-weight: 600
- padding: 14px 28px
- border-radius: 24px
- border: none
- cursor: pointer
- text-decoration: none
- display: inline-block
- transition: background-color 0.15s ease

### CTA button hover
- background-color: #005A52

## States & Behaviors
- Fully static
- CTA button links to /health-systems (use `href="#"` for MVP)

## Assets
- Logo placeholders: text-only cards showing network name (no logo images needed for MVP)

## Text Content (adapted for India / bookphysio)
- Label: "bookphysio for health systems"
- Heading: "We're trusted by top health networks"
- Networks (6 cards):
  1. Apollo Health
  2. Fortis Healthcare
  3. Max Healthcare
  4. Manipal Hospitals
  5. Narayana Health
  6. Aster DM Healthcare
- CTA: "Partner with bookphysio"

## Responsive Behavior
- **Desktop (1440px):** 6-col logo grid
- **Tablet (768px):** 3-col logo grid
- **Mobile (390px):** 2-col logo grid
- **Breakpoint:** ~768px

## Notes for builder
- Static Server Component
- Run `npx tsc --noEmit` before finishing
