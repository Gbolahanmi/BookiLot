import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookings } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireStaff } from "@/lib/auth/tenant";
import { inngest } from "@/lib/jobs/inngest";

/**
 * POST /api/bookings/[id]/cancel — cancel a booking
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireStaff();

  if (!user.organizationId) {
    return NextResponse.json(
      { error: "No organization linked to this account" },
      { status: 400 }
    );
  }

  const { id } = await params;

  const [existing] = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.id, id),
        eq(bookings.organizationId, user.organizationId)
      )
    )
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (existing.status === "cancelled") {
    return NextResponse.json({ error: "Booking already cancelled" }, { status: 400 });
  }

  const [updated] = await db
    .update(bookings)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(bookings.id, id))
    .returning();

  // Fire cancellation notification event
  await inngest.send({
    name: "booking.cancelled",
    data: { bookingId: id },
  });

  return NextResponse.json({ booking: updated });
}
