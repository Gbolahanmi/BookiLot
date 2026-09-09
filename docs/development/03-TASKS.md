# Tasks — MVP Gap Closure

## Priority Legend

- **P0** — Blocking: app is unusable without this
- **P1** — Important: significantly degrades experience
- **P2** — Nice to have: polish, can ship without

---

Used Swr try understand more on it
Who can cancle the bookings, auditLog,
bookings page should atleast show calender n table even if no bookings yet when show error or empty state under
sms not tested

Delaying Inggest for now
Email spam

## P0 — Must Fix Before MVP

### T1: Render `<Toaster />` in root layout

- **Requirement:** U1
- **File:** `src/app/layout.tsx`
- **Change:** Add `<Toaster />` after `{children}`

### T2: Fix cancellation window logic

- **Requirement:** B2
- **File:** `src/lib/services/booking.service.ts:155`
- **Change:** Invert `isBefore` check — block if NOW is AFTER deadline (within 2h of appointment)

### T3: Fix dashboard revenue display

- **File:** `src/app/api/dashboard/stats/route.ts`
- **Change:** Sum `depositAmountCents` instead of counting `depositPaid::int`, or change label from `$X` to `X bookings with deposits`

### T4: Connect settings working hours to DB

- **File:** `src/app/(auth)/settings/page.tsx`
- **Change:**
  - On mount: `GET /api/settings/hours` → populate state
  - On save: `PATCH /api/settings/hours` → persist changes
  - Replace `defaultValue` with controlled `value` inputs
- **Effort:** 30 min
- **Status:** `[ ]`

### T5: Create `/bookings/manage/[token]` frontend page

- **Requirement:** W7, B4
- **File:** New page at `src/app/(public)/bookings/manage/[token]/page.tsx`
- **Change:**
  - Fetch booking details from `GET /api/bookings/manage/[token]`
  - Show: service name, date/time, status, customer name
  - Show cancel button (calls `PATCH /api/bookings/manage/[token]`)
  - Handle loading, error, and already-cancelled states
- **Effort:** 1 hr
- **Status:** `[ ]`

### T6: Add staff edit modal

- **Requirement:** ST3
- **File:** `src/app/(auth)/staff/page.tsx`
- **Change:** Create `StaffModal` component (reuse `ServiceModal` pattern), wire edit button to open modal with pre-filled data, submit to `PATCH /api/staff/[id]`
- **Effort:** 45 min
- **Status:** `[ ]`

### T7: Add staff delete UI

- **Requirement:** ST4
- **File:** `src/app/(auth)/staff/page.tsx`
- **Change:** Add delete button in staff list, confirmation dialog, call `DELETE /api/staff/[id]`
- **Effort:** 15 min
- **Status:** `[ ]`

### T8: Add email field to staff API schema

- **Requirement:** ST5
- **File:** `src/app/api/staff/route.ts`
- **Change:** Add `email: z.string().email().optional()` to `createStaffSchema`
- **Effort:** 5 min
- **Status:** `[ ]`

### T9: Staff invitation & login flow

- **Requirement:** ST6, ST7, ST8
- **Files:**
  - `src/app/api/staff/route.ts` — create user account with role: "staff"
  - `src/lib/email/templates.ts` — add staff invitation template
  - `src/components/layout/sidebar.tsx` — hide settings/billing for staff
  - `src/middleware.ts` — staff role routing
- **Change:**
  - When owner adds staff, create a user account (status: "pending", role: "staff")
  - Send invitation email with link to set password
  - Staff member sets password → status: "email_verified" → can log in
  - Staff sees limited sidebar (no settings, no billing)
  - Staff can view bookings and customers but not modify settings
- **Effort:** 2-3 hrs
- **Status:** `[ ]`

---

## P1 — Should Fix Before Pilot

### T9: Paystack subscription upgrade flow

- **Requirement:** BL3, BL4
- **Files:** `src/app/(auth)/billing/page.tsx`, new `src/app/api/billing/upgrade/route.ts`
- **Change:**
  - Create `POST /api/billing/upgrade` that initializes Paystack subscription
  - Wire "Upgrade" buttons to call API and redirect to Paystack checkout
  - Handle webhook for subscription activation
- **Effort:** 3-4 hrs
- **Status:** `[ ]`

### T10: Verify Paystack webhook signature

- **Requirement:** Security
- **File:** `src/app/api/webhooks/paystack/route.ts`
- **Change:** Verify `x-paystack-signature` header using `PAYSTACK_WEBHOOK_SECRET`
- **Effort:** 30 min
- **Status:** `[ ]`

### T11: Add timezone dropdown to settings

- **Requirement:** SET3
- **File:** `src/app/(auth)/settings/page.tsx`
- **Change:** Add timezone select (reuse global timezone list from onboarding), save via `PATCH /api/settings`
- **Effort:** 15 min
- **Status:** `[ ]`

---

## P2 — Polish (Can Ship Without)

### T12: Booking calendar view

- **Requirement:** B6
- **File:** `src/app/(auth)/bookings/page.tsx`
- **Change:** Build calendar grid showing bookings by day, clickable to see details
- **Effort:** 3-4 hrs
- **Status:** `[ ]`

### T13: Rate limiting on booking creation

- **Requirement:** Security
- **File:** `src/middleware.ts` or `src/app/api/bookings/route.ts`
- **Change:** Add rate limit (e.g., 10 bookings/min per IP) using Upstash Redis
- **Effort:** 1 hr
- **Status:** `[ ]`

### T14: Role-based UI filtering

- **Requirement:** Staff sees limited nav
- **File:** `src/components/layout/sidebar.tsx`
- **Change:** Hide settings/billing/staff nav items for staff users
- **Effort:** 30 min
- **Status:** `[ ]`

---
