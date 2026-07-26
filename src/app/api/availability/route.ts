import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { computeAvailableSlots, getRecommendedSlots } from "@/lib/services/availability.service";

const querySchema = z.object({
  orgId: z.string().uuid(),
  serviceId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  staffMemberId: z.string().uuid().optional(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const parsed = querySchema.safeParse({
    orgId: searchParams.get("orgId"),
    serviceId: searchParams.get("serviceId"),
    date: searchParams.get("date"),
    staffMemberId: searchParams.get("staffMemberId") || undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid parameters", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { orgId, serviceId, date, staffMemberId } = parsed.data;

  try {
    const slots = await computeAvailableSlots({
      organizationId: orgId,
      serviceId,
      date,
      staffMemberId,
    });

    // Also get recommended slots for the date
    const recommended = await getRecommendedSlots({
      organizationId: orgId,
      serviceId,
      date,
      staffMemberId,
    });

    return NextResponse.json({
      slots: slots.map((s) => ({
        startsAt: s.startsAt.toISOString(),
        endsAt: s.endsAt.toISOString(),
        staffMemberId: s.staffMemberId,
      })),
      recommended: recommended.map((s) => ({
        startsAt: s.startsAt.toISOString(),
        endsAt: s.endsAt.toISOString(),
        staffMemberId: s.staffMemberId,
      })),
    });
  } catch (error) {
    console.error("Availability check failed:", error);
    return NextResponse.json(
      { error: "Failed to check availability" },
      { status: 500 }
    );
  }
}
