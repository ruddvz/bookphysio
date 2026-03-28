# Zocdoc Page Topology — bookphysio.in Clone Reference

Extracted: 2026-03-28. Page height: 5177px. Viewport: 1440x900.

## Fixed/Sticky Overlays
- **Navbar** — `position: static` in DOM but sits at top. Height: 80px. bg: cream `#FDFACE`. Contains: Logo, Browse (dropdown), Help, "List your practice", Log in, Sign up (yellow CTA).

## Page Sections (top to bottom)

| # | Name | offsetTop | Height | Bg color | Interaction |
|---|------|-----------|--------|----------|-------------|
| 0 | **Hero** | 80 | 422px | `#DCE9FD` (changes per specialty) | time-driven (CSS anim) |
| 1 | **InsurancePlans** | 502 | 456px | transparent | click-driven (See all) |
| 2 | *(empty)* | 958 | 0 | — | — |
| 3 | **TopSpecialties** | 958 | 330px | transparent / yellow cards | static |
| 4 | **HowItWorks** | 1287 | 642px | `#FEFAE6` yellow | static |
| 5 | **AppSection** | 1929 | 570px | `#FFC794` peach | static |
| 6 | **ProviderCTA** | 2499 | 467px | `#FFFFFF` white | static |
| 7 | **HealthSystems** | 2966 | 392px | `#F9F8F7` beige | static |
| 8 | **CityLinks** | 3358 | 606px | `#FFF0BB` light yellow | click-driven (accordions) |
| 9 | **JobsCTA** | 3964 | 294px | `#FFF0BB` light yellow | static |
| 10 | **CommonReasons** | 4259 | 299px | `#FFF0BB` light yellow | click-driven (accordions) |
| 11 | **Footer** | 4558 | ~620px | `#333333` dark | static |

## Z-index layers
1. Footer nav mega-menu: `z-index: 5`
2. Fixed dark bar (app promo): `z-index: 99`, position: fixed, top: 84px — appears on scroll

## Assembly order for `page.tsx`
```
<Navbar />
<HeroSection />
<InsurancePlans />
<TopSpecialties />
<HowItWorks />
<AppSection />
<ProviderCTA />
<HealthSystems />
<CityLinks />
<JobsCTA />
<CommonReasons />
<Footer />
```
