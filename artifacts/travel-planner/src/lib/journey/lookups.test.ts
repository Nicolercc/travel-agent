import { describe, expect, it } from "vitest";
import { createMinimalJourneyDataset } from "./fixtures/minimal-dataset";
import {
  createJourneyLookupContext,
  getBlockingUnresolvedTasksForDay,
  getEventsForDay,
  getFixedEventsForDay,
  getFlexibleEventsForDay,
  getJourneyDay,
  getTravelLegsForDay,
  sortJourneyDaysByDate,
} from "./lookups";

describe("journey lookups", () => {
  const dataset = createMinimalJourneyDataset();
  const context = createJourneyLookupContext(dataset);

  it("resolves days, events, and legs by reference arrays", () => {
    const day = getJourneyDay(context, "day-2");
    expect(day).toBeDefined();
    if (!day) return;

    expect(getFixedEventsForDay(context, day).map((event) => event.id)).toEqual([
      "evt-checkin",
    ]);
    expect(getFlexibleEventsForDay(context, day).map((event) => event.id)).toEqual([
      "evt-cove-swim",
    ]);
    expect(getEventsForDay(context, day)).toHaveLength(2);

    const flightDay = getJourneyDay(context, "day-0");
    expect(flightDay).toBeDefined();
    if (!flightDay) return;
    expect(getTravelLegsForDay(context, flightDay).map((leg) => leg.id)).toEqual([
      "leg-dl128",
    ]);
  });

  it("returns blocking unresolved tasks sorted by priority", () => {
    const day = getJourneyDay(context, "day-3");
    expect(day).toBeDefined();
    if (!day) return;

    const tasks = getBlockingUnresolvedTasksForDay(context, day);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].priority).toBe("critical");
  });

  it("sorts journey days by calendar date", () => {
    const sorted = sortJourneyDaysByDate(dataset.days);
    expect(sorted.map((day) => day.id)).toEqual(["day-0", "day-2", "day-3"]);
  });
});
