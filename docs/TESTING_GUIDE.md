# Bookilot — MVP Testing Guide

## What Was Built in Phase 1

### 1. Inngest Background Jobs
**File:** `src/app/api/inngest/route.ts`

**What it does:** Connects your app to Inngest's cloud service. Inngest polls your `/api/inngest` endpoint and executes functions when events arrive or cron triggers fire.

**How it works:**
1. Inngest sends a request to `POST /api/inngest`
2. The `serve()` handler routes it to the correct function
3. Functions can `step.sleepUntil()` to wait (e.g., 24h before appointment)
4. Functions can `step.run()` to execute code in Inngest's infrastructure

**Two functions wired:**
- `sendReminder` — Listens for `booking.created` event, sleeps until 24h before appointment, then sends SMS + email reminder
- `handleNoShows` — Runs every 15 min via cron, finds past bookings still marked "confirmed", marks them as no_show

**To test:**
1. Create free account at https://inngest.com
2. Connect your GitHub repo
3. Add to `.env`:
   ```
   INNGEST_SIGNING_KEY=signkey-prod-...
   INNGEST_EVENT_KEY=...
   ```
4. Deploy or run `npx inngest dev` locally
5. In Inngest dashboard, you'll see both functions registered
6. Create a booking → check Inngest dashboard for the `booking.created` event
7. The reminder function will sleep until 24h before, then execute

---

### 2. Booking Confirmations (SMS + Email)
**File:** `src/app/api/bookings/route.ts` (POST handler)

**What it does:** After a booking is created, sends:
- **SMS** via Twilio: "✅ Booking confirmed! [Service] on [Date] at [Time]. Manage/Cancel: [URL]"
- **Email** via Nodemailer: HTML confirmation with booking details + manage link

**How it works:**
1. Customer books via widget → `POST /api/bookings`
2. Booking is created in DB
3. `inngest.send({ name: "booking.created", data: { bookingId } })` fires (async, non-blocking)
4. `sendBookingConfirmations()` fires (async, non-blocking) — looks up customer/service/org, sends SMS + email

**To test:**
1. Go to `/widget?orgId=[your-org-id]`
2. Book a service with a real phone number and email
3. Check your phone for SMS confirmation
4. Check your email inbox for confirmation email
5. The manage URL in the message should open the booking management page

---

### 3. Settings API
**Files:** `src/app/api/settings/route.ts` + `src/app/api/settings/hours/route.ts`

**Endpoints:**

| Method | Path | Auth | What it does |
|--------|------|------|-------------|
| `GET` | `/api/settings` | requireOwner | Returns org name, phone, email, address, description, timezone |
| `PATCH` | `/api/settings` | requireOwner | Updates org settings |
| `GET` | `/api/settings/hours` | requireOwner | Returns working hours for the org |
| `PATCH` | `/api/settings/hours` | requireOwner | Replaces working hours (full replace, not partial) |

**To test:**
1. Log in as the business owner
2. Go to `/settings` — page should load without errors now
3. Change business name → click Save → refresh page → name should persist
4. Working hours: the page has time inputs but the save button isn't wired yet (UI work needed)

---

### 4. noShowCount Fix
**Files:** `src/lib/services/booking.service.ts` + `src/lib/jobs/inngest.ts`

**Bug:** `noShowCount: customers.noShowCount` was a column reference that just set the count to itself (no increment).

**Fix:** Changed to `noShowCount: sql\`${customers.noShowCount} + 1\`` which actually increments.

**To test:**
1. Create a booking, let the appointment time pass
2. Wait for the no-show cron to run (or trigger manually via Inngest dashboard)
3. Check the customer record — `noShowCount` should be 1 (was 0)

---

## Complete API Reference

