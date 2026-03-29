# Interaction Patterns: ZocDoc (Extracted)

Standardized interaction patterns for the ZocDoc clone, tailored for BookPhysio.

## Interactive States

### Hover Effects
- **Buttons (Primary/Secondary):** Background changes, subtle scale (`scale(1.02)`), or shadow increases.
- **Card Hover:** Border-teal change or subtle lift shadow (`shadow-lg`).
- **Icons (Specialties):** Scale up or change background color.
- **Links (Gray/Muted):** Turn into Primary Teal.

### Active/Click Interactions
- **Tap feedback:** Subtle bounce or immediate background color change.
- **Inputs:** Outline-border Teal on focus.
- **Selection:** Checkboxes/Toggles animate with Teal background.

### Loading States
- **Skeletons:** Gradients with pulse animation for Doctor Cards, Specialty Grid, and Bio section.
- **Spinners:** Simple Teal circle/dotted spinner for long tasks (Login/Signup).
- **Progressive Image Loading:** Blur-up effect or grey background placeholders.

## Entrance & Component Animations

### Page Transitions
- Fade-in (0.3s) or Slide-up (0.5s) on page entry.
- Horizontal scroll/slide for carousels (Specialties/Reviews).

### Layout Shifts
- Smooth height transitions when expanding filters or bio text.
- Accordion-style expansion for FAQs or detailed credentials.

### Micro-Interactions
- **Favorite/Save Icon:** Scale and change color (from outlined to filled) on click.
- **Badges:** Tooltips to explain "Verified" or "Premium" status.

## Navigation & Mobile Behavior

### Mobile Swipe Interactions
- **Carousels:** Horizontal swipe with snap points.
- **Drawers:** Slide up from bottom for filters or quick-booking.

### Sticky Headers & Footers
- Navigation bar fades/shrinks on scroll.
- Floating 'Book Now' button for profile pages on mobile (at viewport bottom).

## Error & Validations
- **Form Errors:** Red border-bottom and brief error text below.
- **Empty States:** Illustration (extracted from ZocDoc or custom) with 'Try clearing filters' button.
- **Success:** Green 'check' animation or brief notification before redirection.
