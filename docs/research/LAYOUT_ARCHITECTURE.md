# Layout Architecture: ZocDoc (Extracted)

Standardized layout architecture for the ZocDoc clone, adapted for BookPhysio.

## Core Structure

### Global Wrapper
- `max-width: 1280px`
- `margin: auto`
- `padding: 0 16px` (Mobile) / `0 64px` (Desktop)

### Responsive Grid System
- **1 Column (Mobile < 768px):** All sections (Search bar, Specialty grid, How-it-works).
- **2 Columns (Tablet 768px - 1024px):** Specialty Grid (2x2), Doctor List (List View only).
- **3-4 Columns (Desktop > 1024px):** Specialty Grid (4x2), Doctor List + Sidebar (30/70 split), Footer (4-5 columns).

### Sticky Navigation
- `top: 0`
- `z-index: 100`
- Fixed height: `80px` (Desktop), `64px` (Mobile).
- Shadow appears on scroll (Glassmorphism or solid white).

## Page Layouts

### Homepage (`/`)
- **Main Hero:** Dynamic height (min-viewport 60vh or fixed 600px).
- **Secondary Sections:** Alternating background (White / F5F5F5).
- **Section Margins:** `48px-64px` between sections (Desktop), `24px-32px` (Mobile).

### Search Results (`/search`)
- **Horizontal Split (Desktop):** Sidebar (Filters) | List (Doctor Cards) with city and coverage context.
- **Vertical Stack (Mobile):** Filters (Sticky/Expandable) -> List (Doctor Cards).
- **Infinite Scroll / Pagination:** Results load as user scrolls or through a 'Load more' button.

### Doctor Profile (`/doctor/{id}`)
- **Left Column (70%):** Profile info, bio, reviews, and visit format details.
- **Right Column (30% - Sticky):** Appointment booking widget (Calendar/Time picker).
- **Mobile:** Booking widget is either at the bottom (floating) or top-of-page before bio.

## Header/Footer Hierarchy
- **Header:** Global Search (appears on scroll or is part of Navbar).
- **Footer:** Links grid with legal and SEO optimized pages.

## Modal/Overlay Layers
- **Signup/Login:** Centered dialog, `max-width: 480px`.
- **Global Search overlay:** Full-screen or large popover on mobile.
- **Filters overlay:** Bottom-sheet drawer on mobile.

## Max Z-Index Layers
- Navigation: `100`
- Sticky Sidebar (Map/Calendar): `50` (behind nav)
- Modals/Dialogs: `500`
- Toasts/Notifications: `1000`
