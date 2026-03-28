# bookphysio.in — UI Build Plan
**Date:** 2026-03-28
**Status:** Ready to execute step-by-step
**Reference:** `docs/superpowers/specs/bpdesign.md`, `docs/research/BEHAVIORS.md`, `docs/research/components/*.spec.md`

---

## Current State

The ZocDoc clone homepage is **done and building clean**:
- ✅ Navbar (bookphysio branding, teal CTA, Browse dropdown, mobile hamburger)
- ✅ HeroSection (animated specialty cycling, search bar, Mumbai placeholder)
- ✅ InsurancePlans (Indian insurers: Star Health, Niva Bupa, HDFC ERGO, Medi Assist, ICICI Lombard)
- ✅ TopSpecialties (Indian physio specialties, yellow cards)
- ✅ HowItWorks (3 cards, yellow bg)
- ✅ AppSection (peach bg, QR code placeholder, app store badges)
- ✅ ProviderCTA (white bg, practice sign-up)
- ✅ HealthSystems (beige bg, hospital network logos)
- ✅ CityLinks (Indian cities, accordion, yellow bg)
- ✅ JobsCTA (yellow bg)
- ✅ CommonReasons (physio visit reasons, accordions)
- ✅ Footer (dark bg, Indian insurance column, teal links)

**Build:** `npm run build` passes clean (Next.js 16, no TypeScript errors)

---

## Design System (never change these)

| Token | Value |
|-------|-------|
| Primary teal | `#00766C` |
| Primary dark | `#005A52` |
| Primary light | `#E6F4F3` |
| Accent / CTA | `#FF6B35` |
| Surface | `#F5F5F5` |
| Body bg | `#F7F8F9` |
| Body text | `#333333` |
| Muted text | `#666666` |
| Border | `#E5E5E5` |
| Font | Inter (all weights) |
| Card radius | `8px` |
| Button radius | `24px` |
| Max width | `1142px` |
| Side padding | `60px` desktop, `24px` mobile |
| Breakpoints | `375px` / `768px` / `1280px` |

---

## India Rules (enforce in every file)

- Prices: `₹` prefix, integer rupees — NEVER paise, NEVER `$`
- GST: 18%, computed as `Math.round(fee * 0.18)`, stored in `payments.gst_amount_inr`
- Phone: `+91` prefix, 10 digits, `Zod: z.string().regex(/^\+91[6-9]\d{9}$/)`
- Pincode: 6-digit, `z.string().regex(/^[1-9][0-9]{5}$/)`
- Auth primary: phone OTP via MSG91 (not email/password)
- Provider credential: ICP registration number (not US medical license)
- Visit types: `in_clinic` | `home_visit` | `online` (home_visit is a key India differentiator)
- Date format: DD/MM/YYYY
- Cities: Delhi, Mumbai, Bangalore, Chennai, Hyderabad, Pune, Kolkata, Ahmedabad, Jaipur, Surat

---

## Sprint Structure

### Sprint 1 — Public Pages (no auth required)
### Sprint 2 — Auth Pages (MSG91 OTP)
### Sprint 3 — Booking Flow
### Sprint 4 — Patient Dashboard
### Sprint 5 — Provider Portal
### Sprint 6 — Admin Panel
### Sprint 7 — Static Pages + Polish

---

## Sprint 1 — Public Pages

### Step 1.1 — Search Results Page
**Files to create:**
- `src/app/search/page.tsx` — Server Component, reads searchParams
- `src/app/search/SearchFilters.tsx` — `'use client'`, filter sidebar
- `src/components/DoctorCard.tsx` — reusable card (used in search + homepage)

**Layout (desktop):**
```
┌─────────────────────────────────────────────────────────┐
│ Navbar                                                   │
├──────────────┬──────────────────────────────────────────┤
│ Filters      │ Results header: "47 physios near Mumbai" │
│ (280px)      │ [List View] [Map View] toggle            │
│              ├──────────────────────────────────────────┤
│ Specialty    │ DoctorCard × N                           │
│ checkboxes   │ (scrollable list)                        │
│              │                                          │
│ City         │                                          │
│ dropdown     │                                          │
│              │                                          │
│ Visit Type   │                                          │
│ radios       │                                          │
│              │                                          │
│ Availability │                                          │
│ radios       │                                          │
│              │                                          │
│ Fee range    │                                          │
│ label        │                                          │
└──────────────┴──────────────────────────────────────────┘
│ Footer                                                   │
└─────────────────────────────────────────────────────────┘
```

