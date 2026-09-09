import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { staffMembers, invites } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { requireOwner } from "@/lib/auth/tenant";
import { sendStaffInviteEmail } from "@/lib/email";
import { generateToken } from "@/lib/utils/server";

const inviteSchema = z.object({
  displayName: z.string().min(1).max(255),
  email: z.string().email(),
  bio: z.string().optional(),
});

/**
 * GET /api/staff/invite — list pending invites for the org
 */
export async function GET() {
  const user = await requireOwner();

  if (!user.organizationId) {
    return NextResponse.json(
      { error: "No organization linked to this account" },
      { status: 400 },
    );
  }

  const pendingInvites = await db
    .select({
      id: invites.id,
      staffMemberId: invites.staffMemberId,
      email: invites.email,
      token: invites.token,
      expiresAt: invites.expiresAt,
      acceptedAt: invites.acceptedAt,
      createdAt: invites.createdAt,
    })
    .from(invites)
    .where(
      and(
        eq(invites.organizationId, user.organizationId),
        isNull(invites.acceptedAt),
      ),
    );

  return NextResponse.json({ invites: pendingInvites });
}

/**
 * POST /api/staff/invite — create a staff member and send invite email
 */
export async function POST(request: NextRequest) {
  const user = await requireOwner();

  if (!user.organizationId) {
    return NextResponse.json(
      { error: "No organization linked to this account" },
      { status: 400 },
    );
  }

  const body = await request.json();
  const parsed = inviteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid parameters", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { displayName, email, bio } = parsed.data;
  const lowerEmail = email.toLowerCase().trim();

  // Check for existing active staff member with this email
  const [existing] = await db
    .select()
    .from(staffMembers)
    .where(
      and(
        eq(staffMembers.organizationId, user.organizationId),
        eq(staffMembers.email, lowerEmail),
        eq(staffMembers.active, true),
      ),
    )
    .limit(1);

  if (existing) {
    return NextResponse.json(
      { error: "A staff member with this email already exists" },
      { status: 400 },
    );
  }

  // Create staff member placeholder
  const [staff] = await db
    .insert(staffMembers)
    .values({
      organizationId: user.organizationId,
      displayName,
      email: lowerEmail,
      bio: bio || null,
      status: "invited",
      active: true,
    })
    .returning();

  // Create invite token
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await db
    .insert(invites)
    .values({
      organizationId: user.organizationId,
      staffMemberId: staff.id,
      email: lowerEmail,
      token,
      expiresAt,
    });

  // Send invite email
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const inviteUrl = `${appUrl}/staff/accept?token=${token}`;

  const emailSent = await sendStaffInviteEmail(lowerEmail, {
    staffName: displayName,
    ownerName: user.name || "The business owner",
    businessName: user.orgName || "the business",
    inviteUrl,
  });

  if (!emailSent) {
    return NextResponse.json(
      {
        staff,
        invite: { token, expiresAt },
        warning: "Staff member created but invitation email failed to send. You can resend it from the staff page.",
      },
      { status: 201 }
    );
  }

  return NextResponse.json(
    { staff, invite: { token, expiresAt } },
    { status: 201 }
  );
}
