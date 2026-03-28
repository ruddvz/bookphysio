# Zocdoc Behaviors — Interaction Bible

Extracted: 2026-03-28 via Chrome MCP on https://www.zocdoc.com

## Global
- **Font**: SharpSans (proprietary). bookphysio uses **Inter** from Google Fonts.
- **No smooth-scroll library** detected (no Lenis / Locomotive Scroll classes).
- **No scroll-snap** on the page container.
- **Body bg**: `rgb(247, 248, 249)` = `#F7F8F9`
- **Body text**: `rgb(51, 51, 51)` = `#333333`

## Navbar
- **Model**: static (no scroll-triggered behavior detected at scroll=0 vs scroll=200)
- **Height**: 80px
- **Bg**: cream `rgb(253, 250, 238)` = `#FDFACE` (Zocdoc). bookphysio uses white `#FFFFFF`.
- **Logo**: yellow circle Z + "Zocdoc" wordmark. bookphysio uses teal Z + "bookphysio"
- **Links**: Browse (dropdown with specialty grid), Help, "List your practice on Zocdoc", Log in (dropdown), Sign up
- **Sign up button**: bg `rgb(254, 237, 90)` = `#FEED5A` yellow, black text. bookphysio uses teal `#00766C`, white text.
- **Hover states**: nav links get underline on hover
- **Dropdown (Browse)**: specialty grid mega-menu, appears on click, `z-index: 5`
- **Fixed dark bar**: appears at top after scroll — `rgb(51, 51, 51)` bg, `height: 68px`, `z-index: 99`. Likely app/promo banner.

## Hero Section
- **Model**: time-driven (CSS animation cycles specialties)
- **Bg**: Changes per specialty. Default: `rgb(253, 250, 238)` cream. Blue variant: `rgb(220, 233, 253)`.
- **Animation**: CSS keyframe `bwWwin`, 3.5s ease-in-out forwards, on `.fadeInAndOut` span
- **Heading**: "Book local [SPECIALTY] who take your insurance" — specialty word animated with `fadeInAndOut` class
- **Specialties cycle**: OB-GYNs, dentists, doctors, dermatologists (and more)
- **Search bar**: 3 fields (condition/doctor | location | insurance) + "Find care" yellow button
- **Find care button**: bg `rgb(254, 237, 90)`, black text, 48px height, border-radius 4px
- **Hero padding**: 70px top, 120px bottom, 60px sides
- **h1**: 44px, lineHeight 60px, sharp-sans-medium (use Inter for bookphysio)
- **Illustration**: decorative hands with card illustration — top-right of hero, CSS background or SVG

## Insurance Plans
- **Model**: static (cards) + click (See all button)
- **Heading**: "Find an in-network doctor from over 1,000 insurance plans" (24px, sharp-sans-semibold)
- **Cards**: 5 insurance logo cards in a row (Aetna, Cigna, United Healthcare, Medicare, BlueCross BlueShield)
- **Card style**: white bg, border `1px solid #E0E0E0`, border-radius 8px, ~135px × 80px
- **"See all" link**: underlined, 16px
- **"Add your insurance coverage" button**: outlined style, black border, 16px text

## Top Specialties
- **Model**: static grid
- **Heading**: "Top-searched specialties"
- **Cards**: 6 cards — Primary Care, Dentist, OB-GYN, Dermatologist, Psychiatrist, Eye Doctor
- **Card bg**: light yellow `rgb(255, 241, 191)` ≈ `#FFF1BF`
- **Card size**: ~165px wide, image 150×150px + label below
- **Images**: 150×150px square specialty illustrations

## How It Works (3-card section)
- **Model**: static
- **Heading**: "Let's get you a doc who gets you"
- **Section bg**: yellow `rgb(254, 250, 230)` ≈ `#FEFAE6`
- **3 cards**: "Browse providers who take your insurance", "Read reviews from users", "Book an appointment today, online"
- **Card bg**: white, border-radius 12px, illustration above text
- **CTA buttons on cards**: outlined, "See specialties", "See providers", "See availability"
- **Illustrations**: ~200×150px each

## App Section
- **Model**: static
- **Bg**: peach `rgb(255, 199, 148)` = `#FFC794`
- **Heading**: "Thousands of providers. One app."
- **Sub**: "The Zocdoc app is the quickest, easiest way to book and keep track of your appointments."
- **Left**: text + "Scan the QR code to get the app now" + QR code image (102×102) + App Store + Google Play badges
- **Right**: phone mockup image (large, 1344×1140px natural) showing Zocdoc app UI + yellow circle bg
- **Layout**: 2-col, text left (~40%), phone right (~60%)

## Provider CTA
- **Model**: static (2-col image + text)
- **Bg**: white
- **Label**: "Zocdoc for private practices"
- **Heading**: "Are you a practice interested in filling your calendar?"
- **Bullets**: 3 bullet points
- **CTA**: "Learn more about our practice solutions" — yellow button
- **Image**: photo of doctor/provider at laptop, 1232×840px

## Health Systems
- **Model**: static (logos grid)
- **Bg**: beige `rgb(249, 248, 247)` = `#F9F8F7`
- **Label**: "Zocdoc for health systems"
- **Heading**: "We're trusted by top health systems"
- **Logos**: MedStar Health, Mount Sinai, Tufts Medical Center, Montefiore, Intermountain Health, Houston Methodist
- **CTA**: "Partner with Zocdoc" — yellow button

## City Links
- **Model**: click-driven (accordion per city)
- **Bg**: light yellow `#FFF0BB`
- **Heading**: "Find doctors and dentists by city"
- **Cities**: New York City, Baltimore, Philadelphia, Boston, Brooklyn, Washington DC, Houston, San Francisco, Queens, Seattle, Dallas, Miami, Bronx, Atlanta, Austin, Los Angeles, Long Island, Denver, Chicago, San Diego
- **Each city**: accordion with chevron, expands to show specialties

## Jobs CTA
- **Model**: static
- **Bg**: light yellow `#FFF0BB`
- **Label**: "Zocdoc jobs"
- **Heading**: "Join us, and help transform healthcare for everyone."
- **CTA**: "View job openings" — yellow button
- **Illustration**: two cartoon characters in Zocdoc yellow hoodies

## Common Reasons
- **Model**: click-driven (category accordions)
- **Bg**: light yellow `#FFF0BB`
- **Heading**: "Common visit reasons"
- **Categories**: Medical, Dental, Mental Health, Vision — each expands to visit reason links

## Footer
- **Model**: static
- **Bg**: `#333333` dark
- **Text color**: white / light gray
- **Columns**: Zocdoc (Home, About us, Press, Careers, Contact us, Help), Discover (blog, resources, etc.), Insurance Carriers, Top Specialties, Are you a top doctor/health service?
- **App download**: App Store + Google Play buttons
- **Legal**: disclaimer text + copyright + social icons (Twitter/X, Instagram, Facebook, LinkedIn)

## Responsive Breakpoints (estimated)
- **Desktop**: 1440px — full multi-column layout
- **Tablet**: 768px — 2-col sections stack, nav collapses
- **Mobile**: 390px — single column, hamburger menu

## Hover States Summary
- Nav links: underline appears on hover
- Cards (specialty, insurance, how-it-works): subtle shadow increase
- Buttons (outlined): bg fills on hover
- City/reason accordions: text color changes on hover
- Footer links: color lightens on hover
