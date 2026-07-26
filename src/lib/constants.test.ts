import { describe, it, expect } from "vitest";
import {
  BOOKING_STATUS,
  BOOKING_CHANNEL,
  USER_ROLE,
  SUBSCRIPTION_PLAN,
  PAYMENT_PROVIDER,
  DAYS_OF_WEEK,
  PLAN_LIMITS,
  OTP_LENGTH,
} from "@/lib/constants";

describe("constants", () => {
  it("has correct booking statuses", () => {
    expect(BOOKING_STATUS.PENDING).toBe("pending");
    expect(BOOKING_STATUS.CONFIRMED).toBe("confirmed");
    expect(BOOKING_STATUS.CANCELLED).toBe("cancelled");
    expect(BOOKING_STATUS.COMPLETED).toBe("completed");
    expect(BOOKING_STATUS.NO_SHOW).toBe("no_show");
  });

  it("has correct booking channels", () => {
    expect(BOOKING_CHANNEL.WEB).toBe("web");
    expect(BOOKING_CHANNEL.SMS).toBe("sms");
    expect(BOOKING_CHANNEL.VOICE).toBe("voice");
  });

  it("has correct user roles", () => {
    expect(USER_ROLE.OWNER).toBe("owner");
    expect(USER_ROLE.STAFF).toBe("staff");
    expect(USER_ROLE.SUPER_ADMIN).toBe("super_admin");
  });

  it("has correct days of week", () => {
    expect(DAYS_OF_WEEK.MONDAY).toBe(1);
    expect(DAYS_OF_WEEK.SUNDAY).toBe(0);
    expect(DAYS_OF_WEEK.SATURDAY).toBe(6);
  });

  it("has plan limits for all plans", () => {
    expect(PLAN_LIMITS.free).toBeDefined();
    expect(PLAN_LIMITS.pro).toBeDefined();
    expect(PLAN_LIMITS.enterprise).toBeDefined();
    expect(PLAN_LIMITS.free.maxBookingsPerMonth).toBe(50);
    expect(PLAN_LIMITS.pro.maxBookingsPerMonth).toBe(-1);
  });

  it("OTP length is 6", () => {
    expect(OTP_LENGTH).toBe(6);
  });
});
