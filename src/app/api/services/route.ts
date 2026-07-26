import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { services } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

const createServiceSchema = z.object({
  organizationId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  durationMinutes: z.number().int().min(5).max(480),
  priceCents: z.number().int().min(0),
  currency: z.string().length(3).default("NGN"),
  bufferMinutes: z.number().int().min(0).max(60).default(10),
  depositRequired: z.boolean().default(false),
  depositAmountCents: z.number().int().min(0).default(0),
});

/**
 * GET /api/services?orgId=xxx
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
    .from(services)
    .where(and(eq(services.organizationId, orgId), eq(services.active, true)));

  return NextResponse.json({ services: result });
}

/**
 * POST /api/services
 */
export async function POST(request: NextRequest) {
  const body = await request.json();

  const parsed = createServiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid parameters", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const [service] = await db.insert(services).values(parsed.data).returning();

  return NextResponse.json({ service }, { status: 201 });
}
