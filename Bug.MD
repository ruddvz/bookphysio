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
| [x] | BUG-09 | High | Branding | BpLogo.tsx rewritten — now shows green icon.png + text, invert prop for dark bg |
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
| [x] | BUG-29 | Critical | Branding | BpLogo rewritten with correct green shield icon; old purple wordmark removed |
| [x] | BUG-30 | High | UX | Standalone How It Works page no longer has a large dead gap below the tab toggle |
| [x] | BUG-31 | Medium | Design | Standalone How It Works cards use tighter spacing and rhythm |
| [x] | BUG-32 | Medium | UX | Auth flow now has more bottom breathing room and a minimal footer |
| [x] | BUG-33 | Low | Design | Doctor signup progress indicators and connectors have better contrast |
| [x] | BUG-34 | Low | Code | Login doctor CTA now uses Lucide `ArrowRight` |
| [x] | BUG-35 | Medium | SEO | Login and doctor signup now have page-specific metadata |
| [x] | DESIGN-01 | Low | Design | Auth cards already have visible shadow/border contrast |
| [x] | DESIGN-02 | Medium | UX | Standalone How It Works page now includes a compact hero and CTA |
| [x] | DESIGN-03 | Medium | UX | Auth logos now link back to the homepage |

Open items still needing follow-up: BUG-02 (final production wordmark asset).

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

*Total tracked items: 38 (original) + 42 (pre-deployment audit) = 80 total*  
*Currently open per original audit: 1 (BUG-02 final wordmark asset)*  
*Session 2 fixes: SEC-04, SEC-05, SEC-06, SEC-09, SEC-10, SEC-11, SEC-12, SEC-14 — FIXED*  
*Session 2 additions: Razorpay archived, subscription model, Textbelt SMS, vercel.json, robots.txt*  
*Last updated: 2026-04-02 — Session 2: security hardening + architecture changes*  
*Security audit: 8 CRITICAL, 11 HIGH, 14 MEDIUM, 2 LOW new findings (some now fixed — see below)*

---
---

## PRE-DEPLOYMENT AUDIT — 2026-04-02

> Full-stack audit covering security, performance, SEO, accessibility, and production readiness.
> Findings sourced from: code review, build analysis, LibreUIUX-Claude-Code checklist, awesome-claude-code-toolkit patterns.

---

### CRITICAL — Must Fix Before Production

#### SEC-01: Dummy Fallback Credentials in All Service Clients
**Severity:** CRITICAL  
**Files:** [src/lib/razorpay.ts](src/lib/razorpay.ts), [src/lib/supabase/server.ts](src/lib/supabase/server.ts), [src/lib/supabase/admin.ts](src/lib/supabase/admin.ts), [src/lib/resend.ts](src/lib/resend.ts), [src/lib/upstash.ts](src/lib/upstash.ts), [src/middleware.ts](src/middleware.ts)  
**Symptom:** Every service client uses `|| 'dummy_key'` / `|| 'dummy_secret'` fallbacks. If any env var is missing in production, the app silently connects to dummy endpoints instead of failing fast.  
**Impact:** Payment webhook signature verification uses `'dummy_secret'` if `RAZORPAY_WEBHOOK_SECRET` is missing — an attacker could forge webhook calls. Supabase admin client with `'dummy_key'` bypasses all RLS.  
**Fix:** Replace all `|| 'dummy_*'` fallbacks with a startup validation that throws:
```typescript
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET
if (!RAZORPAY_KEY_SECRET) throw new Error('RAZORPAY_KEY_SECRET not configured')
```
Do this for ALL service clients. The build should crash immediately if env vars are missing.

---

#### SEC-02: TypeScript Build Errors Silently Ignored
**Severity:** CRITICAL  
**File:** [next.config.ts](next.config.ts)  
**Symptom:** `typescript: { ignoreBuildErrors: true }` means type errors never block deployment. Any `any` type, missing prop, or broken import ships to production unchecked.  
**Fix:** Remove `ignoreBuildErrors: true`. Fix all TypeScript errors. Run `npx tsc --noEmit` as a CI gate.

---

