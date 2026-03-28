# JobsCTA Specification

## Overview
- **Target file:** `src/components/JobsCTA.tsx`
- **Screenshot:** `docs/design-references/section-jobs-cta.png`
- **Interaction model:** static

## DOM Structure
```
<section> (full width, py-[80px], bg light yellow)
  <div> (container-bp, flex row, items-center, justify-between)
    <div> (left col, ~60%)
      <p> label "bookphysio jobs"
      <h2> "Join us, and help transform physiotherapy for everyone."
      <a> CTA button "View job openings"
    <div> (right col, ~40%, flex, justify-end)
      <div> illustration placeholder (emoji characters)
```

## Computed Styles

### Section
- background-color: #FFF0BB
- padding: 80px 0

### Container
- display: flex
- flex-direction: row
- align-items: center
- justify-content: space-between

### Left col
- flex: 0 0 60%

### Label p
- font-size: 14px
- font-weight: 600
- color: #00766C
- text-transform: uppercase
- letter-spacing: 0.05em
- margin-bottom: 16px

### h2
- font-size: 36px
- line-height: 48px
- font-weight: 700
- color: #333333
- margin-bottom: 32px
- max-width: 480px

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

### Right col
- flex: 0 0 40%
- display: flex
- justify-content: flex-end
- align-items: center

### Illustration placeholder
- font-size: 96px
- display: flex
- gap: 16px
- align-items: center

## States & Behaviors
- Fully static
- CTA links to /careers (use `href="#"` for MVP)

## Assets
- Illustration: two emoji figures 🧑‍⚕️👩‍⚕️ as placeholder (centered, large)

## Text Content (bookphysio)
- Label: "bookphysio jobs"
- Heading: "Join us, and help transform physiotherapy for everyone."
- CTA: "View job openings"
- Illustration: 🧑‍⚕️ 👩‍⚕️

## Responsive Behavior
- **Desktop (1440px):** 2-col (text left, illustration right)
- **Tablet (768px):** 2-col with compressed widths
- **Mobile (390px):** single col, illustration hidden
- **Breakpoint:** ~768px

## Notes for builder
- Static Server Component
- Run `npx tsc --noEmit` before finishing
