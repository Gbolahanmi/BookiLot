import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { workingHours, staffMembers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
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

  const hours = await db
    .select()
    .from(workingHours)
    .where(
      and(
        eq(workingHours.organizationId, user.organizationId),
        eq(workingHours.staffMemberId, staff.id)
      )
    );

  return NextResponse.json({
    hours,
    canEditHours: staff.canEditHours,
  });
}

export async function PATCH(request: NextRequest) {
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

  if (!staff.canEditHours) {
    return NextResponse.json(
      { error: "You are not permitted to edit your hours" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { hours } = body;

  if (!Array.isArray(hours)) {
    return NextResponse.json(
      { error: "hours must be an array" },
      { status: 400 }
    );
  }

  // Delete existing hours for this staff member
  await db
    .delete(workingHours)
    .where(
      and(
        eq(workingHours.organizationId, user.organizationId),
        eq(workingHours.staffMemberId, staff.id)
      )
    );

  // Insert new hours
  if (hours.length > 0) {
    await db.insert(workingHours).values(
      hours.map((h: { dayOfWeek: number; startTime: string; endTime: string; active: boolean }) => ({
        organizationId: user.organizationId!,
        staffMemberId: staff.id,
        dayOfWeek: h.dayOfWeek,
        startTime: h.startTime,
        endTime: h.endTime,
        active: h.active,
      }))
    );
  }

  return NextResponse.json({ message: "Hours saved" });
}