#### SEC-03: DEV_ACCESS_CODE OTP Bypass Active in Production
**Severity:** CRITICAL  
**File:** [src/app/api/auth/otp/send/route.ts:25-28](src/app/api/auth/otp/send/route.ts#L25-L28)  
**Symptom:** If `DEV_ACCESS_CODE` env var is set (even accidentally), OTP verification is completely bypassed. There's no `NODE_ENV === 'development'` guard.  
**Fix:** Add environment check: `if (process.env.NODE_ENV === 'development' && process.env.DEV_ACCESS_CODE)`. Never allow this bypass in production.

---

#### SEC-04: No Security Headers Configured ✅ FIXED
**Severity:** CRITICAL  
**Files:** [next.config.ts](next.config.ts), no `middleware.ts` security headers  
**Symptom:** No `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, `Referrer-Policy`, or `Permissions-Policy` headers.  
**Impact:** Vulnerable to clickjacking, MIME sniffing, and content injection.  
**Fix:** Add security headers in `next.config.ts`:
```typescript
headers: async () => [{
  source: '/(.*)',
  headers: [
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
  ]
}]
```

---

#### SEC-08: `pay_at_clinic` Creates Bookings With Zero Payment Record
**Severity:** CRITICAL  
**File:** [src/app/book/[id]/StepPayment.tsx:80-83](src/app/book/[id]/StepPayment.tsx#L80-L83)  
**Symptom:** Selecting "Pay at Clinic" books the appointment and marks the slot unavailable, but no `payments` row is written server-side. A malicious actor can book unlimited slots for free. No financial reconciliation possible.  
**Fix:** Server must record a payment row with `status: 'pay_at_clinic'`. Slot should not be released without either a payment record or explicit provider acceptance.

---

#### SEC-09: Any Authenticated User Can Self-Promote to Provider Role ✅ FIXED
**Severity:** CRITICAL  
**File:** [src/app/api/providers/onboard/route.ts:46-65](src/app/api/providers/onboard/route.ts#L46-L65)  
**Symptom:** `POST /api/providers/onboard` immediately sets `role: 'provider'` in both `users` table and `auth.users` metadata. No prior-role check, no admin approval required. A patient can self-elevate to provider. `verified: false` is set but middleware only checks `role`, not `verified`.  
**Fix:** Do NOT grant `role: 'provider'` immediately. Use `role: 'provider_pending'` on submission. Flip to `'provider'` only via admin approval in `/api/admin/listings`.

---

#### SEC-10: `dev-signup` Route Creates Real Users If `isDemoAccessEnabled()` Returns True ✅ FIXED
**Severity:** CRITICAL  
**File:** [src/app/api/auth/dev-signup/route.ts:7-45](src/app/api/auth/dev-signup/route.ts#L7-L45)  
**Symptom:** The guard uses `isDemoAccessEnabled()` which returns `true` for `NODE_ENV === 'test'`. If production runs as `test`, this route creates real Supabase auth users, generates magic links, and leaks raw `createError` objects in 500 responses.  
**Fix:** Gate exclusively on `process.env.NODE_ENV === 'development'`. Remove the `isDemoAccessEnabled()` escape hatch.

---

#### SEC-11: OTP Bypass Code `264200` Hardcoded in Client Bundle ✅ FIXED
**Severity:** CRITICAL  
**File:** [src/app/(auth)/verify-otp/page.tsx:118](src/app/(auth)/verify-otp/page.tsx#L118)  
**Symptom:** The literal string `'264200'` is in the client-side bundle. Anyone inspecting the JS can discover the dev OTP bypass code and authenticate as any phone number.  
**Fix:** Remove the hardcoded bypass from client code entirely. Dev bypass should only exist server-side, gated on `NODE_ENV === 'development'`.

---

### HIGH — Fix Before Launch

#### SEC-05: Payment Signature Verification Uses Non-Constant-Time Comparison ✅ FIXED
**Severity:** HIGH  
**File:** [src/lib/razorpay.ts:25](src/lib/razorpay.ts#L25)  
**Symptom:** `verifyPaymentSignature()` uses `===` string comparison instead of `crypto.timingSafeEqual()`. This is vulnerable to timing attacks. (Note: `verifyWebhookSignature` correctly uses `timingSafeEqual`.)  
**Fix:** Use `crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature))`.

---

#### SEC-06: OTP Error Message Leaks Internal Details ✅ FIXED
**Severity:** HIGH  
**File:** [src/app/api/auth/otp/send/route.ts:37](src/app/api/auth/otp/send/route.ts#L37)  
**Symptom:** `'Failed to prepare OTP: ' + supabaseError.message` — exposes Supabase error internals to client.  
**Fix:** Return generic `'Failed to send OTP. Please try again.'` and log the detailed error server-side only.

---

#### SEC-12: `x-real-ip` Header Used for Rate Limiting Is Trivially Spoofable ✅ FIXED
**Severity:** HIGH  
**Files:** [src/app/api/auth/otp/send/route.ts:17](src/app/api/auth/otp/send/route.ts#L17), [src/app/api/auth/otp/verify/route.ts:40](src/app/api/auth/otp/verify/route.ts#L40), [src/app/api/auth/magic-link/route.ts:16](src/app/api/auth/magic-link/route.ts#L16), [src/app/api/auth/signup/route.ts:17](src/app/api/auth/signup/route.ts#L17)  
**Symptom:** All rate limiters fall back to `request.headers.get('x-real-ip')`. This header is user-controlled — attacker can send `X-Real-IP: <random>` on every request to bypass IP-based rate limiting, enabling OTP flooding (cost: MSG91 credits) and account enumeration.  
**Fix:** Use only `request.ip`. If behind a trusted proxy, configure exactly which `X-Forwarded-For` index to trust. Never fall back to a user-controlled header.

---

#### SEC-13: Admin Routes Have No Rate Limiting
**Severity:** HIGH  
**Files:** [src/app/api/admin/users/route.ts](src/app/api/admin/users/route.ts), [src/app/api/admin/analytics/route.ts](src/app/api/admin/analytics/route.ts), [src/app/api/admin/listings/route.ts](src/app/api/admin/listings/route.ts), [src/app/api/admin/stats/route.ts](src/app/api/admin/stats/route.ts)  
**Symptom:** No rate limiting on any admin route. A compromised admin token allows unrestricted bulk data extraction (50 users per page, unlimited pagination).  
**Fix:** Apply `apiRatelimit` to all admin routes. Consider a stricter limiter (5 req/min) for data-heavy endpoints.

---

#### SEC-14: `admin/users` Returns All Columns via `select('*')` ✅ FIXED
**Severity:** HIGH  
**File:** [src/app/api/admin/users/route.ts:24](src/app/api/admin/users/route.ts#L24)  
**Symptom:** `select('*')` returns every column including phone numbers, roles, and any future sensitive columns. New schema additions are automatically exposed.  
**Fix:** Use explicit column list: `select('id, full_name, email, role, created_at')`.

---

#### SEC-15: Magic Link Callback Vulnerable to Open Redirect
**Severity:** HIGH  
**File:** [src/app/api/auth/magic-link/route.ts:29](src/app/api/auth/magic-link/route.ts#L29)  
**Symptom:** Falls back to `request.nextUrl.origin` if `NEXT_PUBLIC_SITE_URL` is unset. An attacker controlling the `Host` header can redirect the magic-link callback to a phishing site.  
**Fix:** Add `NEXT_PUBLIC_SITE_URL` to `.env.example` as required. Never fall back to `request.nextUrl.origin` in production.

---

#### PERF-01: No `error.tsx` Error Boundaries
**Severity:** HIGH  
**Symptom:** Zero `error.tsx` files exist in the app. If any server component throws, the user sees the default Next.js error page or a blank screen.  
**Fix:** Add `error.tsx` to: `src/app/`, `src/app/(auth)/`, `src/app/patient/`, `src/app/provider/`, `src/app/admin/`, `src/app/search/`, `src/app/book/[id]/`.

---

#### PERF-02: Only 4 `loading.tsx` Files for 30+ Routes
**Severity:** HIGH  
**Files:** Only `doctor/[id]/loading.tsx`, `patient/dashboard/loading.tsx`, `patient/appointments/loading.tsx`, `admin/loading.tsx`  
**Symptom:** Most routes show no loading indicator during navigation. Search, booking, provider pages, and auth pages have no Suspense boundaries.  
**Fix:** Add `loading.tsx` to all route groups: `(auth)/`, `search/`, `book/[id]/`, `provider/dashboard/`, `provider/appointments/`.

---

#### SEO-01: No `robots.txt`
**Severity:** HIGH  
**Symptom:** No `robots.txt` exists. Search engines will crawl everything including `/admin`, `/patient`, `/provider` dashboard routes.  
**Fix:** Create `src/app/robots.ts`:
```typescript
export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/patient', '/provider', '/api', '/book'] }
    ],
    sitemap: 'https://bookphysio.in/sitemap.xml',
  }
}
```

---

#### SEO-02: No Proper OG Image (Uses 512x512 Icon)
**Severity:** HIGH  
**File:** [src/app/layout.tsx:46-50](src/app/layout.tsx#L46-L50)  
**Symptom:** OG image is `/icon.png` (512x512 square). Social media platforms expect 1200x630 landscape images. Shares will look broken on Twitter/LinkedIn/WhatsApp.  
**Fix:** Create a proper OG image at `public/seo/og-image.png` (1200x630) with BookPhysio branding. Update layout.tsx OG metadata.

---

#### SEO-03: Twitter Card Is `summary` Instead of `summary_large_image`
**Severity:** HIGH  
**File:** [src/app/layout.tsx:54](src/app/layout.tsx#L54)  
**Symptom:** `card: "summary"` shows a tiny square thumbnail. For a landing page, `summary_large_image` is far better for click-through.  
**Fix:** Change to `card: "summary_large_image"` and use the 1200x630 OG image.

---

### MEDIUM — Polish Before Launch

#### PERF-03: `images.unoptimized: true` Disables All Image Optimization
**Severity:** MEDIUM  
**File:** [next.config.ts:4-6](next.config.ts#L4-L6)  
**Symptom:** `unoptimized: true` means Next.js serves original images without resizing, format conversion (WebP/AVIF), or lazy loading optimization. On Indian mobile networks this causes slow page loads.  
**Fix:** If using Vercel, remove this flag. If using GitHub Pages (static export), keep it but add manual image optimization (squoosh, sharp) as a build step.

---

#### PERF-04: 39 `console.log/error/warn` Statements in Production Code
**Severity:** MEDIUM  
**Files:** 22 files across API routes and pages  
**Symptom:** Console statements leak debugging info and server-side errors to browser. Some log sensitive data (phone numbers in OTP route).  
**Fix:** Replace with a proper logger (e.g., `pino`) for server-side routes. Remove all `console.log` from client components. Keep `console.error` only in catch blocks with sanitized messages.

---

#### PERF-05: Manifest References Non-Existent `/icon.svg`
**Severity:** MEDIUM  
**File:** [public/manifest.json](public/manifest.json)  
**Symptom:** All icon entries point to `/icon.svg` which doesn't exist. Only `/icon.png` exists. PWA install and home screen icon will be broken.  
**Fix:** Either add `/icon.svg` or update manifest to reference `/icon.png` with correct sizes.

---

#### SEC-07: File Upload Doesn't Sanitize Filename
**Severity:** MEDIUM  
**File:** [src/app/api/upload/route.ts:27](src/app/api/upload/route.ts#L27)  
**Symptom:** `file.name.split('.').pop()` extracts extension from user-provided filename. A malicious filename like `../../etc/passwd.pdf` could theoretically cause path traversal (mitigated by Supabase Storage, but defense-in-depth is needed).  
**Fix:** Sanitize: `const ext = file.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'bin'`

---

#### SEC-16: Demo Cookie Is Unsigned (Base64-Only, Forgeable)
**Severity:** MEDIUM  
**File:** [src/lib/demo/session.ts:188-196](src/lib/demo/session.ts#L188-L196)  
**Symptom:** Demo cookie is base64-encoded JSON with no HMAC signature. Any client can forge `role: 'admin'`. While `isDemoAccessEnabled()` blocks in production, the risk escalates if `NODE_ENV` is ever not `production`.  
**Fix:** Sign the demo cookie with HMAC using a `DEMO_COOKIE_SECRET` env var. Verify signature before trusting any field.

---

#### SEC-17: Provider Onboard Route Has Weak Input Validation
**Severity:** MEDIUM  
**File:** [src/app/api/providers/onboard/route.ts](src/app/api/providers/onboard/route.ts)  
**Symptom:** `step1.name` is just `z.string()` (no length limit), `step3.pincode` is just `z.string()` (no 6-digit regex), `step2.icpNumber` has no format validation. Violates project's own documented validation rules.  
**Fix:** Apply `z.string().min(2).max(100)` for names, `/^[1-9][0-9]{5}$/` for pincode, and a regex for ICP registration numbers.

---

#### SEC-18: `full_name` Read From Raw Body in OTP Verify, Not Zod Schema
**Severity:** MEDIUM  
**File:** [src/app/api/auth/otp/verify/route.ts:38](src/app/api/auth/otp/verify/route.ts#L38)  
**Symptom:** `full_name` extracted from unvalidated `body` object (not from Zod-parsed `parsed.data`), then passed to `supabaseAdmin.auth.admin.updateUserById`.  
**Fix:** Include `full_name` in `otpVerifySchema` as optional with constraints, read from `parsed.data`.

---

#### SEC-19: PATCH Appointments Branches on Unvalidated `body.action`
**Severity:** MEDIUM  
**File:** [src/app/api/appointments/[id]/route.ts:44-59](src/app/api/appointments/[id]/route.ts#L44-L59)  
**Symptom:** `body.action` and `body.notes` read from raw unvalidated body. Routing decision based on unvalidated input.  
**Fix:** Define a discriminated union Zod schema for the PATCH body. Parse the whole request before branching.

---

#### SEC-20: Upload Route Trusts Client-Reported MIME Type
**Severity:** MEDIUM  
**File:** [src/app/api/upload/route.ts:24](src/app/api/upload/route.ts#L24)  
**Symptom:** `file.type` is browser-reported and attacker-controlled. A `.html` file can be uploaded as `image/jpeg`.  
**Fix:** Use magic-byte validation (check first 8-12 bytes against known PDF/JPEG/PNG signatures). Consider the `file-type` npm package.

---

#### A11Y-01: 42 Client Components — Some Could Be Server Components
**Severity:** MEDIUM  
**Symptom:** 42 files use `'use client'`. Some (like `not-found.tsx`, `faq/page.tsx`) may not need client-side interactivity and could be Server Components for better performance.  
**Fix:** Audit each `'use client'` file. Convert static pages to Server Components where possible.

---

#### A11Y-02: No Skip Navigation Link
**Severity:** MEDIUM  
**Symptom:** No "Skip to main content" link for keyboard/screen reader users.  
**Fix:** Add a visually hidden skip link as the first element in the body: `<a href="#main" className="sr-only focus:not-sr-only">Skip to main content</a>` and add `id="main"` to the `<main>` element.

---

#### DESIGN-04: Design Token Mismatch Between DESIGN.md and OVERVIEW.md
**Severity:** MEDIUM  
**Files:** [.claude/design-system/DESIGN.md](.claude/design-system/DESIGN.md) vs [docs/CODEMAPS/OVERVIEW.md](docs/CODEMAPS/OVERVIEW.md)  
**Symptom:** DESIGN.md says primary teal is `#00766C`. OVERVIEW.md says `bp-primary` is `#0B3B32` (Deep Pine) and `bp-accent` is `#12B3A0` (Active Teal). These are different color palettes.  
**Impact:** Developers referencing different docs will use inconsistent colors.  
**Fix:** Reconcile to a single source of truth. The CSS variables in `globals.css` should be the canonical reference.

