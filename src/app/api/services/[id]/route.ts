import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { services } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireOwner } from "@/lib/auth/tenant";

const updateServiceSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  durationMinutes: z.number().int().min(5).max(480).optional(),
  priceCents: z.number().int().min(0).optional(),
  currency: z.string().length(3).optional(),
  bufferMinutes: z.number().int().min(0).max(60).optional(),
  depositRequired: z.boolean().optional(),
  depositAmountCents: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
});

/**
 * PATCH /api/services/[id]
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireOwner();

  if (!user.organizationId) {
    return NextResponse.json(
      { error: "No organization linked to this account" },
      { status: 400 }
    );
  }

  const { id } = await params;
  const body = await request.json();

  const parsed = updateServiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid parameters", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const [updated] = await db
    .update(services)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(
      and(eq(services.id, id), eq(services.organizationId, user.organizationId))
    )
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  return NextResponse.json({ service: updated });
}

/**
 * DELETE /api/services/[id] — soft delete
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireOwner();

  if (!user.organizationId) {
    return NextResponse.json(
      { error: "No organization linked to this account" },
      { status: 400 }
    );
  }

  const { id } = await params;

  const [updated] = await db
    .update(services)
    .set({ active: false, updatedAt: new Date() })
    .where(
      and(eq(services.id, id), eq(services.organizationId, user.organizationId))
    )
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
