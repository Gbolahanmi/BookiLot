import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invites, staffMembers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireOwner } from "@/lib/auth/tenant";

/**
 * DELETE /api/staff/invite/[token] — revoke a pending invitation
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const user = await requireOwner();

  if (!user.organizationId) {
    return NextResponse.json(
      { error: "No organization linked to this account" },
      { status: 400 }
    );
  }

  const { token } = await params;

  const [invite] = await db
    .select()
    .from(invites)
    .where(
      and(
        eq(invites.token, token),
        eq(invites.organizationId, user.organizationId)
      )
    )
    .limit(1);

  if (!invite) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  if (invite.acceptedAt) {
    return NextResponse.json(
      { error: "This invitation has already been accepted" },
      { status: 400 }
    );
  }

  // Delete the staff member (cascade deletes the invite)
  await db
    .delete(staffMembers)
    .where(eq(staffMembers.id, invite.staffMemberId));

  return NextResponse.json({ success: true });
}
