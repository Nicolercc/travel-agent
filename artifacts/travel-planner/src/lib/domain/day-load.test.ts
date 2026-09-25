import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { seed } from "@/data/seed";
import {
  buildDayLoadInput,
  computeDayLoad,
  transitionMinutes,
  type DayLoad,
  type DayLoadInput,
  type LoadActivity,
  type Verdict,
} from "./day-load";
import type { Place, Placement } from "./types";

const locationsById = new Map(seed.locations.map((location) => [location.id, location]));
const RANK: Record<Verdict, number> = { comfortable: 0, full: 1, tight: 2, overloaded: 3 };

function loadFor(dayId: string, places: Place[] = seed.places): DayLoad {
  const day = seed.days.find((candidate) => candidate.id === dayId)!;
  return computeDayLoad(buildDayLoadInput({ day, places, fixedEvents: seed.fixedEvents, legs: seed.legs, locationsById }));
}

function withPlacement(places: Place[], placeId: string, placement: Placement): Place[] {
  return places.map((place) =>
    place.id === placeId ? { ...place, assignment: { ...place.assignment!, placement, backupFor: null, reason: null } } : place,
  );
}

const codes = (load: DayLoad) => load.reasons.map((reason) => reason.code);

function activity(overrides: Partial<LoadActivity> & { id: string }): LoadActivity {
  return {
    label: overrides.id,
    area: "Eixample",
    city: "Barcelona",
    durationMinutes: 60,
    durationEstimated: false,
    start: null,
    energy: "low",
    priority: "medium",
    isAnchor: false,
    ...overrides,
  };
}

function input(overrides: Partial<DayLoadInput> = {}): DayLoadInput {
  return {
    dayType: "city",
    energyMode: "full",
    startStop: { area: "Montjuïc", city: "Barcelona" },
    endStop: { area: "Montjuïc", city: "Barcelona" },
    busy: [],
    committed: [],
    optional: [],
    travelEnergy: 0,
    ...overrides,
  };
}

describe("day load — pinned seed verdicts (docs/DAY_LOAD.md)", () => {
  it.each([
    ["day-0", "comfortable", "planned", []],
    ["day-1", "comfortable", "planned", []],
    ["day-2", "full", "planned", []],
    ["day-3", "comfortable", "planned", []],
    ["day-4", "full", "planned", []],
    ["day-5", "comfortable", "planned", []],
    ["day-6", "comfortable", "estimate", ["MOSTLY_ESTIMATED"]],
    ["day-7", "full", "estimate", ["MOSTLY_ESTIMATED"]],
    ["day-8", "comfortable", "planned", ["SHORT_WINDOW"]],
  ] as const)("%s is %s (%s) with reasons %j", (dayId, verdict, confidence, reasonCodes) => {
    const load = loadFor(dayId);
    expect(load.verdict).toBe(verdict);
    expect(load.confidence).toBe(confidence);
    expect(codes(load)).toEqual(reasonCodes);
  });

  it("Aug 1: adding a third stop (Sa Tuna) makes the road trip Tight, and the fix is Sa Tuna itself", () => {
    const load = loadFor("day-4", withPlacement(seed.places, "place-satuna", "planned"));
    expect(load.verdict).toBe("tight");
    expect(codes(load)).toEqual(["LOW_SLACK", "ENERGY_OVER_BUDGET"]);
    expect(load.suggestion).toEqual({ placeId: "place-satuna", label: "Sa Tuna or Aiguablava", verdictAfter: "full" });
  });

  it("Jul 29: committing to Cova on a long-haul arrival day is too much energy", () => {
    const load = loadFor("day-1", withPlacement(seed.places, "place-cova", "planned"));
    expect(load.verdict).toBe("tight");
    expect(codes(load)).toContain("ENERGY_OVER_BUDGET");
    expect(load.suggestion?.placeId).toBe("place-cova");
  });

  it("Jul 30: overloading the coves day suggests cutting a low-priority extra, not a must-do", () => {
    let places = withPlacement(seed.places, "place-cala-turqueta", "planned");
    places = withPlacement(places, "place-lithica", "planned");
    const load = loadFor("day-2", places);
    expect(load.verdict).toBe("overloaded");
    expect(codes(load)).toEqual(expect.arrayContaining(["OVER_CAPACITY", "ENERGY_OVER_BUDGET", "MANY_AREAS"]));
    const suggested = seed.places.find((place) => place.id === load.suggestion?.placeId)!;
    expect(suggested.priority).toBe("medium");
    expect(RANK[load.suggestion!.verdictAfter]).toBeLessThan(RANK.overloaded);
  });

  it("shows the overnight flight's cost: DL128 blocks the Jul 28 evening and the Jul 29 morning", () => {
    const day0 = buildDayLoadInput({ day: seed.days[0], places: seed.places, fixedEvents: seed.fixedEvents, legs: seed.legs, locationsById });
    const day1 = buildDayLoadInput({ day: seed.days[1], places: seed.places, fixedEvents: seed.fixedEvents, legs: seed.legs, locationsById });
    expect(day0.busy.find((b) => b.id === "leg-dl128")).toMatchObject({ start: 18 * 60 + 55 - 150 });
    expect(day1.busy.find((b) => b.id === "leg-dl128")).toMatchObject({ end: 8 * 60 + 45 + 45 });
    expect(day1.travelEnergy).toBeGreaterThan(0);
  });
});

