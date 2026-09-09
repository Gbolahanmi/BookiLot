import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subscriptions, payments, bookings } from "@/lib/db/schema";
import { eq, and, gte, count } from "drizzle-orm";
import { requireOwner } from "@/lib/auth/tenant";
import { PLAN_LIMITS } from "@/lib/constants";

/**
 * GET /api/billing — returns current plan, usage, and invoices
 */
export async function GET() {
  const user = await requireOwner();

  if (!user.organizationId) {
    return NextResponse.json(
      { error: "No organization linked to this account" },
      { status: 400 }
    );
  }

  // Get or create subscription
  let [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.organizationId, user.organizationId))
    .limit(1);

  if (!sub) {
    [sub] = await db
      .insert(subscriptions)
      .values({
        organizationId: user.organizationId,
        plan: "free",
        status: "active",
      })
      .returning();
  }

  // Count bookings this month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [bookingCount] = await db
    .select({ count: count() })
    .from(bookings)
    .where(
      and(
        eq(bookings.organizationId, user.organizationId),
        gte(bookings.createdAt, monthStart)
      )
    );

  // Get recent payments as invoices
  const invoices = await db
    .select()
    .from(payments)
    .where(eq(payments.organizationId, user.organizationId))
    .orderBy(payments.createdAt)
    .limit(10);

  const planLimits = PLAN_LIMITS[sub.plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;

  return NextResponse.json({
    plan: sub.plan,
    status: sub.status,
    currentPeriodEnd: sub.currentPeriodEnd,
    bookingsUsed: bookingCount?.count || 0,
    maxBookingsPerMonth: planLimits.maxBookingsPerMonth,
    invoices: invoices.map((inv) => ({
      id: inv.id,
      date: inv.createdAt?.toISOString().split("T")[0] || "",
      amount: `$${((inv.amountCents || 0) / 100).toFixed(2)}`,
      status: inv.status,
    })),
  });
}
