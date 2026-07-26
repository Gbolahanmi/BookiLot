# Bookilot — Build Plan

## Timeline Summary

| Week | Focus | Deliverable |
|------|-------|-------------|
| 1 | Foundation | Project init, schema, auth, DB connection |
| 2 | Core Logic | Booking service (availability, create, cancel) — tested |
| 3 | API Layer | All API routes with zod validation |
| 4-5 | Dashboard UI | Onboarding, bookings, services, staff pages |
| 6 | Widget | Public booking widget (iframe-ready) |
| 7 | Integrations | Paystack + Twilio + Inngest jobs |
| 8 | Billing + Polish | Subscription page, error states, mobile testing |
| 9-10 | Testing + Deploy | E2E tests, staging, pilot onboarding |

---

## Phase 0: Foundation (Week 1)

### Done
- [x] Initialize Next.js project (TypeScript, Tailwind, App Router)
- [x] Create package.json with all dependencies
- [x] Configure tsconfig.json, postcss, drizzle.config.ts
- [x] Create `.env.example` with all required env vars
- [x] Create full directory structure
- [x] Create all Drizzle schema files (13 tables)
- [x] Create database connection (`src/lib/db/index.ts`)
- [x] Create constants file (`src/lib/constants.ts`)
- [x] Create utility functions (`src/lib/utils/index.ts`)

### In Progress
- [ ] Install dependencies (`pnpm install`)
- [ ] Run first migration
- [ ] Verify DB connection

### TODO
- [ ] Set up Neon database (create project, get connection string)
- [ ] Set up Auth0 (create application, organization, roles)
- [ ] Create `.env` with real credentials

---

## Phase 1: Core Booking Service (Week 2)

### Services Built
- [x] `availability.service.ts` — `computeAvailableSlots()`, `getRecommendedSlots()`
- [x] `booking.service.ts` — `createBooking()`, `cancelBooking()`, `completeBooking()`, `markNoShow()`, `getBookingByManageToken()`

### Tests Written
- [x] `utils/index.test.ts` — Utility function tests
- [x] `constants.test.ts` — Constants validation tests

### TODO
- [ ] Write unit tests for `availability.service.ts`
- [ ] Write unit tests for `booking.service.ts`
- [ ] Test with real DB data

---

## Phase 2: Auth + Multi-Tenancy (Week 1-2)

### Built
- [x] Auth0 config (`src/lib/auth/config.ts`)
- [x] Tenant resolution helpers (`src/lib/auth/tenant.ts`)
- [x] `requireAuth()`, `requireOwner()`, `getOrganizationId()`

### TODO
- [ ] Create Auth0 Organization
- [ ] Configure JWT org_id claim
- [ ] Test login flow
- [ ] Wire up middleware for protected routes

---

## Phase 3: API Routes (Week 3)

### Built
- [x] `GET /api/availability` — Slot calculation
- [x] `POST /api/bookings` — Create booking
- [x] `GET /api/bookings/manage/[token]` — Public lookup
- [x] `PATCH /api/bookings/manage/[token]` — Cancel via manage link
- [x] `POST /api/webhooks/paystack` — Payment webhook

### TODO
- [ ] `GET /api/services` — List services
- [ ] `POST /api/services` — Create service
- [ ] `PATCH /api/services/[id]` — Update service
- [ ] `DELETE /api/services/[id]` — Soft delete
- [ ] `GET /api/staff` — List staff
- [ ] `POST /api/staff` — Create staff
- [ ] `PATCH /api/staff/[id]` — Update staff
- [ ] `GET /api/customers` — List customers
- [ ] `POST /api/webhooks/auth0` — User lifecycle
- [ ] `POST /api/webhooks/twilio` — SMS callbacks

---

## Phase 4: Dashboard UI (Weeks 4-5)

### Built
- [x] Dashboard layout (`src/components/layout/dashboard-layout.tsx`)
- [x] Sidebar navigation (`src/components/layout/sidebar.tsx`)
- [x] Dashboard home page (`src/app/(auth)/dashboard/page.tsx`)
- [x] Services page (`src/app/(auth)/services/page.tsx`)
- [x] Bookings page (`src/app/(auth)/bookings/page.tsx`)

### TODO
- [ ] Onboarding wizard (3-step: business info → hours → first service)
- [ ] Bookings calendar view (with date picker, staff filter)
- [ ] Bookings list view (with status badges, filters)
- [ ] Services create/edit form (modal or inline)
- [ ] Staff management page
- [ ] Staff create/edit form
- [ ] Settings page (business profile)
- [ ] Billing/subscription page

---

## Phase 5: Booking Widget (Week 6)

### Built
- [x] Widget page structure (`src/app/(public)/widget/page.tsx`)
- [x] Service selection step
- [x] Date/time selection step
- [x] Customer details form
- [x] Confirmation screen

### TODO
- [ ] Wire to real API (fetch services, availability, create booking)
- [ ] Add OTP verification step
- [ ] Mobile responsive testing (360px width)
- [ ] Embed script generation for businesses
- [ ] Loading states, error states
- [ ] "Manage my booking" page (cancel/reschedule)

---

## Phase 6: Integrations (Week 7)

### Built
- [x] Paystack provider (`src/lib/payments/index.ts`)
- [x] Twilio SMS (`src/lib/sms/index.ts`)
- [x] Resend email (`src/lib/email/index.ts`)
- [x] Inngest setup (`src/lib/jobs/inngest.ts`)

### TODO
- [ ] Test Paystack initialize + verify flow
- [ ] Test Twilio SMS send
- [ ] Test Resend email send
- [ ] Deploy Inngest functions
- [ ] Set up webhook endpoints with real signatures

---

## Phase 7: Billing + Polish (Week 8)

### TODO
- [ ] Billing page (current plan, usage, upgrade)
- [ ] Paystack subscription integration
- [ ] Empty states on every screen
- [ ] Loading states (skeletons)
- [ ] Error states (try again, contact support)
- [ ] Permission-denied states
- [ ] Mobile responsive fixes
- [ ] Dark mode (optional)

---

## Phase 8: Testing + Deploy (Weeks 9-10)

### TODO
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
DATABASE_URL=                    # Neon connection string

# Auth0
AUTH0_SECRET=                    # Random 32-char string
AUTH0_BASE_URL=                  # http://localhost:3000
AUTH0_ISSUER_BASE_URL=          # https://your-tenant.us.auth0.com
AUTH0_CLIENT_ID=                 # Auth0 application client ID
AUTH0_CLIENT_SECRET=             # Auth0 application client secret

# Upstash Redis
UPSTASH_REDIS_REST_URL=         # Redis REST URL
UPSTASH_REDIS_REST_TOKEN=       # Redis auth token

# Paystack
PAYSTACK_SECRET_KEY=             # sk_live_xxx
PAYSTACK_PUBLIC_KEY=             # pk_live_xxx
PAYSTACK_WEBHOOK_SECRET=         # whsec_xxx

# Twilio
TWILIO_ACCOUNT_SID=              # ACxxx
TWILIO_AUTH_TOKEN=               # Auth token
TWILIO_PHONE_NUMBER=             # +234xxx

# Resend
RESEND_API_KEY=                  # re_xxx

# Inngest
INNGEST_EVENT_KEY=               # Event key
INNGEST_SIGNING_KEY=             # Signing key

# App
NEXT_PUBLIC_APP_URL=             # http://localhost:3000
```
