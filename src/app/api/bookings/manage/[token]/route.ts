import { NextRequest, NextResponse } from "next/server";
import { cancelBooking, getBookingByManageToken } from "@/lib/services/booking.service";

/**
 * GET /api/bookings/manage/[token] — public booking lookup
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const booking = await getBookingByManageToken(token);

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json({ booking });
}

/**
 * PATCH /api/bookings/manage/[token] — cancel a booking (public)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const body = await request.json();

  const booking = await getBookingByManageToken(token);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (body.action === "cancel") {
    const result = await cancelBooking({
      bookingId: booking.id,
      organizationId: "", // We need to derive this from the booking
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ booking: result.booking });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