describe("day load — guarantees", () => {
  it("is deterministic and does not mutate its input", () => {
    for (const day of seed.days) {
      const dayInput = buildDayLoadInput({ day, places: seed.places, fixedEvents: seed.fixedEvents, legs: seed.legs, locationsById });
      const before = structuredClone(dayInput);
      expect(computeDayLoad(dayInput)).toEqual(computeDayLoad(structuredClone(dayInput)));
      expect(dayInput).toEqual(before);
    }
  });

  it("monotonicity: committing an optional plan never improves a day; demoting a plan never worsens it", () => {
    for (const day of seed.days) {
      const base = loadFor(day.id);
      for (const place of seed.places.filter((p) => p.assignment?.dayId === day.id)) {
        if (place.assignment!.placement === "optional") {
          expect(RANK[loadFor(day.id, withPlacement(seed.places, place.id, "planned")).verdict]).toBeGreaterThanOrEqual(RANK[base.verdict]);
        }
        if (place.assignment!.placement === "planned") {
          expect(RANK[loadFor(day.id, withPlacement(seed.places, place.id, "optional")).verdict]).toBeLessThanOrEqual(RANK[base.verdict]);
        }
      }
    }
  });

  it("isolation: optional, backup, and do-not-cram plans never change committed load", () => {
    for (const day of seed.days) {
      const base = loadFor(day.id);
      for (const placement of ["optional", "backup", "do-not-cram"] as const) {
        const extra: Place = {
          ...seed.places[0],
          id: `place-extra-${placement}`,
          durationMinutes: 600,
          energyCost: "high",
          window: null,
          assignment: { dayId: day.id, placement, backupFor: null, reason: null },
        };
        const load = loadFor(day.id, [...seed.places, extra]);
        expect(load.committedMinutes).toBe(base.committedMinutes);
        expect(load.energyPoints).toBe(base.energyPoints);
        expect(load.verdict).toBe(base.verdict);
      }
    }
  });

  it("a suggestion, when offered, strictly improves the day and never demotes the anchor", () => {
    const scenarios: Place[][] = [];
    for (const day of seed.days) {
      let places = seed.places;
      for (const place of seed.places.filter((p) => p.assignment?.dayId === day.id && p.assignment.placement === "optional")) {
        places = withPlacement(places, place.id, "planned");
        scenarios.push(places);
      }
    }
    let offered = 0;
    for (const places of scenarios) {
      for (const day of seed.days) {
        const load = loadFor(day.id, places);
        if (!load.suggestion) continue;
        offered++;
        const target = places.find((p) => p.id === load.suggestion!.placeId)!;
        expect(target.assignment!.placement).not.toBe("anchor");
        const after = loadFor(day.id, withPlacement(places, target.id, "optional"));
        expect(after.verdict).toBe(load.suggestion.verdictAfter);
        expect(RANK[after.verdict] < RANK[load.verdict] || after.reasons.length < load.reasons.length).toBe(true);
      }
    }
    expect(offered).toBeGreaterThan(0);
  });
});

