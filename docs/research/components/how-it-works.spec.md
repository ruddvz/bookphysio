# HowItWorks Specification

## Overview
- **Target file:** `src/components/HowItWorks.tsx`
- **Screenshot:** `docs/design-references/section-how-it-works.png`
- **Interaction model:** static

## DOM Structure
```
<section> (full width, py-[80px], bg yellow)
  <div> (container-bp)
    <h2> "Let's get you a physio who gets you"
    <div> (flex row, gap-24px)
      <FeatureCard /> × 3
        - "Browse physios who take your insurance" → "See specialties"
        - "Read reviews from patients" → "See providers"
        - "Book an appointment today, online" → "See availability"
```

## Computed Styles

### Section
- background-color: #FEFAE6 (light yellow — matches Zocdoc exactly)
- padding: 80px 0

### h2
- font-size: 24px
- font-weight: 600
- color: #333333
- margin-bottom: 40px
- text-align: center

### Cards row
- display: flex
- flex-direction: row
- gap: 24px

### Feature card
- background-color: #FFFFFF
- border-radius: 12px
- padding: 32px 24px
- flex: 1
- display: flex
- flex-direction: column
- align-items: flex-start
- box-shadow: 0 2px 8px rgba(0,0,0,0.06)

### Card illustration area
- width: 100%
- height: 160px
- background-color: #F5F5F5
- border-radius: 8px
- margin-bottom: 20px
- display: flex
- align-items: center
- justify-content: center
- font-size: 48px  (emoji placeholder)

### Card heading
- font-size: 18px
- font-weight: 600
- color: #333333
- margin-bottom: 20px
- line-height: 28px

### Card CTA button
- border: 1.5px solid #333333
- background: transparent
- border-radius: 8px
- padding: 10px 20px
- font-size: 15px
- font-weight: 500
- color: #333333
- cursor: pointer
- transition: all 0.15s ease
- margin-top: auto

### Card CTA button hover
- background-color: #333333
- color: #FFFFFF

## States & Behaviors
- Cards are static; CTA buttons link to search pages (use `href="#"`)
- Card hover: box-shadow increases to `0 4px 16px rgba(0,0,0,0.12)`

## Assets
- Card 1 illustration: placeholder emoji 🩺 (Browse providers)
- Card 2 illustration: placeholder emoji ⭐ (Read reviews)
- Card 3 illustration: placeholder emoji 📅 (Book appointment)

## Text Content (adapted for bookphysio)
- Section heading: "Let's get you a physio who gets you"
- Card 1: title "Browse physios who take your insurance" | CTA "See specialties"
- Card 2: title "Read reviews from patients" | CTA "See providers"
- Card 3: title "Book an appointment today, online" | CTA "See availability"

## Responsive Behavior
- **Desktop (1440px):** 3 cards in a row
- **Tablet (768px):** 2 cards + 1 below, or single column
- **Mobile (390px):** Single column, full-width cards
- **Breakpoint:** ~768px stacks to column

## Notes for builder
- Static Server Component
- Run `npx tsc --noEmit` before finishing
