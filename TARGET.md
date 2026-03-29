# Target Website

## URL
https://www.zocdoc.com

## Scope

### Pages to Replicate
<!-- Every page across all 4 portals -->

#### Public Portal (no auth)
- [x] Homepage — `/` — hero search, specialty icons, how-it-works, trust signals, city links
- [x] Search Results — `/search` — doctor cards + map view, filters sidebar
- [x] Doctor Profile — `/doctor/{name}-{id}` — photo, bio, credentials, availability, reviews, book CTA
- [x] Specialty Landing — `/specialty/{name}` — e.g. physiotherapy, sports rehab
- [x] Insurance Landing — `/insurance/{name}` — filtered doctor search by insurance
- [x] City Landing — `/city/{name}` — e.g. New Delhi physiotherapists
- [x] How It Works — `/how-it-works`
- [x] About — `/about`
- [x] FAQ — `/faq`
- [x] Privacy Policy — `/privacy`
- [x] Terms of Service — `/terms`
- [x] 404 — not-found page

#### Auth Pages
- [x] Patient Signup — `/signup`
- [x] Patient Login — `/login`
- [x] OTP Verify Screen — `/verify-otp`
- [x] Provider Signup — `/provider/signup`
- [x] Forgot Password — `/forgot-password`

#### Patient Dashboard (authenticated)
- [x] Dashboard Home — `/patient/dashboard` — upcoming appointments, quick actions
- [x] Appointments List — `/patient/appointments` — upcoming + past tabs
- [ ] Appointment Detail — `/patient/appointments/{id}`
- [ ] Find a Doctor (in-dashboard search) — `/patient/search`
- [ ] Messages / Chat — `/patient/messages`
- [ ] Profile & Settings — `/patient/profile`
- [ ] Notifications — `/patient/notifications`
- [ ] Payment History — `/patient/payments`

#### Provider Portal (authenticated)
- [x] Provider Dashboard — `/provider/dashboard` — today's schedule, stats
- [x] Calendar / Schedule — `/provider/calendar`
- [x] Appointment List — `/provider/appointments`
- [ ] Appointment Detail — `/provider/appointments/{id}`
- [x] Patient Records — `/provider/patients`
- [ ] Patient Detail — `/provider/patients/{id}`
- [ ] Messages — `/provider/messages`
- [x] Practice Profile — `/provider/profile`
- [x] Availability Settings — `/provider/availability`
- [x] Earnings / Payouts — `/provider/earnings`
- [ ] Notifications — `/provider/notifications`

#### Admin Panel (authenticated)
- [x] Admin Dashboard — `/admin` — platform stats overview
- [x] Provider Approval Queue — `/admin/listings`
- [x] User Management — `/admin/users`
- [ ] Analytics — `/admin/analytics`

### Fidelity Level
- [x] **Pixel-perfect** — exact match in colors, spacing, typography, animations

### In Scope
- Visual layout and styling (all viewports: 375px mobile / 768px tablet / 1280px desktop)
- Component structure and interactions (hover states, modals, dropdowns, date pickers)
- Responsive design
- Animations and transitions
- All SVG icons extracted from ZocDoc
- All illustration/image assets downloaded
- Mock data for all pages (seed doctors, appointments, reviews)

### Out of Scope
- Real-time features (video calls wired up — just UI shell at clone stage)
- SEO meta tags (added after clone)
- Accessibility audit

## Why
Building bookphysio.in — a physiotherapy booking platform for India — modelled on ZocDoc's UX.
The clone is the UI foundation; the backend (Supabase, Razorpay, MSG91) is layered on top.

## Anti-Bot Strategy
ZocDoc is JS-rendered and has anti-bot protection. Use Chrome MCP for all page inspection:
- Navigate and interact as a real user (scroll, hover, click)
- Use realistic User-Agent headers
- Add delays between page requests (3–5 seconds minimum)
- Extract `getComputedStyle()` values directly from the live DOM
- Take screenshots at each breakpoint (375px, 768px, 1280px)
- Capture network requests to understand underlying API structure

