import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { services } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireOwner, requireStaff } from "@/lib/auth/tenant";

const createServiceSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  durationMinutes: z.number().int().min(5).max(480),
  priceCents: z.number().int().min(0),
  currency: z.string().length(3).optional(),
  bufferMinutes: z.number().int().min(0).max(60).default(10),
  depositRequired: z.boolean().default(false),
  depositAmountCents: z.number().int().min(0).default(0),
});

/**
 * GET /api/services — returns services for the authenticated user's org
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
    .select()
    .from(services)
    .where(
      and(
        eq(services.organizationId, user.organizationId),
        eq(services.active, true)
      )
    );

  return NextResponse.json({ services: result });
}

/**
 * POST /api/services — create a service for the authenticated user's org
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

  const parsed = createServiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid parameters", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const [service] = await db
    .insert(services)
    .values({ ...parsed.data, organizationId: user.organizationId })
    .returning();

  return NextResponse.json({ service }, { status: 201 });
}
