# Bookilot — UI Registry

A living catalog of every UI component, pattern, and page in the application.

---

## Components

### Primitives (src/components/ui/)

| Component | File | Variants | Status |
|-----------|------|----------|--------|
| Button | `button.tsx` | primary, secondary, destructive, ghost, outline × sm, md, lg | ✅ |
| Input | `input.tsx` | text, email, tel, date + label + error | ✅ |
| Badge | `badge.tsx` | pending, confirmed, cancelled, completed, no_show | ✅ |
| Select | — | — | 🔲 TODO |
| Modal | — | — | 🔲 TODO |
| Toast | — | — | 🔲 TODO |
| Calendar | — | — | 🔲 TODO |
| DataTable | — | — | 🔲 TODO |
| Avatar | — | — | 🔲 TODO |
| Tabs | — | — | 🔲 TODO |
| Dropdown | — | — | 🔲 TODO |
| Card | — | — | 🔲 TODO (using div pattern) |

### Layout (src/components/layout/)

| Component | File | Purpose | Status |
|-----------|------|---------|--------|
| DashboardLayout | `dashboard-layout.tsx` | Sidebar + header + main | ✅ |
| Sidebar | `sidebar.tsx` | Navigation with active state | ✅ |
| Header | — | Top bar with user menu | 🔲 TODO |
| MobileNav | — | Hamburger menu for mobile | 🔲 TODO |

### Booking (src/components/booking/)

| Component | File | Purpose | Status |
|-----------|------|---------|--------|
| ServiceCard | — | Service selection in widget | 🔲 TODO |
| TimeSlotPicker | — | Date/time selection grid | 🔲 TODO |
| BookingForm | — | Customer details form | 🔲 TODO |
| BookingConfirmation | — | Success screen | 🔲 TODO |
| ManageBooking | — | Cancel/reschedule view | 🔲 TODO |

---

## Pages

### Public (No Auth)

| Page | Route | File | Status |
|------|-------|------|--------|
| Landing | `/` | `app/page.tsx` | ✅ Basic |
| Pricing | `/pricing` | `app/(public)/pricing/page.tsx` | ✅ |
| Widget | `/widget` | `app/(public)/widget/page.tsx` | ✅ Static |

### Authenticated Dashboard

| Page | Route | File | Status |
|------|-------|------|--------|
| Dashboard Home | `/dashboard` | `app/(auth)/dashboard/page.tsx` | ✅ Empty state |
| Bookings | `/bookings` | `app/(auth)/bookings/page.tsx` | ✅ Empty state |
| Services | `/services` | `app/(auth)/services/page.tsx` | ✅ Empty state |
| Staff | `/staff` | — | 🔲 TODO |
| Customers | `/customers` | — | 🔲 TODO |
| Onboarding | `/onboarding` | — | 🔲 TODO |
| Settings | `/settings` | — | 🔲 TODO |
| Billing | `/billing` | — | 🔲 TODO |

### API Routes

| Route | Method | File | Status |
|-------|--------|------|--------|
| `/api/availability` | GET | `api/availability/route.ts` | ✅ |
| `/api/bookings` | POST | `api/bookings/route.ts` | ✅ |
| `/api/bookings/manage/[token]` | GET, PATCH | `api/bookings/manage/[token]/route.ts` | ✅ |
| `/api/webhooks/paystack` | POST | `api/webhooks/paystack/route.ts` | ✅ |
| `/api/inngest` | GET, POST | `api/inngest/route.ts` | ✅ |
| `/api/services` | GET, POST | — | 🔲 TODO |
| `/api/services/[id]` | PATCH, DELETE | — | 🔲 TODO |
| `/api/staff` | GET, POST | — | 🔲 TODO |
| `/api/customers` | GET | — | 🔲 TODO |

---

## Patterns

### Empty State
```tsx
<div className="text-center py-12 text-gray-500">
  <p className="text-sm">No items yet</p>
  <p className="text-xs mt-1">Description of what to do next.</p>
</div>
```

### Stats Card
```tsx
<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
  <p className="text-sm text-gray-500">{label}</p>
  <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
  <p className="mt-1 text-xs text-green-600">{change}</p>
</div>
```

### Status Badge
```tsx
<span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-{color}-50 text-{color}-700">
  <span className="h-1.5 w-1.5 rounded-full bg-{color}-500" />
  {status}
</span>
```

### Page Header
```tsx
<div className="flex items-center justify-between">
  <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
  <Button>{action}</Button>
</div>
```

### Form Field
```tsx
<div className="space-y-1">
  <label htmlFor={id} className="block text-sm font-medium text-gray-700">
    {label}
  </label>
  <input
    id={id}
    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
  />
  {error && <p className="text-xs text-red-600">{error}</p>}
</div>
```

---

## Widget Step Flow

```
┌─────────────────────────────────────────┐
│ Step 1: SERVICE SELECTION               │
│ - List of services with name, duration, │
│   price, description                    │
│ - Click to select → next step           │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ Step 2: DATE/TIME SELECTION             │
│ - Date picker (input type="date")       │
│ - Recommended slots (3 highlighted)     │
│ - Full slot grid (3 columns)            │
│ - Click slot → next step               │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ Step 3: CUSTOMER DETAILS                │
│ - Name (required)                       │
│ - Phone (required)                      │
│ - Email (optional)                      │
│ - "Confirm Booking" button              │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ Step 4: CONFIRMATION                    │
│ - Green checkmark icon                  │
│ - "You're all set!"                     │
│ - Booking summary (service, date, time) │
│ - Manage booking link                   │
└─────────────────────────────────────────┘
```

---

## Responsive Behavior

| Screen | Sidebar | Content | Widget |
|--------|---------|---------|--------|
| Mobile (< 640px) | Hidden | Full width, p-4 | Full width |
| Tablet (640-1024px) | Hidden | Full width, p-6 | Full width |
| Desktop (> 1024px) | Fixed 264px | Offset by sidebar, p-8 | Max 480px, centered |
| Widget embed (360px) | N/A | N/A | Full width, no padding |
