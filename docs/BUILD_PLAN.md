## Phase 1: Core Booking Service (Week 2) — COMPLETE

- [x] `availability.service.ts` — `computeAvailableSlots()`, `getRecommendedSlots()`
- [x] `booking.service.ts` — `createBooking()`, `cancelBooking()`, `completeBooking()`, `markNoShow()`, `getBookingByManageToken()`
- [x] Unit tests for utilities, constants, availability, booking

---

## Phase 2: Auth + Multi-Tenancy (Week 1-2) — COMPLETE

### Built

- [x] AuthJS config with Google + Credentials providers
- [x] bcrypt password hashing
- [x] JWT token helpers (email verification + password reset)
- [x] Tenant resolution helpers (`requireAuth()`, `requireOwner()`, `requireStaff()`, `requireActive()`)
- [x] Status-based middleware routing (`pending → email_verified → active`)
- [x] Session provider + type augmentation

### Auth Pages

- [x] Login page (email/password + Google OAuth)
- [x] Register page (name, email, password)
- [x] Forgot password page (email input → sends reset link)
- [x] Reset password page (token-based → new password)
- [x] Email verification page (with resend functionality)
- [x] Onboarding banner (shows for `email_verified` users)

### Auth API Routes

- [x] `POST /api/auth/register` — creates user with `status: "pending"`, sends verification email
- [x] `GET /api/auth/verify-email?token=jwt` — verifies email, sets `status: "email_verified"`
- [x] `POST /api/auth/resend-verification` — resends verification email
- [x] `POST /api/auth/forgot-password` — generates JWT, sends reset email
- [x] `POST /api/auth/reset-password` — verifies JWT, updates password
- [x] `POST /api/onboarding/complete` — creates org/services/hours, sets `status: "active"`

### Account Lifecycle

```
Register (status: "pending")
    ↓
Verify Email (status: "email_verified")
    ↓
Complete Onboarding (status: "active")
    ↓
Full Dashboard Access
```

---

## Phase 3: API Routes (Week 3) — COMPLETE

- [x] `GET /api/availability` — Slot calculation
- [x] `POST /api/bookings` — Create booking
- [x] `GET /api/bookings/manage/[token]` — Public lookup
- [x] `PATCH /api/bookings/manage/[token]` — Cancel via manage link
- [x] `POST /api/webhooks/paystack` — Payment webhook
- [x] `GET /api/services` — List services
- [x] `POST /api/services` — Create service
- [x] `PATCH /api/services/[id]` — Update service
- [x] `DELETE /api/services/[id]` — Soft delete
- [x] `GET /api/staff` — List staff
- [x] `POST /api/staff` — Create staff
- [x] `PATCH /api/staff/[id]` — Update staff
- [x] `GET /api/customers` — List customers

---

## Phase 4: Dashboard UI (Weeks 4-5) — COMPLETE

- [x] Dashboard layout with sidebar navigation
- [x] Dashboard home page (stats, today's bookings)
- [x] Services page (list, empty state)
- [x] Bookings page (calendar/list toggle)
- [x] Staff page (add form, list)
- [x] Customers page (search, list)
- [x] Settings page (business info, working hours)
- [x] Billing page (plan display, upgrade options)
- [x] Onboarding wizard (3-step: business → services → hours)

---

## Phase 5: Booking Widget (Week 6) — COMPLETE

- [x] Widget page structure (4-step flow)
- [x] Service selection step (fetched from API)
- [x] Date/time selection step (with recommended slots)
- [x] Customer details form (name, phone, email)
- [x] Confirmation screen (with manage URL)
- [x] Wired to real API endpoints

---

## Phase 6: Integrations (Week 7) — COMPLETE

- [x] Paystack provider (`src/lib/payments/index.ts`)
- [x] Twilio SMS (`src/lib/sms/index.ts`)
- [x] Nodemailer email (`src/lib/email/index.ts`)
- [x] Email templates (`src/lib/email/templates.ts`)
- [x] Inngest setup (`src/lib/jobs/inngest.ts`)

### Email System Details

- **Transporter:** Nodemailer with configurable SMTP
- **Templates:** 4 types (verification, password reset, booking confirmation, booking reminder)
- **Helpers:** `sendVerificationEmail()`, `sendPasswordResetEmail()`, `sendBookingConfirmationEmail()`, `sendBookingReminderEmail()`
- **Configuration:** All via env vars (`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL`, `FROM_NAME`)

### SMTP Provider Options

| Provider | Free Tier     | Notes               |
| -------- | ------------- | ------------------- |
| Gmail    | 500/day       | Needs App Password  |
| SendGrid | 100/day       | Good deliverability |
| Mailgun  | Pay-as-you-go | Good for Africa     |
| Brevo    | 300/day       | Supports SMTP       |

---

## Phase 7: Billing + Polish (Week 8) — TODO

- [ ] Billing page (current plan, usage, upgrade)
- [ ] Paystack subscription integration
- [ ] Role-based UI filtering (staff sees limited nav)
- [ ] Empty states on every screen
- [ ] Loading states (skeletons)
- [ ] Error states (try again, contact support)
- [ ] Permission-denied states
- [ ] Mobile responsive fixes
- [ ] Dark mode (optional)

---

## Phase 8: Testing + Deploy (Weeks 9-10) — TODO

- [ ] E2E tests (Playwright) for booking flow
- [ ] E2E tests for cancellation flow
- [ ] E2E tests for widget embed
- [ ] Set up Vercel staging environment
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Onboard 2-3 pilot businesses
- [ ] Collect feedback
- [ ] Iterate on critical issues

---

MVP Flow (What You Need to Ship)
Phase 1: Security (Critical — Do First)
Add auth to all API routes — wrap with requireAuth() or requireOwner()
Add orgId filtering to all admin endpoints
Fix the widget booking flow — create customer on-the-fly instead of customerId: "temp"
Fix booking cancel — pass correct orgId
Add rate limiting — Upstash Redis is already configured
Phase 2: Core Flow (What Users Actually Do)
Registration → Onboarding → Dashboard (already works)
Create service → share booking link
Customer books → owner gets notification
Booking confirmation → email + optional SMS
Cancel/reschedule via manage link
Phase 3: Billing
Subscription enforcement — check plan limits before allowing actions
Paystack subscription creation — when user upgrades
Webhook handling — subscription created, updated, cancelled
Phase 4: Notifications
Inngest integration — wire up the stub endpoint
Booking reminders — 24h before via email + SMS
No-show tracking — auto-mark after 15 min
