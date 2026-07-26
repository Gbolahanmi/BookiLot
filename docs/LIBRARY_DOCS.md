# Bookilot — Library & Dependency Documentation

## Core Dependencies

### Next.js 15 (App Router)
- **Purpose:** Full-stack React framework — server components, API routes, file-based routing
- **Docs:** https://nextjs.org/docs
- **Key patterns used:**
  - `app/(auth)/` — route group for authenticated dashboard
  - `app/(public)/` — route group for public pages
  - `app/api/` — API route handlers
  - Server components by default, `"use client"` for interactivity

### Drizzle ORM
- **Purpose:** TypeScript ORM for PostgreSQL — schema definition, migrations, type-safe queries
- **Docs:** https://orm.drizzle.team/docs
- **Key patterns:**
  - `pgTable()` for schema definition
  - `drizzle-neon-http` for Neon serverless driver
  - Schema files in `src/lib/db/schema/`
  - Migrations output to `drizzle/` directory
- **Commands:**
  ```bash
  pnpm db:generate   # Generate migration SQL
  pnpm db:migrate    # Run migrations
  pnpm db:push       # Push schema directly (dev)
  pnpm db:studio     # Open Drizzle Studio
  ```

### Auth0 (@auth0/nextjs-auth0)
- **Purpose:** Authentication + multi-tenancy via Organizations
- **Docs:** https://auth0.com/docs/authenticate/login/nextjs
- **Key patterns:**
  - One Auth0 Organization per business (tenant)
  - JWT contains `org_id` claim → maps to `organizations.id`
  - Roles: `owner`, `staff`, `super_admin`
  - `auth0.getSession()` for server-side session
- **Config:** `src/lib/auth/config.ts`

### Neon (@neondatabase/serverless)
- **Purpose:** Serverless PostgreSQL — scales to zero, connection pooling
- **Docs:** https://neon.tech/docs/serverless/serverless-driver
- **Usage:** `neon()` driver for HTTP queries, used by Drizzle

### Upstash Redis (@upstash/redis, @upstash/ratelimit)
- **Purpose:** Serverless Redis for rate limiting + caching
- **Docs:** https://upstash.com/docs
- **Usage:**
  - Rate limit public API endpoints (widget, availability check)
  - Cache availability lookups (TODO)

### Inngest
- **Purpose:** Serverless background job orchestration
- **Docs:** https://www.inngest.com/docs
- **Key patterns:**
  - `inngest.createFunction()` for job definitions
  - `step.sleepUntil()` for delayed execution (reminders)
  - Event-driven: `inngest.send({ name: "booking.created", data: {...} })`
- **Jobs defined:** `src/lib/jobs/inngest.ts`

### Zod
- **Purpose:** TypeScript-first schema validation
- **Docs:** https://zod.dev
- **Usage:** Validate every API route input before processing
- **Pattern:**
  ```typescript
  const schema = z.object({ orgId: z.string().uuid() });
  const result = schema.safeParse(input);
  if (!result.success) return errorResponse(result.error);
  ```

### date-fns
- **Purpose:** Lightweight date manipulation (alternative to moment.js)
- **Docs:** https://date-fns.org/docs
- **Key functions used:**
  - `addMinutes()`, `addHours()` — time arithmetic
  - `startOfDay()`, `endOfDay()` — date boundaries
  - `format()` — date formatting
  - `parseISO()` — parse ISO strings
- **Why:** Tree-shakeable, immutably handles dates, no timezone pitfalls when used with UTC storage

### Tailwind CSS 4
- **Purpose:** Utility-first CSS framework
- **Docs:** https://tailwindcss.com/docs
- **Usage:** All styling via utility classes, no custom CSS needed
- **Config:** `postcss.config.mjs` with `@tailwindcss/postcss`

### Resend
- **Purpose:** Transactional email API
- **Docs:** https://resend.com/docs
- **Usage:** Booking confirmations, reminders, receipts
- **Config:** `src/lib/email/index.ts`

### Paystack
- **Purpose:** Payment processing (Nigeria-first)
- **Docs:** https://paystack.com/docs/api
- **Key endpoints:**
  - `POST /transaction/initialize` — start payment
  - `GET /transaction/verify/:ref` — verify payment
- **Config:** `src/lib/payments/index.ts`

### Twilio
- **Purpose:** SMS send/receive for booking channel + reminders + OTP
- **Docs:** https://www.twilio.com/docs/messaging
- **Key endpoints:**
  - `POST /Messages.json` — send SMS
- **Config:** `src/lib/sms/index.ts`

---

## Dev Dependencies

### Vitest
- **Purpose:** Unit testing framework (Vite-native)
- **Docs:** https://vitest.dev/guide/
- **Commands:**
  ```bash
  pnpm test        # Run tests in watch mode
  pnpm test:run    # Run tests once
  ```

### ESLint + eslint-config-next
- **Purpose:** Code linting
- **Config:** Built into Next.js, `next lint` runs it

### TypeScript
- **Purpose:** Type safety across the entire codebase
- **Config:** `tsconfig.json`
- **Key settings:** strict mode, path aliases (`@/*` → `./src/*`)

---

## Shared Utilities

### cn() — Class Name Merging
```typescript
import { cn } from "@/lib/utils";
// Combines clsx + tailwind-merge for conditional classes
cn("px-4", isActive && "bg-blue-500", className)
```

### formatPrice() — Currency Formatting
```typescript
formatPrice(500000, "NGN") // "₦5,000"
```

### formatDuration() — Duration Display
```typescript
formatDuration(30)  // "30min"
formatDuration(90)  // "1h 30min"
```

### generateToken() — Random Token Generation
```typescript
generateToken(32)  // "aB3xY9..." (32 chars)
```

### generateShortCode() — Booking Short Code
```typescript
generateShortCode(6)  // "K7M2N4" (no ambiguous chars)
```

### slugify() — URL-safe Slugs
```typescript
slugify("My Business!")  // "my-business"
```

---

## Constants Reference

All constants are centralized in `src/lib/constants.ts`. Key groups:

- `BOOKING_STATUS` — pending, confirmed, cancelled, completed, no_show
- `BOOKING_CHANNEL` — web, sms, voice
- `USER_ROLE` — owner, staff, super_admin
- `SUBSCRIPTION_PLAN` — free, pro, enterprise
- `PAYMENT_PROVIDER` — paystack, stripe
- `DAYS_OF_WEEK` — 0=Sunday through 6=Saturday
- `PLAN_LIMITS` — Per-plan restrictions (bookings/month, staff, features)
- `DEFAULT_TIMEZONE` — "Africa/Lagos"
- `DEFAULT_CURRENCY` — "NGN"
- `CANCELLATION_WINDOW_HOURS` — 2
- `REMINDER_HOURS_BEFORE` — 24
- `OTP_LENGTH` — 6
- `RATE_LIMIT` — Rate limit configs per endpoint type
- `WIDGET_CONFIG` — Widget-specific settings
- `STATUS_COLORS` — UI color mappings for booking statuses
- `NAV_ITEMS` — Dashboard navigation labels + hrefs
