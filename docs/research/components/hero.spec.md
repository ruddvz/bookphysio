# HeroSection Specification

## Overview
- **Target file:** `src/components/HeroSection.tsx`
- **Screenshot:** `docs/design-references/section-hero.png`
- **Interaction model:** time-driven (CSS animation cycles specialties every 3.5s)

## DOM Structure
```
<section> (full width, relative)
  <div> (container-bp, pt-[70px] pb-[120px])
    <div> (2-col: text-left ~55%, illustration-right ~45%)
      <div> (text column)
        <h1> "Book local <span.animate-specialty>physiotherapists</span>
              who take your insurance"
        <SearchBar />
      <div> (illustration column, decorative hands/card art)
```

## Computed Styles (from getComputedStyle on zocdoc.com, adapted)

### Section container
- background-color: #DCE9FD (changes per specialty — use CSS custom property or state)
- width: 100%
- position: relative
- overflow: hidden

### Inner section (hero content area)
- padding: 70px 60px 120px
- background-color: #FDFACE (cream — Zocdoc default; bookphysio: use teal-light #E6F4F3)
- width: 100%

### h1 heading
- font-size: 44px
- line-height: 60px
- font-weight: 600
- font-family: Inter
- color: #333333
- max-width: 560px

### Animated specialty span
- class: `animate-specialty`
- animation: fadeInAndOut 3.5s ease-in-out forwards (defined in globals.css)
- color: #00766C (teal — bookphysio primary)
- font-style: italic

### Search bar container
- margin-top: 32px
- display: flex
- flex-direction: row
- align-items: center
- background-color: #FFFFFF
- border-radius: 8px
- border: 1px solid #E5E5E5
- box-shadow: 0 2px 8px rgba(0,0,0,0.08)
- height: 64px
- max-width: 800px

### Search field (condition/doctor)
- flex: 2
- padding: 0 16px
- font-size: 16px
- color: #333333
- border: none
- outline: none
- border-right: 1px solid #E5E5E5

### Location field
- flex: 1.5
- padding: 0 16px
- font-size: 16px
- color: #333333
- border: none
- outline: none
- border-right: 1px solid #E5E5E5

### "Find care" / "Find Physio" button
- background-color: #00766C (bookphysio teal; Zocdoc used #FEED5A yellow)
- color: #FFFFFF
- font-size: 16px
- font-weight: 600
- padding: 0 24px
- height: 100%
- border-radius: 0 8px 8px 0
- border: none
- cursor: pointer
- display: flex, align-items: center, gap: 8px
- transition: background-color 0.15s ease

## States & Behaviors

### Specialty cycling animation
- **Trigger**: CSS keyframe animation, repeats every 3.5s via JS setInterval updating state
- **Specialties** (bookphysio): "physiotherapists", "sports physios", "neuro physios", "paediatric physios", "women's health physios"
- **Background colors per specialty**: cycle through [#E6F4F3, #DCE9FD, #FFF0BB, #FFC794, #F9F8F7]
- **Transition**: background-color 0.5s ease on section container
- **Implementation**: `useEffect` with `setInterval(3500)`, track `currentIndex`, apply `animate-specialty` class, change bg color

### Find Physio button hover
- background-color: #005A52
- transition: background-color 0.15s ease

### Search field focus
- border-color: #00766C
- box-shadow: 0 0 0 2px rgba(0,118,108,0.15)

## Assets
- **Illustration**: Decorative pair of illustrated hands holding a medical card — top-right of hero
  - Use a placeholder teal illustration or SVG for MVP
  - Position: absolute, right: 0, top: 0, height: 100%, object-fit: contain

## Text Content (adapted for bookphysio)
- Heading: "Book local [SPECIALTY] who take your insurance"
- Search placeholder 1: "Condition, injury or physio name"
- Search placeholder 2: "Mumbai, MH"
- Search placeholder 3: "Add insurance"
- CTA button: "🔍 Find Physio"
- Label above search field 1: "Search"
- Label above search field 2: "Location"
- Label above search field 3: "Add insurance"

## Responsive Behavior
- **Desktop (1440px):** 2-col layout, heading 44px, illustration visible right
- **Tablet (768px):** illustration hidden, single col heading, search bar wraps
- **Mobile (390px):** heading 32px, stacked search fields (vertical), full-width button
- **Breakpoint:** ~768px col collapses

## Notes for builder
- Use React `useState` + `useEffect` for specialty cycling
- `'use client'` directive required (interactive)
- Import `cn` from `@/lib/utils`
- Run `npx tsc --noEmit` before finishing
