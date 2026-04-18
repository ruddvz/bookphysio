# Slices 16.28 – 16.30: Provider Profile, AI-Assistant & Messages/Notifications v2

> **For a fresh AI agent.** Read this document top-to-bottom, then implement.
> No need to read CHANGELOG, ACTIVE, or EXECUTION-PLAN first — all required
> context is inlined here.

---

## 0. What you must never break

- `NEXT_PUBLIC_UI_V2` / `bp_ui=v2` cookie / `?ui=v2` query-string gating.
  Every v2 component **must** call `useUiV2()` from `@/hooks/useUiV2` and
  return `null` immediately when the flag is off. This makes v1 the production
  default until the flag is flipped.
- TypeScript strict mode — zero `any`, zero `tsc --noEmit` errors.
- No new API routes. All existing `/api/` endpoints are already wired; keep
  using them unchanged.
- Files stay under 800 lines, functions under 50 lines.
- Design tokens: primary teal `#00766C`, provider CSS token prefix
  `--color-pv-*` (not `--color-pt-*` which is patient).
- Currency is always integer `₹` rupees — never paise, never `$`.

---

## 1. Pattern to follow (already shipped)

The three slices below mirror what was done for the **patient** equivalents.
Study these files before you write a single line:

| What to look at | Path |
|---|---|
| Patient profile v2 | `src/app/patient/profile/PatientProfileV2.tsx` |
| Patient messages v2 | `src/app/patient/messages/PatientMessagesV2.tsx` |
| Patient messages utils | `src/app/patient/messages/messages-v2-utils.ts` |
| Patient notifications v2 | `src/app/patient/notifications/PatientNotificationsV2.tsx` |
| Patient notifications utils | `src/app/patient/notifications/notifications-v2-utils.ts` |
| Patient messages page (gate pattern) | `src/app/patient/messages/page.tsx` |
| Patient notifications page (gate pattern) | `src/app/patient/notifications/page.tsx` |
| Patient profile page (gate pattern) | `src/app/patient/profile/page.tsx` |

The pattern for every slice is:

```
src/app/provider/<surface>/
  page.tsx                  ← already exists (v1). Add gate: if (isV2) return <ProviderXxxV2 />
  ProviderXxxV2.tsx         ← NEW — self-gates via useUiV2(), returns null when flag off
  provider-xxx-v2-utils.ts  ← NEW — pure helper functions (needed only when business logic warrants)
  xxx-v2.test.tsx           ← NEW — ≥ 6 Vitest unit tests (utils + rendered output)
```

### v2 gate pattern (copy this into page.tsx)

```tsx
'use client'
import { useUiV2 } from '@/hooks/useUiV2'
import { ProviderXxxV2 } from './ProviderXxxV2'

export default function ProviderXxx() {
  const isV2 = useUiV2()
  if (isV2) return <ProviderXxxV2 />
  // ... existing v1 JSX unchanged below ...
}
```

### v2 component shell

```tsx
'use client'
import { useUiV2 } from '@/hooks/useUiV2'
// ... other imports ...

export function ProviderXxxV2() {
  const isV2 = useUiV2()
  if (!isV2) return null   // ← always first line after hook calls

  return (
    <div data-ui-version="v2" data-testid="v2-xxx-root">
      {/* v2 chrome */}
    </div>
  )
}
```

### CSS token reference

| Token | Use |
|---|---|
| `var(--color-pv-primary)` | Provider teal (accent, icons) |
| `var(--color-pv-ink)` | Dark navy (text, CTAs) |
| `var(--color-pv-border)` | Card border |
| `var(--color-pv-border-soft)` | Divider lines |
| `var(--color-pv-tile-1-bg)` | Subtle tile background |
| `var(--color-pv-tile-2-bg)` | Secondary tile background |
| `var(--color-pv-tile-2-fg)` | Secondary tile foreground |
| `var(--sq-lg)` | Large border-radius |
| `var(--sq-sm)` | Small border-radius |
| `var(--sq-xs)` | XS border-radius |

### Badge component

`import { Badge } from '@/components/dashboard/primitives/Badge'`

Props: `role="provider"`, `variant="success"|"warning"|"soft"|"neutral"`,
`tone={1|2|3|4}` (only with `variant="soft"`).

---

## 2. Slice 16.28 — `/provider/profile` v2

### Current state

`src/app/provider/profile/page.tsx` — a full v1 client component (~500 lines).
It fetches `/api/profile`, shows avatar, name/bio/fee/experience text inputs,
council registration (read-only), coverage-area card, registry-status sidebar,
public-metadata sidebar.

### What to build

Create `ProviderProfileV2.tsx` in the same directory. The v2 overlay must add:

1. **Provider role Badge** — next to the provider's display name in the avatar
   row: `<Badge role="provider" variant="soft" tone={1}>Physiotherapist</Badge>`

