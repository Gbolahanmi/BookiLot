# Bookilot — UI Rules & Design System

## Design Principles

1. **Clarity over cleverness** — Every element has a clear purpose. No decorative-only UI.
2. **Mobile-first** — Business owners n customer check bookings from their phones. Design for 360px up.
3. **Consistent spacing** — Use Tailwind's spacing scale (4px base). No arbitrary values.
4. **Accessible by default** — Proper contrast ratios, focus states, semantic HTML.
5. **Empty states are content** — Every empty state tells the user what to do next.
   Only install tailwinnd component when its really important else build custom reusable component
   Don't use CSS icons svg

---

## Color System

### Primary

```
indigo-600 (#6366f1) — Primary actions, active states, links
indigo-500 (#818cf8) — Hover states
indigo-50  (#eef2ff) — Background tints
```

### Semantic

```
green-600 (#16a34a) — Success, confirmed, positive
yellow-600 (#ca8a04) — Warning, pending
red-600 (#dc2626) — Error, destructive, cancelled
blue-600 (#2563eb) — Information, completed
gray-500 (#6b7280) — Neutral, secondary text, no-show
```

### Backgrounds

```
white (#ffffff) — Cards, surfaces
gray-50 (#f8fafc) — Page background
gray-100 (#f1f5f9) — Subtle backgrounds, hover
```

### Borders

```
gray-200 (#e2e8f0) — Default borders
gray-300 (#d1d5db) — Input borders, focus rings
```

---

## Typography Scale

| Element       | Class                   | Size | Weight |
| ------------- | ----------------------- | ---- | ------ |
| Page title    | `text-2xl font-bold`    | 24px | 700    |
| Section title | `text-lg font-semibold` | 18px | 600    |
| Card title    | `text-sm font-medium`   | 14px | 500    |
| Body text     | `text-sm`               | 14px | 400    |
| Caption       | `text-xs`               | 12px | 400    |
| Badge         | `text-xs font-medium`   | 12px | 500    |
| Button        | `text-sm font-semibold` | 14px | 600    |

---

## Component Library

### Buttons

**Variants:**

- `primary` — Indigo bg, white text. Main CTAs.
- `secondary` — White bg, gray text, ring border. Alternative actions.
- `destructive` — Red bg, white text. Dangerous actions.
- `ghost` — Transparent bg, gray text. Minimal emphasis.
- `outline` — White bg, ring border, gray text. Tertiary actions.

**Sizes:**

- `sm` — `h-8 px-3 text-xs` — Compact, inline actions
- `md` — `h-10 px-4 text-sm` — Default
- `lg` — `h-12 px-6 text-base` — Hero CTAs, mobile primary

**Rules:**

- Max one primary button per section
- Destructive buttons require confirmation
- Disabled buttons: `disabled:opacity-50 disabled:pointer-events-none`

---

### Inputs

**Structure:**

```
<label> (optional) — text-sm font-medium text-gray-700
<input> — rounded-lg border border-gray-300 px-3 py-2 text-sm
<error> — text-xs text-red-600
```

**States:**

- Default: `border-gray-300`
- Focus: `border-indigo-500 ring-1 ring-indigo-500`
- Error: `border-red-500 ring-1 ring-red-500`
- Disabled: `opacity-50 bg-gray-50`

---

### Badges (Status)

| Status    | Background | Text       | Dot        |
| --------- | ---------- | ---------- | ---------- |
| pending   | yellow-50  | yellow-700 | yellow-500 |
| confirmed | green-50   | green-700  | green-500  |
| cancelled | red-50     | red-700    | red-500    |
| completed | blue-50    | blue-700   | blue-500   |
| no_show   | gray-50    | gray-700   | gray-500   |

**Pattern:**

```tsx
<span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-50 text-green-700">
  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
  confirmed
</span>
```

---

### Cards

**Pattern:**

```tsx
<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
  {/* content */}
</div>
```

**Stats card:**

```tsx
<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
  <p className="text-sm text-gray-500">Label</p>
  <p className="mt-1 text-3xl font-semibold text-gray-900">Value</p>
  <p className="mt-1 text-xs text-green-600">+Change</p>
</div>
```

---

### Empty States

**Pattern:**

```tsx
<div className="text-center py-12 text-gray-500">
  <p className="text-sm">No items yet</p>
  <p className="text-xs mt-1">Description of what to do next.</p>
</div>
```

**Rules:**

- Always explain what the user should do
- Include a CTA when possible
- Use illustrations for key empty states (bookings, services)
  Only download a few external component, Just when required e.g shadcn ui component

---

### Loading States

**Skeleton pattern:**

```tsx
<div className="animate-pulse space-y-4">
  <div className="h-4 bg-gray-200 rounded w-3/4" />
  <div className="h-4 bg-gray-200 rounded w-1/2" />
</div>
```

---

### Error States

**Pattern:**

```tsx
<div className="text-center py-12 text-red-500">
  <p className="text-sm">Something went wrong</p>
  <p className="text-xs mt-1">Please try again or contact support.</p>
  <button className="mt-4 text-sm text-red-600 underline">Try again</button>
</div>
```

---

## Layout Rules

### Dashboard

- Fixed sidebar (264px) on desktop
- Collapsible on mobile (hamburger menu)
- Content area: `p-4 sm:p-6 lg:p-8`
- Max content width: none (full width within padding)

### Booking Widget

- Designed for 360px minimum width
- Single column layout
- No sidebar, no navigation chrome
- Steps: service → datetime → details → confirm
- Back button at top of each step

### Cards/Grid

- Stats: `grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4`
- Lists: Single column, full width
- Forms: Single column, max-width `max-w-lg`

---

## Spacing Rules

Use Tailwind's spacing scale consistently:

- `p-1` / `gap-1` = 4px — Tight (icon padding)
- `p-2` / `gap-2` = 8px — Compact (button inner)
- `p-3` / `gap-3` = 12px — Default (card padding small)
- `p-4` / `gap-4` = 16px — Standard (card padding)
- `p-6` / `gap-6` = 24px — Comfortable (section spacing)
- `p-8` / `gap-8` = 32px — Spacious (page sections)

---

## Responsive Breakpoints

| Breakpoint | Width    | Target                     |
| ---------- | -------- | -------------------------- |
| Default    | < 640px  | Mobile phone               |
| `sm:`      | ≥ 640px  | Large phone / small tablet |
| `lg:`      | ≥ 1024px | Desktop / tablet landscape |
| `xl:`      | ≥ 1280px | Large desktop              |

**Rules:**

- Mobile-first: style for mobile, add `sm:` / `lg:` overrides
- Sidebar hidden on mobile, visible on `lg:`
- Widget: always single column, always works at 360px

---

## Interaction Patterns

### Confirmation Dialogs

- Destructive actions require confirmation
- Use modal overlay, not browser `confirm()`
- Title: what will happen
- Body: brief explanation
- Actions: "Cancel" (ghost) + "Confirm" (destructive)

### Toast Notifications

- Bottom-right position
- Auto-dismiss after 5 seconds
- Types: success (green), error (red), info (blue)
- Max 3 visible at once

### Form Validation

- Validate on blur, not on every keystroke
- Show error below the input
- Disable submit button until form is valid
- Show loading state on submit

---

## Accessibility

- All interactive elements must have `focus-visible:ring-2 focus-visible:ring-indigo-500`
- Form inputs must have associated labels
- Color contrast: minimum 4.5:1 for text
- Status badges use dot + text (not color alone)
- Skip link for keyboard navigation
- Proper heading hierarchy (h1 → h2 → h3)
