import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { services, organizations } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

const querySchema = z.object({
  orgId: z.string().uuid(),
});

/**
 * GET /api/widget/services?orgId=xxx — public services lookup for widget
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const parsed = querySchema.safeParse({
    orgId: searchParams.get("orgId"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid organization ID" },
      { status: 400 }
    );
  }

  const result = await db
    .select()
    .from(services)
    .where(
      and(
        eq(services.organizationId, parsed.data.orgId),
        eq(services.active, true)
      )
    );

  const [org] = await db
    .select({ timezone: organizations.timezone })
    .from(organizations)
    .where(eq(organizations.id, parsed.data.orgId))
    .limit(1);

  return NextResponse.json({
    services: result,
    timezone: org?.timezone || "UTC",
  });
}
