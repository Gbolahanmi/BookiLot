import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { staffMembers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireOwner } from "@/lib/auth/tenant";

const updateStaffSchema = z.object({
  displayName: z.string().min(1).max(255).optional(),
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
 * DELETE /api/staff/[id] — soft delete
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

  const [updated] = await db
    .update(staffMembers)
    .set({ active: false, updatedAt: new Date() })
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

  return NextResponse.json({ success: true });
}
