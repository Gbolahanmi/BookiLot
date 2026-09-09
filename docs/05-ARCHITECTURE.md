# Bookilot — Architecture Diagrams

## System Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        Owner["👤 Business Owner<br/>Browser"]
        Customer["🛒 Customer<br/>Browser"]
        Staff["👨‍💼 Staff Member<br/>Browser"]
        Embed["📦 Embeddable Widget<br/>iframe on Business Website"]
    end

    subgraph "Frontend (Next.js 15 App Router)"
        Landing["Landing Page<br/>/"]
        Pricing["Pricing Page<br/>/pricing"]
        Auth["Auth Pages<br/>/login, /register"]
        Dashboard["Dashboard<br/>/dashboard"]
        Services["Services<br/>/services"]
        Bookings["Bookings<br/>/bookings"]
        StaffPage["Staff<br/>/staff"]
        Customers["Customers<br/>/customers"]
        Settings["Settings<br/>/settings"]
        Billing["Billing<br/>/billing"]
        Onboarding["Onboarding<br/>/onboarding"]
        Widget["Booking Widget<br/>/widget?orgId=X"]
        Manage["Booking Management<br/>/bookings/manage/:token"]
    end

    subgraph "API Layer (Next.js API Routes)"
        AuthAPI["/api/auth/*<br/>AuthJS Handler"]
        BookingsAPI["/api/bookings<br/>CRUD + Cancel"]
        ServicesAPI["/api/services<br/>CRUD"]
        StaffAPI["/api/staff<br/>CRUD"]
        CustomersAPI["/api/customers<br/>List"]
        AvailabilityAPI["/api/availability<br/>Slot Calculation"]
        WidgetAPI["/api/widget/services<br/>Public Services"]
        SettingsAPI["/api/settings<br/>Org + Hours"]
        DashboardAPI["/api/dashboard<br/>Stats + Today"]
        BillingAPI["/api/billing<br/>Plan + Usage"]
        OnboardingAPI["/api/onboarding/complete<br/>Setup"]
        WebhooksAPI["/api/webhooks/paystack<br/>Payment Events"]
        InngestAPI["/api/inngest<br/>Background Jobs"]
    end

    subgraph "Service Layer (Business Logic)"
        BookingService["booking.service.ts<br/>createBooking, cancelBooking,<br/>completeBooking, markNoShow"]
        AvailabilityService["availability.service.ts<br/>computeAvailableSlots,<br/>getRecommendedSlots"]
    end

    subgraph "Data Layer"
        Drizzle["Drizzle ORM<br/>Query Builder"]
        Neon[("Neon PostgreSQL<br/>14 Tables<br/>Serverless Postgres")]
    end

    subgraph "Third-Party Services"
        Twilio["📱 Twilio<br/>SMS Gateway"]
        Nodemailer["📧 Nodemailer<br/>Gmail SMTP"]
        Inngest["⚡ Inngest<br/>Background Jobs"]
        Paystack["💳 Paystack<br/>Payments"]
        GoogleOAuth["🔐 Google OAuth<br/>SSO"]
    end

    subgraph "Background Workers"
        ReminderWorker["⏰ send-reminder<br/>24h before appointment"]
        NoShowWorker["🚫 handle-no-shows<br/>Cron every 15min"]
    end

    subgraph "Middleware"
        MW["Auth Middleware<br/>Status-based routing"]
    end

    Owner --> Dashboard
    Owner --> Services
    Owner --> Bookings
    Owner --> StaffPage
    Owner --> Customers
    Owner --> Settings
    Owner --> Billing
    Staff --> Dashboard
    Staff --> Bookings
    Customer --> Widget
    Customer --> Manage
    Embed --> Widget

    Dashboard --> MW
    Services --> MW
    Bookings --> MW
    StaffPage --> MW
    Settings --> MW
    Billing --> MW

    MW --> AuthAPI
    Dashboard --> DashboardAPI
    Services --> ServicesAPI
    Bookings --> BookingsAPI
    StaffPage --> StaffAPI
    Customers --> CustomersAPI
    Settings --> SettingsAPI
    Billing --> BillingAPI
    Widget --> AvailabilityAPI
    Widget --> WidgetAPI
    Widget --> BookingsAPI

    BookingsAPI --> BookingService
    AvailabilityAPI --> AvailabilityService

    BookingService --> Drizzle
    AvailabilityService --> Drizzle
    Drizzle --> Neon

    BookingsAPI -->|"fire event"| Inngest
    Inngest --> ReminderWorker
    Inngest --> NoShowWorker
    ReminderWorker --> Twilio
    ReminderWorker --> Nodemailer

    BookingsAPI -->|"SMS confirm"| Twilio
    BookingsAPI -->|"Email confirm"| Nodemailer
    AuthAPI --> GoogleOAuth
    BillingAPI --> Paystack
    WebhooksAPI --> Paystack
