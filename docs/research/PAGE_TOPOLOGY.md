# Zocdoc Page Topology — bookphysio.in Clone Reference

Extracted: 2026-03-28. Page height: 5177px. Viewport: 1440x900.

## Fixed/Sticky Overlays
- **Navbar** — `position: static` in DOM but sits at top. Height: 80px. bg: cream `#FDFACE`. Contains: Logo, Browse (dropdown), Help, "List your practice", Log in, Sign up (yellow CTA).

## Page Sections (top to bottom)

| # | Name | offsetTop | Height | Bg color | Interaction |
|---|------|-----------|--------|----------|-------------|
| 0 | **Hero** | 80 | 422px | `#DCE9FD` (changes per specialty) | time-driven (CSS anim) |
| 1 | **ProofSection** | 502 | 456px | white | static |
| 2 | *(empty)* | 958 | 0 | — | — |
| 3 | **TopSpecialties** | 958 | 330px | transparent / yellow cards | static |
| 4 | **HowItWorks** | 1287 | 642px | `#FEFAE6` yellow | static |
| 5 | **HealthSystems** | 1929 | 392px | `#F9F8F7` beige | static |
| 6 | **Testimonials** | 2321 | 420px | `#F4ECDF` sand | static |
| 7 | **FAQ** | 2741 | 520px | `#FFF9F1` warm white | click-driven (accordions) |
| 8 | **Footer** | 3261 | ~620px | `#333333` dark | static |

## Z-index layers
1. Footer nav mega-menu: `z-index: 5`
2. Fixed dark bar (app promo): `z-index: 99`, position: fixed, top: 84px — appears on scroll

## Assembly order for `page.tsx`
```
<Navbar />
<HeroSection />
<ProofSection />
<TopSpecialties />
<HowItWorks />
<HealthSystems />
<Testimonials />
<FAQ />
<Footer />
```
