import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookings, services, staffMembers, organizations } from "@/lib/db/schema";
import { eq, and, gte, asc, sql } from "drizzle-orm";
import { requireStaff } from "@/lib/auth/tenant";

export async function GET() {
  const user = await requireStaff();

  if (!user.organizationId) {
    return NextResponse.json(
      { error: "No organization linked to this account" },
      { status: 400 }
    );
  }

  const [staff] = await db
    .select()
    .from(staffMembers)
    .where(
      and(
        eq(staffMembers.organizationId, user.organizationId),
        eq(staffMembers.userId, user.id)
      )
    )
    .limit(1);

  if (!staff) {
    return NextResponse.json(
      { error: "Staff member not found" },
      { status: 404 }
    );
  }

  // Get org timezone
  const [org] = await db
    .select({ timezone: organizations.timezone })
    .from(organizations)
    .where(eq(organizations.id, user.organizationId))
    .limit(1);

  const now = new Date();

  const upcomingBookings = await db
    .select({
      id: bookings.id,
      startsAt: bookings.startsAt,
      endsAt: bookings.endsAt,
      status: bookings.status,
      serviceName: services.name,
      customerName: sql<string>`coalesce(${bookings.notes}, 'Customer')`,
    })
    .from(bookings)
    .innerJoin(services, eq(bookings.serviceId, services.id))
    .where(
      and(
        eq(bookings.organizationId, user.organizationId),
        eq(bookings.staffMemberId, staff.id),
        gte(bookings.startsAt, now)
      )
    )
    .orderBy(asc(bookings.startsAt))
    .limit(20);

  return NextResponse.json({
    bookings: upcomingBookings,
    timezone: org?.timezone || "UTC",
  });
}