```

---

## Authentication Flow

### Registration → Verification → Onboarding

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as API Route
    participant DB as PostgreSQL
    participant Email as Nodemailer/SMTP

    Note over U,Email: Phase 1: Registration
    U->>FE: Fill form (name, email, password)
    FE->>API: POST /api/auth/register
    API->>API: Hash password (bcrypt, 12 rounds)
    API->>DB: INSERT user (status: "pending")
    API->>API: Generate JWT (24h expiry, purpose: email_verification)
    API->>Email: sendVerificationEmail(email, token)
    Email-->>U: "Verify your Bookilot account"
    API-->>FE: 201 { userId }
    FE->>FE: Redirect to /verify-email

    Note over U,Email: Phase 2: Email Verification
    U->>Email: Click verification link
    Email->>API: GET /api/auth/verify-email?token=jwt
    API->>API: Verify JWT signature + expiry
    API->>DB: UPDATE user SET status = "email_verified"
    API-->>U: Redirect to /login?message=verified
    U->>FE: See "Email verified successfully!"

    Note over U,Email: Phase 3: Login
    U->>FE: Enter email + password
    FE->>API: POST /api/auth/callback/credentials
    API->>DB: SELECT user WHERE email = ?
    API->>API: Compare password (bcrypt)
    API->>DB: SELECT status, organizationId
    API-->>FE: Session cookie (JWT)
    FE->>FE: Middleware checks status

    Note over U,Email: Phase 4: Onboarding
    FE->>FE: Middleware: email_verified + no org → /onboarding
    U->>FE: Complete 3 steps
    FE->>API: POST /api/onboarding/complete
    API->>DB: INSERT organization
    API->>DB: INSERT services
    API->>DB: INSERT working_hours
    API->>DB: UPDATE user SET orgId, status = "active"
    API-->>FE: 200 OK
    FE->>FE: Redirect to /dashboard
```

### Google OAuth Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant AuthJS as AuthJS
    participant Google as Google OAuth
    participant DB as PostgreSQL

    U->>FE: Click "Continue with Google"
    FE->>AuthJS: signIn("google", callbackUrl: "/onboarding")
    AuthJS->>Google: Redirect to Google consent screen
    U->>Google: Approve access
    Google->>AuthJS: Authorization code
    AuthJS->>Google: Exchange for access token
    Google->>AuthJS: User profile (email, name)
    AuthJS->>DB: SELECT user WHERE email = ?

    alt New user
        AuthJS->>DB: INSERT user (status: "email_verified")
        AuthJS->>AuthJS: user.id = created.id
    else Existing user
        AuthJS->>DB: UPDATE user SET status = "email_verified"<br/>WHERE status = "pending"
        AuthJS->>AuthJS: user.id = existing.id
    end

    AuthJS->>DB: SELECT status, organizationId
    AuthJS-->>FE: Session cookie (JWT)
    FE->>FE: Middleware routes based on status + orgId

    alt No organization
        FE->>FE: Redirect to /onboarding
    else Has organization
        FE->>FE: Redirect to /dashboard
    end
