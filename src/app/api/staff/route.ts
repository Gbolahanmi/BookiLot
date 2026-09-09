import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { staffMembers, invites } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { requireOwner, requireStaff } from "@/lib/auth/tenant";

const createStaffSchema = z.object({
  displayName: z.string().min(1).max(255),
  email: z.string().email().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

/**
 * GET /api/staff — returns staff for the authenticated user's org
 * Includes pending invite token via LEFT JOIN for invited (non-active) staff.
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
      id: staffMembers.id,
      organizationId: staffMembers.organizationId,
      userId: staffMembers.userId,
      displayName: staffMembers.displayName,
      email: staffMembers.email,
      bio: staffMembers.bio,
      avatarUrl: staffMembers.avatarUrl,
      status: staffMembers.status,
      canEditHours: staffMembers.canEditHours,
      active: staffMembers.active,
      createdAt: staffMembers.createdAt,
      updatedAt: staffMembers.updatedAt,
      inviteToken: invites.token,
    })
    .from(staffMembers)
    .leftJoin(
      invites,
      and(
        eq(staffMembers.id, invites.staffMemberId),
        isNull(invites.acceptedAt)
      )
    )
    .where(
      and(
        eq(staffMembers.organizationId, user.organizationId),
        eq(staffMembers.active, true)
      )
    );

  return NextResponse.json({ staff: result });
}

/**
 * POST /api/staff — create a staff member for the authenticated user's org
 */
export async function POST(request: NextRequest) {
  const user = await requireOwner();

  if (!user.organizationId) {
    return NextResponse.json(
      { error: "No organization linked to this account" },
      { status: 400 }
    );
  }

  const body = await request.json();

  const parsed = createStaffSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid parameters", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const [staff] = await db
    .insert(staffMembers)
    .values({ ...parsed.data, organizationId: user.organizationId })
    .returning();

  return NextResponse.json({ staff }, { status: 201 });
}
