import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    returning: vi.fn(),
  },
}));

vi.mock("date-fns", () => ({
  addMinutes: vi.fn((date: Date, minutes: number) => {
    const r = new Date(date);
    r.setMinutes(r.getMinutes() + minutes);
    return r;
  }),
  addHours: vi.fn((date: Date, hours: number) => {
    const r = new Date(date);
    r.setHours(r.getHours() + hours);
    return r;
  }),
  isBefore: vi.fn((a: Date, b: Date) => a < b),
}));

describe("booking.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createBooking", () => {
    it("returns error for non-existent service", async () => {
      const { db } = await import("@/lib/db");
      (db.select as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const { createBooking } = await import(
        "@/lib/services/booking.service"
      );

      const result = await createBooking({
        organizationId: "org-123",
        serviceId: "svc-123",
        customerId: "cust-123",
        startsAt: new Date("2025-01-15T10:00:00Z"),
      });

      expect(result.success).toBe(false);
    });

    it("returns existing booking on idempotency key match", async () => {
      const { db } = await import("@/lib/db");
      const existingBooking = {
        id: "bk-1",
        idempotencyKey: "idem-123",
      };

      (db.select as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([existingBooking]),
          }),
        }),
      });

      const { createBooking } = await import(
        "@/lib/services/booking.service"
      );

      const result = await createBooking({
        organizationId: "org-123",
        serviceId: "svc-123",
        customerId: "cust-123",
        startsAt: new Date("2025-01-15T10:00:00Z"),
        idempotencyKey: "idem-123",
      });

      expect(result.success).toBe(true);
      expect(result.booking).toEqual(existingBooking);
    });
  });

  describe("cancelBooking", () => {
    it("returns error for non-existent booking", async () => {
      const { db } = await import("@/lib/db");
      (db.select as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const { cancelBooking } = await import(
        "@/lib/services/booking.service"
      );

      const result = await cancelBooking({
        bookingId: "nonexistent",
        organizationId: "org-123",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Booking not found");
    });
  });
});
