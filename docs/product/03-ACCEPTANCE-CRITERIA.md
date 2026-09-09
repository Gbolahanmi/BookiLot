# Acceptance Criteria — MVP

Each criterion is a testable condition. If all criteria in a group pass, that feature is MVP-ready.

---

## Auth & Onboarding

### AC-A1: Registration
- [ ] User enters name, email, password on `/register`
- [ ] Password must be ≥ 8 characters
- [ ] User is created in DB with `status: "pending"`
- [ ] Verification email is sent
- [ ] User is redirected to `/verify-email`

### AC-A2: Email Verification
- [ ] User clicks link in email → `GET /api/auth/verify-email?token=jwt`
- [ ] User status changes to `"email_verified"`
- [ ] User is redirected to `/login?message=verified`
- [ ] Login page shows "Email verified successfully!" message
- [ ] Expired/invalid tokens show appropriate error

### AC-A3: Google OAuth
- [ ] User clicks "Continue with Google" on `/login` or `/register`
- [ ] After OAuth, user is redirected to `/onboarding` (new) or `/dashboard` (existing)
- [ ] Existing active users are NOT redirected to onboarding
- [ ] New users get status `"email_verified"` and no organization

### AC-A4: Login
- [ ] User enters email + password on `/login`
- [ ] Correct credentials → redirect to `/dashboard` (or `/onboarding` if no org)
- [ ] Wrong credentials → shows "Invalid email or password" error
- [ ] Google-only accounts see hint to use Google button

### AC-A5: Onboarding
- [ ] User completes 3 steps: business info → services → working hours
- [ ] On submit: org created, services created, hours created, user status → `"active"`
- [ ] User is redirected to `/dashboard`
- [ ] Active users cannot revisit `/onboarding` (redirected to `/dashboard`)

### AC-A6: Password Reset
- [ ] User requests reset on `/forgot-password`
- [ ] Reset email is sent with token link
- [ ] User sets new password on `/reset-password?token=jwt`
- [ ] Old password no longer works, new password works

---

## Booking Widget

### AC-W1: Service Selection
- [ ] Widget loads services from `/api/widget/services?orgId=<uuid>`
- [ ] Only active services are shown
- [ ] Each service shows name, description, duration, price
- [ ] User can select a service to proceed

### AC-W2: Date & Time Selection
- [ ] User picks a date (cannot pick past dates)
- [ ] Available time slots load from `/api/availability`
- [ ] Slots respect working hours, existing bookings, blocked times
- [ ] Recommended slots (next 3 available) are highlighted
- [ ] User can select a slot to proceed

### AC-W3: Booking Confirmation
- [ ] User enters name (required), phone (required), email (optional)
- [ ] On submit: booking created in DB with status `"pending"`
- [ ] Customer record is created or matched
- [ ] Confirmation screen shows service, date, time, manage URL

### AC-W4: Post-Booking Notifications
- [ ] SMS confirmation sent to customer phone
- [ ] Email confirmation sent to customer email (if provided)
- [ ] Inngest `booking.created` event fired (triggers 24h reminder)

### AC-W5: Booking Management Page
- [ ] `/bookings/manage/<token>` shows booking details
- [ ] Customer can see service, date, status
- [ ] Customer can cancel (if status is `"confirmed"` or `"pending"`)
- [ ] Already-cancelled bookings show "Cancelled" status (no cancel button)
- [ ] Invalid tokens show "Booking not found"

---

## Dashboard

### AC-D1: Stats Cards
- [ ] Today's bookings count is accurate
- [ ] This week's bookings count is accurate
- [ ] Monthly revenue shows actual dollar amount (not booking count)
- [ ] No-show rate is accurate percentage

### AC-D2: Today's Bookings
- [ ] List shows customer name, service, time, status
- [ ] Bookings are sorted by time
- [ ] Empty state shows when no bookings today

---

## Services

### AC-S1: Service List
- [ ] Services load from API with name, duration, price
- [ ] Empty state shows with "Add Service" CTA
- [ ] Each service has Edit button