2. **NCAHP/IAP credential chip** — reuse the existing `iap_registration_no`
   field displayed as a read-only pill with `ShieldCheck` icon and a
   `<Badge role="provider" variant="success">Verified</Badge>` badge when the
   field is non-null, or `<Badge role="provider" variant="warning">Pending</Badge>`
   when null.

3. **"View public page" CTA** — a secondary button in the sidebar that navigates
   to `/doctor/${userId}` (use `user.id` from `useAuth()`). Label: `View Public Profile`.

4. All the existing v1 save/avatar-upload/discard logic stays intact — you can
   call the existing helpers. The v2 wrapper primarily reskins the chrome and
   adds the three features above without re-implementing PATCH/upload.

**Simplest approach:** The v2 component can *re-implement* a slimmer version of
the profile form using `useQuery` / `useMutation` from `@tanstack/react-query`
(same pattern as `PatientProfileV2.tsx`) instead of raw `useState` + `useCallback`.
Keep the same field set: `full_name`, `bio`, `consultation_fee_inr`,
`experience_years`. Avatar upload is v1-only — in v2 just show the stored
`avatar_url` (or initials) without the upload affordance (that keeps the v2
component simple).

### Gate change in `page.tsx`

Add at the top of the existing default export:

```tsx
const isV2 = useUiV2()
if (isV2) return <ProviderProfileV2 />
```

(The rest of the v1 JSX is unchanged.)

### Tests (`profile-v2.test.tsx`)

Write ≥ 8 Vitest + React Testing Library unit tests covering:

- Renders `null` when `useUiV2` returns `false`.
- Renders `data-testid="v2-profile-root"` when flag is on.
- Shows `"Physiotherapist"` role Badge.
- Shows `"Verified"` credential Badge when `iap_registration_no` is non-null.
- Shows `"Pending"` credential Badge when `iap_registration_no` is null.
- Shows provider's display name in the avatar row.
- "Save Changes" button is disabled when name is unchanged.
- "View Public Profile" CTA button is present.

---

## 3. Slice 16.29 — `/provider/ai-assistant` v2

### Current state

`src/app/provider/ai-assistant/page.tsx` — 22 lines. It renders
`<BookPhysioAIChat variant="provider" api="/api/ai/provider" initialMessages={…} />`
dynamically with `ssr: false`.

### What to build

The v1 component is already reasonable. The v2 overlay wraps it in v2 chrome:

1. **Page kicker + heading** — matching the style used across v2 pages:

```tsx
<div>
  <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-pv-primary)] mb-1">
    AI TOOLS
  </p>
  <h1 className="text-[22px] font-bold text-slate-900 leading-none">
    Clinical AI Assistant
  </h1>
  <p className="text-[13px] text-slate-500 mt-1">
    Evidence-backed visit notes, treatment plans, and patient summaries
  </p>
</div>
```

2. **Provider pulse tokens strip** — a horizontal chip rail above the chat
   window showing 3 static capability chips:

```tsx
<div className="flex flex-wrap gap-2" data-testid="v2-capability-chips">
  <Badge role="provider" variant="soft" tone={1}>Visit-note autodraft</Badge>
  <Badge role="provider" variant="soft" tone={2}>Treatment plan builder</Badge>
  <Badge role="provider" variant="soft" tone={3}>Patient summary</Badge>
</div>
```

3. The `<BookPhysioAIChat>` component renders beneath, unchanged.

Create `ProviderAIAssistantV2.tsx`. The existing `page.tsx` stays but add the
gate:

```tsx
const isV2 = useUiV2()
if (isV2) return <ProviderAIAssistantV2 />
```

### Tests (`ai-assistant-v2.test.tsx`)

Write ≥ 6 Vitest + RTL tests:

- Renders `null` when flag is off.
- Renders `data-testid="v2-ai-root"` when flag is on.
- Shows heading `"Clinical AI Assistant"`.
- Renders the capability chips container.
- Shows `"Visit-note autodraft"` chip.
- Shows `"Treatment plan builder"` chip.
- Shows `"Patient summary"` chip.

(You do not need to test `BookPhysioAIChat` itself — mock it.)

---

## 4. Slice 16.30 — `/provider/messages` + `/provider/notifications` v2

### Current state

`src/app/provider/messages/page.tsx` — full conversation sidebar + chat thread
(~330 lines, v1 only, no v2 gate yet). Identical in structure to the patient
messages page before 16.19 was added.

`src/app/provider/notifications/page.tsx` — notifications list (~170 lines,
v1 only, no v2 gate yet).

### What to build

This is a **direct port** of what was done for the patient equivalents in
slice 16.19. Swap `--color-pt-*` tokens for `--color-pv-*`, change copy
("Communicate with your patients" instead of "providers"), and use
`role="provider"` on `Badge` props. Everything else is structurally identical.

#### 4a. Messages

Create `src/app/provider/messages/ProviderMessagesV2.tsx`:

