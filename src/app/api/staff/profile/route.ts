import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { staffMembers } from "@/lib/db/schema";
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

  return NextResponse.json({ staff });
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

  const body = await request.json();
  const { displayName, bio } = body;

  await db
    .update(staffMembers)
    .set({
      ...(displayName !== undefined && { displayName }),
      ...(bio !== undefined && { bio }),
      updatedAt: new Date(),
    })
    .where(eq(staffMembers.id, staff.id));

  return NextResponse.json({ message: "Profile updated" });
}
