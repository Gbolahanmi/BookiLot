import { Inngest } from "inngest";
import { db } from "@/lib/db";
import { bookings, customers, services, organizations, invites } from "@/lib/db/schema";
import { eq, and, lte, sql, lt, isNotNull } from "drizzle-orm";
import { sendBookingReminder, sendSms } from "@/lib/sms";
import { sendBookingReminderEmail, sendBookingCancellationEmail } from "@/lib/email";
import { addHours, format, subDays } from "date-fns";
import { BOOKING_STATUS, REMINDER_HOURS_BEFORE, NO_SHOW_THRESHOLD_MINUTES } from "@/lib/constants";

export const inngest = new Inngest({ id: "bookilot" });

/**
 * Send booking reminders 24 hours before appointment.
 */
export const sendReminder = inngest.createFunction(
  { id: "send-reminder" },
  { event: "booking.created" },
  async ({ event, step }) => {
    const { bookingId } = event.data;

    // Wait until 24h before the appointment
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!booking || booking.status === BOOKING_STATUS.CANCELLED) return;

    const reminderTime = addHours(booking.startsAt, -REMINDER_HOURS_BEFORE);
    const now = new Date();

    if (reminderTime > now) {
      await step.sleepUntil("wait-for-reminder", reminderTime);
    }

    // Re-check status after sleep
    const [updatedBooking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!updatedBooking || updatedBooking.status !== BOOKING_STATUS.CONFIRMED) return;

    // Get customer, service, org details
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, updatedBooking.customerId))
      .limit(1);

    const [service] = await db
      .select()
      .from(services)
      .where(eq(services.id, updatedBooking.serviceId))
      .limit(1);

    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, updatedBooking.organizationId))
      .limit(1);

    if (!customer || !service || !org) return;

    const manageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/bookings/manage/${updatedBooking.manageToken}`;
    const dateStr = format(updatedBooking.startsAt, "MMM d, yyyy");
    const timeStr = format(updatedBooking.startsAt, "h:mm a");

    // Send SMS
    if (customer.phone) {
      await sendBookingReminder(customer.phone, {
        businessName: org.name,
        serviceName: service.name,
        date: dateStr,
        time: timeStr,
        manageUrl,
      });
    }

    // Send email
    if (customer.email) {
      await sendBookingReminderEmail(customer.email, {
        customerName: customer.name,
        businessName: org.name,
        serviceName: service.name,
        date: dateStr,
        time: timeStr,
        manageUrl,
      });
    }
  }
);

/**
 * Auto-mark no-shows. Runs every 15 minutes via Inngest cron.
 */
export const handleNoShows = inngest.createFunction(
  { id: "handle-no-shows" },
  { cron: "*/15 * * * *" },
  async ({ step: _step }) => {
    const threshold = addHours(new Date(), -NO_SHOW_THRESHOLD_MINUTES / 60);

    // Find bookings that passed and are still pending/confirmed
    const pastBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          lte(bookings.endsAt, threshold),
          eq(bookings.status, BOOKING_STATUS.CONFIRMED)
        )
      );

    for (const booking of pastBookings) {
      await db
        .update(bookings)
        .set({
          status: BOOKING_STATUS.NO_SHOW,
          updatedAt: new Date(),
        })
        .where(eq(bookings.id, booking.id));

      // Increment customer no-show count
      await db
        .update(customers)
        .set({
          noShowCount: sql`${customers.noShowCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(customers.id, booking.customerId));
    }
  }
);

/**
 * Send cancellation notifications via SMS and email.
 */
export const sendCancellationNotification = inngest.createFunction(
  { id: "send-cancellation-notification" },
  { event: "booking.cancelled" },
  async ({ event }) => {
    const { bookingId } = event.data;

    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!booking) return;

    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, booking.customerId))
      .limit(1);

    const [service] = await db
      .select()
      .from(services)
      .where(eq(services.id, booking.serviceId))
      .limit(1);

    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, booking.organizationId))
      .limit(1);

    if (!customer || !service || !org) return;

    const dateStr = format(booking.startsAt, "MMM d, yyyy");
    const timeStr = format(booking.startsAt, "h:mm a");
    const manageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/bookings/manage/${booking.manageToken}`;

    // Send SMS
    if (customer.phone) {
      const message = [
        `❌ Your booking has been cancelled.`,
        ``,
        `${service.name}`,
        `📅 ${dateStr} at ${timeStr}`,
        `📍 ${org.name}`,
        ``,
        `If this was a mistake, please rebook at: ${manageUrl}`,
      ].join("\n");
      await sendSms(customer.phone, message);
    }

    // Send email
    if (customer.email) {
      await sendBookingCancellationEmail(customer.email, {
        customerName: customer.name,
        businessName: org.name,
        serviceName: service.name,
        date: dateStr,
        time: timeStr,
        manageUrl,
      });
    }
  }
);

/**
 * Clean up expired and old accepted invites. Runs daily at 3am.
 */
export const cleanupInvites = inngest.createFunction(
  { id: "cleanup-invites" },
  { cron: "0 3 * * *" },
  async ({ step: _step }) => {
    const now = new Date();

    // Delete accepted invites older than 30 days
    const acceptedCutoff = subDays(now, 30);
    await db
      .delete(invites)
      .where(
        and(
          isNotNull(invites.acceptedAt),
          lt(invites.acceptedAt, acceptedCutoff)
        )
      );

    // Delete expired invites older than 7 days
    const expiredCutoff = subDays(now, 7);
    await db
      .delete(invites)
      .where(
        and(
          lt(invites.expiresAt, expiredCutoff),
          isNotNull(invites.expiresAt)
        )
      );
  }
);
