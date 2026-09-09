import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { staffMembers, users, invites } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireOwner } from "@/lib/auth/tenant";

const updateStaffSchema = z.object({
  displayName: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  active: z.boolean().optional(),
});

/**
 * PATCH /api/staff/[id]
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireOwner();

  if (!user.organizationId) {
    return NextResponse.json(
      { error: "No organization linked to this account" },
      { status: 400 }
    );
  }

  const { id } = await params;
  const body = await request.json();

  const parsed = updateStaffSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid parameters", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const [updated] = await db
    .update(staffMembers)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(
      and(
        eq(staffMembers.id, id),
        eq(staffMembers.organizationId, user.organizationId)
      )
    )
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Staff not found" }, { status: 404 });
  }

  return NextResponse.json({ staff: updated });
}

/**
 * DELETE /api/staff/[id] — soft delete staff + deactivate user + clean up invites
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireOwner();

  if (!user.organizationId) {
    return NextResponse.json(
      { error: "No organization linked to this account" },
      { status: 400 }
    );
  }

  const { id } = await params;

  // Verify the staff member exists and belongs to this org
  const [existing] = await db
    .select()
    .from(staffMembers)
    .where(
      and(
        eq(staffMembers.id, id),
        eq(staffMembers.organizationId, user.organizationId)
      )
    )
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Staff not found" }, { status: 404 });
  }

  // Soft delete the staff member
  await db
    .update(staffMembers)
    .set({ active: false, status: "removed", updatedAt: new Date() })
    .where(eq(staffMembers.id, id));

  // Delete any pending invites for this staff member
  await db
    .delete(invites)
    .where(eq(invites.staffMemberId, id));

  // Deactivate the linked user account so they can't log in
  if (existing.userId) {
    await db
      .update(users)
      .set({ status: "inactive", updatedAt: new Date() })
      .where(eq(users.id, existing.userId));
  }

  return NextResponse.json({ success: true });
}
