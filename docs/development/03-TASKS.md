# Tasks — MVP Gap Closure

## Priority Legend

- **P0** — Blocking: app is unusable without this
- **P1** — Important: significantly degrades experience
- **P2** — Nice to have: polish, can ship without

---

## P0 — Must Fix Before MVP

### T1: Render `<Toaster />` in root layout
- **Requirement:** U1
- **File:** `src/app/layout.tsx`
- **Change:** Add `<Toaster />` after `{children}`
- **Effort:** 2 min
- **Status:** `[ ]`

### T2: Fix cancellation window logic
- **Requirement:** B2
- **File:** `src/lib/services/booking.service.ts:155`
- **Change:** Invert `isBefore` check — block if NOW is AFTER deadline (within 2h of appointment)
- **Effort:** 5 min
- **Status:** `[ ]`

### T3: Fix dashboard revenue display
- **Requirement:** D3
- **File:** `src/app/api/dashboard/stats/route.ts`
- **Change:** Sum `depositAmountCents` instead of counting `depositPaid::int`, or change label from `$X` to `X bookings with deposits`
- **Effort:** 10 min
- **Status:** `[ ]`

### T4: Connect settings working hours to DB
- **Requirement:** SET2
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

## Task Summary

| Priority | Count | Total Effort |
|----------|-------|-------------|
| P0 | 8 | ~2.5 hrs |
| P1 | 3 | ~4.5 hrs |
| P2 | 3 | ~5 hrs |
| **Total** | **14** | **~12 hrs** |

---

## Execution Order

```
Session 1 (P0 — ~2.5 hrs):
  T1 → T2 → T3 → T4 → T8 → T7 → T6 → T5

Session 2 (P1 — ~4.5 hrs):
  T10 → T11 → T9

Session 3 (P2 — as needed):
  T14 → T13 → T12
```
