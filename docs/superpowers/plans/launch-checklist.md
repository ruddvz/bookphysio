# bookphysio.in — Website Launch Checklist

> Check off each item before going live. Work sections 1–5 in any order, then complete 6 (Pre-Launch Testing) and 7 (Launch Day) last.

---

## 1. Website

- [ ] Landing page live — site name, one-liner, screenshots/demo, CTA buttons, contact info
- [ ] Open Graph tags set on all pages (`og:title`, `og:description`, `og:image` 1200×630, `og:url`)
- [ ] OG tags tested via Facebook Sharing Debugger or Twitter Card Validator
- [ ] Favicon added in all sizes (16×16, 32×32, 180×180 Apple Touch)
- [ ] Site is fully mobile responsive — tested on real devices, not just browser resize
- [ ] SSL certificate active — URL starts with `https://`, not `http://`
- [ ] HTTP → HTTPS redirect working — plain `http://` requests redirect to `https://`
- [ ] `Strict-Transport-Security` (HSTS) header present
- [ ] Security headers set in `next.config.js`: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] Content-Security-Policy header configured — blocks inline scripts, restricts third-party origins

---

## 2. SEO

- [ ] Google Search Console connected and site verified
- [ ] Sitemap submitted to Google Search Console
- [ ] Bing Webmaster Tools connected (import from Google in one click)
- [ ] Sitemap submitted to Bing
- [ ] IndexNow configured (API key file in site root, ping on publish)
- [ ] Meta `<title>` set on every page (≤ 60 chars, includes keywords)
- [ ] Meta `<description>` set on every page (≤ 160 chars, compelling)
- [ ] `robots.txt` in place — allows crawling, blocks admin routes, points to sitemap

---

## 3. Legal

- [ ] Privacy policy written — covers: data collected, why, storage, retention, third-party sharing, deletion rights, children's data, change notification
- [ ] Privacy policy linked from website footer and onboarding screens
- [ ] Terms of service written — covers: who can use, acceptable use, IP rights, liability limit, dispute resolution, termination
- [ ] Terms linked from website footer and signup flow
- [ ] Data handling documented internally — where stored, encrypted in transit + at rest, who has access, deletion process
- [ ] GDPR compliance verified if EU users expected — consent, access, delete, export, breach notification
- [ ] Cookie notice on website if analytics or tracking cookies used

---

## 4. Marketing

- [ ] Launch post written for Twitter/X (short, punchy, hook first)
- [ ] Launch post written for LinkedIn (professional, story-driven)
- [ ] Launch post written for Reddit (value-first, not promotional — check subreddit rules)
- [ ] Social media assets ready: logo variants, formatted screenshots, banner images, demo GIF
- [ ] Email list notified — early access or special offer if possible, ask them to share
- [ ] Product Hunt listing prepared (if using): thumbnail, gallery, description, maker comment drafted
- [ ] Friends, family, and community supporters briefed and ready to engage on launch day

---

## 5. bookphysio-Specific

> India-first and stack-specific checks unique to this project.

### Payments & Auth
- [ ] Razorpay **live mode** keys confirmed in production `.env` — not sandbox keys
- [ ] MSG91 DLT template approved and sender ID registered with TRAI — test OTP delivery from a number never used in sandbox
- [ ] MSG91 credentials (auth key + DLT template + sender ID) entered in **Supabase dashboard → Auth → Providers → Phone** (the app does not read MSG91 env vars directly)
- [ ] OTP delivery tested on real Indian numbers (+91) from a cold device — verify the SMS arrives via Supabase's send-test-OTP button AND via the app's `/login` flow
- [ ] Upstash Redis rate limiting verified on OTP and booking API routes — confirm limits enforced in production config

### Data & Compliance
- [ ] GST (18%) computed server-side only — never client-side, stored in `payments.gst_amount_inr`
- [ ] All phone numbers validated as E.164 (+91XXXXXXXXXX) via Zod at input boundaries
- [ ] All pincodes validated as 6-digit regex `/^[1-9][0-9]{5}$/`
- [ ] Currency displayed as ₹ (INR) everywhere — no paise, no USD
- [ ] ICP registration number required and enforced on provider signup

