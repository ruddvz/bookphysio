# TopSpecialties Specification

## Overview
- **Target file:** `src/components/TopSpecialties.tsx`
- **Screenshot:** `docs/design-references/section-specialties.png`
- **Interaction model:** static (each card links to specialty search)

## DOM Structure
```
<section> (full width, py-[48px])
  <div> (container-bp)
    <h2> "Top physiotherapy specialties"
    <div> (grid, 6 cols desktop, 3 cols tablet, 2 cols mobile, gap-16px)
      <SpecialtyCard /> × 6
```

## Computed Styles

### Section
- padding: 48px 0
- background-color: transparent

### h2
- font-size: 24px
- font-weight: 600
- color: #333333
- margin-bottom: 24px

### Grid container
- display: grid
- grid-template-columns: repeat(6, 1fr) — desktop
- gap: 16px

### Specialty card
- background-color: #FFF1BF (light yellow — Zocdoc used same)
- border-radius: 12px
- padding: 16px
- display: flex
- flex-direction: column
- align-items: center
- justify-content: center
- cursor: pointer
- text-decoration: none
- transition: box-shadow 0.15s ease, transform 0.15s ease

### Specialty card image
- width: 80px
- height: 80px
- object-fit: contain
- margin-bottom: 12px

### Specialty card label
- font-size: 14px
- font-weight: 500
- color: #333333
- text-align: center

### Specialty card hover
- box-shadow: 0 4px 12px rgba(0,0,0,0.12)
- transform: translateY(-2px)

## States & Behaviors
- Each card is an `<a>` tag linking to search with specialty pre-filled
- Hover: subtle lift + shadow

## Assets
- Specialty illustrations: 80×80px emoji/SVG icons for MVP
  - Sports Physio: 🏃 or sport SVG
  - Neuro Physio: 🧠
  - Ortho Physio: 🦴
  - Paediatric Physio: 👶
  - Women's Health: 🌸
  - Geriatric Physio: 👴

## Text Content (bookphysio specialties)
6 cards:
1. Sports Physio
2. Neuro Physio
3. Ortho Physio
4. Paediatric Physio
5. Women's Health
6. Geriatric Physio

## Responsive Behavior
- **Desktop (1440px):** 6 columns
- **Tablet (768px):** 3 columns
- **Mobile (390px):** 2 columns
- **Breakpoint:** 768px → 3col; 390px → 2col

## Notes for builder
- Static Server Component
- Use Next.js `<Link>` for cards
- Use emoji text as placeholder icons (no image files needed for MVP)
- Run `npx tsc --noEmit` before finishing
