import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { payments, bookings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PAYMENT_STATUS } from "@/lib/constants";

/**
 * POST /api/webhooks/paystack — handle Paystack payment events
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const signature = request.headers.get("x-paystack-signature");

  // TODO: Verify webhook signature with PAYSTACK_WEBHOOK_SECRET
  // For now, process the event

  const event = body;

  if (event.event === "charge.success") {
    const { reference, amount, metadata } = event.data;

    // Update payment record
    const [payment] = await db
      .update(payments)
      .set({
        status: PAYMENT_STATUS.SUCCESS,
        providerRef: reference,
      })
      .where(eq(payments.providerRef, reference))
      .returning();

    if (payment?.bookingId) {
      // Update booking deposit status
      await db
        .update(bookings)
        .set({
          depositPaid: true,
          status: "confirmed",
          updatedAt: new Date(),
        })
        .where(eq(bookings.id, payment.bookingId));
    }
  }

  return NextResponse.json({ received: true });
}