### Public Endpoints (no auth)
| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/widget/services?orgId=xxx` | List active services for a business |
| `GET` | `/api/availability?orgId=xxx&serviceId=xxx&date=2024-01-15` | Get available time slots |
| `POST` | `/api/bookings` | Create a booking (accepts customer info) |
| `GET` | `/api/bookings/manage/[token]` | Look up booking by manage token |
| `PATCH` | `/api/bookings/manage/[token]` | Cancel a booking by manage token |

### Authenticated Endpoints (require login)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `GET` | `/api/services` | requireStaff | List org's services |
| `POST` | `/api/services` | requireOwner | Create a service |
| `PATCH` | `/api/services/[id]` | requireOwner | Update a service |
| `DELETE` | `/api/services/[id]` | requireOwner | Soft-delete a service |
| `GET` | `/api/staff` | requireStaff | List org's staff |
| `POST` | `/api/staff` | requireOwner | Create a staff member |
| `PATCH` | `/api/staff/[id]` | requireOwner | Update a staff member |
| `DELETE` | `/api/staff/[id]` | requireOwner | Soft-delete a staff member |
| `GET` | `/api/customers` | requireStaff | List org's customers |
| `GET` | `/api/bookings` | session check | List org's bookings |
| `GET` | `/api/settings` | requireOwner | Get org settings |
| `PATCH` | `/api/settings` | requireOwner | Update org settings |
| `GET` | `/api/settings/hours` | requireOwner | Get working hours |
| `PATCH` | `/api/settings/hours` | requireOwner | Update working hours |
| `GET` | `/api/dashboard/stats` | session check | Dashboard statistics |
| `GET` | `/api/dashboard/today-bookings` | session check | Today's bookings |

### Webhook Endpoints
| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/webhooks/paystack` | Paystack payment events |
| `POST/GET/PUT` | `/api/inngest` | Inngest function handler |

---

## How to Test Each Flow

### Flow 1: Full Booking (Widget → Confirmation → Reminder)

**Setup:** Ensure Twilio and SMTP are configured in `.env`

1. **Book via widget:**
   - Open `/widget?orgId=[your-org-id]`
   - Select a service → pick a date → pick a time
   - Enter name, phone, email → Confirm
   - You should see "Booking confirmed!" screen

2. **Verify confirmations:**
   - Check phone for SMS: "✅ Booking confirmed!"
   - Check email for confirmation with booking details

3. **Verify Inngest event:**
   - Go to Inngest dashboard → Events tab
   - You should see `booking.created` event with the booking ID

4. **Verify reminder (24h before):**
   - In Inngest dashboard → Functions tab → send-reminder
   - You'll see it sleeping until 24h before the appointment
   - If you want to test immediately: change `REMINDER_HOURS_BEFORE` in constants.ts to 0, create a booking in the future, and the reminder should fire immediately

### Flow 2: Settings Management

1. **View settings:**
   - Log in as owner → go to `/settings`
   - Page should load with current business info

2. **Update settings:**
   - Change business name → Save
   - Refresh page → name should persist
   - Or test via API: `curl -X PATCH /api/settings -H "Content-Type: application/json" -d '{"name":"New Name"}'`

### Flow 3: No-Show Detection

1. **Create a booking** for a time in the near future
2. **Wait for the appointment to pass** (or set `NO_SHOW_THRESHOLD_MINUTES` to 0 in constants.ts for testing)
3. **Wait for the cron** (every 15 min) or trigger manually in Inngest dashboard
4. **Check:**
   - Booking status should be `no_show`
   - Customer's `noShowCount` should be incremented

### Flow 4: Cancel Booking via Manage Link

1. **Get the manage URL** from the confirmation SMS/email
2. **Open the URL** — shows booking details
3. **Click cancel** → booking status changes to `cancelled`
4. **Verify:** The booking list in dashboard shows it as cancelled

---

## Environment Variables Required

```bash
# Database (already configured)
DATABASE_URL="postgresql://..."

# Auth (already configured)
AUTH_SECRET="..."
AUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Inngest (NEW — you need to add these)
INNGEST_SIGNING_KEY="signkey-prod-..."    # From inngest.com dashboard
INNGEST_EVENT_KEY="..."                    # From inngest.com dashboard

# Twilio (already configured)
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+..."

# SMTP (already configured)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your@email.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="bookings@bookilot.app"
FROM_NAME="Bookilot"

# Paystack (for Phase 2)
PAYSTACK_SECRET_KEY="sk_..."
PAYSTACK_PUBLIC_KEY="pk_..."
PAYSTACK_WEBHOOK_SECRET="whsec_..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## What's Next (Phase 2)

1. **Service CRUD modals** — Add/Edit/Delete services from dashboard
2. **Billing API** — Plan enforcement, upgrade flow
3. **Paystack integration** — Subscription payments
4. **Booking management** — Calendar view, create/cancel from dashboard
