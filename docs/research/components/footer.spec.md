# Footer Specification

## Overview
- **Target file:** `src/components/Footer.tsx`
- **Screenshot:** `docs/design-references/section-footer.png`
- **Interaction model:** static

## DOM Structure
```
<footer> (full width, dark bg)
  <div> (container-bp, py-[64px])
    <div> (4-col grid: brand | Explore | Patients | Providers)
      <FooterColumn /> × 4
    <div> (app badges row + social icons, border-top, mt-48px, pt-32px)
      <div> app badges
      <div> social icons
  <div> (legal bar, border-top, py-16px)
    <p> disclaimer
    <div> © + links + privacy choices
```

## Computed Styles

### Footer
- background-color: #333333
- color: #FFFFFF
- width: 100%

### Container
- padding: 64px 60px 0

### 5-col grid
- display: grid
- grid-template-columns: 120px 1fr 1fr 1fr 1fr (first col narrower)
- gap: 48px
- padding-bottom: 48px

### Column heading
- font-size: 14px
- font-weight: 600
- color: #FFFFFF
- margin-bottom: 16px
- text-transform: none

### Column links
- font-size: 14px
- color: #CCCCCC
- text-decoration: none
- display: block
- margin-bottom: 12px
- line-height: 1.4

### Column link hover
- color: #FFFFFF
- transition: color 0.15s ease

### "New" badge
- background-color: #FEED5A (yellow)
- color: #333333
- font-size: 11px
- font-weight: 600
- padding: 2px 6px
- border-radius: 4px
- margin-left: 6px

### App badges section
- display: flex
- flex-direction: row
- justify-content: space-between
- align-items: center
- border-top: 1px solid rgba(255,255,255,0.15)
- padding-top: 32px
- margin-top: 0

### App store badge img
- height: 40px
- border-radius: 6px

### Social icons row
- display: flex
- gap: 16px

### Social icon
- width: 24px
- height: 24px
- color: #CCCCCC
- cursor: pointer

### Social icon hover
- color: #FFFFFF

### Legal bar
- background-color: #222222
- padding: 16px 60px
- font-size: 12px
- color: #999999
- line-height: 1.6

### Legal disclaimer
- margin-bottom: 16px

### Copyright row
- display: flex
- justify-content: space-between
- align-items: center
- flex-wrap: wrap
- gap: 8px

### Legal links
- display: flex
- gap: 16px
- font-size: 12px
- color: #999999
- text-decoration: none

## States & Behaviors
- Fully static
- All links use `href="#"` placeholder

## Assets
- App Store badge: inline SVG or placeholder button
- Google Play badge: inline SVG or placeholder button
- Social icons: Twitter/X, Instagram, Facebook, LinkedIn — use simple SVG or emoji placeholders

## Text Content (adapted for bookphysio)

**Column 1 — bookphysio**
- Home | About us | Press | Careers | Contact us | Help

**Column 2 — Discover**
- The Physio Journal (blog) | Resources for providers | Community Standards | Privacy policy | Verified reviews | Tech Blog `New`

**Column 2 — Explore**
- About us | Search physios | How it works | FAQ

**Column 3 — Patients**
- Log in | Create account | Book a session | Privacy policy

**Column 4 — Providers**
- Doctor signup | Provider dashboard | Availability | Terms of service

**App section**: "Get the bookphysio app" + App Store + Google Play badges

**Legal**: "The content provided here and elsewhere on the bookphysio.in site or mobile app is provided for general informational purposes only. It is not intended as, and bookphysio does not provide, medical advice, diagnosis or treatment."

**Copyright**: "© 2026 bookphysio.in" | Terms | Privacy | Consumer Health | Site map | Your privacy choices

**Social**: Twitter, Instagram, Facebook, LinkedIn icons

## Responsive Behavior
- **Desktop (1440px):** 5-col grid
- **Tablet (768px):** 3-col grid (last 2 cols stack)
- **Mobile (390px):** Single col, each section stacked
- **Breakpoint:** ~768px

## Notes for builder
- Static Server Component
- Social icons can be simple inline SVGs
- Run `npx tsc --noEmit` before finishing
