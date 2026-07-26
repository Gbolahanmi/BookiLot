import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createBooking } from "@/lib/services/booking.service";
import { inngest } from "@/lib/jobs/inngest";

const createBookingSchema = z.object({
  organizationId: z.string().uuid(),
  serviceId: z.string().uuid(),
  staffMemberId: z.string().uuid().optional(),
  customerId: z.string().uuid(),
  startsAt: z.string().datetime(),
  idempotencyKey: z.string().optional(),
  channel: z.enum(["web", "sms", "voice"]).default("web"),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();

  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid parameters", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { startsAt, ...rest } = parsed.data;

  try {
    const result = await createBooking({
      ...rest,
      startsAt: new Date(startsAt),
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    // Trigger reminder job
    await inngest.send({
      name: "booking.created",
      data: { bookingId: result.booking!.id },
    });

    return NextResponse.json({ booking: result.booking }, { status: 201 });
  } catch (error) {
    console.error("Booking creation failed:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