describe("day load — synthetic edge cases", () => {
  it("an empty day is Comfortable", () => {
    expect(computeDayLoad(input()).verdict).toBe("comfortable");
  });

  it("two plans at the same time are Overloaded with a time conflict", () => {
    const load = computeDayLoad(input({ committed: [activity({ id: "a", start: 600 }), activity({ id: "b", start: 630 })] }));
    expect(load.verdict).toBe("overloaded");
    expect(codes(load)[0]).toBe("TIME_CONFLICT");
    expect(load.conflicts).toEqual([["a", "b"]]);
  });

  it("a timed plan during a flight or appointment is a conflict", () => {
    const load = computeDayLoad(
      input({ busy: [{ id: "flight", label: "Flight", start: 600, end: 720 }], committed: [activity({ id: "a", start: 660 })] }),
    );
    expect(load.conflicts).toEqual([["a", "flight"]]);
  });

  it("a plan outside the usable day is a conflict", () => {
    expect(computeDayLoad(input({ committed: [activity({ id: "late", start: 21 * 60 + 30 })] })).conflicts).toEqual([["late", "day-window"]]);
  });

  it("anything planned on a day with no free time is Overloaded", () => {
    const load = computeDayLoad(
      input({ busy: [{ id: "all-day", label: "Travel", start: 0, end: 24 * 60 }], committed: [activity({ id: "a" })] }),
    );
    expect(load.verdict).toBe("overloaded");
    expect(codes(load)).toEqual(expect.arrayContaining(["OVER_CAPACITY", "SHORT_WINDOW"]));
  });

  it("experience-type days without an anchor say so; travel days never do", () => {
    expect(codes(computeDayLoad(input({ committed: [activity({ id: "a" })] })))).toContain("NO_ANCHOR");
    expect(codes(computeDayLoad(input({ dayType: "arrival", committed: [activity({ id: "a" })] })))).not.toContain("NO_ANCHOR");
  });

  it("more than one plan on a travel day is flagged", () => {
    const load = computeDayLoad(input({ dayType: "departure", committed: [activity({ id: "a" }), activity({ id: "b" })] }));
    expect(codes(load)).toContain("TRAVEL_DAY_SQUEEZE");
  });

  it("zig-zagging across areas is flagged on city days but not on road trips", () => {
    const committed = [
      activity({ id: "a", area: "El Born" }),
      activity({ id: "b", area: "Gràcia" }),
      activity({ id: "c", area: "Eixample", isAnchor: true }),
    ];
    expect(codes(computeDayLoad(input({ committed })))).toContain("MANY_AREAS");
    expect(codes(computeDayLoad(input({ dayType: "road-trip", committed })))).not.toContain("MANY_AREAS");
  });

  it("labels a day built mostly on category estimates as an estimate", () => {
    const load = computeDayLoad(
      input({ committed: [activity({ id: "a", durationEstimated: true, durationMinutes: 120, isAnchor: true }), activity({ id: "b", durationMinutes: 60 })] }),
    );
    expect(load.confidence).toBe("estimate");
    expect(codes(load)).toContain("MOSTLY_ESTIMATED");
  });

  it("an optional plan fits only if inserting it stays within the available time", () => {
    const busy = [{ id: "block", label: "Block", start: 510, end: 1200 }];
    const load = computeDayLoad(
      input({ busy, optional: [activity({ id: "short", durationMinutes: 30 }), activity({ id: "long", durationMinutes: 200 })] }),
    );
    expect(load.optional).toEqual([
      { placeId: "short", fits: true },
      { placeId: "long", fits: false },
    ]);
  });

  it("transitions require the same city before names count as the same area", () => {
    expect(transitionMinutes({ area: "Old Town", city: "Begur" }, { area: "Old Town", city: "Begur" })).toBe(15);
    expect(transitionMinutes({ area: "Old Town", city: "Begur" }, { area: "Vila Vella", city: "Begur" })).toBe(30);
    expect(transitionMinutes({ area: "Old Town", city: "Begur" }, { area: "Old Town", city: "Ciutadella" })).toBe(60);
  });

  it("never presents a duration as precise: any number in a reason is prefixed \"about\"", () => {
    const loads = [
      computeDayLoad(input({ busy: [{ id: "b", label: "B", start: 510, end: 1230 }], committed: [activity({ id: "a", durationMinutes: 47, isAnchor: true })] })),
      computeDayLoad(input({ busy: [{ id: "b", label: "B", start: 510, end: 1300 }], committed: [activity({ id: "a", durationMinutes: 200, isAnchor: true })] })),
      ...seed.days.map((day) => loadFor(day.id)),
    ];
    const numeric = loads.flatMap((load) => load.reasons).filter((reason) => /\d/.test(reason.message));
    expect(numeric.length).toBeGreaterThan(0);
    for (const reason of numeric.filter((r) => r.code !== "MANY_AREAS")) expect(reason.message).toMatch(/about/);
  });
});

describe("heuristics are centralized (RFC amendment 3)", () => {
  const here = dirname(fileURLToPath(import.meta.url));

  it("day-load.ts contains no numeric literals other than 0 and 1", () => {
    const source = readFileSync(join(here, "day-load.ts"), "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*$/gm, "")
      .replace(/(["'`])(?:\\.|(?!\1).)*\1/g, "");
    const literals = source.match(/(?<![\w.])\d+(?:\.\d+)?(?![\w.])/g) ?? [];
    expect(literals.filter((literal) => literal !== "0" && literal !== "1")).toEqual([]);
  });

  it("the heuristics module documents itself as heuristic", () => {
    const source = readFileSync(join(here, "planning-heuristics.ts"), "utf8");
    expect(source).toMatch(/deliberately rough planning estimates/);
  });
});
