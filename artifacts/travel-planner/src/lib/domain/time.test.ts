import { describe, expect, it } from "vitest";
import { formatApproxDuration, formatClock, formatTimeOfDay, isTimeOfDay, toMinutes } from "./time";

describe("time of day", () => {
  it("parses HH:mm into minutes since midnight", () => {
    expect(toMinutes("00:00")).toBe(0);
    expect(toMinutes("08:30")).toBe(510);
    expect(toMinutes("23:59")).toBe(1439);
  });

  it.each(["24:00", "8:30", "12:60", "noon", ""])("rejects %j", (value) => {
    expect(isTimeOfDay(value)).toBe(false);
    expect(() => toMinutes(value)).toThrow();
  });

  it("formats 12-hour clock times", () => {
    expect(formatClock(0)).toBe("12:00 AM");
    expect(formatClock(12 * 60)).toBe("12:00 PM");
    expect(formatTimeOfDay("18:55")).toBe("6:55 PM");
    expect(formatTimeOfDay("08:05")).toBe("8:05 AM");
  });
});

describe("approximate durations (honesty rule)", () => {
  it.each([
    [0, "no time"],
    [7, "no time"],
    [8, "about 15 minutes"],
    [50, "about 45 minutes"],
    [60, "about 1 hour"],
    [150, "about 2½ hours"],
    [200, "about 3¼ hours"],
    [345, "about 5¾ hours"],
  ])("%i minutes reads as %j", (minutes, expected) => {
    expect(formatApproxDuration(minutes)).toBe(expected);
  });
});
