import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invites, staffMembers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireOwner } from "@/lib/auth/tenant";
import { sendStaffInviteEmail } from "@/lib/email";
import { generateToken } from "@/lib/utils/server";

/**
 * POST /api/staff/invite/[token]/resend — resend an invitation email
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const user = await requireOwner();

  if (!user.organizationId) {
    return NextResponse.json(
      { error: "No organization linked to this account" },
      { status: 400 },
    );
  }

  const { token } = await params;

  const [invite] = await db
    .select()
    .from(invites)
    .where(
      and(
        eq(invites.token, token),
        eq(invites.organizationId, user.organizationId),
      ),
    )
    .limit(1);

  if (!invite) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  if (invite.acceptedAt) {
    return NextResponse.json(
      { error: "This invitation has already been accepted" },
      { status: 400 },
    );
  }

  // Generate new token and extend expiry
  const newToken = generateToken();
  const newExpiresAt = new Date();
  newExpiresAt.setDate(newExpiresAt.getDate() + 7);

  await db
    .update(invites)
    .set({
      token: newToken,
      expiresAt: newExpiresAt,
    })
    .where(eq(invites.id, invite.id));

  // Get staff member name for the email
  const [staff] = await db
    .select({ displayName: staffMembers.displayName })
    .from(staffMembers)
    .where(eq(staffMembers.id, invite.staffMemberId))
    .limit(1);

  // Resend invite email
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const inviteUrl = `${appUrl}/staff/accept?token=${newToken}`;

  await sendStaffInviteEmail(invite.email, {
    staffName: staff?.displayName || "Staff Member",
    ownerName: user.name || "The business owner",
    businessName: user.orgName || "the business",
    inviteUrl,
  });

  return NextResponse.json({
    success: true,
    invite: { token: newToken, expiresAt: newExpiresAt },
  });
}
