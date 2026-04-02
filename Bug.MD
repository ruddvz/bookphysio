# Bug.MD — BookPhysio Homepage Audit
**Date:** 2026-04-02  
**Based on:** Live screenshots at bookphysio-xznf.vercel.app + code review

---

## STATUS TABLE — READ THIS FIRST
Status legend: `[x]` fixed in code, `[ ]` still open or needs follow-up verification/assets.

| Status | ID | Severity | Area | One-liner |
|--------|----|----------|------|-----------|
| [x] | BUG-01 | Critical | Layout | Hero fills the viewport and keeps the search CTA above the fold |
| [ ] | BUG-02 | Critical | Branding | Logo asset itself may still need replacement with final production wordmark |
| [x] | BUG-03 | Critical | Animation | Rotating hero word aligns to the baseline and avoids clipping |
| [x] | BUG-04 | High | Copy | FAQ subtitle now uses patient-facing copy |
| [x] | BUG-05 | High | Copy | Homepage HowItWorks subtitle now uses patient-facing copy |
| [x] | BUG-06 | High | Copy | TopSpecialties subtitle now uses patient-facing copy |
| [x] | BUG-07 | High | Copy | HealthSystems subtitle now uses patient-facing copy |
| [x] | BUG-08 | High | Copy | Testimonials subtitle now uses patient-facing copy |
| [ ] | BUG-09 | High | Branding | `public/logo.png` may still need final approved wordmark asset |
| [x] | BUG-10 | High | Code | Removed non-standard `data-scroll-behavior` markup |
| [x] | BUG-11 | Medium-High | Code | Scroll behavior now lives only in CSS |
| [x] | BUG-12 | Medium | UX | Hero stats are readable by default |
| [x] | BUG-13 | Medium | UX | FAQ collapsed answers are fully hidden |
| [x] | BUG-14 | Medium | Performance | Navbar blur background reduced from `/92` to `/90` |
| [x] | BUG-15 | Medium | Code | Unused Hero `PreviewPanel` dead code removed |
| [x] | BUG-16 | Medium | Design | Footer CTA hover state preserves contrast |
| [x] | BUG-17 | Medium | A11y | FAQ items no longer use `<article>` |
| [x] | BUG-18 | Medium | A11y | FAQ toggle buttons now expose `aria-expanded` and `aria-controls` |
| [x] | BUG-19 | Medium | SEO | OpenGraph now includes url, locale, and image metadata |
| [x] | BUG-20 | Medium | SEO | Twitter/X card metadata is now present |
| [x] | BUG-21 | Low | A11y | Specialty CTA contrast improved |
| [x] | BUG-22 | Low | Copy | FAQ item 5 now uses a real patient question |
| [x] | BUG-23 | Low | Design | Testimonial avatars now show two initials |
| [x] | BUG-24 | Low | A11y | Homepage sections now have landmark labels |
| [x] | BUG-25 | Low | Code | Body gradient now uses theme token variables |
| [x] | BUG-26 | Low | UX | Added `<noscript>` fallback |
| [x] | BUG-27 | Low | Design | Homepage HowItWorks compare step now uses a comparison icon |
| [x] | BUG-28 | Low | UX | Mobile nav now includes “For providers” |
| [ ] | BUG-29 | Critical | Branding | Auth/navbar logo framing improved, but final production wordmark asset may still be needed |
| [x] | BUG-30 | High | UX | Standalone How It Works page no longer has a large dead gap below the tab toggle |
| [x] | BUG-31 | Medium | Design | Standalone How It Works cards use tighter spacing and rhythm |
| [x] | BUG-32 | Medium | UX | Auth flow now has more bottom breathing room and a minimal footer |
| [x] | BUG-33 | Low | Design | Doctor signup progress indicators and connectors have better contrast |
| [x] | BUG-34 | Low | Code | Login doctor CTA now uses Lucide `ArrowRight` |
| [x] | BUG-35 | Medium | SEO | Login and doctor signup now have page-specific metadata |
| [x] | DESIGN-01 | Low | Design | Auth cards already have visible shadow/border contrast |
| [x] | DESIGN-02 | Medium | UX | Standalone How It Works page now includes a compact hero and CTA |
| [x] | DESIGN-03 | Medium | UX | Auth logos now link back to the homepage |

