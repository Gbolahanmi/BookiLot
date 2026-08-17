# 00 — Project Context

## What Is Bookilot?

Bookilot is a multi-tenant SaaS platform that lets local service businesses accept bookings from customers through a web widget, SMS, and (later) AI voice. Business owners get a dashboard to manage services, staff, bookings, and their subscription.

## The Problem

Local service businesses — salons, clinics, spas, fitness studios, consultants — still rely on phone calls, WhatsApp messages, and paper calendars to manage bookings. This leads to:

- **No-shows** with no automated follow-up
- **Double-bookings** from manual scheduling
- **No visibility** into revenue, peak hours, or customer patterns
- **Zero online presence** for customers to self-serve

Existing tools (Calendly, Fresha) either focus on enterprise or don't work well in emerging markets where Paystack, not Stripe, is the payment rail.

## Who It's For

| User | What They Need |
|------|---------------|
| **Business Owner** | Fill their calendar, reduce no-shows, understand their business |
| **Business Staff** | See their own schedule, manage their bookings |
| **Customer (guest)** | Book quickly, no account required |
| **Customer (registered)** | Saved history, returning visits |
| **Platform Admin** | Manage tenants, support, billing |

## How It Works

1. Business owner signs up → completes onboarding (business info, services, working hours)
2. Embeds a booking widget on their website (iframe)
3. Customer visits widget → picks service → picks date/time → enters details → books
4. Owner gets notified (dashboard, SMS, email)
5. Customer gets confirmation + 24h reminder
6. Owner manages everything from the dashboard

## Tech Stack

| Layer | Tool |
|-------|------|
| Frontend | Next.js 15 (App Router), Tailwind CSS v4 |
| Backend | Next.js API Routes, Drizzle ORM |
| Database | PostgreSQL (Neon) |
| Auth | AuthJS v5 (Google + Credentials) |
| Jobs | Inngest (reminders, no-show detection) |
| Payments | Paystack |
| SMS | Twilio |
| Email | Nodemailer (SMTP) |
| Hosting | Vercel |

## Key Decisions

1. **Widget-first** — Launch with embeddable widget, marketplace later
2. **Nigeria-first** — Paystack primary, but code is globalized (USD/UTC defaults)
3. **Solo dev** — Single Next.js app, no monorepo
4. **Drizzle over Prisma** — Lighter, closer to SQL
5. **Same booking logic for all channels** — Web, SMS, voice all call the same service functions
