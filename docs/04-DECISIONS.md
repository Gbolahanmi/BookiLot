# Decisions Log

Architecture, product, and technical decisions made during development. Each entry records what was decided, why, and what was considered.

---

## D1: AuthJS v5 over Auth0 SDK

**Date:** Initial setup  
**Decision:** Use AuthJS (NextAuth) v5 beta instead of Auth0's official SDK  
**Why:**
- AuthJS is framework-native for Next.js App Router
- No external Auth0 tenant required (simpler for solo dev)
- JWT strategy avoids Redis session storage
- Free (Auth0 charges per MAU after 7k)

**Tradeoffs:**
- Beta software (v5.0.0-beta.32) — encountered PKCE and redirect bugs
- Less enterprise-ready than Auth0 proper
- No built-in multi-tenancy (built custom `requireOwner()`/`requireStaff()`)

**Status:** Locked in. Working after 8 bug fixes.

---

## D2: Drizzle over Prisma

**Date:** Initial setup  
**Decision:** Use Drizzle ORM instead of Prisma  
**Why:**
- Lighter bundle size (no binary engine)
- Closer to SQL — easier to debug queries
- Better serverless support (no connection pooler issues)
- TypeScript-first, no codegen step

**Tradeoffs:**
- Smaller ecosystem, fewer tutorials
- No visual schema editor
- Manual migration management

**Status:** Locked in. No regrets.

---

## D3: JWT Sessions over Database Sessions

**Date:** Auth setup  
**Decision:** Use JWT strategy for sessions instead of database-stored sessions  
**Why:**
- No database read on every request (performance)
- Works with serverless functions (no sticky sessions)
- Simpler architecture for single-server deployment

**Tradeoffs:**
- Cannot invalidate tokens server-side (must wait for expiry)
- JWT payload grows with each callback (status, orgId refreshed from DB)
- Token size limits (not an issue for our payload)

**Status:** Locked in. JWT callback now fetches fresh status from DB on every request (fixes stale token issue).

---

## D4: Shared Database, Tenant-Scoped Rows

**Date:** Architecture  
**Decision:** Multi-tenancy via `organizationId` column on every table, filtered at query time  
**Why:**
- Simpler than database-per-tenant or schema-per-tenant
- Works with Neon's serverless Postgres
- Easy to query across tenants (admin dashboard)
- No connection pool complexity

**Tradeoffs:**
- Must remember to filter by `organizationId` on every query (enforced via `requireOwner()`/`requireStaff()`)
- Data isolation depends on code correctness, not database constraints
- Large tenants could affect query performance for others

**Status:** Locked in. Enforced via middleware + tenant helpers.

---

## D5: Inngest over Custom Cron

**Date:** Integrations  
**Decision:** Use Inngest for background jobs instead of custom cron/Vercel cron  
**Why:**
- Serverless-native (no worker processes)
- Built-in retry, scheduling, idempotency
- Event-driven (booking.created triggers reminder)
- Free tier covers our needs

**Tradeoffs:**
- External service dependency
- Requires INNGEST_SIGNING_KEY + INNGEST_EVENT_KEY
- Debugging requires Inngest dashboard

**Status:** Locked in. Functions wired, needs keys in `.env`.

---

## D6: Paystack over Stripe

**Date:** Architecture  
**Decision:** Use Paystack as primary payment provider  
**Why:**
- Better support for African payment methods (card, bank transfer, USSD)
- Lower fees for Nigeria (our initial market)
- NGN payouts to Nigerian bank accounts
- Stripe has limited African coverage

**Tradeoffs:**
- Less global coverage (can add Stripe later for other markets)
- Smaller developer community than Stripe
- Documentation is less comprehensive

**Status:** Locked in. Stripe can be added as secondary provider in Phase 2.

---

## D7: Widget-First, Marketplace Second

**Date:** Vision  
**Decision:** Launch with embeddable booking widget, add marketplace/directory in Phase 2  
**Why:**
- Widget is the core value (accept bookings online)
- Marketplace requires critical mass (businesses + customers)
- Widget can be sold immediately; marketplace needs network effects
- Faster time to revenue

**Tradeoffs:**
- No organic discovery channel at launch
- Must drive business owner adoption directly
- Customer acquisition depends on business owners embedding widget

**Status:** Locked in.

---

## D8: Single Next.js App, No Monorepo

**Date:** Architecture  
**Decision:** One Next.js application for dashboard, widget, API, and marketing  
**Why:**
- Solo developer — no team to justify monorepo complexity
- Shared code between dashboard and widget (auth, utils, types)
- Single deployment (Vercel)
- Simpler CI/CD

**Tradeoffs:**
- Widget bundle includes dashboard dependencies (larger iframe payload)
- Marketing site shares bundle with app (acceptable for now)
- Cannot deploy widget independently

**Status:** Locked in. Can extract widget to separate app later if bundle size becomes an issue.

---

## D9: Gmail SMTP over Dedicated Email Service

**Date:** Integrations  
**Decision:** Use Gmail SMTP (via Nodemailer) instead of SendGrid/Mailgun  
**Why:**
- Free (500 emails/day)
- No setup beyond App Password
- Good deliverability for small volumes
- Can switch to SendGrid/Mailgun later without code changes (same Nodemailer interface)

**Tradeoffs:**
- Gmail may flag high volume as spam
- No email analytics (open rates, click rates)
- App password rotation needed periodically

**Status:** Locked in. FROM_EMAIL must match Gmail address for reliability.

---

## D10: No Rate Limiting at Launch

**Date:** Security  
**Decision:** Skip rate limiting on booking creation for MVP  
**Why:**
- Low traffic expected (pilot businesses only)
- Booking creation requires valid orgId + serviceId (not easily automated)
- Rate limiting adds Redis dependency + complexity
- Can add after pilot if abuse occurs

**Tradeoffs:**
- Vulnerable to script abuse (someone could spam bookings)
- No protection against DDoS at application layer

**Status:** Planned as P2 task (T13). Add via Upstash Redis when needed.

---

## D11: Globalized Code (USD/UTC)

**Date:** Session 2  
**Decision:** Remove hardcoded Nigeria references (NGN, ₦, Africa/Lagos, +234)  
**Why:**
- App should work for any country
- Defaults to UTC timezone and USD currency
- Onboarding auto-detects timezone
- Paystack supports multiple currencies

**Tradeoffs:**
- Lost "Nigeria-first" specificity in UI (can add locale detection later)
- Pricing page shows $29/mo instead of ₦15,000/mo

**Status:** Locked in. Can add locale-based pricing in Phase 2.

---

## Summary

| # | Decision | Status | Reversible? |
|---|----------|--------|-------------|
| D1 | AuthJS v5 | Locked in | Yes (migration needed) |
| D2 | Drizzle | Locked in | Yes (migration needed) |
| D3 | JWT sessions | Locked in | Yes |
| D4 | Shared DB multi-tenancy | Locked in | Yes (complex) |
| D5 | Inngest | Locked in | Yes (replace with cron) |
| D6 | Paystack | Locked in | Yes (add Stripe) |
| D7 | Widget-first | Locked in | N/A (product strategy) |
| D8 | Single Next.js app | Locked in | Yes (extract widget) |
| D9 | Gmail SMTP | Locked in | Yes (switch provider) |
| D10 | No rate limiting | Temporary | Yes (add later) |
| D11 | Globalized code | Locked in | Yes (add locale) |