```

---

## Booking Flow (Customer)

```mermaid
sequenceDiagram
    participant C as Customer
    participant Widget as Widget
    participant API as API Route
    participant Service as booking.service.ts
    participant DB as PostgreSQL
    participant Inngest as Inngest
    participant SMS as Twilio
    participant Email as Nodemailer

    Note over C,Email: Step 1: Service Selection
    C->>Widget: Visit /widget?orgId=X
    Widget->>API: GET /api/widget/services?orgId=X
    API->>DB: SELECT services WHERE active = true
    API-->>Widget: services[]
    C->>Widget: Select service

    Note over C,Email: Step 2: Date & Time
    C->>Widget: Pick date
    Widget->>API: GET /api/availability?orgId=X&serviceId=Y&date=Z
    API->>DB: SELECT service (duration, buffer)
    API->>DB: SELECT working_hours WHERE dayOfWeek = ?
    API->>DB: SELECT bookings WHERE date = ? AND status != 'cancelled'
    API->>DB: SELECT blocked_times WHERE date = ?
    API->>API: Generate slots = hours - bookings - blocked
    API-->>Widget: slots[], recommended[]
    C->>Widget: Select time slot

    Note over C,Email: Step 3: Customer Details
    C->>Widget: Enter name, phone, email
    C->>Widget: Click "Confirm Booking"

    Note over C,Email: Step 4: Booking Creation
    Widget->>API: POST /api/bookings
    API->>API: Zod validation
    API->>DB: SELECT customer WHERE email = ? OR phone = ?
    alt Customer exists
        API->>API: Use existing customer
    else New customer
        API->>DB: INSERT customer
    end
    API->>Service: createBooking()
    Service->>Service: Check idempotency key
    Service->>DB: SELECT service (calculate endsAt)
    Service->>DB: Check overlapping bookings
    Service->>DB: INSERT booking (status: "pending")
    Service-->>API: booking
    API->>DB: INSERT payment record
    API->>Inngest: send("booking.created", { bookingId })
    API->>SMS: sendBookingConfirmation(phone, details)
    API->>Email: sendBookingConfirmationEmail(email, details)
    API-->>Widget: 201 { booking, manageUrl }
    Widget->>C: "You're all set!" + manage URL

    Note over C,Email: Step 5: Background Jobs (24h later)
    Inngest->>Inngest: sleepUntil(booking.startsAt - 24h)
    Inngest->>DB: SELECT booking (check if still confirmed)
    Inngest->>SMS: sendBookingReminder(phone)
    Inngest->>Email: sendBookingReminderEmail(email)
```

---

## Availability Calculation Flow

```mermaid
sequenceDiagram
    participant Widget as Widget
    participant API as /api/availability
    participant DB as PostgreSQL

    Widget->>API: GET ?orgId=X&serviceId=Y&date=Z

    par Parallel DB Queries
        API->>DB: SELECT service WHERE id = Y
        DB-->>API: { durationMinutes, bufferMinutes }
    and
        API->>DB: SELECT working_hours<br/>WHERE orgId = X AND dayOfWeek = ?
        DB-->>API: { startTime, endTime, active }
    and
        API->>DB: SELECT bookings<br/>WHERE serviceId = Y AND date = Z<br/>AND status != 'cancelled'
        DB-->>API: [{ startsAt, endsAt }]
    and
        API->>DB: SELECT blocked_times<br/>WHERE orgId = X AND date = Z
        DB-->>API: [{ startTime, endTime }]
    end

    API->>API: Generate all possible slots<br/>(30-min increments within working hours)
    API->>API: Filter out past slots
    API->>API: Filter out booking overlaps
    API->>API: Filter out blocked time overlaps
    API->>API: Filter out buffer overlaps

    API->>API: Compute recommended slots<br/>(next 3 available across 7 days)

    API-->>Widget: { slots: [...], recommended: [...] }
```

---

## Settings Update Flow

```mermaid
sequenceDiagram
    participant Owner as Business Owner
    participant FE as Settings Page
    participant API as /api/settings
    participant DB as PostgreSQL

    Note over Owner,DB: Load Settings
    Owner->>FE: Visit /settings
    FE->>API: GET /api/settings
    API->>DB: SELECT organization WHERE id = orgId
    API-->>FE: { name, phone, email, address, timezone }
    FE->>FE: Populate form fields

    par Load Working Hours
        FE->>API: GET /api/settings/hours
        API->>DB: SELECT working_hours WHERE orgId = orgId
        API-->>FE: [{ dayOfWeek, startTime, endTime, active }]
        FE->>FE: Populate hours form
    end

    Note over Owner,DB: Save Changes
    Owner->>FE: Edit fields + Click "Save"
    FE->>API: PATCH /api/settings
    API->>DB: UPDATE organization SET name, phone, email, ...
    API-->>FE: 200 { organization }
    FE->>FE: Toast "Saved!"

    Owner->>FE: Change working hours + Click "Save"
    FE->>API: PATCH /api/settings/hours
    API->>DB: DELETE working_hours WHERE orgId = orgId
    API->>DB: INSERT working_hours (new hours)
    API-->>FE: 200 { hours }
    FE->>FE: Toast "Saved!"