**DoctorCard anatomy:**
```
┌────────────────────────────────────────────────────┐
│ [Avatar 80px] Dr. Priya Sharma, BPT, MPT      [ICP✓]│
│               Sports Physiotherapist                │
│               ⭐ 4.9 · 187 reviews                  │
│               📍 Andheri West, Mumbai · 1.2 km      │
│               🕐 Next: Today at 2:30 PM              │
│               [In-clinic] [Home Visit]  ₹700/session │
│                                    [Book Session →]  │
└────────────────────────────────────────────────────┘
```

**Filter sidebar anatomy:**
```
Specialty (multi-select checkboxes)
  ☐ Sports Physio
  ☐ Neuro Physio
  ☐ Ortho Physio
  ☐ Paediatric Physio
  ☐ Women's Health
  ☐ Geriatric Physio
  ☐ Post-Surgery Rehab
  ☐ Pain Management

City (dropdown select)
  Mumbai ▼

Visit Type (radio)
  ● Any  ○ In-clinic  ○ Home Visit  ○ Online

Availability (radio)
  ● Any day  ○ Today  ○ Tomorrow  ○ This week

Fee Range
  ₹0 ─────────●───── ₹2000
```

**Mock doctors data:**
```typescript
const MOCK_DOCTORS = [
  { id: '1', name: 'Dr. Priya Sharma', credentials: 'BPT, MPT (Sports)', specialty: 'Sports Physiotherapist', rating: 4.9, reviewCount: 187, location: 'Andheri West, Mumbai', distance: '1.2 km', nextSlot: 'Today at 2:30 PM', visitTypes: ['in_clinic', 'home_visit'], fee: 700, icpVerified: true },
  { id: '2', name: 'Dr. Rohit Mehta', credentials: 'BPT, MPT (Ortho)', specialty: 'Orthopedic Physiotherapist', rating: 4.7, reviewCount: 132, location: 'Bandra, Mumbai', distance: '3.4 km', nextSlot: 'Today at 4:00 PM', visitTypes: ['in_clinic', 'online'], fee: 800, icpVerified: true },
  { id: '3', name: 'Dr. Ananya Krishnan', credentials: 'BPT, MPT (Neuro)', specialty: 'Neurological Physiotherapist', rating: 4.8, reviewCount: 94, location: 'Koramangala, Bangalore', distance: '2.1 km', nextSlot: 'Tomorrow at 10:00 AM', visitTypes: ['in_clinic', 'home_visit', 'online'], fee: 900, icpVerified: true },
  { id: '4', name: 'Dr. Vikram Singh', credentials: 'BPT', specialty: 'Sports Physiotherapist', rating: 4.6, reviewCount: 68, location: 'Lajpat Nagar, Delhi', distance: '4.2 km', nextSlot: 'Today at 5:30 PM', visitTypes: ['in_clinic'], fee: 600, icpVerified: false },
  { id: '5', name: 'Dr. Sneha Patel', credentials: 'BPT, MPT (Paeds)', specialty: 'Paediatric Physiotherapist', rating: 4.9, reviewCount: 211, location: 'Powai, Mumbai', distance: '5.1 km', nextSlot: 'Today at 11:00 AM', visitTypes: ['in_clinic', 'home_visit'], fee: 1000, icpVerified: true },
  { id: '6', name: 'Dr. Arun Nair', credentials: 'BPT, MPT (Cardio)', specialty: 'Cardiopulmonary Physiotherapist', rating: 4.5, reviewCount: 45, location: 'T. Nagar, Chennai', distance: '6.8 km', nextSlot: 'Tomorrow at 9:00 AM', visitTypes: ['in_clinic', 'online'], fee: 750, icpVerified: true },
]
```

---

### Step 1.2 — Doctor Profile Page
**Files to create:**
- `src/app/doctor/[id]/page.tsx` — Server Component
- `src/app/doctor/[id]/BookingCard.tsx` — `'use client'`

