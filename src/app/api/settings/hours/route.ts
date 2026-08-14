import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { workingHours } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireOwner } from "@/lib/auth/tenant";

const updateHoursSchema = z.object({
  hours: z.array(
    z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      endTime: z.string().regex(/^\d{2}:\d{2}$/),
      active: z.boolean(),
    })
  ),
});

/**
 * GET /api/settings/hours — return working hours for the org
 */
export async function GET() {
  const user = await requireOwner();

  if (!user.organizationId) {
    return NextResponse.json(
      { error: "No organization linked to this account" },
      { status: 400 }
    );
  }

  const result = await db
    .select()
    .from(workingHours)
    .where(
      and(
        eq(workingHours.organizationId, user.organizationId),
        eq(workingHours.active, true)
      )
    )
    .orderBy(workingHours.dayOfWeek);

  return NextResponse.json({ hours: result });
}

/**
 * PATCH /api/settings/hours — replace working hours for the org
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

  const parsed = updateHoursSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid parameters", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Delete existing hours for this org (non-staff-specific)
  await db
    .delete(workingHours)
    .where(
      and(
        eq(workingHours.organizationId, user.organizationId),
        eq(workingHours.active, true)
      )
    );

  // Insert new hours
  const inserted = await db
    .insert(workingHours)
    .values(
      parsed.data.hours.map((h) => ({
        organizationId: user.organizationId!,
        dayOfWeek: h.dayOfWeek,
        startTime: h.startTime,
        endTime: h.endTime,
        active: h.active,
      }))
    )
    .returning();

  return NextResponse.json({ hours: inserted });
}
