import { describe, expect, it } from "vitest";
import { seed } from "@/data/seed";
import { getTripPhase } from "./trip-phase";
import { placementForPriority } from "./placement";

const at = (y: number, m: number, d: number) => new Date(y, m - 1, d, 10);

describe("trip phase", () => {
  it.each([
    [at(2026, 7, 25), "upcoming", "3 days to go"],
    [at(2026, 7, 27), "upcoming", "1 day to go"],
    [at(2026, 7, 28), "traveling", "Traveling now"],
    [at(2026, 8, 5), "traveling", "Traveling now"],
    [at(2026, 8, 6), "completed", "Trip completed"],
  ] as const)("on %s is %s (%s)", (now, phase, label) => {
    expect(getTripPhase(seed.trip, now)).toMatchObject({ phase, label });
  });
});

describe("Inbox placement", () => {
  it("never chooses the anchor", () => {
    expect((["must", "high", "medium", "low"] as const).map(placementForPriority)).toEqual(["planned", "planned", "optional", "backup"]);
  });
});
