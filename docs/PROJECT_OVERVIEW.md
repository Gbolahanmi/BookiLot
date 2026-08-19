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
| Email    | Resend                | Confirmations, reminders, receipts                 |
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
