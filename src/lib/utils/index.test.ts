import { describe, it, expect } from "vitest";
import { generateToken } from "@/lib/utils/server";
import {
  generateShortCode,
  slugify,
  formatPrice,
  formatDuration,
  timeStringToMinutes,
  minutesToTimeString,
} from "@/lib/utils";

describe("utils", () => {
  describe("generateToken", () => {
    it("generates a token", () => {
      const token = generateToken();
      expect(token).toBeTruthy();
      expect(typeof token).toBe("string");
    });

    it("generates unique tokens", () => {
      const token1 = generateToken();
      const token2 = generateToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe("generateShortCode", () => {
    it("generates a short code of specified length", () => {
      expect(generateShortCode(6)).toHaveLength(6);
    });

    it("excludes ambiguous characters", () => {
      const code = generateShortCode(20);
      expect(code).not.toMatch(/[IO01]/);
    });
  });

  describe("slugify", () => {
    it("converts text to URL-safe slug", () => {
      expect(slugify("Hello World")).toBe("hello-world");
      expect(slugify("My Business!")).toBe("my-business");
      expect(slugify("  Spaces  ")).toBe("spaces");
    });
  });

  describe("formatPrice", () => {
    it("formats NGN price", () => {
      const result = formatPrice(500000, "NGN");
      expect(result).toContain("5,000");
    });
  });

  describe("formatDuration", () => {
    it("formats minutes only", () => {
      expect(formatDuration(30)).toBe("30min");
    });

    it("formats hours only", () => {
      expect(formatDuration(60)).toBe("1h");
    });

    it("formats hours and minutes", () => {
      expect(formatDuration(90)).toBe("1h 30min");
    });
  });

  describe("timeStringToMinutes", () => {
    it("converts time string to minutes", () => {
      expect(timeStringToMinutes("09:00")).toBe(540);
      expect(timeStringToMinutes("17:30")).toBe(1050);
    });
  });

  describe("minutesToTimeString", () => {
    it("converts minutes to time string", () => {
      expect(minutesToTimeString(540)).toBe("09:00");
      expect(minutesToTimeString(1050)).toBe("17:30");
    });
  });
});
