import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateToken } from "@/lib/auth/tokens";
import { sendVerificationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const email = (body as { email?: unknown })?.email;
    if (typeof email !== "string" || !email.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        status: users.status,
      })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (!user || user.status !== "pending") {
      return NextResponse.json(
        { message: "If an account exists, a verification link has been sent" },
        { status: 200 },
      );
    }

    const token = generateToken(user.id, user.email, "email_verification");

    await sendVerificationEmail(user.email, {
      name: user.name || "there",
      token,
    });

    return NextResponse.json({
      message: "If an account exists, a verification link has been sent",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
