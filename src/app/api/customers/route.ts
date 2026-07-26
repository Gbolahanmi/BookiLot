import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { customers, bookings } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

/**
 * GET /api/customers?orgId=xxx
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const orgId = searchParams.get("orgId");

  if (!orgId) {
    return NextResponse.json(
      { error: "organizationId is required" },
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
    .where(eq(customers.organizationId, orgId))
    .groupBy(customers.id)
    .orderBy(sql`${customers.createdAt} DESC`);

  return NextResponse.json({ customers: result });
}
