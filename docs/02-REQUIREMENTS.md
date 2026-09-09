# 02 — Requirements

## Functional Requirements

### Auth & Onboarding

| ID | Requirement | Status |
|----|-------------|--------|
| A1 | User can register with email + password | ✅ |
| A2 | User can sign in with Google OAuth | ✅ |
| A3 | User receives email verification after registration | ✅ |
| A4 | User must verify email before accessing dashboard | ✅ |
| A5 | User completes onboarding (business info, services, hours) | ✅ |
| A6 | User can reset forgotten password via email | ✅ |
| A7 | Account status lifecycle: pending → email_verified → active | ✅ |
| A8 | Middleware blocks unauthorized routes based on status | ✅ |

### Services Management

| ID | Requirement | Status |
|----|-------------|--------|
| S1 | Owner can create a service (name, duration, price, description) | ✅ |
| S2 | Owner can edit a service | ✅ |
| S3 | Owner can soft-delete a service | ✅ |
| S4 | Services are scoped to the owner's organization | ✅ |
| S5 | Only active services appear in the widget | ✅ |

### Booking Widget

| ID | Requirement | Status |
|----|-------------|--------|
| W1 | Customer can view available services for a business | ✅ |
| W2 | Customer can pick a date and see available time slots | ✅ |
| W3 | Customer can enter name, phone, email and book | ✅ |
| W4 | Booking creates a record in the database | ✅ |
| W5 | Customer receives SMS confirmation | ✅ |
| W6 | Customer receives email confirmation | ✅ |
| W7 | Customer receives a manage/cancel link | ⚠️ Link 404s (no frontend page) |
| W8 | Widget works in 360px iframe | ✅ |

### Booking Management

| ID | Requirement | Status |
|----|-------------|--------|
| B1 | Owner can view all bookings in a list | ✅ |
| B2 | Owner can cancel a booking | ✅ |
| B3 | Owner can see customer name, service, date, status | ✅ |
| B4 | Customer can cancel via manage link | ⚠️ API works, no frontend page |
| B5 | Cancelled bookings are excluded from availability | ✅ |
| B6 | Calendar view for bookings | ❌ Stub only |

### Staff Management

| ID | Requirement | Status |
|----|-------------|--------|
| ST1 | Owner can add staff members | ✅ |
| ST2 | Owner can view staff list | ✅ |
| ST3 | Owner can edit a staff member | ❌ Edit button exists, no modal |
| ST4 | Owner can delete a staff member | ❌ API exists, no UI |
| ST5 | Staff email is saved | ❌ Silently dropped by API |
| ST6 | Staff member can sign in with their own credentials | ❌ No user account created |
| ST7 | Staff sees limited nav (no settings/billing) | ❌ Not implemented |
| ST8 | Staff role is assigned on sign-in | ❌ No invitation flow |

### Customer Management

| ID | Requirement | Status |
|----|-------------|--------|
| C1 | Owner can view customer list | ✅ |
| C2 | Customers show booking count and no-show count | ✅ |
| C3 | Owner can search/filter customers | ✅ |

### Settings

| ID | Requirement | Status |
|----|-------------|--------|
| SET1 | Owner can update business name, phone, email, address | ✅ |
| SET2 | Owner can update working hours | ❌ Hardcoded, never loads/saves |
| SET3 | Owner can update timezone | ❌ Not in UI |

### Billing

| ID | Requirement | Status |
|----|-------------|--------|
| BL1 | Owner can see current plan and usage | ✅ |
| BL2 | Owner can see plan comparison | ✅ |
| BL3 | Owner can initiate upgrade | ❌ Button exists, no payment flow |
| BL4 | Paystack subscription integration | ❌ Webhook handler stub only |

### Notifications

| ID | Requirement | Status |
|----|-------------|--------|
| N1 | SMS confirmation on booking creation | ✅ |
| N2 | Email confirmation on booking creation | ✅ |
| N3 | SMS reminder 24h before appointment | ✅ (Inngest wired, needs INNGEST keys) |
| N4 | Email reminder 24h before appointment | ✅ (Inngest wired, needs INNGEST keys) |
| N5 | No-show auto-detection | ✅ (Inngest wired, needs INNGEST keys) |

### Dashboard

| ID | Requirement | Status |
|----|-------------|--------|
| D1 | Show today's bookings count | ✅ |
| D2 | Show this week's bookings count | ✅ |
| D3 | Show monthly revenue | ⚠️ Shows booking count, not dollars |
| D4 | Show no-show rate | ✅ |
| D5 | Show today's booking list | ✅ |

### UI/UX

| ID | Requirement | Status |
|----|-------------|--------|
| U1 | Toast notifications appear on actions | ❌ Component exists, never rendered |
| U2 | Loading states on all pages | ✅ Skeletons used |
| U3 | Empty states with CTAs | ✅ |
| U4 | Error states with retry | ✅ |
| U5 | Mobile responsive | ✅ |

---

## Non-Functional Requirements

| Requirement | Status |
|------------|--------|
| All API routes require authentication | ✅ |
| All API routes filter by organizationId | ✅ |
| Public endpoints (widget, manage) don't require auth | ✅ |
| Booking overlap prevention | ✅ |
| Idempotent booking creation | ✅ |
| Email verification via JWT (24h expiry) | ✅ |
| Password reset via JWT (1h expiry) | ✅ |
| bcrypt password hashing (12 rounds) | ✅ |
| Zod validation on all inputs | ✅ |

---

## Summary

| Category | Total | Done | Partial | Missing |
|----------|-------|------|---------|---------|
| Auth & Onboarding | 8 | 8 | 0 | 0 |
| Services | 5 | 5 | 0 | 0 |
| Widget | 8 | 6 | 1 | 1 |
| Bookings | 6 | 4 | 1 | 1 |
| Staff | 5 | 2 | 0 | 3 |
| Customers | 3 | 3 | 0 | 0 |
| Settings | 3 | 1 | 0 | 2 |
| Billing | 4 | 2 | 0 | 2 |
| Notifications | 5 | 5 | 0 | 0 |
| Dashboard | 5 | 4 | 1 | 0 |
| UI/UX | 5 | 4 | 0 | 1 |
| **Total** | **57** | **44** | **3** | **10** |

**MVP completion: 77% (44/57 requirements fully met)**
