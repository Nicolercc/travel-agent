import { describe, expect, it } from "vitest";
import { seed } from "@/data/seed";
import { legDurationMinutes, legIsInternational, legLeavesTrip, legsForDay } from "./legs";

const day = (id: string) => seed.days.find((candidate) => candidate.id === id)!;
const leg = (id: string) => seed.legs.find((candidate) => candidate.id === id)!;
const locationsById = new Map(seed.locations.map((location) => [location.id, location]));

describe("leg attachment (INV-7)", () => {
  it("shows the overnight DL128 on both its departure and arrival days", () => {
    expect(legsForDay(day("day-0"), seed.legs).map((l) => l.id)).toContain("leg-dl128");
    expect(legsForDay(day("day-1"), seed.legs).map((l) => l.id)).toContain("leg-dl128");
    expect(legsForDay(day("day-2"), seed.legs).map((l) => l.id)).not.toContain("leg-dl128");
  });

  it("keeps untimed legs on their owning day only", () => {
    const owners = seed.days.filter((d) => legsForDay(d, seed.legs).some((l) => l.id === "leg-drive-coves"));
    expect(owners.map((d) => d.id)).toEqual(["day-2"]);
  });

  it("recognizes the long-haul legs as international and the flight home as leaving the trip", () => {
    expect(legIsInternational(leg("leg-dl128"), locationsById)).toBe(true);
    expect(legIsInternational(leg("leg-fr7509"), locationsById)).toBe(false);
    expect(legLeavesTrip(leg("leg-dl129"), locationsById)).toBe(true);
    expect(legLeavesTrip(leg("leg-dl128"), locationsById)).toBe(false);
  });
});

describe("leg duration across time zones", () => {
  const location = (id: string) => seed.locations.find((candidate) => candidate.id === id)!;
  const duration = (legId: string) => {
    const leg = seed.legs.find((candidate) => candidate.id === legId)!;
    return legDurationMinutes(leg, location(leg.fromLocationId), location(leg.toLocationId));
  };

  it("converts each end with its own zone (DL128: 18:55 New York → 08:45 Barcelona next day is 7 h 50)", () => {
    expect(duration("leg-dl128")).toBe(7 * 60 + 50);
    expect(duration("leg-dl129")).toBe(8 * 60 + 41);
  });

  it("is plain subtraction within one zone", () => {
    expect(duration("leg-fr7509")).toBe(60);
    expect(duration("leg-fr6882")).toBe(55);
  });

  it("is unknown when either time is missing", () => {
    expect(duration("leg-car-menorca-pickup")).toBeNull();
    expect(duration("leg-drive-coves")).toBeNull();
  });

  it("does not depend on the machine's time zone", () => {
    const leg = { ...seed.legs[0], departure: { date: "2026-03-08", time: "01:30" }, arrival: { date: "2026-03-08", time: "03:30" } };
    const newYork = location("loc-jfk");
    // US DST starts 02:00 on Mar 8, 2026: 01:30 EST → 03:30 EDT is one hour.
    expect(legDurationMinutes(leg, newYork, newYork)).toBe(60);
  });
});
