# CityLinks Specification

## Overview
- **Target file:** `src/components/CityLinks.tsx`
- **Screenshot:** `docs/design-references/section-city-links.png`
- **Interaction model:** click-driven (accordion per city)

## DOM Structure
```
<section> (full width, py-[64px], bg light yellow)
  <div> (container-bp)
    <h2> "Find physiotherapists by city"
    <div> (cities grid, 4 cols desktop)
      <div> CityAccordion × N
        <button> city name + chevron icon
        <div> (collapsed by default; expands to show specialty links)
          <a> specialty link × 6
```

## Computed Styles

### Section
- background-color: #FFF0BB
- padding: 64px 0

### h2
- font-size: 24px
- font-weight: 600
- color: #333333
- margin-bottom: 32px

### Cities grid
- display: grid
- grid-template-columns: repeat(4, 1fr)
- gap: 8px 24px

### City accordion button
- display: flex
- justify-content: space-between
- align-items: center
- width: 100%
- padding: 12px 0
- background: transparent
- border: none
- border-bottom: 1px solid rgba(0,0,0,0.12)
- cursor: pointer
- font-size: 15px
- font-weight: 500
- color: #333333
- text-align: left

### City accordion button hover
- color: #00766C

### Chevron icon
- width: 16px
- height: 16px
- transition: transform 0.2s ease
- color: #666666

### Chevron (open state)
- transform: rotate(180deg)

### Expanded content
- padding: 8px 0 12px 0
- display: flex
- flex-direction: column
- gap: 6px

### Specialty link
- font-size: 14px
- color: #666666
- text-decoration: none
- line-height: 1.4
- transition: color 0.15s ease

### Specialty link hover
- color: #00766C
- text-decoration: underline

## States & Behaviors
- Default: all accordions collapsed
- Click city button: toggles that city open/closed
- Only one city open at a time (close others when opening a new one) — OR allow multiple, simpler
- Chevron rotates 180° when open
- Smooth expand: use CSS `max-height` transition or React state with conditional render

## Text Content (Indian cities for bookphysio)

Cities and their physio specialties:
- **Mumbai**: Sports Physio | Neuro Physio | Ortho Physio | Home Visit | Paediatric Physio | Women's Health
- **Delhi**: Sports Physio | Neuro Physio | Ortho Physio | Home Visit | Geriatric Physio | Women's Health
- **Bengaluru**: Sports Physio | Ortho Physio | Neuro Physio | Home Visit | Paediatric Physio | Women's Health
- **Hyderabad**: Sports Physio | Ortho Physio | Neuro Physio | Home Visit | Women's Health | Geriatric Physio
- **Chennai**: Sports Physio | Ortho Physio | Neuro Physio | Women's Health | Home Visit | Geriatric Physio
- **Pune**: Sports Physio | Ortho Physio | Home Visit | Women's Health | Neuro Physio | Paediatric Physio
- **Kolkata**: Sports Physio | Neuro Physio | Ortho Physio | Home Visit | Women's Health | Geriatric Physio
- **Ahmedabad**: Sports Physio | Ortho Physio | Home Visit | Women's Health | Neuro Physio | Geriatric Physio
- **Jaipur**: Sports Physio | Ortho Physio | Home Visit | Neuro Physio | Women's Health | Geriatric Physio
- **Kochi**: Sports Physio | Ortho Physio | Neuro Physio | Home Visit | Women's Health | Paediatric Physio
- **Chandigarh**: Sports Physio | Ortho Physio | Home Visit | Neuro Physio | Geriatric Physio | Women's Health
- **Surat**: Sports Physio | Ortho Physio | Home Visit | Women's Health | Neuro Physio | Geriatric Physio

## Responsive Behavior
- **Desktop (1440px):** 4-col grid
- **Tablet (768px):** 2-col grid
- **Mobile (390px):** 1-col (full width)
- **Breakpoint:** ~768px

## Notes for builder
- `'use client'` required (accordion state)
- Use `useState` for tracking which city is open (string | null)
- All specialty links use `href="#"` for MVP
- Run `npx tsc --noEmit` before finishing
