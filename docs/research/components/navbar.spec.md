# Navbar Specification

## Overview
- **Target file:** `src/components/Navbar.tsx`
- **Screenshot:** `docs/design-references/section-navbar.png`
- **Interaction model:** static + click-driven (Browse dropdown)

## DOM Structure
```
<header> (sticky top-0, full width, z-50)
  <div> (max-width 1142px, mx-auto, flex, items-center, h-[80px])
    <Logo />           — left: teal Z mark + "bookphysio" wordmark
    <nav>              — center: Browse (dropdown), Help, "List your practice"
    <div>              — right: Log in (dropdown arrow), Sign up (CTA button)
```

## Computed Styles (from getComputedStyle on zocdoc.com)

### Header container
- position: sticky
- top: 0
- z-index: 50
- background-color: #FFFFFF  (bookphysio white; Zocdoc used #FDFACE cream)
- border-bottom: 1px solid #E5E5E5
- height: 80px
- width: 100%

### Inner wrapper
- display: flex
- flex-direction: row
- align-items: center
- justify-content: space-between
- max-width: 1142px
- margin: 0 auto
- padding: 0 60px
- height: 80px

### Logo mark (Z circle)
- width: 40px, height: 40px
- background-color: #00766C (teal)
- border-radius: 50%
- color: white
- font-size: 20px, font-weight: 700
- display: flex, align-items: center, justify-content: center

### Logo wordmark "bookphysio"
- font-size: 18px
- font-weight: 600
- color: #333333
- margin-left: 8px

### Nav links (Browse, Help, List your practice)
- font-size: 16px
- font-weight: 500
- color: #333333
- padding: 8px 12px
- display: flex, gap: 4px, align-items: center

### "Log in" button
- font-size: 16px
- font-weight: 500
- color: #333333
- background: transparent
- border: none
- display: flex, align-items: center, gap: 4px (chevron icon)

### "Sign up" CTA button
- background-color: #00766C (teal — bookphysio primary; Zocdoc used #FEED5A yellow)
- color: #FFFFFF
- font-size: 16px
- font-weight: 600
- padding: 10px 20px
- border-radius: 24px
- border: none
- cursor: pointer

## States & Behaviors

### Hover states
- **Nav links**: color → #00766C, underline appears, transition: color 0.15s ease
- **Sign up button**: background-color #005A52, transition: background-color 0.15s ease
- **Log in**: color → #00766C

### Browse dropdown
- **Trigger**: click on "Browse" link
- **State A**: hidden (display: none)
- **State B**: shown — mega-menu grid of specialties
- **Transition**: fade-in, 0.15s
- **Simplified**: just render a simple dropdown with 6–8 specialties; full mega-menu is not needed for MVP

## Assets
- Logo: use inline SVG circle with "B" or teal circle + wordmark
- Chevron: inline SVG `▾` for Browse and Log in

## Text Content (verbatim adapted for bookphysio)
- Logo: "bookphysio"
- Nav: "Browse" | "Help" | "List your practice on bookphysio"
- Right: "Log in" | "Sign up"

## Responsive Behavior
- **Desktop (1440px):** Full horizontal nav, all links visible
- **Tablet (768px):** Nav links compress; "List your practice" hides
- **Mobile (390px):** Hamburger menu icon; nav collapses to drawer
- **Breakpoint:** stacks at ~768px

## Notes for builder
- Use `shadcn/ui` for the dropdown menu component
- `cn()` from `@/lib/utils` for class merging
- No external libraries needed
- Run `npx tsc --noEmit` before finishing