```

---

## Staff Management Flow

```mermaid
sequenceDiagram
    participant Owner as Business Owner
    participant FE as Staff Page
    participant API as /api/staff
    participant DB as PostgreSQL

    Note over Owner,DB: Add Staff
    Owner->>FE: Click "Add Staff"
    FE->>FE: Open StaffModal
    Owner->>FE: Enter name, email, bio
    FE->>API: POST /api/staff
    API->>DB: INSERT staff_member
    API-->>FE: 201 { staff }
    FE->>FE: Toast "Staff added" + Refresh list

    Note over Owner,DB: Edit Staff
    Owner->>FE: Click "Edit" on staff member
    FE->>API: GET /api/staff (already loaded)
    FE->>FE: Open StaffModal (pre-filled)
    Owner->>FE: Modify fields
    FE->>API: PATCH /api/staff/[id]
    API->>DB: UPDATE staff_member
    API-->>FE: 200 { staff }
    FE->>FE: Toast "Staff updated" + Refresh list

    Note over Owner,DB: Delete Staff
    Owner->>FE: Click "Delete" on staff member
    FE->>FE: Show confirmation dialog
    Owner->>FE: Confirm delete
    FE->>API: DELETE /api/staff/[id]
    API->>DB: UPDATE staff_member SET active = false
    API-->>FE: 200 { success }
    FE->>FE: Toast "Staff removed" + Refresh list
```

---

## Payment Flow (Paystack)

```mermaid
sequenceDiagram
    participant Owner as Business Owner
    participant FE as Billing Page
    participant API as /api/billing
    participant PS as Paystack
    participant DB as PostgreSQL

    Note over Owner,DB: View Current Plan
    Owner->>FE: Visit /billing
    FE->>API: GET /api/billing
    API->>DB: SELECT subscription WHERE orgId = orgId
    API->>DB: SELECT COUNT(bookings) WHERE month = current
    API-->>FE: { plan, bookingsUsed, invoices }
    FE->>FE: Show plan + usage bar

    Note over Owner,DB: Upgrade Plan
    Owner->>FE: Click "Upgrade to Pro"
    FE->>API: POST /api/billing/upgrade
    API->>PS: Initialize transaction (amount, email, metadata)
    PS-->>API: { authorization_url, reference }
    API-->>FE: { checkoutUrl }
    FE->>PS: Redirect to Paystack checkout
    Owner->>PS: Complete payment
    PS->>API: POST /api/webhooks/paystack
    API->>API: Verify webhook signature
    API->>DB: UPDATE subscription SET plan = "pro"
    API->>DB: INSERT payment record
    PS-->>FE: Redirect back to /billing
    FE->>API: GET /api/billing (refresh)
    FE->>FE: Show "Pro" plan
```

---

## Background Jobs Flow

```mermaid
sequenceDiagram
    participant BookingAPI as Booking API
    participant Inngest as Inngest
    participant DB as PostgreSQL
    participant SMS as Twilio
    participant Email as Nodemailer

    Note over BookingAPI,Email: Booking Created
    BookingAPI->>Inngest: send("booking.created", { bookingId })
    Inngest->>Inngest: Queue event

    Note over BookingAPI,Email: Reminder Job (24h before)
    Inngest->>Inngest: sleepUntil(startsAt - 24h)
    Inngest->>DB: SELECT booking WHERE id = bookingId
    alt Booking still confirmed
        Inngest->>DB: SELECT customer, service, organization
        par Send notifications
            Inngest->>SMS: sendBookingReminder(phone, details)
        and
            Inngest->>Email: sendBookingReminderEmail(email, details)
        end
    else Booking cancelled/completed
        Inngest->>Inngest: Skip (no notification needed)
    end

    Note over BookingAPI,Email: No-Show Detection (every 15min)
    Inngest->>DB: SELECT bookings<br/>WHERE status = 'confirmed'<br/>AND endsAt < now - 15min
    loop For each overdue booking
        Inngest->>DB: UPDATE SET status = 'no_show'
        Inngest->>DB: UPDATE customers SET noShowCount = noShowCount + 1
    end
