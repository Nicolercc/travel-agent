import { describe, expect, it } from "vitest";
import { mockDays, mockLogistics, mockPlaces } from "@/data/mockData";
import { SavedPlace } from "@/types";
import {
  dayHasAnchor,
  getDayRibbonStatus,
  getDaysMissingAnchors,
  getDaysNeedingLogistics,
  isDayShaped,
} from "./day-readiness";

describe("day readiness by day_kind", () => {
  it("does not require anchors for arrival, transfer, or departure days", () => {
    const logisticsDays = mockDays.filter((day) =>
      ["arrival", "transfer", "departure"].includes(day.day_kind),
    );
    expect(getDaysMissingAnchors(mockDays, [])).not.toEqual(
      expect.arrayContaining(logisticsDays),
    );
  });

  it("requires anchors for experience and city days without anchors", () => {
    const missing = getDaysMissingAnchors(mockDays, []);
    expect(missing.some((day) => day.id === "day-1")).toBe(false);
    expect(missing.some((day) => day.id === "day-5")).toBe(false);
    expect(missing.some((day) => day.id === "day-8")).toBe(false);
  });

  it("marks transfer day shaped when logistics on that date are secured", () => {
    const transferDay = mockDays.find((day) => day.id === "day-5")!;
    expect(isDayShaped(transferDay, [], mockLogistics)).toBe(true);
  });

  it("flags departure day when no logistics exist on that date", () => {
    const departureDay = mockDays.find((day) => day.id === "day-8")!;
    const needing = getDaysNeedingLogistics(mockDays, mockLogistics);
    expect(needing.some((day) => day.id === "day-8")).toBe(true);
    expect(isDayShaped(departureDay, [], mockLogistics)).toBe(false);
  });
});

describe("effective anchor readiness", () => {
  const jul30 = mockDays.find((day) => day.id === "day-2")!;
  const cala = mockPlaces.find((place) => place.id === "place-menorca-cala")!;

  it("recognizes Jul 30 anchor from mutable assignment", () => {
    expect(dayHasAnchor(jul30, mockPlaces)).toBe(true);
    expect(getDayRibbonStatus(jul30, mockPlaces, mockLogistics)).toEqual({
      label: "Anchored",
      variant: "ok",
    });
  });

  it("reports needs anchor after moving Cala Macarella to planned", () => {
    const places: SavedPlace[] = mockPlaces.map((place) =>
      place.id === cala.id ? { ...place, day_section: "planned" } : place,
    );

    expect(dayHasAnchor(jul30, places)).toBe(false);
    expect(getDayRibbonStatus(jul30, places, mockLogistics)).toEqual({
      label: "Needs anchor",
      variant: "attention",
    });
    expect(getDaysMissingAnchors(mockDays, places).some((d) => d.id === "day-2")).toBe(
      true,
    );
  });

  it("keeps arrival day exempt from activity anchor requirements", () => {
    const arrival = mockDays.find((day) => day.id === "day-1")!;
    expect(dayHasAnchor(arrival, [])).toBe(false);
    expect(getDaysMissingAnchors(mockDays, [])).not.toContainEqual(arrival);
  });

  it("keeps road-trip readiness tied to current anchor assignment", () => {
    const roadTrip = mockDays.find((day) => day.id === "day-4")!;
    expect(dayHasAnchor(roadTrip, mockPlaces)).toBe(true);

    const tossa = mockPlaces.find((place) => place.id === "place-tossa")!;
    const places = mockPlaces.map((place) =>
      place.id === tossa.id ? { ...place, day_section: "planned" } : place,
    );
    expect(dayHasAnchor(roadTrip, places)).toBe(false);
  });
});