---

#### A11Y-03: Form Errors Not Announced to Screen Readers
**Severity:** MEDIUM  
**Files:** All auth pages — [src/app/(auth)/login/page.tsx](src/app/(auth)/login/page.tsx), [src/app/(auth)/signup/page.tsx](src/app/(auth)/signup/page.tsx), etc.  
**Symptom:** Error messages appear visually but have no `role="alert"` or `aria-live="polite"`. Screen readers won't announce errors.  
**Fix:** Add `role="alert" aria-live="polite"` to all error message containers. Add `aria-invalid="true"` to invalid inputs and `aria-describedby` linking to error messages.

---

#### A11Y-04: Body Text Color Fails WCAG AA Contrast
**Severity:** MEDIUM  
**File:** [src/app/globals.css](src/app/globals.css)  
**Symptom:** `--color-bp-body: #616b68` on white/surface backgrounds gives ~4.2:1 ratio — below WCAG AA 4.5:1. Even worse with opacity modifiers like `text-bp-body/60`.  
**Fix:** Darken `bp-body` to `#4a5452` (~5.5:1) or `#3d4745` (~6.5:1).

---

#### SEO-05: 33 of 43 Pages Missing Individual Metadata
**Severity:** MEDIUM  
**Pages without metadata:** `/about`, `/faq`, `/privacy`, `/terms`, `/search`, `/book/[id]`, all `/patient/*`, `/provider/*`, `/admin/*`  
**Fix:** Add page-specific `export const metadata` to at least the public-facing pages: about, faq, privacy, terms, search. Dashboard pages are less critical but should have titles for tab identification.

