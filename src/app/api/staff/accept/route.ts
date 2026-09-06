import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { staffMembers, invites, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const acceptSchema = z.object({
  token: z.string().min(1),
  name: z.string().min(1).max(255),
  password: z.string().min(8).max(100),
});

/**
 * GET /api/staff/accept?token=xxx — check invite status (public, no auth)
 * Returns: { status: "pending" | "accepted" | "expired" | "invalid", loginUrl? }
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ status: "invalid" });
  }

  const [invite] = await db
    .select()
    .from(invites)
    .where(eq(invites.token, token))
    .limit(1);

  if (!invite) {
    return NextResponse.json({ status: "invalid" });
  }

  if (invite.acceptedAt) {
    return NextResponse.json({ status: "accepted", loginUrl: "/login" });
  }

  if (new Date() > invite.expiresAt) {
    return NextResponse.json({ status: "expired" });
  }

  return NextResponse.json({ status: "pending" });
}

/**
 * POST /api/staff/accept — accept a staff invitation (public, no auth)
 * Idempotent: if already accepted, returns success with login URL.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = acceptSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid parameters", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { token, name, password } = parsed.data;

  const [invite] = await db
    .select()
    .from(invites)
    .where(eq(invites.token, token))
    .limit(1);

  if (!invite) {
    return NextResponse.json({ error: "Invalid invitation link" }, { status: 404 });
  }

  if (invite.acceptedAt) {
    return NextResponse.json({
      message: "You already have an account. Please log in.",
      loginUrl: "/login",
    });
  }

  if (new Date() > invite.expiresAt) {
    return NextResponse.json({ error: "This invitation has expired" }, { status: 400 });
  }

  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, invite.email))
    .limit(1);

  let userId: string;

  if (existingUser) {
    userId = existingUser.id;
    await db
      .update(users)
      .set({
        role: "staff",
        status: "active",
        organizationId: invite.organizationId,
        passwordHash: await bcrypt.hash(password, 12),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  } else {
    const [newUser] = await db
      .insert(users)
      .values({
        email: invite.email,
        name,
        passwordHash: await bcrypt.hash(password, 12),
        role: "staff",
        status: "active",
        organizationId: invite.organizationId,
      })
      .returning({ id: users.id });
    userId = newUser.id;
  }

  await db
    .update(staffMembers)
    .set({
      userId,
      status: "active",
      displayName: name,
      updatedAt: new Date(),
    })
    .where(eq(staffMembers.id, invite.staffMemberId));

  await db
    .update(invites)
    .set({ acceptedAt: new Date() })
    .where(eq(invites.id, invite.id));

  return NextResponse.json({
    message: "Account created successfully. You can now log in.",
    loginUrl: "/login",
  });
}
