import { describe, expect, it } from "vitest";
import { parseLocalDateTime, resolveDemoNow } from "./demo-clock";

describe("demo clock", () => {
  it("defaults to three days before the demo trip departs", () => {
    const now = resolveDemoNow(null);
    expect([now.getFullYear(), now.getMonth(), now.getDate(), now.getHours()]).toEqual([2026, 6, 25, 10]);
  });

  it("parses date-time overrides as local wall-clock time", () => {
    const now = resolveDemoNow("2026-08-04T11:30");
    expect([now.getMonth(), now.getDate(), now.getHours(), now.getMinutes()]).toEqual([7, 4, 11, 30]);
  });

  it("accepts a date-only override at local midnight", () => {
    const now = resolveDemoNow("2026-07-31");
    expect([now.getDate(), now.getHours()]).toEqual([31, 0]);
  });

  it.each(["2026-02-30", "2026-07-28T25:00", "tomorrow", "2026-7-28", ""])(
    "falls back to the default for invalid override %j",
    (value) => {
      expect(parseLocalDateTime(value)).toBeNull();
      expect(resolveDemoNow(value).getDate()).toBe(25);
    },
  );
});
