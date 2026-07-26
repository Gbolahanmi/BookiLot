import { db } from "@/lib/db";
import { services, workingHours, bookings, blockedTimes } from "@/lib/db/schema";
import { eq, and, gte, lte, ne, isNull } from "drizzle-orm";
import {
  BOOKING_STATUS,
  DEFAULT_BUFFER_MINUTES,
  WIDGET_CONFIG,
} from "@/lib/constants";
import { addMinutes, startOfDay, endOfDay, parseISO } from "date-fns";

export interface TimeSlot {
  startsAt: Date;
  endsAt: Date;
  staffMemberId: string | null;
}

export interface AvailabilityParams {
  organizationId: string;
  serviceId: string;
  date: string; // "YYYY-MM-DD"
  staffMemberId?: string;
}

/**
 * Compute available time slots for a service on a given date.
 * Accounts for: working hours, existing bookings, buffer time, blocked times.
 */
export async function computeAvailableSlots(
  params: AvailabilityParams
): Promise<TimeSlot[]> {
  const { organizationId, serviceId, date, staffMemberId } = params;

  // 1. Get the service to know duration + buffer
  const [service] = await db
    .select()
    .from(services)
    .where(and(eq(services.id, serviceId), eq(services.organizationId, organizationId)))
    .limit(1);

  if (!service || !service.active) return [];

  const duration = service.durationMinutes;
  const buffer = service.bufferMinutes || DEFAULT_BUFFER_MINUTES;
  const slotSize = duration + buffer;

  // 2. Get the day of week for the requested date
  const targetDate = parseISO(date);
  const dayOfWeek = targetDate.getDay();

  // 3. Get working hours for this day
  const orgHours = await db
    .select()
    .from(workingHours)
    .where(
      and(
        eq(workingHours.organizationId, organizationId),
        eq(workingHours.dayOfWeek, dayOfWeek),
        eq(workingHours.active, true),
        // org-wide hours have null staffMemberId
        // staff-specific hours have a staffMemberId
        staffMemberId
          ? eq(workingHours.staffMemberId, staffMemberId)
          : isNull(workingHours.staffMemberId)
      )
    );

  if (orgHours.length === 0) return [];

  // 4. Get existing bookings for this date (non-cancelled)
  const dayStart = startOfDay(targetDate);
  const dayEnd = endOfDay(targetDate);

  const existingBookings = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.organizationId, organizationId),
        gte(bookings.startsAt, dayStart),
        lte(bookings.startsAt, dayEnd),
        ne(bookings.status, BOOKING_STATUS.CANCELLED),
        // if staffMemberId specified, filter to that staff
        staffMemberId
          ? eq(bookings.staffMemberId, staffMemberId)
          : undefined
      )
    );

  // 5. Get blocked times
  const blocked = await db
    .select()
    .from(blockedTimes)
    .where(
      and(
        eq(blockedTimes.organizationId, organizationId),
        gte(blockedTimes.endsAt, dayStart),
        lte(blockedTimes.startsAt, dayEnd),
        staffMemberId
          ? eq(blockedTimes.staffMemberId, staffMemberId)
          : undefined
      )
    );

  // 6. Generate all possible slots from working hours
  const slots: TimeSlot[] = [];

  for (const hours of orgHours) {
    const [startH, startM] = hours.startTime.split(":").map(Number);
    const [endH, endM] = hours.endTime.split(":").map(Number);

    const workStartMinutes = startH * 60 + startM;
    const workEndMinutes = endH * 60 + endM;

    for (
      let cursor = workStartMinutes;
      cursor + slotSize <= workEndMinutes;
      cursor += WIDGET_CONFIG.SLOT_INCREMENT_MINUTES
    ) {
      const slotStart = new Date(targetDate);
      slotStart.setHours(Math.floor(cursor / 60), cursor % 60, 0, 0);

      const slotEnd = addMinutes(slotStart, duration);

      // Skip if in the past (for today)
      if (slotStart <= new Date()) continue;

      // Check overlap with existing bookings
      const hasBookingOverlap = existingBookings.some(
        (b) => slotStart < b.endsAt && slotEnd > b.startsAt
      );
      if (hasBookingOverlap) continue;

      // Check overlap with blocked times
      const hasBlockedOverlap = blocked.some(
        (b) => slotStart < b.endsAt && slotEnd > b.startsAt
      );
      if (hasBlockedOverlap) continue;

      slots.push({
        startsAt: slotStart,
        endsAt: slotEnd,
        staffMemberId: staffMemberId || null,
      });
    }
  }

  return slots;
}

/**
 * Get the N closest available slots across multiple dates (for "recommended" display).
 */
export async function getRecommendedSlots(
  params: AvailabilityParams,
  count = WIDGET_CONFIG.RECOMMENDED_SLOTS_COUNT
): Promise<TimeSlot[]> {
  const allSlots: TimeSlot[] = [];
  const today = new Date();

  // Check next 7 days
  for (let i = 0; i < 7 && allSlots.length < count; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() + i);

    const dateStr = checkDate.toISOString().split("T")[0];
    const daySlots = await computeAvailableSlots({ ...params, date: dateStr });
    allSlots.push(...daySlots);
  }

  return allSlots.slice(0, count);
}
