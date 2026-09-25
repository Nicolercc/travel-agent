import { describe, expect, it } from "vitest";
import { seed } from "@/data/seed";
import { validatePlaces, validateSeed } from "./validation";
import type { Place, Placement, TripSeed } from "./types";

const clone = (): TripSeed => structuredClone(seed);
const codes = (value: TripSeed) => validateSeed(value).map((issue) => issue.code);
const context = { dayIds: new Set(seed.days.map((d) => d.id)), bookingIds: new Set(seed.bookings.map((b) => b.id)) };

describe("seed validation", () => {
  it("accepts the Spain 2026 seed with zero issues", () => {
    expect(validateSeed(seed)).toEqual([]);
  });

  it("rejects dangling references", () => {
    const broken = clone();
    broken.legs[0].toLocationId = "loc-nowhere";
    broken.tasks[0].relatedPlaceId = "place-nowhere";
    broken.fixedEvents[0].bookingId = "book-nowhere";
    expect(codes(broken)).toEqual(expect.arrayContaining(["missing_location", "missing_place", "missing_booking"]));
  });

  it("rejects a leg that arrives before it departs", () => {
    const broken = clone();
    const leg = broken.legs.find((l) => l.id === "leg-fr7509")!;
    leg.arrival = { date: leg.departure!.date, time: "15:00" };
    expect(codes(broken)).toContain("leg_order");
  });

  it("rejects an unknown time zone (leg durations depend on it)", () => {
    const broken = clone();
    broken.locations[0].timeZone = "Mars/Olympus_Mons";
    expect(codes(broken)).toContain("invalid_time_zone");
  });

  it("rejects days out of order or outside the trip", () => {
    const broken = clone();
    broken.days[3].date = "2026-07-29";
    broken.days[8].date = "2026-09-01";
    expect(codes(broken)).toEqual(expect.arrayContaining(["day_order", "day_outside_trip"]));
  });

  it("requires a booking for tasks that resolve by booking", () => {
    const broken = clone();
    broken.tasks.find((t) => t.resolvedBy === "booking")!.relatedBookingId = null;
    expect(codes(broken)).toContain("task_resolution");
  });
});

describe("place rules (INV-1, INV-9, INV-11)", () => {
  const assigned = (id: string, dayId: string, placement: Placement, extra: Partial<Place> = {}): Place => ({
    id, name: id, city: null, area: null, category: "other", priority: "medium", notes: "", sourceUrl: null,
    durationMinutes: null, energyCost: null, window: null, bookingId: null, origin: "user",
    assignment: { dayId, placement, backupFor: null, reason: null }, ...extra,
  });

  it("rejects two anchors on one day", () => {
    const issues = validatePlaces([assigned("a", "day-2", "anchor"), assigned("b", "day-2", "anchor")], context);
    expect(issues.map((i) => i.code)).toContain("multiple_anchors");
  });

  it("allows one anchor per day across different days", () => {
    expect(validatePlaces([assigned("a", "day-2", "anchor"), assigned("b", "day-3", "anchor")], context)).toEqual([]);
  });

  it("requires backups to reference a place on the same day", () => {
    const target = assigned("target", "day-3", "planned");
    const backup = assigned("backup", "day-2", "backup");
    backup.assignment!.backupFor = "target";
    expect(validatePlaces([target, backup], context).map((i) => i.code)).toContain("backup_target");
  });

  it("rejects unknown days, bookings, invalid windows, and non-positive durations", () => {
    const issues = validatePlaces(
      [assigned("x", "day-99", "planned", { bookingId: "book-nope", window: { start: "14:00", end: "13:00" }, durationMinutes: 0 })],
      context,
    ).map((i) => i.code);
    expect(issues).toEqual(expect.arrayContaining(["missing_day", "missing_booking", "window_order", "invalid_duration"]));
  });
});
