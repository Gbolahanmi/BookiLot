import { NextResponse } from "next/server";
import { getOrganizationId } from "@/lib/auth/tenant";
import { db } from "@/lib/db";
import { bookings } from "@/lib/db/schema";
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

  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const orgFilter = eq(bookings.organizationId, orgId);
  const notDeleted = sql`${bookings.deletedAt} IS NULL`;

  // Today's bookings
  const [todayResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(bookings)
    .where(and(orgFilter, notDeleted, gte(bookings.startsAt, startOfToday), lt(bookings.startsAt, endOfToday)));

  // This week's bookings
  const [weekResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(bookings)
    .where(and(orgFilter, notDeleted, gte(bookings.startsAt, startOfWeek), lt(bookings.startsAt, endOfToday)));

  // Month revenue (from completed/confirmed bookings)
  const [revenueResult] = await db
    .select({ total: sql<number>`coalesce(sum(${bookings.depositPaid}::int), 0)::int` })
    .from(bookings)
    .where(and(orgFilter, notDeleted, gte(bookings.startsAt, startOfMonth), lt(bookings.startsAt, endOfMonth)));

  // No-show rate (this month)
  const [noShowResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(bookings)
    .where(and(orgFilter, notDeleted, eq(bookings.status, "no_show"), gte(bookings.startsAt, startOfMonth), lt(bookings.startsAt, endOfMonth)));

  const [totalResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(bookings)
    .where(and(orgFilter, notDeleted, gte(bookings.startsAt, startOfMonth), lt(bookings.startsAt, endOfMonth)));

  const noShowRate = totalResult.count > 0
    ? Math.round((noShowResult.count / totalResult.count) * 100)
    : 0;

  return NextResponse.json({
    todayBookings: todayResult.count,
    weekBookings: weekResult.count,
    monthRevenue: revenueResult.total,
    noShowRate,
  });
}