### AC-S2: Add Service
- [ ] "Add Service" opens modal with form
- [ ] Fields: name (required), description, duration, price, buffer
- [ ] On submit: service created, list refreshes, modal closes
- [ ] Validation errors shown inline

### AC-S3: Edit Service
- [ ] "Edit" opens modal pre-filled with service data
- [ ] On submit: service updated, list refreshes, modal closes

### AC-S4: Delete Service
- [ ] "Delete" in edit modal shows confirmation
- [ ] On confirm: service soft-deleted (set `active: false`), removed from list
- [ ] Deleted services no longer appear in widget

---

## Staff

### AC-ST1: Staff List
- [ ] Staff members load from API with name, email, bio
- [ ] Each staff member has Edit and Delete buttons

### AC-ST2: Add Staff
- [ ] "Add Staff" opens modal with form
- [ ] Fields: name (required), email, bio
- [ ] On submit: staff created, list refreshes

### AC-ST3: Edit Staff
- [ ] "Edit" opens modal pre-filled with staff data
- [ ] On submit: staff updated, list refreshes

### AC-ST4: Delete Staff
- [ ] "Delete" shows confirmation
- [ ] On confirm: staff soft-deleted, removed from list

---

## Customers

### AC-C1: Customer List
- [ ] Customers load from API with name, phone, booking count, no-show count
- [ ] Search filters by name, email, or phone
- [ ] Responsive: table on desktop, cards on mobile

---

## Settings

### AC-SET1: Business Info
- [ ] Business name, phone, email, address load from API
- [ ] User can edit fields
- [ ] "Save" persists changes via `PATCH /api/settings`
- [ ] "Saved!" toast appears on success

### AC-SET2: Working Hours
- [ ] Hours load from `GET /api/settings/hours`
- [ ] Each day shows start time, end time, active toggle
- [ ] User can modify hours
- [ ] "Save" persists changes via `PATCH /api/settings/hours`
- [ ] Changes take effect for availability calculation

### AC-SET3: Timezone
- [ ] Timezone dropdown shows global timezone list
- [ ] Current timezone is pre-selected
- [ ] Change is saved with business info

---

## Billing

### AC-BL1: Plan Display
- [ ] Current plan name and limits are shown
- [ ] Usage bar shows bookings used vs max
- [ ] Plan comparison cards show Free/Pro/Enterprise

### AC-BL2: Upgrade Flow (P1)
- [ ] "Upgrade" button initiates Paystack subscription
- [ ] User is redirected to Paystack checkout
- [ ] On success: plan upgrades, page refreshes
- [ ] Webhook signature is verified

---

## Cross-Cutting

### AC-CC1: Toast Notifications
- [ ] Success toasts appear (green, bottom-right, auto-dismiss 5s)
- [ ] Error toasts appear (red, bottom-right, auto-dismiss 5s)
- [ ] Toasts appear for: service CRUD, settings save, booking cancel, staff CRUD

### AC-CC2: Authentication
- [ ] Unauthenticated users cannot access `/dashboard`, `/bookings`, etc.
- [ ] Pending users are redirected to `/verify-email`
- [ ] Email-verified users without org are redirected to `/onboarding`
- [ ] Active users are redirected away from `/onboarding`

### AC-CC3: Multi-Tenancy
- [ ] Org A cannot see Org B's services, bookings, customers
- [ ] All API routes filter by `organizationId` from session
- [ ] Widget requires `orgId` parameter

---

## Summary

| Category | Criteria | Pass Criteria |
|----------|----------|---------------|
| Auth & Onboarding | 22 | All must pass |
| Booking Widget | 16 | All must pass |
| Dashboard | 6 | All must pass |
| Services | 12 | All must pass |
| Staff | 9 | All must pass |
| Customers | 3 | All must pass |
| Settings | 8 | All must pass |
| Billing | 5 | AC-BL1 must pass, AC-BL2 is P1 |
| Cross-Cutting | 9 | All must pass |
| **Total** | **90** | **85 pass for MVP** |
