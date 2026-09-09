import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { users, organizations, services, workingHours } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { business, services: svcList, workingHours: wh } = body;

    if (!business?.name || !business?.phone) {
      return NextResponse.json(
        { error: "Business name and phone are required" },
        { status: 400 }
      );
    }

    if (!svcList || svcList.length === 0) {
      return NextResponse.json(
        { error: "At least one service is required" },
        { status: 400 }
      );
    }

    // Create organization
    const slug = business.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const [org] = await db
      .insert(organizations)
      .values({
        name: business.name,
        slug,
        phone: business.phone,
        email: business.email || session.user.email,
        address: business.address || null,
        timezone: business.timezone || "UTC",
      })
      .returning({ id: organizations.id });

    // Create services
    for (const svc of svcList) {
      await db.insert(services).values({
        organizationId: org.id,
        name: svc.name,
        description: svc.description || null,
        durationMinutes: parseInt(svc.duration) || 30,
        priceCents: svc.price ? Math.round(parseFloat(svc.price) * 100) : 0,
        currency: business.currency || "USD",
      });
    }

    // Create working hours
    const dayMap: Record<string, number> = {
      Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
    };

    for (const [day, config] of Object.entries(wh)) {
      const dayConfig = config as { open: string; close: string; active: boolean };
      if (!dayConfig.active) continue;

      const [openH, openM] = dayConfig.open.split(":").map(Number);
      const [closeH, closeM] = dayConfig.close.split(":").map(Number);

      await db.insert(workingHours).values({
        organizationId: org.id,
        dayOfWeek: dayMap[day],
        startTime: `${String(openH).padStart(2, "0")}:${String(openM).padStart(2, "0")}`,
        endTime: `${String(closeH).padStart(2, "0")}:${String(closeM).padStart(2, "0")}`,
      });
    }

    // Link user to org and set active
    await db
      .update(users)
      .set({
        organizationId: org.id,
        status: "active",
      })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({ message: "Onboarding complete", organizationId: org.id });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
