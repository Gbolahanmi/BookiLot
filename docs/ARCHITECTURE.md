# Bookilot — Architecture Document

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
├─────────────────┬─────────────────┬─────────────────────────────┤
│  Owner Dashboard │  Booking Widget │  Marketing Site             │
│  (Next.js App)   │  (iframe embed) │  (Next.js App Router)      │
│  /dashboard/*    │  /widget?org=X  │  /, /pricing                │
└────────┬────────┴────────┬────────┴─────────────┬───────────────┘
         │                  │                      │
         ▼                  ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER (Next.js Routes)                 │
├─────────────────────────────────────────────────────────────────┤
│  /api/bookings          │  /api/availability                    │
│  /api/services          │  /api/staff                           │
│  /api/customers         │  /api/webhooks/*                      │
│  /api/admin             │  /api/inngest                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER (lib/services/)                │
├─────────────────────────────────────────────────────────────────┤
│  availability.service.ts  │  booking.service.ts                 │
│  service.service.ts       │  staff.service.ts                   │
│  customer.service.ts      │  payment.service.ts                 │
│                                                                      │
│  Rules:                                                           │
│  - Route handlers are thin controllers                           │
│  - All business logic lives in service functions                 │
│  - Services call data access layer, never route handlers         │
│  - Services are pure functions, testable without HTTP            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                    │
├───────────────────────┬─────────────────────────────────────────┤
│  Drizzle ORM          │  PostgreSQL (Neon)                      │
│  src/lib/db/schema/*  │  Managed serverless Postgres            │
│  src/lib/db/index.ts  │                                         │
└───────────────────────┴─────────────────────────────────────────┘
```

---

## Multi-Tenancy Model

**Approach:** Shared database, tenant-scoped rows.

Every table (except global ones like Auth0 users) carries an `organizationId` column. This is enforced at the schema level and auto-applied via service functions.

```
Organization (tenant)
├── Users (owner/staff linked via Auth0)
├── Services
├── Staff Members
├── Bookings
├── Customers
├── Working Hours
├── Blocked Times
├── Payments
├── Subscriptions
├── Waitlist Entries
└── Audit Logs
```

### Tenant Resolution by Channel

| Channel | How orgId is resolved |
|---------|----------------------|
| Dashboard (owner/staff) | From Auth0 JWT `org_id` claim |
| Booking Widget | Passed as `orgId` URL param in embed script |
| SMS | Phone number → organization mapping (TODO) |
| Voice | Phone number → organization mapping (TODO) |

---

## Request Flow: Booking Creation

```
Customer clicks "Confirm Booking"
        │
        ▼
POST /api/bookings
        │
        ▼
┌──────────────────┐
│ Zod validation   │ ← Input validation
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ booking.service  │ ← Business logic
│  .createBooking()│
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────────┐
│ Idemp. │ │ Overlap    │ ← Atomic check
│ check  │ │ check      │
└────────┘ └────────────┘
    │         │
    └────┬────┘
         │
         ▼
┌──────────────────┐
│ Insert booking   │ ← DB write
│ (transaction)    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Trigger Inngest  │ ← Background jobs
│ (reminder job)   │
└────────┬─────────┘
         │
         ▼
    Return booking
```

---

## Data Flow: Availability Calculation

```
GET /api/availability?orgId=X&serviceId=Y&date=2025-01-15
        │
        ▼
┌──────────────────┐
│ Get service      │ ← duration + buffer
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Get working hrs  │ ← org-wide + staff-specific
│ for day of week  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Get existing     │ ← Non-cancelled bookings
│ bookings         │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Get blocked      │ ← Holidays, personal time
│ times            │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Generate slots   │ ← Working hours - bookings - blocked
│ Filter past time │
└────────┬─────────┘
         │
         ▼
    Return slots[]
```

---

## Authentication & Authorization

```
┌─────────────────────────────────────────┐
│  Auth0 Organizations                    │
│  ┌─────────────┐  ┌─────────────┐      │
│  │ Org: Salons │  │ Org: Clinics│ ...  │
│  │  └─ Owner   │  │  └─ Owner   │      │
│  │  └─ Staff   │  │  └─ Staff   │      │
│  └─────────────┘  └─────────────┘      │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│  JWT contains:                          │
│  - sub (Auth0 user ID)                 │
│  - org_id (Organization ID)            │
│  - role (owner | staff | super_admin)  │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│  Tenant Resolution                      │
│  1. Extract org_id from JWT             │
│  2. Query user → confirm orgId match    │
│  3. All subsequent queries filter by    │
│     organizationId                      │
└─────────────────────────────────────────┘
```

---

## Payment Architecture

```
┌─────────────────────────────────────────┐
│  PaymentProvider Interface              │
│  ├── initializePayment()                │
│  └── verifyPayment()                    │
└─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌──────────────────┐  ┌──────────────────┐
│ PaystackProvider │  │ StripeProvider   │
│ (Nigeria-first)  │  │ (Phase 2)        │
└──────────────────┘  └──────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│  Webhook: POST /api/webhooks/paystack   │
│  1. Verify signature                    │
│  2. Update payment record               │
│  3. Update booking.depositPaid          │
│  4. Confirm booking                     │
└─────────────────────────────────────────┘
```

---

## Background Jobs (Inngest)

| Job | Trigger | Purpose |
|-----|---------|---------|
| `send-reminder` | `booking.created` event | Sends SMS/email reminder 24h before appointment |
| `handle-no-shows` | `cron/15min` | Marks bookings as no-show after threshold |

---

## File Structure

```
bookilot/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth0-protected routes
│   │   │   ├── dashboard/            # Owner dashboard
│   │   │   ├── bookings/             # Bookings calendar/list
│   │   │   ├── services/             # Services CRUD
│   │   │   ├── staff/                # Staff CRUD
│   │   │   ├── billing/              # Subscription
│   │   │   └── settings/             # Business settings
│   │   ├── (public)/                 # No auth required
│   │   │   ├── page.tsx              # Landing page
│   │   │   ├── pricing/              # Pricing page
│   │   │   └── widget/               # Booking widget
│   │   └── api/                      # API routes
│   │       ├── bookings/             # Booking CRUD
│   │       ├── availability/         # Slot calculation
│   │       ├── services/             # Service management
│   │       ├── staff/                # Staff management
│   │       ├── webhooks/             # Paystack, Auth0, Twilio
│   │       ├── inngest/              # Background jobs
│   │       └── admin/                # Platform admin
│   ├── lib/
│   │   ├── db/                       # Drizzle schema + connection
│   │   │   ├── schema/               # Table definitions
│   │   │   └── index.ts              # DB client
│   │   ├── services/                 # Business logic
│   │   ├── auth/                     # Auth0 helpers
│   │   ├── payments/                 # Paystack abstraction
│   │   ├── sms/                      # Twilio abstraction
│   │   ├── email/                    # Resend abstraction
│   │   ├── jobs/                     # Inngest functions
│   │   ├── utils/                    # Shared utilities
│   │   └── constants.ts              # All constants
│   ├── components/
│   │   ├── ui/                       # Reusable UI components
│   │   ├── layout/                   # Layout components
│   │   └── booking/                  # Booking-specific components
│   └── types/                        # TypeScript types
├── drizzle/                          # Migration files
├── docs/                             # This documentation
├── .env.example
├── drizzle.config.ts
├── next.config.ts
├── vitest.config.ts
└── package.json
```
