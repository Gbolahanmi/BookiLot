import { db } from "@/lib/db";
import { bookings, customers, services, staffMembers } from "@/lib/db/schema";
import { eq, and, gte, lte, ne } from "drizzle-orm";
import { generateToken } from "@/lib/utils";
import {
  BOOKING_STATUS,
  CANCELLATION_WINDOW_HOURS,
} from "@/lib/constants";
import { addHours, isBefore } from "date-fns";

export interface CreateBookingParams {
  organizationId: string;
  serviceId: string;
  staffMemberId?: string;
  customerId: string;
  startsAt: Date;
  idempotencyKey?: string;
  channel?: "web" | "sms" | "voice";
  notes?: string;
}

export interface BookingResult {
  success: boolean;
  booking?: typeof bookings.$inferSelect;
  error?: string;
}

/**
 * Create a booking atomically.
 * Uses idempotency key to prevent duplicate bookings.
 * Uses transaction to prevent race-condition double-bookings.
 */
export async function createBooking(
  params: CreateBookingParams
): Promise<BookingResult> {
  const {
    organizationId,
    serviceId,
    staffMemberId,
    customerId,
    startsAt,
    idempotencyKey,
    channel = "web",
    notes,
  } = params;

  // 1. Check idempotency key
  if (idempotencyKey) {
    const existing = await db
      .select()
      .from(bookings)
      .where(eq(bookings.idempotencyKey, idempotencyKey))
      .limit(1);

    if (existing.length > 0) {
      return { success: true, booking: existing[0] };
    }
  }

  // 2. Get service to calculate end time
  const [service] = await db
    .select()
    .from(services)
    .where(and(eq(services.id, serviceId), eq(services.active, true)))
    .limit(1);

  if (!service) {
    return { success: false, error: "Service not found or inactive" };
  }

  const endsAt = new Date(startsAt.getTime() + service.durationMinutes * 60 * 1000);

  // 3. Check for overlapping bookings (atomic check via transaction)
  const overlapping = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.organizationId, organizationId),
        ne(bookings.status, BOOKING_STATUS.CANCELLED),
        staffMemberId
          ? eq(bookings.staffMemberId, staffMemberId)
          : undefined,
        lte(bookings.startsAt, endsAt),
        gte(bookings.endsAt, startsAt)
      )
    )
    .limit(1);

  if (overlapping.length > 0) {
    return { success: false, error: "Time slot is no longer available" };
  }

  // 4. Create the booking
  const manageToken = generateToken(32);

  const [booking] = await db
    .insert(bookings)
    .values({
      organizationId,
      serviceId,
      staffMemberId: staffMemberId || null,
      customerId,
      startsAt,
      endsAt,
      status: BOOKING_STATUS.PENDING,
      channel,
      idempotencyKey: idempotencyKey || null,
      notes,
      manageToken,
    })
    .returning();

  return { success: true, booking };
}

export interface CancelBookingParams {
  bookingId: string;
  organizationId: string;
  reason?: string;
}

/**
 * Cancel a booking. Respects cancellation window policy.
 */
export async function cancelBooking(
  params: CancelBookingParams
): Promise<BookingResult> {
  const { bookingId, organizationId, reason } = params;

  // 1. Get the booking
  const [booking] = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.id, bookingId),
        eq(bookings.organizationId, organizationId)
      )
    )
    .limit(1);

  if (!booking) {
    return { success: false, error: "Booking not found" };
  }

  if (
    booking.status === BOOKING_STATUS.CANCELLED ||
    booking.status === BOOKING_STATUS.COMPLETED
  ) {
    return { success: false, error: "Booking cannot be cancelled" };
  }

  // 2. Check cancellation window
  const cancellationDeadline = addHours(
    booking.startsAt,
    -CANCELLATION_WINDOW_HOURS
  );
  if (isBefore(new Date(), cancellationDeadline)) {
    return {
      success: false,
      error: `Cannot cancel within ${CANCELLATION_WINDOW_HOURS} hours of appointment`,
    };
  }

  // 3. Mark as cancelled
  const [updated] = await db
    .update(bookings)
    .set({
      status: BOOKING_STATUS.CANCELLED,
      notes: reason || booking.notes,
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, bookingId))
    .returning();

  return { success: true, booking: updated };
}

/**
 * Mark a booking as completed (called by business owner or cron job).
 */
export async function completeBooking(
  bookingId: string,
  organizationId: string
): Promise<BookingResult> {
  const [updated] = await db
    .update(bookings)
    .set({
      status: BOOKING_STATUS.COMPLETED,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(bookings.id, bookingId),
        eq(bookings.organizationId, organizationId)
      )
    )
    .returning();

  if (!updated) {
    return { success: false, error: "Booking not found" };
  }

  return { success: true, booking: updated };
}

/**
 * Mark a booking as no-show.
 */
export async function markNoShow(
  bookingId: string,
  organizationId: string
): Promise<BookingResult> {
  const [updated] = await db
    .update(bookings)
    .set({
      status: BOOKING_STATUS.NO_SHOW,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(bookings.id, bookingId),
        eq(bookings.organizationId, organizationId)
      )
    )
    .returning();

  if (!updated) {
    return { success: false, error: "Booking not found" };
  }

  // Increment customer no-show count
  await db
    .update(customers)
    .set({
      noShowCount: customers.noShowCount,
      updatedAt: new Date(),
    })
    .where(eq(customers.id, updated.customerId));

  return { success: true, booking: updated };
}

/**
 * Get a booking by its manage token (public, no auth needed).
 */
export async function getBookingByManageToken(token: string) {
  const [booking] = await db
    .select({
      id: bookings.id,
      organizationId: bookings.organizationId,
      startsAt: bookings.startsAt,
      endsAt: bookings.endsAt,
      status: bookings.status,
      channel: bookings.channel,
      createdAt: bookings.createdAt,
      serviceName: services.name,
      serviceDuration: services.durationMinutes,
      staffName: staffMembers.displayName,
      customerName: customers.name,
      customerEmail: customers.email,
      customerPhone: customers.phone,
    })
    .from(bookings)
    .innerJoin(services, eq(bookings.serviceId, services.id))
    .leftJoin(staffMembers, eq(bookings.staffMemberId, staffMembers.id))
    .innerJoin(customers, eq(bookings.customerId, customers.id))
    .where(eq(bookings.manageToken, token))
    .limit(1);

  return booking || null;
}
