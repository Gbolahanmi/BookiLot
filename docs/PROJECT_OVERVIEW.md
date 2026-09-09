# Bookilot — Project Overview

## What Is Bookilot?

A multi-tenant SaaS platform that lets any local service business (salons, clinics, consultants, trainers, etc.) accept bookings from their customers through multiple channels — a web widget, SMS/text, and (later) an AI voice agent. Business owners get a dashboard to manage services, staff, bookings, and their subscription.

---

## Target Users

| User                      | Role           | What They Care About                                                     |
| ------------------------- | -------------- | ------------------------------------------------------------------------ |
| **Business Owner**        | Primary buyer  | Reducing no-shows, filling calendar, understanding business through data |
| **Business Staff**        | Secondary user | Their own calendar, managing their bookings                              |
| **Customer (guest)**      | End user       | Booking quickly, minimal friction, no account required                   |
| **Customer (registered)** | Returning user | Saved history, loyalty across businesses                                 |
| **Platform Admin**        | You/your team  | Managing tenants, support, billing                                       |

---

## Core Value Proposition

Most competitors (Calendly, Fresha) only do web booking well. Bookilot differentiates with:

1. **Multi-channel booking** — web, SMS, voice — all powered by the same booking logic
2. **No-show reduction** — two-way reminders, deposit requirements, no-show tracking
3. **Business intelligence** — insights from booking patterns, revenue, peak hours
4. **Marketplace discovery** — customers can find businesses by category/location (Phase 2)

Not "AI" as a buzzword — AI in service of fewer missed appointments and better scheduling.

---

## Tech Stack

| Layer    | Tool                  | Why                                                |
| -------- | --------------------- | -------------------------------------------------- |
| Frontend | Next.js (App Router)  | Server components for dashboard, client for widget |
| Backend  | Next.js API Routes    | Thin controllers over service layer                |
| Auth     | Auth0 (Organizations) | Multi-tenant, RBAC, JWT org claims                 |
| Database | PostgreSQL (Neon)     | Relational integrity, serverless-friendly          |
| ORM      | Drizzle               | Lighter than Prisma, closer to SQL                 |
| Caching  | Upstash Redis         | Rate limiting, availability caching                |
| Jobs     | Inngest               | Serverless background jobs (reminders, no-shows)   |
| Payments | Paystack              | Nigeria-first, NGN payouts                         |
| SMS      | Twilio                | Booking channel + OTP + reminders                  |
| Email    | Nodemailer            | Confirmations, reminders, receipts                 |
| Testing  | Vitest                | Unit tests for booking logic                       |
| Hosting  | Vercel                | Frontend + API hosting                             |

---

## Booking Channels

All three channels call the **same underlying service functions** — no duplicated booking logic.

### 1. Web Widget (v1)

- Embeddable via iframe on business websites
- Service → Date/Time → Details → Confirm
- Mobile-first, works in 360px iframe
- Manage booking via link/short code

### 2. SMS/Text (v1)

- Customer texts business number
- Scripted conversation state machine
- Twilio handles SMS send/receive
- Used for reminders + two-way confirmation

### 3. Voice AI (Phase 2)

- ElevenLabs conversational agent
- Tool calls: `check_availability`, `create_booking`
- Business-specific prompts
- Phone number per business/location

---

# 01 — Vision

## Where Bookilot Is Going

### Phase 1: MVP (Now)

A working booking platform. Business owners sign up, set up their services, embed a widget, and start accepting bookings. Customers book, get confirmations, get reminders. Owners see their dashboard.

**Success metric:** 3 pilot businesses actively using Bookilot to manage real bookings.

### Phase 2: Differentiators (Months 3-6)

The features that make Bookilot worth switching to:

- **Voice booking channel** — AI phone agent that answers calls and books appointments
- **Two-way SMS** — Customers confirm/cancel via text, not just receive notifications
- **Deposits & prepayment** — Reduce no-shows with upfront payment
- **Waitlist with auto-notification** — Fill cancellations automatically
- **Business insights** — Revenue trends, peak hours, no-show patterns, customer retention
- **Marketplace/directory** — Customers discover businesses by category and location

### Phase 3: Ecosystem (Months 6-12)

The platform effects:

- **Loyalty tracking** — Repeat customer recognition
- **Post-appointment reviews** — Build reputation
- **Calendar sync** — Google Calendar, Outlook integration
- **Zapier/Make** — Connect to other tools
- **AI-generated suggestions** — Optimize pricing, staffing, hours
- **Multi-location** — One account, multiple branches

## The Big Idea

Most booking tools are scheduling tools. Bookilot is a **revenue tool** that happens to do scheduling.

The booking widget is the entry point. The real value is:

- Fewer no-shows (reminders + deposits + tracking)
- More bookings (online presence + marketplace)
- Better decisions (insights from booking data)
- Less manual work (automated confirmations, reminders, follow-ups)

## What We're Not Building

- A general-purpose calendar (use Google Calendar for that)
- A CRM (we track customers, not full relationships)
- A payment processor (Paystack handles that)
- An all-in-one business tool (we do bookings really well)

## Success Looks Like

- A salon owner in Lagos uses Bookilot instead of their WhatsApp group
- A clinic in Nairobi reduces no-shows from 30% to 10%
- A fitness studio fills cancellation slots automatically via waitlist
- Customers say "I love how easy it is to book" without thinking about the tool behind it

<!-- From Roadmap -->

## Phase 2: Differentiators (Months 3-6)

| Feature                            | Impact                         | Effort |
| ---------------------------------- | ------------------------------ | ------ |
| Voice booking channel (ElevenLabs) | High — unique selling point    | High   |
| Two-way SMS confirmation           | High — reduce no-shows further | Medium |
| Deposits & prepayment              | High — upfront commitment      | Medium |
| Waitlist with auto-notification    | Medium — fill cancellations    | Medium |
| Business insights dashboard        | Medium — data-driven decisions | Medium |
| Marketplace/directory              | Medium — discovery channel     | High   |

---

## Phase 3: Ecosystem (Months 6-12)

| Feature                      | Impact                         | Effort |
| ---------------------------- | ------------------------------ | ------ |
| Loyalty tracking             | Medium — retention             | Medium |
| Post-appointment reviews     | Medium — social proof          | Low    |
| Google Calendar/Outlook sync | Medium — reduce double-booking | Medium |
| Zapier/Make integration      | Low — power users              | Low    |
| AI-generated suggestions     | Low — differentiation          | High   |
| Multi-location support       | Medium — scale                 | High   |