```

---

## Multi-Tenancy Data Flow

```mermaid
graph TB
    subgraph "Tenant A (Salon)"
        UserA["Owner A"]
        OrgA["Organization A"]
        ServicesA["Services A"]
        BookingsA["Bookings A"]
    end

    subgraph "Tenant B (Clinic)"
        UserB["Owner B"]
        OrgB["Organization B"]
        ServicesB["Services B"]
        BookingsB["Bookings B"]
    end

    subgraph "Shared Database"
        DB[("PostgreSQL<br/>All tenants in same tables")]
    end

    subgraph "Tenant Isolation"
        Filter["organizationId Filter<br/>Applied on every query"]
    end

    UserA -->|"session.orgId = A"| Filter
    UserB -->|"session.orgId = B"| Filter
    Filter --> DB

    OrgA --- ServicesA
    OrgA --- BookingsA
    OrgB --- ServicesB
    OrgB --- BookingsB

    ServicesA -.->|"organizationId = A"| DB
    BookingsA -.->|"organizationId = A"| DB
    ServicesB -.->|"organizationId = B"| DB
    BookingsB -.->|"organizationId = B"| DB
```

---

## External Communication Map

```mermaid
graph LR
    subgraph "Bookilot App"
        App["Next.js<br/>Application"]
    end

    subgraph "External Services"
        Google["🔐 Google OAuth<br/>accounts.google.com"]
        Twilio["📱 Twilio<br/>api.twilio.com"]
        SMTP["📧 Gmail SMTP<br/>smtp.gmail.com:587"]
        Paystack["💳 Paystack<br/>api.paystack.co"]
        InngestCloud["⚡ Inngest Cloud<br/>api.inngest.com"]
        NeonDB[("🗄️ Neon<br/>ep-divine-boat...")]
    end

    subgraph "User Devices"
        OwnerPhone["Owner Phone<br/>(SMS notifications)"]
        OwnerEmail["Owner Email<br/>(email notifications)"]
        CustomerPhone["Customer Phone<br/>(SMS confirmations)"]
        CustomerEmail["Customer Email<br/>(email confirmations)"]
    end

    App -->|"OAuth flow"| Google
    App -->|"Send SMS"| Twilio
    App -->|"Send email"| SMTP
    App -->|"Process payments"| Paystack
    App -->|"Fire events, schedule jobs"| InngestCloud
    App -->|"Read/write data"| NeonDB

    Twilio -->|"Deliver SMS"| OwnerPhone
    Twilio -->|"Deliver SMS"| CustomerPhone
    SMTP -->|"Deliver email"| OwnerEmail
    SMTP -->|"Deliver email"| CustomerEmail
    Paystack -->|"Webhook callback"| App
```

---

## Middleware Routing Logic

```mermaid
flowchart TD
    Start([Request]) --> IsPublic{Is public route?<br/>/, /login, /register,<br/>/pricing, /widget/*,<br/>/api/auth/*}
    IsPublic -->|Yes| Allow([NextResponse.next])
    IsPublic -->|No| HasAuth{Has session?}

    HasAuth -->|No| ToLogin[Redirect to /login]
    HasAuth -->|Yes| GetStatus[Get status from session]

    GetStatus --> IsPending{status = "pending"?}
    IsPending -->|Yes| IsVerifyEmail{Path = /verify-email?}
    IsVerifyEmail -->|Yes| Allow
    IsVerifyEmail -->|No| ToVerify[Redirect to /verify-email]

    IsPending -->|No| IsVerified{status = "email_verified"?}
    IsVerified -->|Yes| HasOrg{Has organizationId?}
    HasOrg -->|No| IsOnboarding{Path = /onboarding?}
    IsOnboarding -->|Yes| Allow
    IsOnboarding -->|No| ToOnboarding[Redirect to /onboarding]
    HasOrg -->|Yes| IsOwnerOnly{Path in<br/>/settings, /billing, /staff?}
    IsOwnerOnly -->|Yes| ToDashboard[Redirect to /dashboard]
    IsOwnerOnly -->|No| Allow

    IsVerified -->|No| IsActive{status = "active"?}
    IsActive -->|Yes| IsOnboarding2{Path = /onboarding?}
    IsOnboarding2 -->|Yes| ToDashboard
    IsOnboarding2 -->|No| Allow
```
