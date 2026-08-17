# Current State — August 17, 2026

## What's Working End-to-End

These flows work completely from start to finish:

1. **Registration → Verification → Onboarding → Dashboard**
   - Register with email/password or Google OAuth
   - Verify email (click link in email)
   - Complete onboarding (business info, services, hours)
   - Land on dashboard with real data

2. **Widget → Booking → Confirmation → Reminder**
   - Customer visits `/widget?orgId=<uuid>`
   - Picks service, date/time, enters details
   - Booking created in DB
   - SMS + email confirmation sent
   - 24h reminder fires via Inngest

3. **Services CRUD**
   - Add, edit, delete services from dashboard
   - Changes reflect in widget immediately

4. **Bookings List + Cancel**
   - Owner sees all bookings with customer/service/status
   - Owner can cancel bookings
   - Cancelled slots freed in availability

5. **Customers List**
   - Auto-populated from bookings
   - Shows booking count and no-show count
   - Searchable

---

## What's Broken or Incomplete

### Bugs

| Bug | Impact | Location |
|-----|--------|----------|
| `<Toaster />` never rendered | No user feedback on actions | `src/app/layout.tsx` |
| Cancellation window inverted | Allows cancel when imminent, blocks when safe | `src/lib/services/booking.service.ts:155` |
| Dashboard revenue shows count | `$X` label is misleading | `src/app/api/dashboard/stats/route.ts` |

### Missing Features

| Feature | Impact | Location |
|---------|--------|----------|
| Settings working hours don't persist | Hours set in onboarding can't be changed | `src/app/(auth)/settings/page.tsx` |
| `/bookings/manage/[token]` page | Widget confirmation links 404 | Missing page |
| Staff edit modal | Edit button does nothing | `src/app/(auth)/staff/page.tsx` |
| Staff delete UI | API exists, no button | `src/app/(auth)/staff/page.tsx` |
| Staff email field | Silently dropped by API | `src/app/api/staff/route.ts` |
| Billing upgrade flow | Button exists, no payment | `src/app/(auth)/billing/page.tsx` |
| Booking calendar view | Placeholder only | `src/app/(auth)/bookings/page.tsx` |
| Timezone setting | Not in settings UI | `src/app/(auth)/settings/page.tsx` |

### Security Gaps

| Gap | Impact | Location |
|-----|--------|----------|
| Paystack webhook signature not verified | Anyone can fake payments | `src/app/api/webhooks/paystack/route.ts` |
| No rate limiting on booking creation | Abuse potential | `src/app/api/bookings/route.ts` |

---

## API Routes

### Auth
| Route | Methods | Status |
|-------|---------|--------|
| `/api/auth/[...auth0]` | GET/POST | ✅ |
| `/api/auth/register` | POST | ✅ |
| `/api/auth/verify-email` | GET | ✅ |
| `/api/auth/resend-verification` | POST | ✅ |
| `/api/auth/forgot-password` | POST | ✅ |
| `/api/auth/reset-password` | POST | ✅ |

### Core
| Route | Methods | Status |
|-------|---------|--------|
| `/api/bookings` | GET/POST | ✅ |
| `/api/bookings/[id]/cancel` | POST | ✅ |
| `/api/bookings/manage/[token]` | GET/PATCH | ✅ |
| `/api/services` | GET/POST | ✅ |
| `/api/services/[id]` | PATCH/DELETE | ✅ |
| `/api/staff` | GET/POST | ✅ |
| `/api/staff/[id]` | PATCH/DELETE | ✅ |
| `/api/customers` | GET | ✅ |
| `/api/availability` | GET | ✅ |
| `/api/widget/services` | GET | ✅ |

### Dashboard
| Route | Methods | Status |
|-------|---------|--------|
| `/api/dashboard/stats` | GET | ✅ |
| `/api/dashboard/today-bookings` | GET | ✅ |

### Settings
| Route | Methods | Status |
|-------|---------|--------|
| `/api/settings` | GET/PATCH | ✅ |
| `/api/settings/hours` | GET/PATCH | ✅ |

### Billing
| Route | Methods | Status |
|-------|---------|--------|
| `/api/billing` | GET | ✅ |

### Integrations
| Route | Methods | Status |
|-------|---------|--------|
| `/api/inngest` | GET/POST/PUT | ✅ |
| `/api/webhooks/paystack` | POST | ⚠️ Stub |
| `/api/onboarding/complete` | POST | ✅ |

---

## Pages

### Public
| Page | Route | Status |
|------|-------|--------|
| Landing | `/` | ✅ |
| Pricing | `/pricing` | ✅ |
| Login | `/login` | ✅ |
| Register | `/register` | ✅ |
| Forgot Password | `/forgot-password` | ✅ |
| Reset Password | `/reset-password` | ✅ |
| Verify Email | `/verify-email` | ✅ |
| Widget | `/widget?orgId=<uuid>` | ✅ |

### Dashboard (Auth Required)
| Page | Route | Status |
|------|-------|--------|
| Dashboard | `/dashboard` | ✅ |
| Bookings | `/bookings` | ⚠️ List works, calendar stub |
| Services | `/services` | ✅ |
| Staff | `/staff` | ⚠️ List works, edit/delete missing |
| Customers | `/customers` | ✅ |
| Settings | `/settings` | ⚠️ Business info works, hours hardcoded |
| Billing | `/billing` | ⚠️ Visual only, no payment |
| Onboarding | `/onboarding` | ✅ |

---

## Database

14 tables pushed to Neon PostgreSQL:
- organizations, users, services, staff_members, staff_services
- working_hours, blocked_times, bookings, customers
- payments, waitlist_entries, audit_logs, subscriptions

---

## Git History (Recent)

```
d9d7ddb fix: active Google users redirected to onboarding on every sign-in
6be4907 fix: Google OAuth existing users redirected to verify-email
995fa17 fix: resolve 7 auth flow bugs
147f689 fix: improve credentials login error message
3465ada feat: bookings dashboard — list view with cancel
8d5ddb2 feat: billing API
150546a feat: service CRUD modals
0eb1819 fix: Google OAuth PKCE cookie error
e7c0fc2 docs: add MVP testing guide
b9d55b0 feat: wire Inngest, booking confirmations, settings API
5ce91b8 fix: secure API routes with auth + orgId filtering
1574047 feat: Landing Page + fix: Onboarding
d2bf917 fix: TS error in auth config, add dashboard API routes
9b355cd feat: complete auth system, UI polish, Google OAuth, DB migration
a91674c feat: initial project scaffolding
```

---

## Next Session Should

1. Fix the 7 MVP-blocking bugs (see `02-REQUIREMENTS.md`)
2. Create `/bookings/manage/[token]` frontend page
3. Connect settings working hours to DB
4. Deploy to Vercel staging