**Layout (desktop 2-col):**
```
┌─────────────────────────────────────────────────────────┐
│ Navbar                                                   │
├──────────────────────────────┬──────────────────────────┤
│ LEFT (65%)                   │ RIGHT sticky (35%)        │
│                              │ ┌────────────────────┐   │
│ [Avatar 120px]               │ │ ₹700 / session     │   │
│ Dr. Priya Sharma, BPT, MPT   │ │                    │   │
│ Sports Physiotherapist       │ │ [In-clinic][Home]  │   │
│ ⭐ 4.9 · 187 reviews   [ICP✓]│ │ [Online]  ← tabs   │   │
│ 📍 Andheri West, Mumbai      │ │                    │   │
│                              │ │ Mo Tu We Th Fr Sa  │   │
│ About ─────────────────────  │ │ 28 29 30 31  1  2  │   │
│ 3–4 sentence bio             │ │                    │   │
│                              │ │ Morning            │   │
│ Specializations ───────────  │ │ [9:00][9:30][10:00]│   │
│ [Back Pain][Sports Injuries] │ │ Afternoon          │   │
│ [Post-Surgery][Knee Pain]    │ │ [2:00][2:30][3:00] │   │
│                              │ │ Evening            │   │
│ Education ─────────────────  │ │ [5:30][6:00][7:00] │   │
│ BPT – KMC Manipal (2015)     │ │                    │   │
│ MPT Sports – NIMHANS (2017)  │ │ [Book Session →]   │   │
│                              │ │ No hidden charges  │   │
│ ICP: ICP-MH-2017-04821 ✓     │ └────────────────────┘   │
│ Languages: EN, HI, MR        │                          │
│                              │                          │
│ Reviews ───────────────────  │                          │
│ [Review 1][Review 2][Review3]│                          │
└──────────────────────────────┴──────────────────────────┘
│ Footer                                                   │
└─────────────────────────────────────────────────────────┘
```

**BookingCard state:**
- `visitType: 'in_clinic' | 'home_visit' | 'online'` (tab)
- `selectedDate: string` (default: today, ISO date string)
- `selectedTime: string | null`
- On Book: `router.push('/book/[id]?date=...&time=...&type=...')`

**Mock time slots:**
```typescript
const TIME_SLOTS = {
  morning: ['9:00', '9:30', '10:00', '11:00', '11:30'],
  afternoon: ['2:00', '2:30', '3:00', '3:30', '4:00'],
  evening: ['5:30', '6:00', '6:30', '7:00'],
}
```

---

### Step 1.3 — Specialty Landing Pages
**Files to create:**
- `src/app/specialty/[slug]/page.tsx`

Simple page: hero banner with specialty name, filtered DoctorCard list (reuse from Step 1.1), SEO meta.

---

### Step 1.4 — City Landing Pages
**Files to create:**
- `src/app/city/[slug]/page.tsx`

Same structure as specialty page but filtered by city.

---

## Sprint 2 — Auth Pages

### Step 2.1 — Patient Signup
**Files to create:**
- `src/app/(auth)/signup/page.tsx`

```
┌────────────────────────────┐
│ bookphysio logo            │
│                            │
│ Create your account        │
│                            │
│ Full Name ──────────────── │
│ Mobile number              │
│ +91 │ 98765 43210          │
│                            │
│ [Send OTP]  ← teal button  │
│                            │
│ ─── or ───                 │
│ [Continue with Google]     │
│                            │
│ Already have an account?   │
│ Log in                     │
└────────────────────────────┘
```

### Step 2.2 — OTP Verify Screen
**Files to create:**
- `src/app/(auth)/verify-otp/page.tsx`

```
┌────────────────────────────┐
│ Enter the 6-digit code     │
│ sent to +91 98765 43210    │
│                            │
│ [_][_][_][_][_][_]         │
│ ← 6 individual digit inputs│
│   auto-advance on input    │
│                            │
│ Resend OTP (00:45)         │
│ ← countdown timer          │
│                            │
│ [Verify]  ← teal button    │
└────────────────────────────┘
```

### Step 2.3 — Login Page
**Files to create:**
- `src/app/(auth)/login/page.tsx`

Phone number input → Send OTP → Verify OTP flow (same as signup verify screen).

### Step 2.4 — Provider Signup
**Files to create:**
- `src/app/(auth)/provider-signup/page.tsx`

Multi-step form:
- Step 1: Personal details (name, phone, email)
- Step 2: Professional details (ICP number, BPT/MPT degree, years of experience, specialties)
- Step 3: Practice details (clinic name, address, city, pincode, visit types offered)
- Step 4: OTP verify

---

## Sprint 3 — Booking Flow

