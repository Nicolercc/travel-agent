import { describe, expect, it } from "vitest";
import {
  formatDateOnly,
  isDateOnlyString,
  parseDateOnly,
  toLocalDateOnlyString,
} from "./dates";

describe("parseDateOnly", () => {
  it("parses YYYY-MM-DD as local midnight", () => {
    const date = parseDateOnly("2026-08-04");
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(7);
    expect(date.getDate()).toBe(4);
  });

  it("formats Aug 4 without rolling to Aug 3 in US timezones", () => {
    expect(formatDateOnly("2026-08-04", "MMM d")).toBe("Aug 4");
  });

  it("rejects non date-only strings", () => {
    expect(() => parseDateOnly("2026-08-04T12:00:00Z")).toThrow();
    expect(isDateOnlyString("2026-08-04T12:00:00Z")).toBe(false);
  });
});

describe("toLocalDateOnlyString", () => {
  it("round-trips with parseDateOnly", () => {
    const original = new Date(2026, 6, 28);
    expect(toLocalDateOnlyString(original)).toBe("2026-07-28");
    expect(parseDateOnly("2026-07-28").getDate()).toBe(28);
  });
});