---

#### SEO-06: Doctor Detail Page Missing `generateMetadata`
**Severity:** MEDIUM  
**File:** [src/app/doctor/[id]/page.tsx](src/app/doctor/[id]/page.tsx)  
**Symptom:** Doctor profiles are the most SEO-valuable dynamic pages, but they have no `generateMetadata`. Google won't show rich doctor info in search results.  
**Fix:** Add `generateMetadata` that fetches doctor name, specialty, and city for the title/description.

---

#### SEO-07: No JSON-LD Structured Data
**Severity:** MEDIUM  
**Symptom:** No Schema.org markup anywhere. Missing Organization, LocalBusiness, MedicalBusiness, and FAQ schemas.  
**Impact:** No rich snippets in Google search results. Competitors with structured data will outrank.  
**Fix:** Add JSON-LD for: Organization (root layout), MedicalBusiness (doctor profiles), FAQ (FAQ page), LocalBusiness (city pages).

---

#### PERF-07: No Server-Side Caching on Any API Route
**Severity:** MEDIUM  
**Files:** All API routes, especially [src/app/doctor/[id]/page.tsx](src/app/doctor/[id]/page.tsx) which uses `cache: 'no-store'`  
**Symptom:** Doctor profiles fetch fresh data on every request despite rarely changing. No `revalidate`, no `Cache-Control` headers anywhere.  
**Fix:** Add ISR/revalidation: provider profiles `revalidate: 3600` (1h), search results `revalidate: 300` (5m), availability slots `revalidate: 60` (1m).

