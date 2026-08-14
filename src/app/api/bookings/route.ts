import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { customers } from "@/lib/db/schema";
import { createBooking } from "@/lib/services/booking.service";
import { getSession } from "@/lib/auth/tenant";

const createBookingSchema = z.object({
  organizationId: z.string().uuid(),
  serviceId: z.string().uuid(),
  staffMemberId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  customerName: z.string().min(1).max(255).optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().min(1).max(50).optional(),
  startsAt: z.string().datetime(),
  idempotencyKey: z.string().optional(),
  channel: z.enum(["web", "sms", "voice"]).default("web"),
  notes: z.string().optional(),
});

/**
 * POST /api/bookings
 *
 * Public endpoint — accepts orgId from body.
 * If customerId is provided, uses it directly.
 * If customerName/customerEmail/customerPhone are provided, creates or finds customer.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();

  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid parameters", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { startsAt, customerName, customerEmail, customerPhone, customerId, organizationId, serviceId, staffMemberId, idempotencyKey, channel, notes } = parsed.data;

  // Resolve customer
  let finalCustomerId = customerId;

  if (!finalCustomerId && (customerName || customerEmail || customerPhone)) {
    // Try to find existing customer by email or phone
    let existingCustomer = null;

    if (customerEmail) {
      const [found] = await db
        .select()
        .from(customers)
        .where(
          and(
            eq(customers.organizationId, organizationId),
            eq(customers.email, customerEmail)
          )
        )
        .limit(1);
      existingCustomer = found;
    }

    if (!existingCustomer && customerPhone) {
      const [found] = await db
        .select()
        .from(customers)
        .where(
          and(
            eq(customers.organizationId, organizationId),
            eq(customers.phone, customerPhone)
          )
        )
        .limit(1);
      existingCustomer = found;
    }

    if (existingCustomer) {
      finalCustomerId = existingCustomer.id;
    } else {
      // Create new customer
      const [newCustomer] = await db
        .insert(customers)
        .values({
          organizationId,
          name: customerName || "Guest",
          email: customerEmail ?? null,
          phone: customerPhone || "",
          isRegistered: false,
        })
        .returning();
      finalCustomerId = newCustomer.id;
    }
  }

  if (!finalCustomerId) {
    return NextResponse.json(
      { error: "Customer information is required (customerId or customerName/customerEmail)" },
      { status: 400 }
    );
  }

  try {
    const result = await createBooking({
      organizationId,
      serviceId,
      staffMemberId,
      customerId: finalCustomerId,
      startsAt: new Date(startsAt),
      idempotencyKey,
      channel,
      notes,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    return NextResponse.json({ booking: result.booking }, { status: 201 });
  } catch (error) {
    console.error("Booking creation failed:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bookings — returns bookings for the authenticated user's org
 */
export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  if (!session.user.organizationId) {
    return NextResponse.json(
      { error: "No organization linked to this account" },
      { status: 400 }
    );
  }

  const { bookings, services, staffMembers, customers: custs } = await import("@/lib/db/schema");

  const result = await db
    .select({
      id: bookings.id,
      startsAt: bookings.startsAt,
      endsAt: bookings.endsAt,
      status: bookings.status,
      channel: bookings.channel,
      notes: bookings.notes,
      createdAt: bookings.createdAt,
      serviceName: services.name,
      staffName: staffMembers.displayName,
      customerName: custs.name,
      customerEmail: custs.email,
      customerPhone: custs.phone,
    })
    .from(bookings)
    .innerJoin(services, eq(bookings.serviceId, services.id))
    .leftJoin(staffMembers, eq(bookings.staffMemberId, staffMembers.id))
    .innerJoin(custs, eq(bookings.customerId, custs.id))
    .where(eq(bookings.organizationId, session.user.organizationId));

  return NextResponse.json({ bookings: result });
}