### Step 3.1 — Booking Page (3-step wizard)
**Files to create:**
- `src/app/book/[id]/page.tsx` — reads searchParams (date, time, type), manages step state
- `src/app/book/[id]/StepConfirm.tsx` — `'use client'`
- `src/app/book/[id]/StepPayment.tsx` — `'use client'`
- `src/app/book/[id]/StepSuccess.tsx` — `'use client'`

**Progress bar:**
```
● Step 1: Confirm  ──  ○ Step 2: Payment  ──  ○ Step 3: Done
```

**Step 1 — Confirm Appointment:**
```
┌──────────────────────────────────────────┐
│ [Avatar] Dr. Priya Sharma                │
│          Sports Physiotherapist          │
│          📅 Mon, 28 Mar · 2:30 PM        │
│          🏥 In-clinic · Andheri West     │
│          ₹700                            │
├──────────────────────────────────────────┤
│ Your details                             │
│ Full Name* ──────────────────────────── │
│ Mobile* (+91) ────────────────────────  │
│ Email (optional) ─────────────────────  │
│ Reason for visit (optional)             │
│ ┌──────────────────────────────────────┐│
│ │                                      ││
│ └──────────────────────────────────────┘│
│                                          │
│ [Continue to Payment →]                  │
└──────────────────────────────────────────┘
```

**Step 2 — Payment:**
```
┌──────────────────────────────────────────┐
│ Order Summary                            │
│ Consultation fee         ₹700            │
│ GST (18%)                ₹126            │
│ ─────────────────────────────────────── │
│ Total                    ₹826            │
├──────────────────────────────────────────┤
│ Payment Method                           │
│ ◉ UPI          [Recommended]             │
│   UPI ID: name@upi ────────────────────  │
│ ○ Credit / Debit Card                    │
│ ○ Net Banking                            │
│ ○ Pay at Clinic                          │
│                                          │
│ [Pay ₹826 →]                             │
│ 🔒 Secured by Razorpay                   │
└──────────────────────────────────────────┘
```

**Step 3 — Success:**
```
┌──────────────────────────────────────────┐
│           ✅ (large green circle)         │
│         Booking Confirmed!               │
│       Ref: BP-2026-0042                  │
│                                          │
│ Dr. Priya Sharma                         │
│ Mon, 28 Mar 2026 · 2:30 PM               │
│ In-clinic · Andheri West, Mumbai         │
│ ₹826 paid via UPI                        │
│                                          │
│ [Add to Calendar]  [View Appointments]   │
│                                          │
│ Find another physiotherapist →           │
└──────────────────────────────────────────┘
```

---

## Sprint 4 — Patient Dashboard

### Step 4.1 — Dashboard Layout
**Files to create:**
- `src/app/(patient)/layout.tsx` — sidebar nav + header
- `src/app/(patient)/dashboard/page.tsx`

**Sidebar (240px, white, border-right):**
```
[BP] bookphysio

👤 Rahul Verma
   rahul@example.com

── Navigation ──
🏠 Dashboard
📅 Appointments
🔍 Find a Physio
💬 Messages
💳 Payments
⚙️  Profile

── ──────────── ──
🚪 Log out
```

**Dashboard Home:**
```
Good morning, Rahul 👋

┌─────────────────────────────────────────────┐
│ Upcoming Appointment                        │
│ Dr. Priya Sharma · Mon 28 Mar · 2:30 PM     │
│ Sports Physio · Andheri West                │
│ [View Details]  [Cancel]  [Join Online →]   │
└─────────────────────────────────────────────┘

Quick Actions
[Find a Physio] [Book Follow-up] [View Records]

Past Appointments (last 3)
────────────────────────────
Dr. Rohit Mehta · 15 Mar · Completed  [Rebook]
Dr. Ananya K. · 2 Mar · Completed     [Rebook]
```

### Step 4.2 — Appointments List Page
**File:** `src/app/(patient)/appointments/page.tsx`

Tabs: Upcoming | Past
Each row: doctor name, specialty, date/time, visit type, status badge, [View] button.

### Step 4.3 — Appointment Detail Page
**File:** `src/app/(patient)/appointments/[id]/page.tsx`

Full appointment card: doctor info, date/time, location/link, fee receipt, cancel button (if upcoming), prescription download (if past).

### Step 4.4 — Profile & Settings
**File:** `src/app/(patient)/profile/page.tsx`

Form: name, phone (+91), email, DOB, gender, city, pincode, medical history notes. Save button.

### Step 4.5 — Payment History
**File:** `src/app/(patient)/payments/page.tsx`

Table: Date | Doctor | Amount (₹) | GST (₹) | Total (₹) | Status | Receipt

