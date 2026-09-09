import { NextRequest, NextResponse } from "next/server";
import { cancelBooking, getBookingByManageToken } from "@/lib/services/booking.service";

/**
 * GET /api/bookings/manage/[token] — public booking lookup
 */
export async function GET(
  _request: NextRequest,
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

  if (body.action !== "cancel") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const booking = await getBookingByManageToken(token);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const result = await cancelBooking({
    bookingId: booking.id,
    organizationId: booking.organizationId,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ booking: result.booking });
}
