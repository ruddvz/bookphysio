# BookPhysio.in — Pre-Deployment Checklist

> **Do not deploy until every CRITICAL item is checked.**  
> Generated: 2026-04-02 | Based on: LibreUIUX-Claude-Code + awesome-claude-code-toolkit best practices

---

## Phase 1: CRITICAL Security Fixes (Block Deployment)

- [ ] **SEC-01**: Remove all `|| 'dummy_*'` fallbacks from service clients — fail fast if env vars missing
  - `src/lib/razorpay.ts` (3 occurrences)
  - `src/lib/supabase/server.ts` (2)
  - `src/lib/supabase/admin.ts` (2)
  - `src/lib/resend.ts` (1)
  - `src/lib/upstash.ts` (2)
  - `src/middleware.ts` (2)
- [ ] **SEC-02**: Remove `ignoreBuildErrors: true` from `next.config.ts` — fix all TS errors
- [ ] **SEC-03**: Guard `DEV_ACCESS_CODE` with `NODE_ENV === 'development'` check
- [ ] **SEC-04**: Add security headers (CSP, X-Frame-Options, HSTS, etc.) to `next.config.ts`
- [ ] **SEC-05**: Fix timing-safe comparison in `verifyPaymentSignature()` in `razorpay.ts`
- [ ] **SEC-06**: Remove internal error messages from OTP API response
- [ ] **SEC-08**: `pay_at_clinic` must create a server-side payment record (currently zero payment verification)
- [ ] **SEC-09**: Provider onboard must NOT grant `role: 'provider'` immediately — use `provider_pending` + admin approval
- [ ] **SEC-10**: `dev-signup` route — gate on `NODE_ENV === 'development'` only, remove `isDemoAccessEnabled()` escape
- [ ] **SEC-11**: Remove hardcoded OTP bypass `'264200'` from client bundle (`verify-otp/page.tsx`)
- [ ] **SEC-12**: Replace `x-real-ip` header fallback in rate limiters — use only `request.ip`
- [ ] **SEC-13**: Add rate limiting to all admin API routes
- [ ] **SEC-14**: Replace `select('*')` with explicit column list in `admin/users` route
- [ ] **SEC-15**: Make `NEXT_PUBLIC_SITE_URL` required — never fall back to `request.nextUrl.origin`

---

## Phase 2: Environment & Services Setup

### Supabase (Database + Auth)
- [ ] Create production Supabase project
- [ ] Run all 3 migrations (`001_initial_schema`, `002_rls_policies`, `003_indexes`)
- [ ] Verify RLS policies are enabled on all tables
- [ ] Run seed data (cities, specialties)
- [ ] Set `NEXT_PUBLIC_SUPABASE_URL` (production)
- [ ] Set `NEXT_PUBLIC_SUPABASE_ANON_KEY` (production)
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY` (production, server-only)
- [ ] Configure Supabase Auth: enable phone OTP, set redirect URLs

### Razorpay (Payments)
- [ ] Complete Razorpay KYC for live mode
- [ ] Get live `RAZORPAY_KEY_ID` (starts with `rzp_live_`)
- [ ] Get live `RAZORPAY_KEY_SECRET`
- [ ] Configure webhook URL: `https://bookphysio.in/api/payments/webhook`
- [ ] Get `RAZORPAY_WEBHOOK_SECRET` from webhook settings
- [ ] Test live payment end-to-end (UPI + card)

### MSG91 (SMS/OTP)
- [ ] Register DLT template for OTP messages
- [ ] Get production `MSG91_AUTH_KEY`
- [ ] Get approved `MSG91_TEMPLATE_ID`
- [ ] Test OTP send + verify flow end-to-end

### Resend (Email)
- [ ] Verify `bookphysio.in` domain on Resend (DNS records)
- [ ] Set `RESEND_API_KEY` (production)
- [ ] Set `RESEND_FROM_EMAIL` to `noreply@bookphysio.in`
- [ ] Test booking confirmation email

### Upstash Redis (Rate Limiting)
- [ ] Create production Redis instance
- [ ] Set `UPSTASH_REDIS_REST_URL`
- [ ] Set `UPSTASH_REDIS_REST_TOKEN`
- [ ] Verify rate limiting works (OTP send, API routes)

### Mapbox (Maps)
- [ ] Create production-restricted token (scoped to `bookphysio.in`)
- [ ] Set `NEXT_PUBLIC_MAPBOX_TOKEN`

---

## Phase 3: SEO & Social

