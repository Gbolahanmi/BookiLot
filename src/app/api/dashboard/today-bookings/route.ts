import { NextResponse } from "next/server";
import { getOrganizationId } from "@/lib/auth/tenant";
import { db } from "@/lib/db";
import { bookings, customers, services } from "@/lib/db/schema";
import { eq, and, gte, lt, sql } from "drizzle-orm";

export async function GET() {
  const orgId = await getOrganizationId();
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  const results = await db
    .select({
      id: bookings.id,
      customerName: customers.name,
      service: services.name,
      time: sql<string>`to_char(${bookings.startsAt}, 'HH12:MI AM')`,
      status: bookings.status,
      startsAt: bookings.startsAt,
    })
    .from(bookings)
    .innerJoin(customers, eq(bookings.customerId, customers.id))
    .innerJoin(services, eq(bookings.serviceId, services.id))
    .where(
      and(
        eq(bookings.organizationId, orgId),
        sql`${bookings.deletedAt} IS NULL`,
        gte(bookings.startsAt, startOfToday),
        lt(bookings.startsAt, endOfToday)
      )
    )
    .orderBy(bookings.startsAt);

  return NextResponse.json(results);
}
