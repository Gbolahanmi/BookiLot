// ─── Booking Statuses ────────────────────────────────────────
export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
  NO_SHOW: "no_show",
} as const;

export type BookingStatus =
  (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

// ─── Booking Channels ────────────────────────────────────────
export const BOOKING_CHANNEL = {
  WEB: "web",
  SMS: "sms",
  VOICE: "voice",
} as const;

export type BookingChannel =
  (typeof BOOKING_CHANNEL)[keyof typeof BOOKING_CHANNEL];

// ─── User Roles ──────────────────────────────────────────────
export const USER_ROLE = {
  OWNER: "owner",
  STAFF: "staff",
  SUPER_ADMIN: "super_admin",
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

// ─── Account Status ─────────────────────────────────────────
export const ACCOUNT_STATUS = {
  PENDING: "pending",
  EMAIL_VERIFIED: "email_verified",
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

export type AccountStatus =
  (typeof ACCOUNT_STATUS)[keyof typeof ACCOUNT_STATUS];

// ─── Subscription Plans ──────────────────────────────────────
export const SUBSCRIPTION_PLAN = {
  FREE: "free",
  PRO: "pro",
  ENTERPRISE: "enterprise",
} as const;

export type SubscriptionPlan =
  (typeof SUBSCRIPTION_PLAN)[keyof typeof SUBSCRIPTION_PLAN];

// ─── Subscription Status ─────────────────────────────────────
export const SUBSCRIPTION_STATUS = {
  ACTIVE: "active",
  PAST_DUE: "past_due",
  CANCELLED: "cancelled",
  TRIALING: "trialing",
} as const;

export type SubscriptionStatus =
  (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];

// ─── Payment Providers ───────────────────────────────────────
export const PAYMENT_PROVIDER = {
  PAYSTACK: "paystack",
  STRIPE: "stripe",
} as const;

export type PaymentProvider =
  (typeof PAYMENT_PROVIDER)[keyof typeof PAYMENT_PROVIDER];

// ─── Payment Status ──────────────────────────────────────────
export const PAYMENT_STATUS = {
  PENDING: "pending",
  SUCCESS: "success",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;

export type PaymentStatus =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

// ─── Days of Week ────────────────────────────────────────────
export const DAYS_OF_WEEK = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
} as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[keyof typeof DAYS_OF_WEEK];

// ─── Plan Limits ─────────────────────────────────────────────
export const PLAN_LIMITS = {
  free: {
    maxBookingsPerMonth: 50,
    maxStaff: 1,
    maxServices: 5,
    channels: ["web"] as const,
    smsEnabled: false,
    voiceEnabled: false,
    insightsEnabled: false,
    waitlistEnabled: false,
    customBranding: false,
    customDomain: false,
    websiteBuilder: false,
    customCss: false,
    aiResponses: false,
    aiInsights: false,
    smsCredits: 0,
    voiceCredits: 0,
  },
  pro: {
    maxBookingsPerMonth: -1,
    maxStaff: 10,
    maxServices: 50,
    channels: ["web", "sms"] as const,
    smsEnabled: true,
    voiceEnabled: false,
    insightsEnabled: true,
    waitlistEnabled: true,
    customBranding: true,
    customDomain: false,
    websiteBuilder: false,
    customCss: false,
    aiResponses: true,
    aiInsights: true,
    smsCredits: 500,
    voiceCredits: 0,
  },
  enterprise: {
    maxBookingsPerMonth: -1,
    maxStaff: -1,
    maxServices: -1,
    channels: ["web", "sms", "voice"] as const,
    smsEnabled: true,
    voiceEnabled: true,
    insightsEnabled: true,
    waitlistEnabled: true,
    customBranding: true,
    customDomain: true,
    websiteBuilder: true,
    customCss: true,
    aiResponses: true,
    aiInsights: true,
    smsCredits: -1,
    voiceCredits: -1,
  },
} as const;

// ─── Business Defaults ───────────────────────────────────────
export const DEFAULT_BUFFER_MINUTES = 10;
export const DEFAULT_SLOT_INCREMENT_MINUTES = 30;
export const CANCELLATION_WINDOW_HOURS = 2;
export const NO_SHOW_THRESHOLD_MINUTES = 15;
export const REMINDER_HOURS_BEFORE = 24;

// ─── OTP Config ──────────────────────────────────────────────
export const OTP_LENGTH = 6;
export const OTP_EXPIRY_MINUTES = 10;
export const OTP_MAX_ATTEMPTS = 3;

// ─── Rate Limiting ───────────────────────────────────────────
export const RATE_LIMIT = {
  BOOKING_CREATE: { requests: 10, window: "1m" },
  AVAILABILITY_CHECK: { requests: 30, window: "1m" },
  OTP_SEND: { requests: 3, window: "5m" },
  PUBLIC_API: { requests: 60, window: "1m" },
} as const;

// ─── Widget Config ───────────────────────────────────────────
export const WIDGET_CONFIG = {
  MIN_WIDTH_PX: 360,
  MAX_WIDTH_PX: 480,
  RECOMMENDED_SLOTS_COUNT: 3,
  MAX_SLOTS_PER_DAY: 20,
  SLOT_INCREMENT_MINUTES: 30,
} as const;

// ─── Navigation Labels ───────────────────────────────────────
export const NAV_ITEMS = {
  dashboard: { label: "Dashboard", href: "/dashboard" },
  bookings: { label: "Bookings", href: "/bookings" },
  services: { label: "Services", href: "/services" },
  staff: { label: "Staff", href: "/staff" },
  customers: { label: "Customers", href: "/customers" },
  billing: { label: "Billing", href: "/billing" },
  settings: { label: "Settings", href: "/settings" },
} as const;

// ─── Staff Navigation Labels ─────────────────────────────────
export const STAFF_NAV_ITEMS = {
  dashboard: { label: "Dashboard", href: "/staff/dashboard" },
  bookings: { label: "My Bookings", href: "/staff/bookings" },
  hours: { label: "My Hours", href: "/staff/hours" },
  profile: { label: "Profile", href: "/staff/profile" },
} as const;

// ─── Status Colors (for UI) ──────────────────────────────────
export const STATUS_COLORS: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  pending: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    dot: "bg-yellow-500",
  },
  confirmed: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  cancelled: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  completed: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  no_show: { bg: "bg-gray-50", text: "text-gray-700", dot: "bg-gray-500" },
};