---

#### PERF-08: Admin GMV Fetches All Appointments Instead of SQL SUM
**Severity:** MEDIUM  
**File:** [src/app/api/admin/stats/route.ts](src/app/api/admin/stats/route.ts)  
**Symptom:** Fetches all appointment rows then reduces in JS: `appointments?.reduce((acc, curr) => acc + (curr.fee_inr || 0), 0)`. With thousands of bookings this will be slow and memory-heavy.  
**Fix:** Use a Supabase RPC or raw SQL `SELECT SUM(fee_inr) FROM appointments WHERE status = 'confirmed'`.

---

#### PERF-09: ClinicGallery Uses Raw `<img>` Tags
**Severity:** MEDIUM  
**File:** [src/app/doctor/[id]/ClinicGallery.tsx](src/app/doctor/[id]/ClinicGallery.tsx)  
**Symptom:** Gallery images use `<img>` instead of `next/image`. No lazy loading, no responsive sizes, no format optimization.  
**Fix:** Replace with `<Image>` component with proper `width`, `height`, and `sizes` attributes.

---

#### PERF-10: Missing API Pagination on Payments and Admin Routes
**Severity:** MEDIUM  
**Files:** [src/app/api/payments/route.ts](src/app/api/payments/route.ts), [src/app/api/admin/stats/route.ts](src/app/api/admin/stats/route.ts)  
**Symptom:** No `limit`/`offset` parameters. Fetches all records. Will degrade as data grows.  
**Fix:** Add pagination with `page` and `limit` query params, default limit of 20.