### Step 4.6 — Notifications
**File:** `src/app/(patient)/notifications/page.tsx`

List of notifications with unread dot, timestamp, mark-all-read button.

---

## Sprint 5 — Provider Portal

### Step 5.1 — Provider Layout
**Files to create:**
- `src/app/(provider)/layout.tsx` — sidebar + header

**Sidebar:**
```
[BP] bookphysio

👨‍⚕️ Dr. Priya Sharma
   ICP-MH-2017-04821

── Navigation ──
📊 Dashboard
📅 Calendar
📋 Appointments
👥 Patients
💬 Messages
💰 Earnings
⚙️  Practice Profile
🕐 Availability

── ──────────── ──
🚪 Log out
```

### Step 5.2 — Provider Dashboard
**File:** `src/app/(provider)/dashboard/page.tsx`

```
Good morning, Dr. Sharma 👋

Today's Summary
┌──────────┬──────────┬──────────┬──────────┐
│    8     │    3     │  ₹5,600  │  ⭐ 4.9  │
│ Appts    │ New      │ Today's  │ Rating   │
│ Today    │ Patients │ Earnings │          │
└──────────┴──────────┴──────────┴──────────┘

Today's Schedule (timeline)
9:00 AM  Rahul Verma      · In-clinic · [Start]
10:30 AM Priti Desai      · Home Visit · [Start]
2:00 PM  Arjun Kapoor     · Online · [Join]
...
```

### Step 5.3 — Calendar Page
**File:** `src/app/(provider)/calendar/page.tsx`

Weekly calendar grid (7 columns Mon–Sun). Each slot: 30-min blocks, booked=teal, available=white/dashed, blocked=grey. Click slot to view appointment or block time.

### Step 5.4 — Appointments List
**File:** `src/app/(provider)/appointments/page.tsx`

Table: Patient | Date | Time | Type | Status | Actions.

### Step 5.5 — Patient Records
**File:** `src/app/(provider)/patients/page.tsx`

Patient list with search. Each row: name, phone, last visit, total visits, [View] button.

### Step 5.6 — Availability Settings
**File:** `src/app/(provider)/availability/page.tsx`

Weekday toggles (Mon–Sun), slot duration (30/45/60 min), working hours per day (start/end time), blocked dates picker.

### Step 5.7 — Earnings
**File:** `src/app/(provider)/earnings/page.tsx`

```
This Month: ₹42,500
GST collected: ₹7,650
Payouts: ₹34,850

[Monthly chart placeholder]

Transactions table: Date | Patient | Amount | GST | Net | Status
```

### Step 5.8 — Practice Profile
**File:** `src/app/(provider)/profile/page.tsx`

Form: display name, bio, photo upload, specializations (tag pills), education (add/remove), ICP number, languages, clinic details (name, address, city, pincode, lat/lng), visit types offered, consultation fee per type.

---

## Sprint 6 — Admin Panel

### Step 6.1 — Admin Layout
**File:** `src/app/(admin)/layout.tsx`

Sidebar: Dashboard, Provider Approvals, Users, Analytics, Settings.

### Step 6.2 — Admin Dashboard
**File:** `src/app/(admin)/page.tsx`

```
Platform Overview
┌──────────┬──────────┬──────────┬──────────┐
│  1,204   │   342    │  8,921   │ ₹12.4L   │
│ Providers│ Pending  │ Patients │ GMV MTD  │
└──────────┴──────────┴──────────┴──────────┘
```

### Step 6.3 — Provider Approval Queue
**File:** `src/app/(admin)/listings/page.tsx`

Table: Provider Name | ICP # | City | Submitted | Status | [Approve] [Reject] [View Docs].

### Step 6.4 — User Management
**File:** `src/app/(admin)/users/page.tsx`

Tabs: Patients | Providers. Search bar, table, role badge, [Suspend] [View] actions.

---

## Sprint 7 — Static Pages

### Step 7.1 — How It Works
**File:** `src/app/how-it-works/page.tsx`

3-step illustrated flow (patients) + 3-step flow (providers). Call to action.

### Step 7.2 — About
**File:** `src/app/about/page.tsx`

Mission statement, team section (placeholder cards), stats (cities, providers, patients).

### Step 7.3 — FAQ
**File:** `src/app/faq/page.tsx`

Accordion FAQ. Categories: Patients, Providers, Payments, Technical.

