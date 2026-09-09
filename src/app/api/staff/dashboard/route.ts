import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookings, services, staffMembers } from "@/lib/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { requireStaff } from "@/lib/auth/tenant";

export async function GET() {
  const user = await requireStaff();

  if (!user.organizationId) {
    return NextResponse.json(
      { error: "No organization linked to this account" },
      { status: 400 }
    );
  }

  // Find staff member record for this user
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

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const [todayResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(bookings)
    .where(
      and(
        eq(bookings.organizationId, user.organizationId),
        eq(bookings.staffMemberId, staff.id),
        gte(bookings.startsAt, startOfDay),
        lte(bookings.startsAt, endOfDay)
      )
    );

  const [weekResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(bookings)
    .where(
      and(
        eq(bookings.organizationId, user.organizationId),
        eq(bookings.staffMemberId, staff.id),
        gte(bookings.startsAt, startOfWeek),
        lte(bookings.startsAt, endOfWeek)
      )
    );

  const [totalResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(bookings)
    .where(
      and(
        eq(bookings.organizationId, user.organizationId),
        eq(bookings.staffMemberId, staff.id),
        gte(bookings.startsAt, startOfMonth),
        lte(bookings.startsAt, endOfMonth)
      )
    );

  return NextResponse.json({
    todayBookings: todayResult?.count ?? 0,
    weekBookings: weekResult?.count ?? 0,
    totalBookings: totalResult?.count ?? 0,
  });
}
