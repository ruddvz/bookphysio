# Design Tokens: ZocDoc (Extracted)

Standardized design tokens for the ZocDoc clone, adapted for BookPhysio.

## Colors

| Token | CSS Variable | Hex Value | Usage |
|-------|--------------|-----------|-------|
| Primary Teal | `--color-primary-teal` | `#00766C` | Main brand color, icons, links |
| Primary Dark | `--color-primary-dark` | `#005A52` | Button hover, deep accents |
| Primary Light | `--color-primary-light` | `#E6F4F3` | Backgrounds, highlight badges |
| Secondary Yellow | `--color-secondary-yellow` | `#FFF34A` | New ZocDoc brand (use sparingly for alerts) |
| Accent Orange | `--color-accent-orange` | `#FF6B35` | CTA buttons, critical actions |
| Text Primary | `--color-text-primary` | `#2D2D2D` | Headings, main body text |
| Text Secondary| `--color-text-secondary`| `#5E5E5E` | Subtext, labels |
| Border | `--color-border` | `#E0E0E0` | Card borders, input borders |
| Surface | `--color-surface` | `#FFFFFF` | Card backgrounds |
| Background | `--color-background` | `#F5F5F5` | Page background |

## Typography

- **Font Family:** `Sharp Sans`, `Inter`, `sans-serif`
- **Headings (H1):** `36px` / `2.25rem`, Bold (700), Line-height: 1.2
- **Headings (H2):** `28px` / `1.75rem`, Semi-bold (600), Line-height: 1.3
- **Headings (H3):** `22px` / `1.375rem`, Semi-bold (600), Line-height: 1.4
- **Body:** `16px` / `1rem`, Regular (400), Line-height: 1.5
- **Subtext/Label:** `14px` / `0.875rem`, Regular (400)
- **Button Text:** `16px`, Semi-bold (600), Uppercase or Title Case

## Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | `4px` | Tiny adjustments |
| `space-2` | `8px` | Minimal padding, internal gaps |
| `space-3` | `12px` | Small gaps |
| `space-4` | `16px` | Standard mobile padding, card gaps |
| `space-6` | `24px` | Standard desktop padding, section gaps |
| `space-8` | `32px` | Large component gaps |
| `space-12`| `48px` | Section vertical padding (Desktop) |
| `space-16`| `64px` | Hero section vertical padding |

## Components (Common Rules)

- **Border Radius:**
  - Buttons: `24px` (Pill-shaped) or `8px` (Standard)
  - Cards: `12px`
  - Inputs: `8px`
  - Avatars: `50%` (Circle)
- **Shadows:**
  - `shadow-sm`: `0 2px 4px rgba(0,0,0,0.05)`
  - `shadow-md`: `0 4px 12px rgba(0,0,0,0.08)`
  - `shadow-lg`: `0 8px 24px rgba(0,0,0,0.12)` (Modals, Dropdowns)