---

### LOW — Nice to Have

#### PERF-06: No Additional `next/dynamic` for Heavy Pages
**Severity:** LOW  
**Symptom:** Dynamic imports exist for maps and AI chat (good), but booking calendar, analytics charts, and provider availability grid could benefit from code splitting too.  
**Fix:** Consider `next/dynamic` for: analytics charts, availability grid, booking calendar.

---

#### SEO-04: Sitemap Missing `/forgot-password` and `/update-password`
**Severity:** LOW  
**File:** [src/app/sitemap.ts](src/app/sitemap.ts)  
**Symptom:** Auth pages like forgot-password are in staticRoutes but update-password is missing. Not critical since these aren't high-value SEO pages, but completeness matters.

---

## SERVICES / APIs NEEDED FOR PRODUCTION

| Service | Status | What You Need |
|---------|--------|--------------|
| **Supabase** | Needs production project | Create prod project, run migrations, configure RLS, set `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` |
| **Razorpay** | Needs live mode | Switch from test (`rzp_test_*`) to live keys. Complete KYC on Razorpay dashboard. Set webhook URL to `https://bookphysio.in/api/payments/webhook` |
| **MSG91** | ~~REMOVED~~ — replaced by Textbelt | MSG91 removed. Use `TEXTBELT_API_KEY`. OTP delivery via Supabase native provider. |
| **Razorpay** | ~~ARCHIVED~~ — all routes return 503 | Re-enable when subscription billing is implemented. |
| **Resend** | Needs domain verification | Verify `bookphysio.in` domain on Resend. Set `RESEND_API_KEY` |
| **Upstash Redis** | Needs production instance | Create prod Redis DB. Set `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` |
| **Mapbox** | Needs production token | Create restricted token for `bookphysio.in` domain. Set `NEXT_PUBLIC_MAPBOX_TOKEN` |
| **Textbelt** | Ready | Set `TEXTBELT_API_KEY=textbelt` for free (1/day) or purchase credits at textbelt.com |
| **Domain DNS** | Action needed | Remove GitHub Pages A records, add Vercel DNS (see Session 2 notes below) |
| **SSL Certificate** | Vercel automatic | Vercel provisions SSL automatically once domain is connected |
| **OG Image** | Missing | Create 1200x630 branded image at `public/seo/og-image.png` |
| **Production Logo** | Open (BUG-02) | Final production wordmark asset at `/public/logo.png` may still need updating |