## Customization Plans — India Replacements

### Branding
| ZocDoc | bookphysio.in |
|--------|--------------|
| "ZocDoc" / "Zocdoc" | "BookPhysio" / "bookphysio.in" |
| ZocDoc logo | BookPhysio logo (TBD — use placeholder teal BP icon) |
| "Find a doctor" | "Find a physiotherapist" |
| "Book an appointment" | "Book a session" |
| "Doctor" / "Physician" | "Physiotherapist" / "Provider" |
| "Patient" | "Patient" (keep) |

### Design Tokens (keep ZocDoc teal exactly)
| Primary teal | `#00766C` — NEVER change |
| Primary dark | `#005A52` |
| Primary light | `#E6F4F3` |
| Accent / CTA | `#FF6B35` |
| Surface | `#F5F5F5` |
| Font | Inter (all weights) |
| Card radius | 8px |
| Button radius | 24px |
| Specialization | Physiotherapy / Physical Therapy |

### Geography
| ZocDoc | bookphysio.in |
|--------|--------------|
| US cities (New York, LA, Chicago…) | Indian cities (Delhi, Mumbai, Bangalore, Chennai, Hyderabad, Pune, Kolkata) |
| US state abbreviations (NY, CA) | Indian states (DL, MH, KA…) |
| ZIP codes | 6-digit pincodes (`/^[1-9][0-9]{5}$/`) |
| "Near me" geolocation | India-bounded geolocation |
| Mapbox map centered on USA | Mapbox map centered on India (lat: 20.5937, lng: 78.9629) |

### Currency & Payments
| ZocDoc | bookphysio.in |
|--------|--------------|
| USD ($) | INR (₹) — stored as integer rupees, NEVER paise |
| Insurance billing (US) | Razorpay (UPI, cards, netbanking, wallets) |
| Insurance filter | "Pay via UPI / Card / Cash" filter |
| "Accepts your insurance" badge | "UPI accepted" / "Home visit available" badge |
| Price: "$150" | Price: "₹800" (example) |

### Authentication
| ZocDoc | bookphysio.in |
|--------|--------------|
| Email + password | Phone OTP via MSG91 (primary) |
| Google OAuth | Google OAuth (keep — secondary) |
| "Enter your email" | "Enter your mobile number (+91)" |
| Email OTP | SMS OTP (6-digit, 10 min expiry) |
| Password reset via email | OTP re-send via SMS |

### Medical Specialties (replace US specialties with Indian physio specialties)
| Replace | With |
|---------|------|
| Primary Care, Dermatology, Psychiatry… | Physiotherapy, Sports Rehabilitation, Orthopedic Physio, Neurological Physio, Pediatric Physio, Geriatric Physio, Cardiopulmonary Physio, Post-Surgery Rehab, Pain Management, Home Visit Physio |

### Visit Types
| ZocDoc | bookphysio.in |
|--------|--------------|
| In-person | In-clinic |
| Video visit | Online (telehealth via 100ms) |
| — | Home visit (very popular in India — highlight prominently) |

### Provider Credentials
| ZocDoc | bookphysio.in |
|--------|--------------|
| Medical license number | ICP (Indian Council of Physiotherapy) registration number |
| Board certification | BPT / MPT degree verification |
| NPI number | ICP number |

### Language & Tone
| ZocDoc (US) | bookphysio.in (India) |
|-------------|----------------------|
| "Book online" | "Book online" (keep) |
| "Same-day appointments" | "Same-day appointments" (keep) |
| "Verified reviews" | "Verified reviews" (keep) |
| Insurance jargon | "No hidden charges" / "Pay at clinic" |
| Phone: (555) 000-0000 | Phone: +91 98765 43210 |
| Date: MM/DD/YYYY | Date: DD/MM/YYYY |
| Time: 12-hour AM/PM | Time: 12-hour AM/PM (keep — common in India) |
