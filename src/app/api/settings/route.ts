import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireOwner } from "@/lib/auth/tenant";

const updateSettingsSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
  timezone: z.string().max(50).optional(),
});

/**
 * GET /api/settings — return the authenticated user's org settings
 */
export async function GET() {
  const user = await requireOwner();

  if (!user.organizationId) {
    return NextResponse.json(
      { error: "No organization linked to this account" },
      { status: 400 }
    );
  }

  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, user.organizationId))
    .limit(1);

  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: org.id,
    name: org.name,
    slug: org.slug,
    phone: org.phone,
    email: org.email,
    address: org.address,
    description: org.description,
    timezone: org.timezone,
    logoUrl: org.logoUrl,
  });
}

/**
 * PATCH /api/settings — update the authenticated user's org settings
 */
export async function PATCH(request: NextRequest) {
  const user = await requireOwner();

  if (!user.organizationId) {
    return NextResponse.json(
      { error: "No organization linked to this account" },
      { status: 400 }
    );
  }

  const body = await request.json();

  const parsed = updateSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid parameters", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const [updated] = await db
    .update(organizations)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(organizations.id, user.organizationId))
    .returning();

  return NextResponse.json({ settings: updated });
}