---

## QUESTIONS FOR YOU (Action Required)

1. **Supabase**: Production instance is live on free tier. Run migration `013_provider_subscriptions.sql` against prod.
2. **Razorpay**: Archived — not needed yet. Will be re-enabled for provider subscription billing.
3. **MSG91**: Removed — replaced by Textbelt + Supabase native phone auth.
4. **Resend**: Verify `bookphysio.in` domain on Resend dashboard if not done yet.
5. **Hosting**: Vercel — `vercel.json` created, deploy via CLI or GitHub integration.
6. **Logo**: BpLogo rewritten but `/public/logo.png` (used elsewhere) should still be the production wordmark.
7. **OG Image**: Still needs `public/seo/og-image.png` (1200×630).
8. **Domain**: Remove GitHub Pages DNS, add Vercel records (see Session 2 Deployment Notes below).

---

## SESSION 2 � ARCHITECTURAL CHANGES (2026-04-02)

> Security hardening, payment archival, subscription model, SMS provider swap, branding fix, Vercel deployment setup.

### Changes Made This Session

| Area | Change | Files |
|------|--------|-------|
| **Security** | Removed DEV_OTP 264200 bypass from client bundle | erify-otp/page.tsx |
| **Security** | Removed isDemoAccessEnabled() escape from dev-signup | pi/auth/dev-signup/route.ts |
| **Security** | Replaced x-real-ip fallback with 
equest.ip only in 4 routes | otp/send, otp/verify, magic-link, signup |
| **Security** | Removed Supabase error leak from OTP send | pi/auth/otp/send/route.ts |
| **Security** | Provider onboard now sets provider_pending: true, no immediate role escalation | pi/providers/onboard/route.ts |
| **Security** | dmin/users now returns explicit columns only | pi/admin/users/route.ts |
| **Security** | 
azorpay.ts now uses timing-safe equal + lazy init, no dummy fallbacks | src/lib/razorpay.ts |
| **Security** | Added CSP, HSTS, X-Frame-Options, Referrer-Policy headers | 
ext.config.ts |
| **Security** | Created public/robots.txt (blocks /admin/, /api/) | public/robots.txt |
| **Payments** | All 4 payment routes return 503 "not available yet" | payments/create-order, erify, webhook, 
efund |
| **Subscriptions** | DB migration for provider_subscriptions table + RLS + trigger | supabase/migrations/013_provider_subscriptions.sql |
| **Subscriptions** | GET/POST /api/subscriptions endpoint | src/app/api/subscriptions/route.ts |
| **Subscriptions** | <SubscriptionPlans> UI component (Free/Pro ?100/Max ?200) | src/components/SubscriptionPlans.tsx |
| **SMS** | Removed MSG91 from OTP send; created Textbelt client | src/lib/textbelt.ts |
| **Branding** | BpLogo.tsx rewritten � green shield icon + "BookPhysio.in" text | src/components/BpLogo.tsx |
| **Branding** | All BpLogo call sites updated to new invert prop API | Footer, Navbar, BpLogo.test, auth pages |
| **Deploy** | Created ercel.json (Mumbai region bom1, API no-cache headers) | ercel.json |
| **Deploy** | Removed public/CNAME (GitHub Pages artifact causing 404) | public/CNAME deleted |
| **Env** | Updated .env.example � removed MSG91/Razorpay vars, added Textbelt, NEXT_PUBLIC_SITE_URL | .env.example |