- Self-gates via `useUiV2()`, returns `null` when off.
- Conversation sidebar with per-row unread `Badge` chips.
- Day-grouped thread dividers (same `groupMessagesByDay` util — just import it
  from the patient utils or create a new `messages-v2-utils.ts` with the same
  functions).
- `data-testid="v2-messages-root"` on the root div.

Create `src/app/provider/messages/messages-v2.test.tsx` — ≥ 6 tests:

- Renders `null` when flag is off.
- Renders `data-testid="v2-messages-root"` when flag is on.
- Conversation sidebar renders (`data-testid="v2-conversation-sidebar"`).
- Empty inbox state renders when conversations are empty.
- Unread badge renders for a conversation with `unread_count > 0`.
- Send button renders when a conversation is selected.

Modify `src/app/provider/messages/page.tsx` — add at top of default export:

```tsx
const isV2 = useUiV2()
if (isV2) return <ProviderMessagesV2 />
```

#### 4b. Notifications

Create `src/app/provider/notifications/ProviderNotificationsV2.tsx`:

- Self-gates via `useUiV2()`, returns `null` when off.
- Day-grouped sections (same `groupNotificationsByDay` util — import from
  patient utils or duplicate with provider namespace).
- Per-notification type `Badge` chips.
- Unread count `Badge` + "Mark all read" button in header.
- `data-testid="v2-notifications-root"` on root div.

Create `src/app/provider/notifications/notifications-v2.test.tsx` — ≥ 6 tests:

- Renders `null` when flag is off.
- Renders `data-testid="v2-notifications-root"` when flag is on.
- Shows unread count Badge when unread > 0.
- Shows "Mark all read" button when unread > 0.
- Renders empty-state when notifications list is empty.
- Clicking a notification row calls `markOneRead`.

Modify `src/app/provider/notifications/page.tsx` — add at top of default export:

```tsx
const isV2 = useUiV2()
if (isV2) return <ProviderNotificationsV2 />
```

#### Reusing patient utils

Rather than duplicating util functions, import directly from the patient
notification utils:

```ts
// provider notifications v2
import {
  groupNotificationsByDay,
  notificationBadgeVariant,
  notificationTypeLabel,
  formatRelativeTime,
} from '@/app/patient/notifications/notifications-v2-utils'
```

And for messages:

```ts
// provider messages v2
import {
  groupMessagesByDay,
  nameInitials,
  unreadBadgeVariant,
  lastMessagePreview,
  formatMessageTime,
} from '@/app/patient/messages/messages-v2-utils'
```

(The functions are role-agnostic — they operate on dates and strings only.)

---

## 5. Files to create / modify

| Action | Path |
|---|---|
| **CREATE** | `src/app/provider/profile/ProviderProfileV2.tsx` |
| **CREATE** | `src/app/provider/profile/profile-v2.test.tsx` |
| **MODIFY** | `src/app/provider/profile/page.tsx` (add v2 gate) |
| **CREATE** | `src/app/provider/ai-assistant/ProviderAIAssistantV2.tsx` |
| **CREATE** | `src/app/provider/ai-assistant/ai-assistant-v2.test.tsx` |
| **MODIFY** | `src/app/provider/ai-assistant/page.tsx` (add v2 gate) |
| **CREATE** | `src/app/provider/messages/ProviderMessagesV2.tsx` |
| **CREATE** | `src/app/provider/messages/messages-v2.test.tsx` |
| **MODIFY** | `src/app/provider/messages/page.tsx` (add v2 gate) |
| **CREATE** | `src/app/provider/notifications/ProviderNotificationsV2.tsx` |
| **CREATE** | `src/app/provider/notifications/notifications-v2.test.tsx` |
| **MODIFY** | `src/app/provider/notifications/page.tsx` (add v2 gate) |

---

## 6. Verification checklist

Run these commands in order. All must pass before committing.

```bash
rtk npm run build          # zero TS errors, zero webpack/turbo errors
rtk npm test               # all tests green (existing 741 + your new ≥ 26)
```

If `rtk` is not available, use:

```bash
npm run build
npm test -- --run
```

---

## 7. Commit instructions

Make **three separate commits**, one per slice:

```bash
git add src/app/provider/profile/
git commit -m "feat(ui-v2): slice 16.28 — provider profile v2 with credential chip + public preview CTA"

git add src/app/provider/ai-assistant/
git commit -m "feat(ui-v2): slice 16.29 — provider AI-assistant v2 shell + capability chips"

git add src/app/provider/messages/ src/app/provider/notifications/
git commit -m "feat(ui-v2): slice 16.30 — provider messages + notifications v2 (parity with patient 16.19)"
```

Then push and open a single PR targeting `main`.

---

## 8. What NOT to do

- Do not touch any API routes.
- Do not modify patient components or utils (read-only reference only).
- Do not add new Supabase migrations.
- Do not change existing v1 JSX beyond the three-line gate block.
- Do not rename or move existing files.
- Do not install new npm packages.
