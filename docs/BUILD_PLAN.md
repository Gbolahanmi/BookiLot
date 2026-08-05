# Bookilot — Build Plan

## Timeline Summary

| Week | Focus | Deliverable |
|------|-------|-------------|
| 1 | Foundation | Project init, schema, auth, DB connection |
| 2 | Core Logic | Booking service (availability, create, cancel) — tested |
| 3 | API Layer | All API routes with zod validation |
| 4-5 | Dashboard UI | Onboarding, bookings, services, staff pages |
| 6 | Widget | Public booking widget (iframe-ready) |
| 7 | Integrations | Paystack + Twilio + Inngest + Nodemailer |
| 8 | Billing + Polish | Subscription page, error states, mobile testing |
| 9-10 | Testing + Deploy | E2E tests, staging, pilot onboarding |

---

## Phase 0: Foundation (Week 1) — COMPLETE

- [x] Initialize Next.js project (TypeScript, Tailwind, App Router)
- [x] Create package.json with all dependencies
- [x] Configure tsconfig.json, postcss, drizzle.config.ts
- [x] Create `.env.example` with all required env vars
- [x] Create full directory structure
- [x] Create all Drizzle schema files (13 tables)
- [x] Create database connection (`src/lib/db/index.ts`)
- [x] Create constants file (`src/lib/constants.ts`)
- [x] Create utility functions (`src/lib/utils/index.ts`)

---

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
| Provider | Free Tier | Notes |
|----------|-----------|-------|
| Gmail | 500/day | Needs App Password |
| SendGrid | 100/day | Good deliverability |
| Mailgun | Pay-as-you-go | Good for Africa |
| Brevo | 300/day | Supports SMTP |

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

## Environment Variables Needed

```env
# Database
DATABASE_URL=                    # PostgreSQL connection string

# AuthJS
AUTH_SECRET=                     # Random 32-char string
AUTH_URL=                        # http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=                # Google OAuth client ID
GOOGLE_CLIENT_SECRET=            # Google OAuth client secret

# Upstash Redis
UPSTASH_REDIS_REST_URL=          # Redis REST URL
UPSTASH_REDIS_REST_TOKEN=        # Redis auth token

# Paystack
PAYSTACK_SECRET_KEY=             # sk_live_xxx
PAYSTACK_PUBLIC_KEY=             # pk_live_xxx
PAYSTACK_WEBHOOK_SECRET=         # whsec_xxx

# Twilio (SMS)
TWILIO_ACCOUNT_SID=              # ACxxx
TWILIO_AUTH_TOKEN=               # Auth token
TWILIO_PHONE_NUMBER=             # +234xxx

# SMTP (Email via Nodemailer)
SMTP_HOST=                       # smtp.gmail.com
SMTP_PORT=                       # 587
SMTP_SECURE=                     # false
SMTP_USER=                       # your@email.com
SMTP_PASS=                       # your-app-password
FROM_EMAIL=                      # bookings@bookilot.app
FROM_NAME=                       # Bookilot

# Inngest
INNGEST_EVENT_KEY=               # Event key
INNGEST_SIGNING_KEY=             # Signing key

# App
NEXT_PUBLIC_APP_URL=             # http://localhost:3000
```
