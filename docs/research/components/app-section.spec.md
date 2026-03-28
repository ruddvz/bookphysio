# AppSection Specification

## Overview
- **Target file:** `src/components/AppSection.tsx`
- **Screenshot:** `docs/design-references/section-app.png`
- **Interaction model:** static

## DOM Structure
```
<section> (full width, peach bg, py-[80px])
  <div> (container-bp, flex row, gap-48px)
    <div> (left col, ~45%)
      <h2> "Thousands of physios. One app."
      <p> description text
      <p> "Scan the QR code to get the app now"
      <img> QR code (102×102px)
      <div> (app store badges row)
        <a> App Store badge
        <a> Google Play badge
    <div> (right col, ~55%, relative)
      <div> (yellow circle bg, absolute)
      <img> phone mockup (bookphysio app screenshot)
```

## Computed Styles

### Section
- background-color: #FFC794 (peach — matches Zocdoc exactly)
- padding: 80px 0
- overflow: hidden

### Container (flex row)
- display: flex
- flex-direction: row
- align-items: center
- gap: 48px

### Left column
- flex: 0 0 45%

### h2
- font-size: 36px
- line-height: 48px
- font-weight: 700
- color: #333333
- margin-bottom: 16px

### Description p
- font-size: 16px
- line-height: 26px
- color: #333333
- margin-bottom: 32px

### QR label
- font-size: 14px
- color: #333333
- margin-bottom: 12px

### QR code image
- width: 102px
- height: 102px
- border-radius: 8px
- border: 2px solid #FFFFFF
- margin-bottom: 24px

### App store badges row
- display: flex
- flex-direction: row
- gap: 16px

### App store badge img
- height: 44px
- border-radius: 8px

### Right column
- flex: 0 0 55%
- position: relative
- display: flex
- align-items: flex-end
- justify-content: center

### Yellow circle bg
- position: absolute
- width: 400px
- height: 400px
- background-color: #FEED5A (yellow — keep Zocdoc's yellow for the circle)
- border-radius: 50%
- bottom: -80px
- right: 0
- z-index: 0

### Phone mockup image
- position: relative
- z-index: 1
- height: 480px
- object-fit: contain

## States & Behaviors
- Fully static
- App Store / Google Play badges link to app stores (use `href="#"`)

## Assets
- QR code: placeholder 102×102 grey box with "QR" text
- Phone mockup: placeholder 300×480 styled mockup showing booking UI
- App Store badge: use SVG inline or placeholder
- Google Play badge: use SVG inline or placeholder

## Text Content (adapted for bookphysio)
- Heading: "Thousands of physios. One app."
- Description: "The bookphysio app is the quickest, easiest way to book and keep track of your physiotherapy appointments."
- QR label: "Scan the QR code to get the app now"
- Badges: "Download on the App Store" | "Get it on Google Play"

## Responsive Behavior
- **Desktop (1440px):** 2-col, text left, phone right
- **Tablet (768px):** 2-col with compressed widths
- **Mobile (390px):** Single col, phone mockup below text, reduced size
- **Breakpoint:** ~768px

## Notes for builder
- Static Server Component
- Run `npx tsc --noEmit` before finishing
