# InsurancePlans Specification

## Overview
- **Target file:** `src/components/InsurancePlans.tsx`
- **Screenshot:** `docs/design-references/section-insurance.png`
- **Interaction model:** static

## DOM Structure
```
<section> (full width, py-[64px])
  <div> (container-bp)
    <h2> "Find an in-network physio from over 100+ insurance plans"
    <p> "Add your insurance to see in-network physiotherapists"
    <div> (flex row, gap-16px, flex-wrap)
      <InsuranceCard /> × 5  (Star Health, Niva Bupa, HDFC ERGO, Medi Assist, ICICI Lombard)
    <a> "See all (100+)"
    <button> "Add your insurance coverage"
```

## Computed Styles

### Section
- padding: 64px 0
- background-color: transparent (inherits body white #FFFFFF)

### Heading h2
- font-size: 24px
- line-height: 32px
- font-weight: 600
- color: #333333
- margin-bottom: 8px

### Subtext p
- font-size: 16px
- color: #666666
- margin-bottom: 32px

### Cards row
- display: flex
- flex-direction: row
- gap: 16px
- flex-wrap: wrap
- margin-bottom: 24px

### Insurance card
- width: ~185px
- height: 80px
- background-color: #FFFFFF
- border: 1px solid #E5E5E5
- border-radius: 8px
- display: flex
- align-items: center
- justify-content: center
- padding: 16px
- cursor: pointer

### Insurance card hover
- box-shadow: 0 2px 8px rgba(0,0,0,0.12)
- border-color: #00766C
- transition: box-shadow 0.15s ease, border-color 0.15s ease

### "See all" link
- font-size: 16px
- color: #00766C
- text-decoration: underline
- cursor: pointer
- display: block
- margin-bottom: 24px

### "Add your insurance coverage" button
- background: transparent
- border: 1.5px solid #333333
- border-radius: 8px
- padding: 12px 20px
- font-size: 16px
- font-weight: 500
- color: #333333
- cursor: pointer

### "Add your insurance" button hover
- background-color: #F5F5F5
- transition: background-color 0.15s ease

## States & Behaviors
- Cards are static links (no expand/collapse)
- "See all" navigates to insurance list page (use `href="#"` for MVP)
- "Add your insurance" opens modal (use `onClick={() => {}}` placeholder)

## Per-State Content
N/A — static section

## Assets
- Insurance logo images: use placeholder grey rectangles with insurer name text for MVP
- Images would be: `public/images/insurance/star-health.png` etc.
- For MVP, render insurer name as text centered in the card

## Text Content (adapted for India)
- Heading: "Find an in-network physio from over 100+ insurance plans"
- Subtext: "Add your insurance to see in-network physiotherapists"
- Insurers: Star Health, Niva Bupa, HDFC ERGO, Medi Assist, ICICI Lombard
- Link: "See all (100+)"
- Button: "Add your insurance coverage"

## Responsive Behavior
- **Desktop (1440px):** 5 cards in one row
- **Tablet (768px):** 3 cards per row
- **Mobile (390px):** 2 cards per row, cards fill width
- **Breakpoint:** ~768px

## Notes for builder
- Static Server Component (no `'use client'` needed)
- Import `cn` from `@/lib/utils`
- Run `npx tsc --noEmit` before finishing
