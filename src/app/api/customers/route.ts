import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { customers, bookings } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { requireStaff } from "@/lib/auth/tenant";

/**
 * GET /api/customers — returns customers for the authenticated user's org
 */
export async function GET() {
  const user = await requireStaff();

  if (!user.organizationId) {
    return NextResponse.json(
      { error: "No organization linked to this account" },
      { status: 400 }
    );
  }

  const result = await db
    .select({
      id: customers.id,
      name: customers.name,
      email: customers.email,
      phone: customers.phone,
      isRegistered: customers.isRegistered,
      noShowCount: customers.noShowCount,
      createdAt: customers.createdAt,
      totalBookings: sql<number>`count(${bookings.id})::int`,
    })
    .from(customers)
    .leftJoin(bookings, eq(customers.id, bookings.customerId))
    .where(eq(customers.organizationId, user.organizationId))
    .groupBy(customers.id)
    .orderBy(sql`${customers.createdAt} DESC`);

  return NextResponse.json({ customers: result });
}
