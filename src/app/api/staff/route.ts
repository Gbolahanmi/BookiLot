import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { staffMembers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

const createStaffSchema = z.object({
  organizationId: z.string().uuid(),
  displayName: z.string().min(1).max(255),
  bio: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

/**
 * GET /api/staff?orgId=xxx
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const orgId = searchParams.get("orgId");

  if (!orgId) {
    return NextResponse.json(
      { error: "organizationId is required" },
      { status: 400 }
    );
  }

  const result = await db
    .select()
    .from(staffMembers)
    .where(
      and(
        eq(staffMembers.organizationId, orgId),
        eq(staffMembers.active, true)
      )
    );

  return NextResponse.json({ staff: result });
}

/**
 * POST /api/staff
 */
export async function POST(request: NextRequest) {
  const body = await request.json();

  const parsed = createStaffSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid parameters", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const [staff] = await db.insert(staffMembers).values(parsed.data).returning();

  return NextResponse.json({ staff }, { status: 201 });
}
