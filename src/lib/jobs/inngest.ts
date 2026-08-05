import { Inngest } from "inngest";
import { db } from "@/lib/db";
import { bookings, customers, services, organizations } from "@/lib/db/schema";
import { eq, and, lte } from "drizzle-orm";
import { sendBookingReminder } from "@/lib/sms";
import { sendBookingReminderEmail } from "@/lib/email";
import { addHours, format } from "date-fns";
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

    if (!updatedBooking || updatedBooking.status !== BOOKING_STATUS.PENDING) return;

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
 * Auto-mark no-shows after appointment time + threshold.
 */
export const handleNoShows = inngest.createFunction(
  { id: "handle-no-shows" },
  { event: "cron/15min" },
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
          noShowCount: customers.noShowCount,
          updatedAt: new Date(),
        })
        .where(eq(customers.id, booking.customerId));
    }
  }
);