Open items still needing follow-up: BUG-02, BUG-09, BUG-29.

---

## CRITICAL — Fix Now

### BUG-01: Hero Section Does Not Fill the Viewport
**Severity:** Critical  
**File:** [src/components/HeroSection.tsx](src/components/HeroSection.tsx)  
**Symptom:** On first load, the hero section is cut off at the bottom — the search bar and stats are not visible without scrolling. The user does not see the full CTA on a standard 1080p screen.  
**Root cause:** `HeroSection` uses `py-16 md:py-24 lg:py-32` inside `.bp-section` but has no `min-h-screen` or `min-h-[calc(100vh-5rem)]` constraint. The Navbar is `h-20` (sticky), so the hero must fill the remaining viewport height.  
**Fix:** Add `min-h-[calc(100vh-5rem)]` to the `<section>` wrapper in HeroSection and use `flex flex-col justify-center` so the content is vertically centered and fully visible on load.

---

### BUG-02: Logo Renders Too Small in the Navbar
**Severity:** Critical  
**File:** [src/components/Navbar.tsx:40-48](src/components/Navbar.tsx#L40-L48)  
**Symptom:** The logo in the navbar appears as a tiny icon (roughly 20-24px tall in the screenshots) instead of the intended 40px. The brand mark is illegible at a glance.  
**Root cause:** `logo.png` is a horizontal lockup. At `width={160} height={40}` the Next.js `<Image>` should render at 160×40px, but the CSS class `h-10 w-auto` (40px height, auto width) is correct. The issue is likely the source image itself is low-resolution or the aspect ratio of `/logo.png` is very narrow (e.g., 600×50), making it appear short when constrained to `h-10`. The screenshots show a cross-hatch / wireframe placeholder rather than the real logo.  
**Fix:**  
1. Check that `/public/logo.png` is the final production logo at adequate resolution (≥320px wide, ≥80px tall at 2×).  
2. If the logo file is wrong/missing, replace it. The navbar `width={160} height={40}` declaration is correct for the intended size.  
3. Confirm the footer logo (same file, `brightness-0 invert`) also renders correctly after the fix.

---

### BUG-03: Hero Animated Word Cut Off / Vertical Overflow
**Severity:** Critical  
**File:** [src/components/HeroSection.tsx:250-257](src/components/HeroSection.tsx#L250-L257)  
**Symptom:** The rotating specialty word ("sports rehab", "home visits", etc.) uses `overflow-hidden` on the parent `<span>` and `animate-specialty` on the inner `<span>`. If the animation includes a vertical slide-in, the descenders (letters like "y" in "physiotherapy") can be clipped.  
**Root cause:** `overflow-hidden align-top` on the animated span + `align-top` misaligns the baseline. The `h1` is 96px on desktop; the inline word must share that line-height. `align-top` pushes the word to the top of the line box instead of the baseline, causing visual misalignment and clipping.  
**Fix:** Replace `align-top` with `align-baseline` (or remove the attribute entirely). Ensure the animation keyframes only animate `opacity` and `translateY` with enough padding headroom to avoid clipping.

---

## HIGH — Fix Before Next Release

### BUG-04: FAQ Description Text Is Placeholder / Developer Note
**Severity:** High  
**File:** [src/components/FAQ.tsx:54-56](src/components/FAQ.tsx#L54-L56)  
**Symptom:** The FAQ section subtitle reads: *"The FAQ should feel like part of the product, not a legal appendix. Clear answers, generous spacing, and one obvious action."* — this is a design spec annotation, not user-facing copy. It's visible in the screenshots.  
**Fix:** Replace with real user-facing copy. Suggested: *"Everything you need to know before booking your first session."*

---

### BUG-05: How It Works Section Subtitle Is a Design Spec Note
**Severity:** High  
**File:** [src/components/HowItWorks.tsx:58-60](src/components/HowItWorks.tsx#L58-L60)  
**Symptom:** The copy reads: *"Search, compare, and confirm should feel like one continuous action. No hero gimmick, no dead-end panel, no visual drift."* — this is internal design language, not patient-facing content.  
**Fix:** Replace with real copy. Suggested: *"Find a verified physiotherapist, check their availability, and book your session in under 60 seconds."*

---

### BUG-06: TopSpecialties Section Subtitle Is Also a Design Note
**Severity:** High  
**File:** [src/components/TopSpecialties.tsx:107-110](src/components/TopSpecialties.tsx#L107-L110)  
**Symptom:** Copy reads: *"The homepage should narrow the decision fast: choose a care lane first, then move into location, visit type, and availability."* — again a product spec, not patient copy.  
**Fix:** Replace with real copy. Suggested: *"Choose your care category and we'll surface verified physiotherapists in your city."*

---

### BUG-07: HealthSystems Section Subtitle Is a Design Note
**Severity:** High  
**File:** [src/components/HealthSystems.tsx:51-53](src/components/HealthSystems.tsx#L51-L53)  
**Symptom:** Copy reads: *"The home page needs a clear proof layer after the hero: verification, visit mode, speed, and price transparency without making the page feel bureaucratic."* — internal note.  
**Fix:** Replace with real copy. Suggested: *"Every detail patients need to feel confident — credentials, visit format, fees, and availability — shown upfront."*

---

### BUG-08: Testimonials Section Subtitle Is a Design Note
**Severity:** High  
**File:** [src/components/Testimonials.tsx:43-45](src/components/Testimonials.tsx#L43-L45)  
**Symptom:** Copy reads: *"The tone should stay human and credible. These quotes should support the search experience, not overpower it."* — this is a design direction comment, not a user-facing tagline.  
**Fix:** Remove or replace. Suggested: *"Real patients. Real results. Every review is tied to a verified booking."*

---

### BUG-09: Navbar Logo Uses Placeholder File
**Severity:** High  
**File:** [src/components/Navbar.tsx:41](src/components/Navbar.tsx#L41), [src/components/Footer.tsx:43](src/components/Footer.tsx#L43)  
**Symptom:** Screenshots show a purple wireframe/pixel-art cross-hatch mark instead of the bookphysio brand logo. This appears both in the Navbar and Footer.  
**Root cause:** `/public/logo.png` is a placeholder file (possibly an icon sprite or wrong export).  
**Fix:** Replace `/public/logo.png` with the actual production logo. The `width={160} height={40}` sizing and `brightness-0 invert` in the footer are correct — only the file needs replacing.

---

### BUG-10: `scroll-behavior: smooth` Set in Two Places (Conflict)
**Severity:** High  
**File:** [src/app/layout.tsx:56](src/app/layout.tsx#L56), [src/app/globals.css:154](src/app/globals.css#L154)  
**Symptom:** `data-scroll-behavior="smooth"` is a non-standard attribute on `<html>`. Smooth scroll is already applied correctly via `scroll-behavior: smooth` in globals.css on the `html` element.  
**Fix:** Remove `data-scroll-behavior="smooth"` from the `<html>` tag in layout.tsx — it does nothing. Keep only the CSS rule.

---

### BUG-11: `scroll-behavior` Set via `data-` Attribute
**Severity:** Medium-High  
See BUG-10 above. The `data-scroll-behavior` attribute is non-standard and has no effect on actual scroll behavior. It's dead markup.

---

## MEDIUM — Polish Pass

### BUG-12: Hero Stats Section Has Aggressive Grayscale/Opacity Effect
**Severity:** Medium  
**File:** [src/components/HeroSection.tsx:273](src/components/HeroSection.tsx#L273)  
**Symptom:** The stats row (`5,000+ verified providers`, `18 cities`, etc.) is wrapped with `opacity-70 grayscale` by default and only becomes full-color on hover. This means the social proof — arguably the most trust-building element — is visually muted and unemphatic.  
**Fix:** Remove the default `grayscale` and `opacity-70`. The subtle hover effect is fine, but the default state should be fully readable. Stats should not require user interaction to communicate trust.

---

### BUG-13: FAQ First Item Open By Default Shows Minus Icon — Inconsistency
**Severity:** Medium  
**File:** [src/components/FAQ.tsx:43](src/components/FAQ.tsx#L43)  
**Symptom:** `useState<number | null>(1)` sets FAQ item 1 open on load. The minus icon correctly shows. However, the other FAQ items show a `+` icon with a faint visible answer text below — the answer is visible in the screenshot even for closed items. This is because the `grid-rows-[0fr]` animation state may still show a sliver of text at render.  
**Fix:** Ensure the closed state truly hides text — verify `min-h-0` on the inner div is working correctly and that the initial CSS transition doesn't leak content. Add `pb-0` when closed.

---

### BUG-14: Navbar Backdrop Blur Uses Non-Standard Opacity Syntax
**Severity:** Medium  
**File:** [src/components/Navbar.tsx:37](src/components/Navbar.tsx#L37)  
**Symptom:** `bg-[#fffaf4]/92` — Tailwind JIT opacity modifier `/92` (92%) is valid, but the combination with `backdrop-blur-md` can cause performance issues on lower-end Android devices which are primary users in India.  
**Fix:** Consider reducing to `/90` and testing on mid-range Android. Not a visual bug but a performance consideration for the primary audience.

---

### BUG-15: HeroSection Preview Panel Not Visible in Hero on Mobile
**Severity:** Medium  
**File:** [src/components/HeroSection.tsx:123-208](src/components/HeroSection.tsx#L123-L208)  
**Symptom:** The `PreviewPanel` component is defined but not actually rendered in `HeroSection`'s return. Looking at the screenshots, sections labeled "Network Transparency" and "Real-time..." appear to be from a different section, not the hero. The PreviewPanel (with search result cards showing Dr. Priya Sharma, etc.) is rendered inside `HealthSystems` or as its own context section — but the hero itself has no preview.  
**Root Cause:** The `PreviewPanel` component in HeroSection.tsx is defined but never called in the exported `HeroSection` component return. It's dead code.  
**Fix:** Either integrate PreviewPanel into the HeroSection layout (as a right-panel on desktop), or delete the component if it has been moved elsewhere. Unused components add confusion.

---

### BUG-16: Footer CTA Button Has Inconsistent Color on Hover
**Severity:** Medium  
**File:** [src/components/Footer.tsx:59](src/components/Footer.tsx#L59)  
**Symptom:** "Start searching" button in the footer hovers to `hover:bg-[#f7efe5]` — a light cream color — on a dark `#18312d` footer. The contrast ratio of the cream text on cream hover is near 1:1 and unreadable.  
**Fix:** Hover should stay within a readable contrast range. Use `hover:bg-white` or `hover:opacity-90` instead.

---

### BUG-17: `<article>` Used for FAQ Items — Semantically Incorrect
**Severity:** Medium  
**File:** [src/components/FAQ.tsx:72](src/components/FAQ.tsx#L72)  
**Symptom:** FAQ accordion items use `<article>` tags. `<article>` implies self-contained, independently distributable content. A FAQ accordion item is not an article.  
**Fix:** Use `<div>` or `<section>` with appropriate `role="region"` + `aria-labelledby` for accessibility. Better yet: use a proper `<details>`/`<summary>` pattern with JS enhancement for browser-native accessibility.

---

### BUG-18: No `aria-expanded` on FAQ Toggle Buttons
**Severity:** Medium  
**File:** [src/components/FAQ.tsx:79-90](src/components/FAQ.tsx#L79-L90)  
**Symptom:** The FAQ toggle `<button>` has no `aria-expanded` attribute. Screen readers cannot announce open/closed state.  
**Fix:** Add `aria-expanded={isOpen}` and `aria-controls={`faq-answer-${faq.id}`}` to each button. Add `id={`faq-answer-${faq.id}`}` to each answer div.

---

### BUG-19: Missing `og:url` and `og:image` in OpenGraph Metadata
**Severity:** Medium  
**File:** [src/app/layout.tsx:37-43](src/app/layout.tsx#L37-L43)  
**Symptom:** OpenGraph metadata is incomplete — missing `url`, `image`, and `locale`. Social media shares will render without a preview image and with incomplete metadata.  
**Fix:** Add `url: "https://bookphysio.in"`, `locale: "en_IN"`, and `images: [{ url: "/seo/og-image.png", width: 1200, height: 630 }]` to the `openGraph` block.

---

### BUG-20: Missing `twitter:card` Metadata
**Severity:** Medium  
**File:** [src/app/layout.tsx](src/app/layout.tsx)  
**Symptom:** No Twitter/X card metadata. Links shared on Twitter/X will render as plain URLs.  
**Fix:** Add `twitter: { card: "summary_large_image", title: "...", description: "...", images: ["/seo/og-image.png"] }` to the metadata export.

---

## LOW — Design Polish

### BUG-21: Specialty Cards Show "Explore specialists" in Teal — Low Contrast
**Severity:** Low  
**File:** [src/components/TopSpecialties.tsx:88](src/components/TopSpecialties.tsx#L88)  
**Symptom:** "Explore specialists" text in teal `#0f7668` on a white card bg has a contrast ratio of ~3.5:1 — below the WCAG AA 4.5:1 requirement for normal text.  
**Fix:** Darken to `#0b5c52` or add an underline to ensure it reads as an interactive element.

---

### BUG-22: FAQ Section Has 5 Items But Only 4 Are Meaningful
**Severity:** Low  
**File:** [src/components/FAQ.tsx:8-38](src/components/FAQ.tsx#L8-L38)  
**Symptom:** FAQ item 5 asks "Is BookPhysio meant for mobile?" — an unusual question for users to ask. It also reveals internal planning intent ("the refreshed layout is built to stay readable..."). This is self-referential product copy.  
**Fix:** Replace with a genuine patient concern, e.g., "Can I cancel or reschedule a session?" or "Do physiotherapists come to my home anywhere in India?"

---

### BUG-23: Testimonials Use Only First Initial for Avatar
**Severity:** Low  
**File:** [src/components/Testimonials.tsx:65](src/components/Testimonials.tsx#L65)  
**Symptom:** `testimonial.author.charAt(0)` shows only one letter (e.g., "A") in a circle. Zocdoc and similar platforms show two initials (first + last) for better identifiability.  
**Fix:** Split the author name and show initials: `author.split(' ').map(n => n[0]).join('')` to get "AM", "SK", "VS".

---

### BUG-24: `<section>` Inside `<main>` Has No `aria-label` or `aria-labelledby`
**Severity:** Low  
**File:** Multiple — [src/components/HeroSection.tsx](src/components/HeroSection.tsx), [src/components/TopSpecialties.tsx](src/components/TopSpecialties.tsx), etc.  
**Symptom:** Landmark regions are not labeled. Screen reader users navigating by landmarks will hear "section, section, section" with no differentiation.  
**Fix:** Add `aria-label="Hero"`, `aria-label="Browse by specialty"`, etc. to each `<section>` element.

---

### BUG-25: Body Background-Image Applied via CSS — Not Consistent with Theme Tokens
**Severity:** Low  
**File:** [src/app/globals.css:149-150](src/app/globals.css#L149-L150)  
**Symptom:** The body has an inline `background-image` radial gradient hardcoded in globals.css using raw hex values, not the defined `--color-bp-*` tokens. If the brand palette changes, this will not update automatically.  
**Fix:** Reference CSS variables: `rgba(var(--color-bp-accent), 0.08)` style — or keep as-is if the gradient is intentionally permanent. Low priority but a maintenance concern.

---

### BUG-26: No `<noscript>` Fallback
**Severity:** Low  
**File:** [src/app/layout.tsx](src/app/layout.tsx)  
**Symptom:** The app has no `<noscript>` tag. If JavaScript is disabled, the page renders nothing (Next.js App Router hydration issue). Indian low-bandwidth users on slow connections may see a blank page during slow hydration.  
**Fix:** Add a `<noscript>You need JavaScript enabled to use BookPhysio.</noscript>` inside the body, or ensure proper static HTML is output by confirming Server Components are used correctly.

---

### BUG-27: HowItWorks Steps Use Star Icon for "Compare" Step
**Severity:** Low  
**File:** [src/components/HowItWorks.tsx:14](src/components/HowItWorks.tsx#L14)  
**Symptom:** Step 02 "Compare verified options" uses a `Star` icon. A star typically conveys rating/favorites, not comparison. This creates icon-meaning mismatch.  
**Fix:** Replace with `SlidersHorizontal`, `ListChecks`, or `BarChart2` from Lucide.

---

### BUG-28: Navbar Mobile Menu Missing "For providers" Link
**Severity:** Low  
**File:** [src/components/Navbar.tsx:107-135](src/components/Navbar.tsx#L107-L135)  
**Symptom:** The desktop nav shows three links: Browse, How it works, For providers. The mobile menu only shows "Browse Specialties" and "How it works". The provider onboarding link is missing on mobile.  
**Fix:** Add a "For providers" link to the mobile menu nav section, matching the desktop experience.

---

---

## NEW OBSERVATIONS — From Latest Screenshots (2026-04-02)

### BUG-29: Logo Is Critically Small Across All Pages
**Severity:** Critical  
**Pages affected:** Login (`/login`), Doctor Signup (`/doctor-signup`), Navbar on all public pages  
**Symptom:** The logo renders as a tiny ~20×20px purple wireframe/pixel-art mark. On the login and doctor-signup pages it appears in the top-left corner of the card at roughly 30px wide. In the main navbar it's similarly undersized. It is completely illegible — you cannot read "BookPhysio" or see any meaningful brandmark.  
**Root cause:** `/public/logo.png` is almost certainly a low-resolution icon file (possibly an SVG exported as a tiny PNG, or an icon sprite frame) rather than the proper horizontal wordmark lockup. Next.js `<Image>` will scale it up but the source is wrong.  
**Fix (3 steps):**
1. Replace `/public/logo.png` with the actual BookPhysio wordmark PNG at ≥640×160px resolution (2× retina minimum).
2. In the auth card (login, signup), set `width={140} height={35}` explicitly and remove any width constraints from the parent container.
3. In the Navbar, confirm `height={40} width={160}` and that the `<Image>` parent `<div>` has no `max-w` that clips it.

---

### BUG-30: How It Works — Tab Toggle Creates Dead Whitespace (No Animation)
**Severity:** High  
**File:** The How It Works page component  
**Symptom:** In the screenshots, the "For Patients" / "For Physiotherapists" tab switcher shows one tab active (For Physiotherapists, dark teal) but there is a **massive blank gap** (~300px+) between the toggle buttons and the step cards below. The cards eventually appear but there's no visual connection — the gap makes it look like the page is broken or content failed to load.  
**Root cause:** The section layout likely has excessive `py` / `gap` between the tab switcher and the content grid. The tab content transition may also use an opacity/translate animation that starts at a visually empty state, and on first render appears blank.  
**Fix:** Reduce the vertical gap between the toggle and the cards. Add an immediate visible state (no delayed entrance animation on initial render). The tab content should be immediately adjacent to the toggle with no more than `mt-8` (32px) separation.

---

### BUG-31: How It Works Cards Have Oversized Whitespace / Poor Vertical Rhythm
**Severity:** Medium  
**File:** How It Works page — step cards  
**Symptom:** The 4 step cards (Register Practice, Set Availability, Accept Bookings, Track Earnings) each have excessive internal padding. The icon circle sits at the very top, then there's a large gap before "STEP 1", then another gap before the title, then the description. The arrows between cards (`→`) are rendered inline but the card height feels overly tall for the content.  
**Fix:** Reduce `py` inside cards from likely `py-10 or py-12` to `py-8`. Remove extra `mb` between icon and "STEP N" label. The content is sparse enough that it reads fine with tighter spacing — more whitespace here doesn't add clarity, it just makes the page feel empty.

---

### BUG-32: Login Card Has No Bottom Padding / Footer Breathing Room
**Severity:** Medium  
**File:** Login page / auth card component  
**Symptom:** The login card ends with "Are you a doctor? Join as a doctor →" right at the card edge with very little bottom padding. The text is dangerously close to the card border, especially on smaller screens. The card itself sits in the middle of a cream/off-white background with no footer branding (privacy policy, terms, copyright).  
**Fix:** Add `pb-8` minimum to the auth card's inner container. Consider adding a minimal footer below the auth card: "© 2026 BookPhysio · Privacy · Terms".

---

### BUG-33: Doctor Signup — Step Indicator Connector Lines Are Barely Visible
**Severity:** Low  
**File:** Doctor signup multi-step form  
**Symptom:** The step progress bar shows 5 steps (Personal, Professional, Practice, Pricing, Verify) connected by thin dashed/light lines. The connector between step 1 (active, teal) and step 2 is barely visible in the screenshot — it appears as a very faint gray line. Inactive step circles (2–5) use a gray ring with gray number that has near-zero contrast against the white card background.  
**Fix:** Increase connector line weight to 2px and use a mid-gray (`#CCCCCC`) at minimum. For inactive steps, use a slightly darker ring color (`#BBBBBB` border, `#888888` number text) to ensure they're clearly perceived as "upcoming" rather than absent.

---

### BUG-34: "Join as a doctor" Link in Login Uses Arrow (→) — Inconsistent with Design System
**Severity:** Low  
**File:** Login page  
**Symptom:** The bottom link reads "Join as a doctor →" using a text arrow. Other CTAs in the app use Lucide `<ArrowRight>` icon component. Using plain text `→` renders differently across fonts and OSes.  
**Fix:** Replace `→` with `<ArrowRight className="inline w-4 h-4 ml-1" />` from Lucide for visual consistency.

---

### BUG-35: Auth Pages Missing Page Title / Browser Tab Shows Generic Name
**Severity:** Medium  
**File:** Login page metadata, Doctor Signup metadata  
**Symptom:** Auth pages likely inherit the root layout metadata title "BookPhysio" without page-specific overrides. Browser tab shows the same title across all auth pages, which hurts SEO and usability (can't distinguish tabs).  
**Fix:** Add page-level `export const metadata` to each auth page:
- Login: `"Log in to BookPhysio — India's Physiotherapy Network"`
- Doctor Signup: `"Join as a Physiotherapist — BookPhysio"`

---

### DESIGN-01: Auth Card Background Is Plain White — No Visual Interest
**Severity:** Low (Design Suggestion)  
**Symptom:** The login and signup cards are solid white `#FFFFFF` on a cream/off-white `#FFFAF4` background. The contrast between card and page background is very subtle (only ~5% difference). The card blends into the page rather than floating above it.  
**Suggestion:** Add a subtle shadow to the auth card: `shadow-md` or `box-shadow: 0 4px 24px rgba(0,0,0,0.08)` to create clear card elevation. Alternatively, add a 1px teal-tinted border `border border-[#E6F4F3]` to define the card edge against the background.

---

### DESIGN-02: "How It Works" Page Has No Hero Banner / Entry Point
**Severity:** Medium (Design Suggestion)  
**Symptom:** The `/how-it-works` page starts directly with the "How BookPhysio Works" heading and tab toggle, with no hero banner, no supporting imagery, and no above-fold CTA. The page feels incomplete compared to the homepage.  
**Suggestion:** Add a compact hero section at the top of the How It Works page:
- Teal background strip (or the brand cream)
- Large heading: "Simple, Fast, Transparent"
- Subheading: "Book a physio session in 3 steps — no calls, no waiting."
- CTA: "Start searching →"

---

### DESIGN-03: Logo on Auth Pages Should Link to Homepage
**Severity:** Medium (UX Suggestion)  
**Symptom:** The logo in the top-left of auth card pages is presumably not clickable (no `<Link>` wrapper visible based on layout). Users who navigate to the login page directly and want to return to the homepage have no obvious back button.  
**Fix:** Wrap the auth page logo in `<Link href="/">` so clicking it returns to the homepage.

---

*Total tracked items: 38*  
*Currently open: 3*  
*Last updated: 2026-04-02 from live screenshots at bookphysio-xznf.vercel.app*
