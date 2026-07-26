import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("date-fns", () => ({
  addMinutes: vi.fn((date: Date, minutes: number) => {
    const r = new Date(date);
    r.setMinutes(r.getMinutes() + minutes);
    return r;
  }),
  startOfDay: vi.fn((date: Date) => {
    const r = new Date(date);
    r.setHours(0, 0, 0, 0);
    return r;
  }),
  endOfDay: vi.fn((date: Date) => {
    const r = new Date(date);
    r.setHours(23, 59, 59, 999);
    return r;
  }),
  parseISO: vi.fn((str: string) => new Date(str)),
}));

function makeChain(result: any) {
  return {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue(result),
  };
}

describe("availability.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty array when service is not found", async () => {
    vi.doMock("@/lib/db", () => ({
      db: { select: vi.fn().mockReturnValue(makeChain([])) },
    }));

    const { computeAvailableSlots } = await import(
      "@/lib/services/availability.service"
    );

    const slots = await computeAvailableSlots({
      organizationId: "org-123",
      serviceId: "nonexistent",
      date: "2025-01-15",
    });

    expect(slots).toEqual([]);
    vi.doUnmock("@/lib/db");
  });

  it("returns empty array when no working hours for the day", async () => {
    let callCount = 0;
    vi.doMock("@/lib/db", () => ({
      db: {
        select: vi.fn().mockImplementation((): any => {
          callCount++;
          if (callCount === 1) {
            // Service found
            return makeChain([
              { id: "svc-1", active: true, durationMinutes: 30, bufferMinutes: 10 },
            ]);
          }
          // All other queries return empty
          return makeChain([]);
        }),
      },
    }));

    const { computeAvailableSlots } = await import(
      "@/lib/services/availability.service"
    );

    const slots = await computeAvailableSlots({
      organizationId: "org-123",
      serviceId: "svc-1",
      date: "2025-01-15",
    });

    expect(slots).toEqual([]);
    vi.doUnmock("@/lib/db");
  });
});
