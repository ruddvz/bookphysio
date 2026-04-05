# Component Inventory: ZocDoc (Extracted)

Standardized component definitions for the ZocDoc clone, tailored for BookPhysio.

## Global Components

### Navbar (TopBar)
- **Structure:** Logo (Left), Search/Categories (Center/Left), Login/Signup (Right)
- **States:** Sticky on scroll, mobile hamburger menu
- **Interactive:** Search bar focuses on click, dropdown for 'Specialties' or 'Browse'
- **Icons:** User (Profile), Help (Question Circle), Activity (Physio)

### Footer
- **Structure:** 4-5 column grid (Desktop), vertical list (Mobile)
- **Sections:** About, Specialties, Locations, Appointments, Help/Support
- **Icons:** Social media (Facebook, Twitter, Instagram), App store badges

## Page-Specific Components

### Homepage (`/`)
- **Hero Search:** Large input group with 'What/Condition' and 'Where/Location' fields.
- **Specialty Grid:** 2xN grid (Mobile) or 4x2 grid (Desktop) of cards with icons and text.
- **How-it-works:** 3-step icon-and-text explanation.
- **Trust Signals:** Icons/badges (Verified, Same-day, In-person/Online).
- **City Links:** Tag-like links at the bottom (Mumbai, Delhi, Bangalore...).

### Search Results (`/search`)
- **Results List:** Scrollable list of Doctor cards.
- **Doctor Card:**
  - **Left Section:** Photo + Badge (Verified/Premium)
  - **Center Section:** Name, Specialty, Ratings (stars), Address, Availability summary
  - **Right Section:** Availability grid (Next available slots)
- **Filter Sidebar:** Multi-select checkboxes for specialty, gender, distance, and visit type.
- **Location Context:** City chips, nearby coverage cues, and availability previews instead of a live map.

### Doctor Profile (`/doctor/{id}`)
- **Profile Header:** Larger photo, full name, specialty, address.
- **Booking Carousel:** Multi-day/time date-and-time picker.
- **Detailed Bio:** About text, education, board certifications (ICP for India), languages spoken.
- **Reviews Section:** Average rating, count, detailed reviews list with verified badge.
- **Photos/Videos:** Gallery of the clinic or doctor.

## UI Primitives (shadcn/ui equivalents)

- **Button:** 
  - `primary`: Teal background, white text, pill-shaped.
  - `secondary`: Teal border, teal text, pill-shaped.
  - `ghost`: Transparent, text-only.
- **Input:** 
  - `search`: Integrated icons, large padding.
  - `standard`: Simple border-bottom or full border.
- **Card:** White background, 12px radius, subtle shadow.
- **Badge:** Small text with background (teal/light-teal).
- **Dialog/Modal:** Central overlay for login/signup or large filters.
- **Popover:** Used for hover states on icons or tooltips.

## Custom Icons (Lucide alternatives)

- **Condition:** `Search`, `Stethoscope`
- **Location:** `MapPin`
- **Filters:** `SlidersHorizontal`
- **Physio-specific:** `Activity`, `Dumbbell` (for rehab), `HeartPulse`
- **Home Visit:** `Home`
- **In-clinic:** `Building2`
- **Online:** `Video`