### Build Status

pm run build � **PASSES** � full route tree renders, no TypeScript errors blocking build.

### Deployment Steps (Action Required)

1. **Vercel setup:**
   `
   npx vercel --prod
   `
   Or connect GitHub repo at vercel.com/new.

2. **Environment variables to add in Vercel dashboard:**
   `
   NEXT_PUBLIC_SUPABASE_URL=<your supabase url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
   SUPABASE_SERVICE_ROLE_KEY=<service role key>
   TEXTBELT_API_KEY=textbelt
   RESEND_API_KEY=re_4jVW...
   NEXT_PUBLIC_APP_URL=https://bookphysio.in
   NEXT_PUBLIC_SITE_URL=https://bookphysio.in
   UPSTASH_REDIS_REST_URL=<upstash url>
   UPSTASH_REDIS_REST_TOKEN=<upstash token>
   NEXT_PUBLIC_MAPBOX_TOKEN=<mapbox token>
   `

3. **Domain DNS** (at your registrar � remove all GitHub Pages A records):
   - Add A record: ookphysio.in ? Vercel IP (from Vercel dashboard)
   - Add CNAME record: www ? cname.vercel-dns.com
   - Or use Vercel nameservers if your registrar supports it.

4. **Supabase migration:**
   Run supabase/migrations/013_provider_subscriptions.sql against your production project.

5. **Supabase phone auth:**
   - Enable Phone provider in Supabase dashboard ? Auth ? Providers
   - Configure a Twilio account (recommended for India DLT compliance), OR
   - Use Textbelt as a custom SMTP-style sender (DLT compliance not guaranteed)

### Open Security Issues (Not Fixed This Session)
- **SEC-01**: Other service clients (supabase/server, upstash) may still have || 'dummy' fallbacks � verify
- **SEC-02**: ignoreBuildErrors: true still set in next.config.ts � fix TypeScript errors and remove
- **SEC-13**: Admin routes still have no rate limiting � add piRatelimit to all admin handlers
- **SEC-15**: Magic link callback 
equest.nextUrl.origin fallback � set NEXT_PUBLIC_SITE_URL in prod

