import { describe, expect, it } from "vitest";
import { mockDays, mockLogistics, mockPlaces, mockTrip } from "@/data/mockData";
import { SavedPlace } from "@/types";
import {
  computeDaysWithMeta,
  computeNextBestActions,
  computePlanningHealth,
  computeTripReadiness,
  getDayPreviewSnapshot,
  getTripPhase,
} from "./trip-metrics";
import { countUnresolvedBookings } from "./booking-readiness";
import { getDayRibbonStatus } from "./day-readiness";

describe("getTripPhase", () => {
  it("reports days until departure before trip start", () => {
    const result = getTripPhase(mockTrip, new Date(2026, 6, 10));
    expect(result.phase).toBe("upcoming");
    expect(result.daysUntilDeparture).toBe(18);
    expect(result.label).toContain("until departure");
  });

  it("reports currently traveling during trip dates", () => {
    const result = getTripPhase(mockTrip, new Date(2026, 7, 2));
    expect(result.phase).toBe("traveling");
    expect(result.label).toBe("Currently traveling");
  });

  it("reports completed after trip end", () => {
    const result = getTripPhase(mockTrip, new Date(2026, 7, 10));
    expect(result.phase).toBe("completed");
    expect(result.label).toBe("Trip completed");
  });
});

describe("computeNextBestActions", () => {
  it("returns at most three prioritized actions from health", () => {
    const health = computePlanningHealth(mockDays, mockPlaces, mockLogistics);
    const actions = computeNextBestActions(health);
    expect(actions.length).toBeLessThanOrEqual(3);
    if (actions.length > 1) {
      expect(actions[0].priority).toBeLessThanOrEqual(actions[1].priority);
    }
  });

  it("surfaces unresolved bookings including logistics gaps", () => {
    const health = computePlanningHealth(mockDays, mockPlaces, mockLogistics);
    const actions = computeNextBestActions(health);
    const ids = actions.map((action) => action.id);
    expect(
      ids.includes("missing-bookings") || ids.includes("days-needing-logistics"),
    ).toBe(true);
    expect(countUnresolvedBookings(health.bookingReadiness)).toBeGreaterThan(0);
  });
});

describe("computeTripReadiness bookings dimension", () => {
  it("surfaces needs-attention when departure shuttle is unresolved", () => {
    const readiness = computeTripReadiness(
      mockDays,
      mockPlaces,
      mockLogistics,
    );
    const bookings = readiness.dimensions.find(
      (dimension) => dimension.id === "bookings",
    );
    expect(bookings?.stage).toBe("needs-attention");
    expect(bookings?.summary).toContain("confirmation or link");
  });
});

describe("effective anchor consistency", () => {
  const jul30 = mockDays.find((day) => day.id === "day-2")!;
  const cala = mockPlaces.find((place) => place.id === "place-menorca-cala")!;

  it("aligns Day Preview and Journey Ribbon when anchor is present", () => {
    const preview = getDayPreviewSnapshot(jul30, mockPlaces);
    const ribbon = getDayRibbonStatus(jul30, mockPlaces, mockLogistics);

    expect(preview.hasAnchor).toBe(true);
    expect(ribbon.label).toBe("Anchored");
  });

  it("aligns Day Preview and planning health when anchor is removed", () => {
    const places: SavedPlace[] = mockPlaces.map((place) =>
      place.id === cala.id ? { ...place, day_section: "planned" } : place,
    );
    const preview = getDayPreviewSnapshot(jul30, places);
    const ribbon = getDayRibbonStatus(jul30, places, mockLogistics);
    const health = computePlanningHealth(mockDays, places, mockLogistics);
    const meta = computeDaysWithMeta(mockDays, places).find(
      (day) => day.id === "day-2",
    );

    expect(preview.hasAnchor).toBe(false);
    expect(ribbon.label).toBe("Needs anchor");
    expect(meta?.hasAnchor).toBe(false);
    expect(health.missingAnchors.some((day) => day.id === "day-2")).toBe(true);
  });
});
