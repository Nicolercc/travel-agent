import { describe, expect, it } from "vitest";
import { mockLogistics, mockPlaces } from "@/data/mockData";
import {
  computeBookingReadiness,
  countUnresolvedBookings,
  isLogisticsItemSecured,
} from "./booking-readiness";

describe("computeBookingReadiness", () => {
  it("treats secured logistics as resolved except explicit gaps", () => {
    const secured = mockLogistics.filter((item) => item.type !== "emergency");
    const result = computeBookingReadiness([], secured);
    expect(countUnresolvedBookings(result)).toBe(1);
    expect(result.unresolvedLogistics[0]?.title).toContain("Shuttle");
  });

  it("flags FrontAir shuttle missing confirmation", () => {
    const shuttle = mockLogistics.find((item) => item.id === "log-shuttle");
    expect(shuttle).toBeDefined();
    expect(isLogisticsItemSecured(shuttle!)).toBe(false);
  });

  it("flags saved places that are booked without links", () => {
    const bookedNoLink = mockPlaces.filter(
      (place) => place.status === "booked" && !place.booking_link,
    );
    const result = computeBookingReadiness(mockPlaces, []);
    expect(result.unresolvedPlaces.length).toBeGreaterThanOrEqual(
      bookedNoLink.length,
    );
  });

  it("excludes emergency information from booking completeness", () => {
    const emergencyOnly = mockLogistics.filter((item) => item.type === "emergency");
    const result = computeBookingReadiness([], emergencyOnly);
    expect(result.totalCount).toBe(0);
    expect(result.unresolvedLogistics).toHaveLength(0);
  });

  it("handles mixed secured and unresolved logistics", () => {
    const mixed = [
      mockLogistics.find((item) => item.id === "log-dl128")!,
      mockLogistics.find((item) => item.id === "log-shuttle")!,
    ];
    const result = computeBookingReadiness([], mixed);
    expect(result.securedCount).toBe(1);
    expect(result.totalCount).toBe(2);
    expect(result.unresolvedLogistics).toHaveLength(1);
  });

  it("does not treat blank strings as secured references", () => {
    const item = {
      ...mockLogistics[0],
      confirmation: "   ",
      booking_link: "",
    };
    expect(isLogisticsItemSecured(item)).toBe(false);
  });
});
