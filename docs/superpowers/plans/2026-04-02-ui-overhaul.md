# UI Polish Discovery — Phase 1: Architectural Design Specification

**Status:** Draft / Proposed
**Target Date:** April 2026
**Authors:** Architect Agent

## 1. Executive Summary
The current BookPhysio.in homepage lacks the "premium clinic" aesthetic required for a high-trust health platform. This design specification proposes a shift from a split-layout (left-heavy) hero to a centered, "Search-First" architecture. We will also refresh the visual system to use a deeper, more sophisticated palette while maintaining accessibility.

## 2. Visual System Refresh

### 2.1 Color Palette (Premium Overhaul)
We are moving away from "flat teal" towards a layered, high-contrast palette that suggests competence and luxury.

| Color | Value | Usage |
|-------|-------|-------|
| **Deep Pine** (Primary) | `#0B3B32` | Headings, Primary CTAs, Dark backgrounds |
| **Active Teal** (Accent) | `#12B3A0` | Icons, secondary highlights, status cues |
| **Sunset Clay** (Secondary) | `#D9734D` | CTA accents (hover states), small detail highlights |
| **Soft Parchment** (Surface) | `#FBF9F4` | Main page background |
| **Warm Smoke** (Muted) | `#616B68` | Body text, subheaders |
| **Golden Sand** (Border) | `#EBE1D2` | Component borders |

### 2.2 Typography
- **Headings:** Fraunces (Serif) - Medium/SemiBold for that "high-end editorial" feel.
- **Body:** Inter (Sans) - for medical clarity and modern readability.
- **Scales:** Optimized for 1142px max-width (standard viewport).

---

## 3. Hero Section Redesign (Step 8.X)

### 3.1 Layout Strategy
- **Centered Alignment:** All elements (Kicker, H1, Subtext, Search Bar) transition to `text-center`.
- **Search Dominance:** The `SearchBar` component will move from a side-column to a full-width container centered within the hero shell.
- **Visual Weight:** Remove the `PreviewPanel` (right widget) to eliminate visual noise and focus the user entirely on the "search" intent.

### 3.2 Component: SearchBar Polish
- **Width:** Expands to `max-w-4xl` (approx 900px).
- **Shadows:** Soft multi-layered shadow (`0 12px 48px -12px rgba(11, 59, 50, 0.15)`).
- **Interactions:** Subtle hover lifting on inputs and a "magnetic" feel on the "Find Care" button.

---

## 4. Relocation: The "Proof" Section

The `PreviewPanel` content is valuable but intrusive in the hero. It will be refactored into a **"Live Network Proof"** section placed directly below the fold (Section 2).

- **New Name:** `NetworkProofSection.tsx`
- **Layout:** Horizontal scroll or 3-column grid showing live physiotherapy availability.
- **Purpose:** Transition the user from "Intent" (Search) to "Evidence" (Look at these doctors you could book right now).

---

## 5. Technical Implementation Plan

### Phase A: CSS Token Updates (`src/app/globals.css`)
Update `@theme` block with new premium tokens:
```css
--color-bp-primary: #0B3B32;
--color-bp-accent: #12B3A0;
--color-bp-secondary: #D9734D;
--color-bp-surface: #FBF9F4;
--color-bp-border: #EBE1D2;
```

### Phase B: Hero Component Refactor (`src/components/HeroSection.tsx`)
1. **Remove `PreviewPanel`** from the `return` JSX.
2. **Refactor SearchBar Container:**
   - Change `grid-cols-2` to `flex flex-col items-center`.
   - Update wrapper to `mx-auto max-w-4xl w-full`.
3. **Typography Update:** Apply `text-center` and updated heading classes.

### Phase C: New Proof Section (`src/components/ProofSection.tsx`)
Create a new component to house the former `PreviewPanel` data, using a more relaxed layout suited for a mid-page section.

---

## 6. Consistency Checklist
- [ ] All `bp-card` borders updated to `var(--color-bp-border)`.
- [ ] Buttons transition to `#0B3B32` (Primary) with high-contrast text.
- [ ] Section backgrounds alternate between `parchment` and `white`.
- [ ] All icons transitioned to `Active Teal`.