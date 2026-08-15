import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyToken } from "@/lib/auth/tokens";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/verify-email?error=missing_token", req.url)
      );
    }

    const payload = verifyToken(token);

    if (!payload || payload.purpose !== "email_verification") {
      return NextResponse.redirect(
        new URL("/verify-email?error=invalid_token", req.url)
      );
    }

    const [user] = await db
      .select({ id: users.id, status: users.status })
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (!user) {
      return NextResponse.redirect(
        new URL("/verify-email?error=user_not_found", req.url)
      );
    }

    if (user.status !== "pending") {
      return NextResponse.redirect(
        new URL("/login?message=already_verified", req.url)
      );
    }

    await db
      .update(users)
      .set({ status: "email_verified" })
      .where(eq(users.id, payload.userId));

    return NextResponse.redirect(
      new URL("/login?message=verified", req.url)
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.redirect(
      new URL("/verify-email?error=server_error", req.url)
    );
  }
}