### Infrastructure
- [ ] Supabase production project URL and keys confirmed in production `.env` — not dev/staging project
- [ ] Supabase RLS policies reviewed and enabled on all tables before go-live
- [ ] Supabase daily backups (or PITR) confirmed enabled on the production project
- [ ] All Supabase API keys are anon/public keys only on the client — service role key server-side only
- [ ] `.env.example` up to date with all required keys documented
- [ ] No secrets committed to repo — verified with `git log` + `git grep`

### Appointment Handling
- [ ] Provider appointments tested end-to-end for accept/reject and status updates
- [ ] Appointment lifecycle tested - complete, cancel, and reschedule flows close cleanly

---

## 6. Pre-Launch Testing

### Website
- [ ] Tested in Chrome, Safari, Firefox, Edge
- [ ] Tested on iOS Safari and Android Chrome
- [ ] Tested with slow/flaky network (throttle in dev tools)
- [ ] All forms submit correctly and show errors on invalid input
- [ ] All links work — no 404s, internal navigation, external links, CTA buttons
- [ ] Edge cases tested: empty states, very long names, special characters, zero results
- [ ] Basic accessibility verified: all form inputs have labels, color contrast passes WCAG AA, keyboard navigation reaches all CTAs

### Core Web Vitals
- [ ] Lighthouse or PageSpeed Insights run on production URL — LCP under 2.5s on throttled mobile, CLS under 0.1

### Critical User Flows (all must pass end-to-end with real data)
- [ ] Patient: search → select doctor → select slot → pay (Razorpay live) → booking confirmation
- [ ] Patient: OTP login (Supabase phone provider → MSG91 delivery on real +91 number)
- [ ] Provider: onboarding (5-step signup, ICP number required)
- [ ] Provider: appointment management and status updates
- [ ] Admin: login and dashboard access

### Payments
- [ ] Razorpay live mode purchase tested successfully (small test amount)
- [ ] Razorpay failed payment handled gracefully (error shown, booking not confirmed)
- [ ] Manual refund SOP written in `docs/planning/ops-refunds.md` — Razorpay dashboard operator knows the steps
- [ ] UPI ID validation works inline (format check before Pay enabled)

---

## 7. Launch Day

### Morning of Launch
- [ ] Website live and all pre-launch checks passed
- [ ] All launch posts ready to publish (copy-paste, no writing on the day)
- [ ] Calendar cleared — be available to respond all day
- [ ] Supabase logs open, browser console monitored

### Go Live
- [ ] Publish launch posts across all platforms
- [ ] Submit to Product Hunt (if using) — be present to respond to comments
- [ ] Send email to list
- [ ] Notify community and personal network

### Throughout the Day
- [ ] Monitor Supabase logs for errors
- [ ] Respond to all comments, questions, and feedback
- [ ] Note any bugs reported — triage by severity

### End of Day
- [ ] Check numbers: signups, bookings started, website visits
- [ ] Document what worked and what didn't
- [ ] File bugs from the day into `docs/planning/ACTIVE.md`

---

## 8. Post-Launch

### Week One
- [ ] Monitor and respond to user feedback
- [ ] Fix any critical bugs from launch day (P0/P1 only — no scope creep)
- [ ] Check retention: are users returning after day 1?
- [ ] Thank supporters publicly

### First Month
- [ ] Analyze what drove the most signups/bookings
- [ ] Prioritize top feature requests from user feedback
- [ ] Ship at least one visible update
- [ ] Continue marketing — one launch post is not enough

### Ongoing
- [ ] At minimum one visible update per month
- [ ] Communicate changelog to users
- [ ] Keep `.env.example` and privacy policy updated as stack evolves
- [ ] Revisit this checklist before any major re-launch or new market expansion