- [ ] **robots.txt**: Create `src/app/robots.ts` — disallow `/admin`, `/patient`, `/provider`, `/api`
- [ ] **OG Image**: Create `public/seo/og-image.png` (1200x630) with BookPhysio branding
- [ ] **Twitter card**: Change to `summary_large_image` in `layout.tsx`
- [ ] **OG image ref**: Update OG image URL from `/icon.png` to `/seo/og-image.png`
- [ ] **Sitemap**: Verify `sitemap.xml` generates correctly at `/sitemap.xml`
- [ ] **Favicon**: Verify `/icon.png` renders correctly in browser tabs
- [ ] **Structured data**: Add JSON-LD for Organization + LocalBusiness + MedicalBusiness + FAQ schema
- [ ] **Page metadata**: Add metadata to `/about`, `/faq`, `/privacy`, `/terms`, `/search`
- [ ] **Doctor metadata**: Add `generateMetadata` to `/doctor/[id]/page.tsx`
- [ ] **Google Search Console**: Submit sitemap, verify ownership

---

## Phase 4: Branding Assets

- [ ] **Logo**: Replace `/public/logo.png` with final production wordmark (>=640x160px)
- [ ] **Manifest icons**: Fix `manifest.json` — change `/icon.svg` to `/icon.png` or add SVG
- [ ] **Apple touch icon**: Verify `/icon.png` works as apple-touch-icon

---

## Phase 5: Performance & UX

- [ ] **Error boundaries**: Add `error.tsx` to all route groups
- [ ] **Loading states**: Add `loading.tsx` to remaining route groups
- [ ] **Console cleanup**: Remove 39 console.log/warn statements from production code
- [ ] **Image optimization**: If on Vercel, remove `images.unoptimized: true`
- [ ] **Skip navigation**: Add "Skip to main content" link for a11y
- [ ] **Form a11y**: Add `role="alert" aria-live="polite"` to error containers, `aria-invalid` to fields
- [ ] **Color contrast**: Darken `bp-body` color from `#616b68` to pass WCAG AA (4.5:1)
- [ ] **Server caching**: Add ISR/revalidation to doctor profiles (1h), search (5m), slots (1m)
- [ ] **API pagination**: Add limit/offset to `/api/payments` and `/api/admin/stats`
- [ ] **Admin GMV**: Replace JS reduce with SQL SUM for appointment fees
- [ ] **ClinicGallery**: Replace `<img>` tags with `next/image` component
- [ ] **Dynamic imports**: Use `next/dynamic` for heavy components (charts, calendar)

---

## Phase 6: Testing Gate

- [ ] `npm run build` — zero errors, zero warnings
- [ ] `npx tsc --noEmit` — zero type errors (after removing `ignoreBuildErrors`)
- [ ] `npm test` — all tests pass (currently 103/103)
- [ ] Lighthouse audit: Performance >= 80, Accessibility >= 90, SEO >= 90
- [ ] Test on Chrome, Firefox, Safari, Edge
- [ ] Test on Android Chrome (mid-range device) + iOS Safari
- [ ] Test at 375px, 768px, 1280px breakpoints

---

## Phase 7: Domain & Hosting

- [ ] **Hosting target**: Vercel production project connected to this GitHub repo
- [ ] **DNS**: Point `bookphysio.in` and `www.bookphysio.in` to Vercel-provided records
- [ ] **SSL**: Verify HTTPS enforced on all routes
- [ ] **Subdomain**: Configure `ai.bookphysio.in` if using Motio AI subdomain routing
- [ ] **www redirect**: Ensure `www.bookphysio.in` redirects to `bookphysio.in`
- [ ] **404 page**: Verify custom 404 renders on unknown routes

---

## Phase 8: Post-Deploy Verification

- [ ] Visit `https://bookphysio.in` — homepage loads, no console errors
- [ ] Test signup flow (phone OTP)
- [ ] Test login flow
- [ ] Test search + doctor profile
- [ ] Test booking flow (with Razorpay live payment)
- [ ] Test patient dashboard (appointments, payments, messages)
- [ ] Test provider dashboard
- [ ] Test admin panel
- [ ] Verify OG image renders on Twitter/LinkedIn share debugger
- [ ] Verify sitemap accessible at `/sitemap.xml`
- [ ] Monitor error rates for 24 hours

---

## Phase 9: Monitoring & Ops (Post-Launch)

- [ ] Set up error tracking (Sentry or similar)
- [ ] Set up uptime monitoring (Better Uptime, UptimeRobot)
- [ ] Set up Supabase database backups (automatic on paid plan)
- [ ] Configure Supabase alerts for auth failures
- [ ] Set up Razorpay webhook failure alerts
- [ ] Review Supabase RLS policies quarterly

---

## CRITICAL HOSTING DECISION

**GitHub Pages is deprecated for this app** because it cannot run Next.js API routes. Your app has 25+ API routes that handle:
- Authentication (OTP send/verify)
- Payment processing (Razorpay webhook)
- Appointment CRUD
- File uploads
- Admin operations

**Production target:**
- **Vercel** (required for Next.js server routes, ISR, middleware, and image optimization)

**Fallback alternatives if Vercel is not available:**
- **Railway** / **Render** / **Fly.io** (alternatives)
- **AWS Amplify** or **Cloudflare Pages** (with Workers)

GitHub Pages will only serve static HTML. All API-dependent features (auth, booking, payments) will break, and the repo's `pages-build-deployment` workflow should be retired after the Vercel cutover is complete.
