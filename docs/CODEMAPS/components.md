# BookPhysio — Components Codemap

> All files in `src/components/`. Owner: `bp-ui-public` (sole write access).

## Component Index

| File | Purpose | Props | Imported By |
|------|---------|-------|-------------|
| `Navbar.tsx` | Top navigation: logo, nav links, Browse dropdown, Login/Signup CTAs, mobile hamburger | none | 12 public pages, not-found |
| `Footer.tsx` | Page footer: links grid, trust/resources links, copyright | none | 14 pages incl. patient + provider layouts |
| `DoctorCard.tsx` | Doctor result card: avatar, name, credentials, rating, location, fee, book CTA | `Doctor` type (id, name, credentials, specialty, rating, reviewCount, location, distance, nextSlot, visitTypes, fee, icpVerified) | search, specialty, city pages |
| `HeroSection.tsx` | Homepage hero: animated specialty cycling, search bar, illustration cards | none | page.tsx (homepage only) |
| `HowItWorks.tsx` | Homepage: 3-step feature cards with teal links | none | page.tsx |
| `TopSpecialties.tsx` | Homepage: specialty card grid | none | page.tsx |
| `AppSection.tsx` | Homepage: app download CTA, QR code, app store badges | none | page.tsx |
| `ProviderCTA.tsx` | Homepage: "List your practice" sign-up CTA | none | page.tsx |
| `HealthSystems.tsx` | Homepage: hospital network / trust logos | none | page.tsx |
| `CityLinks.tsx` | Homepage: Indian cities accordion | none | page.tsx |
| `CommonReasons.tsx` | Homepage: physio visit reasons accordion | none | page.tsx |
| `JobsCTA.tsx` | Homepage: careers CTA | none | page.tsx |
| `SidebarNav.tsx` | Dashboard sidebar: icon + label nav items, active state | `items[]`, `activeHref` | patient/layout, provider/layout, admin/layout |
| `PageHeader.tsx` | Dashboard page header: title + optional action button | `title`, `action?` | dashboard pages |
| `StatusBadge.tsx` | Appointment status pill: confirmed/pending/cancelled/completed | `status` | appointment list pages |
| `StarRating.tsx` | Star display with count | `rating`, `count` | DoctorCard, review sections |
| `VisitTypeBadge.tsx` | Visit type pill: in_clinic/home_visit | `type` | DoctorCard, booking steps |
| `PriceDisplay.tsx` | ₹ price formatter (integer rupees) | `fee` | DoctorCard, booking steps, payment pages |
| `Avatar.tsx` | Doctor/user avatar circle | `src?`, `name`, `size` | DoctorCard, booking steps, dashboard cards |
| `ui/button.tsx` | shadcn/ui Button primitive | standard shadcn props | various |

## Dependency Graph

```
Homepage (page.tsx)
  └── Navbar, Footer, HeroSection, TopSpecialties, HowItWorks,
      AppSection, ProviderCTA, HealthSystems, CityLinks, CommonReasons, JobsCTA

Search (/search/page.tsx)
  └── Navbar, Footer, DoctorCard, SearchFilters
      DoctorCard └── Avatar, StarRating, VisitTypeBadge, PriceDisplay

Doctor Profile (/doctor/[id]/page.tsx)
  └── Navbar, Footer, BookingCard
      BookingCard └── (client component, manages slot selection)

Booking (/book/[id]/)
  └── Navbar, StepConfirm, StepPayment, StepSuccess
      StepConfirm └── Avatar, VisitTypeBadge, PriceDisplay

Dashboards (patient/, provider/, admin/)
  └── SidebarNav, PageHeader, Footer
      Lists └── StatusBadge, Avatar, PriceDisplay
```

## Modification Rules

- **Only `bp-ui-public`** may modify these files
- Other agents must raise a task if a shared component needs changes
- Before modifying, check "Imported By" column to understand blast radius
- Run `rtk npm run build` after any change to verify no breakage
