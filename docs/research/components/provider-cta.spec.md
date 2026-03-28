# ProviderCTA Specification

## Overview
- **Target file:** `src/components/ProviderCTA.tsx`
- **Screenshot:** `docs/design-references/section-provider-cta.png`
- **Interaction model:** static

## DOM Structure
```
<section> (full width, py-[80px], bg white)
  <div> (container-bp, flex row, gap-64px, items-center)
    <div> (left col, ~50%, relative)
      <div> (placeholder image area, 560×380px, rounded-[12px], bg #F0F0F0)
        <span> emoji placeholder 👨‍⚕️
    <div> (right col, ~50%)
      <p> label "bookphysio for private practices"
      <h2> "Are you a practice interested in filling your calendar?"
      <ul> (3 bullet points)
        <li> × 3
      <a> CTA button "Learn more about our practice solutions"
```

## Computed Styles

### Section
- background-color: #FFFFFF
- padding: 80px 0

### Container
- display: flex
- flex-direction: row
- align-items: center
- gap: 64px

### Left col (image)
- flex: 0 0 50%

### Image placeholder
- width: 100%
- max-width: 560px
- height: 380px
- background-color: #F0F0F0
- border-radius: 12px
- display: flex
- align-items: center
- justify-content: center
- font-size: 80px

### Right col
- flex: 0 0 50%

### Label p
- font-size: 14px
- font-weight: 600
- color: #00766C
- text-transform: uppercase
- letter-spacing: 0.05em
- margin-bottom: 12px

### h2
- font-size: 32px
- line-height: 44px
- font-weight: 700
- color: #333333
- margin-bottom: 24px

### ul
- list-style: none
- padding: 0
- margin-bottom: 32px

### li
- font-size: 16px
- line-height: 26px
- color: #333333
- padding-left: 24px
- margin-bottom: 12px
- position: relative

### li::before (checkmark)
- content: "✓"
- position: absolute
- left: 0
- color: #00766C
- font-weight: 700

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
- CTA button links to /for-providers (use `href="#"` for MVP)

## Assets
- Provider image: placeholder 560×380 grey box with 👨‍⚕️ emoji (no real image needed for MVP)

## Text Content (adapted for bookphysio)
- Label: "bookphysio for private practices"
- Heading: "Are you a practice interested in filling your calendar?"
- Bullet 1: "Reach patients who need your physiotherapy expertise"
- Bullet 2: "Smart scheduling that reduces no-shows by up to 30%"
- Bullet 3: "Seamless integration with your existing clinic workflow"
- CTA: "Learn more about our practice solutions"

## Responsive Behavior
- **Desktop (1440px):** 2-col, image left, text right
- **Tablet (768px):** stacks to single col, image above text
- **Mobile (390px):** single col, image hidden or shown above
- **Breakpoint:** ~768px

## Notes for builder
- Static Server Component
- Run `npx tsc --noEmit` before finishing