### Step 7.4 — Privacy Policy
**File:** `src/app/privacy/page.tsx`

Standard privacy policy page. Long-form text layout.

### Step 7.5 — Terms of Service
**File:** `src/app/terms/page.tsx`

Standard ToS. Long-form text layout.

### Step 7.6 — 404 Page
**File:** `src/app/not-found.tsx`

Friendly 404 with teal illustration, "Go back home" CTA.

---

## Shared Components Needed (create before or during Sprint 1)

| Component | File | Used by |
|-----------|------|---------|
| `DoctorCard` | `src/components/DoctorCard.tsx` | Search, Homepage, Specialty, City pages |
| `PageHeader` | `src/components/PageHeader.tsx` | All dashboard layouts |
| `SidebarNav` | `src/components/SidebarNav.tsx` | Patient + Provider + Admin layouts |
| `StatusBadge` | `src/components/StatusBadge.tsx` | Appointments everywhere |
| `Avatar` | `src/components/Avatar.tsx` | Doctor cards, dashboards |
| `StarRating` | `src/components/StarRating.tsx` | Doctor cards, reviews |
| `VisitTypeBadge` | `src/components/VisitTypeBadge.tsx` | Doctor cards, appointments |
| `PriceDisplay` | `src/components/PriceDisplay.tsx` | ₹ formatting, always integer rupees |

---

## Route Map (final)

```
/ ................................. Homepage (✅ DONE)
/search ........................... Search Results
/doctor/[id] ...................... Doctor Profile
/specialty/[slug] ................. Specialty Landing
/city/[slug] ...................... City Landing
/how-it-works ..................... How It Works (static)
/about ............................ About
/faq .............................. FAQ
/privacy .......................... Privacy Policy
/terms ............................ Terms of Service

/(auth)
  /signup ......................... Patient Signup (phone OTP)
  /verify-otp ..................... OTP Verification
  /login .......................... Login
  /provider-signup ................ Provider Signup (multi-step)

/book/[id] ........................ Booking Flow (3-step wizard)

/(patient)
  /dashboard ...................... Patient Home
  /appointments ................... Appointments List
  /appointments/[id] .............. Appointment Detail
  /profile ........................ Profile & Settings
  /payments ....................... Payment History
  /notifications .................. Notifications

/(provider)
  /dashboard ...................... Provider Home
  /calendar ....................... Weekly Calendar
  /appointments ................... Appointments List
  /patients ....................... Patient Records
  /patients/[id] .................. Patient Detail
  /availability ................... Availability Settings
  /earnings ....................... Earnings & Payouts
  /profile ........................ Practice Profile

/(admin)
  / ............................... Admin Dashboard
  /listings ....................... Provider Approval Queue
  /users .......................... User Management
```

---

## Execution Order (recommended)

When you say "do Step X.X", I will build exactly that step and nothing else.

```
✅ Homepage (done)
── Sprint 1: Public ──
→ Step 1.1  Search Results + DoctorCard
→ Step 1.2  Doctor Profile + BookingCard
→ Step 1.3  Specialty Landing
→ Step 1.4  City Landing
── Sprint 2: Auth ──
→ Step 2.1  Patient Signup
→ Step 2.2  OTP Verify
→ Step 2.3  Login
→ Step 2.4  Provider Signup
── Sprint 3: Booking ──
→ Step 3.1  Booking Wizard (all 3 steps)
── Sprint 4: Patient Dashboard ──
→ Step 4.1  Layout + Dashboard Home
→ Step 4.2  Appointments List
→ Step 4.3  Appointment Detail
→ Step 4.4  Profile & Settings
→ Step 4.5  Payment History
→ Step 4.6  Notifications
── Sprint 5: Provider Portal ──
→ Step 5.1  Layout
→ Step 5.2  Provider Dashboard
→ Step 5.3  Calendar
→ Step 5.4  Appointments List
→ Step 5.5  Patient Records
→ Step 5.6  Availability Settings
→ Step 5.7  Earnings
→ Step 5.8  Practice Profile
── Sprint 6: Admin ──
→ Step 6.1  Layout
→ Step 6.2  Admin Dashboard
→ Step 6.3  Provider Approval Queue
→ Step 6.4  User Management
── Sprint 7: Static ──
→ Step 7.1  How It Works
→ Step 7.2  About
→ Step 7.3  FAQ
→ Step 7.4  Privacy Policy
→ Step 7.5  Terms of Service
→ Step 7.6  404 Page
```
