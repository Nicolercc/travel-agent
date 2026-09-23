import { describe, expect, it } from "vitest";
import {
  isExperienceShapedDayType,
  isLogisticsPrimaryDayType,
  tripDayKindToDayType,
} from "./day-type-bridge";

describe("tripDayKindToDayType", () => {
  it("maps legacy day kinds to journey day types", () => {
    expect(tripDayKindToDayType("arrival")).toBe("arrival");
    expect(tripDayKindToDayType("experience")).toBe("experience");
    expect(tripDayKindToDayType("road-trip")).toBe("road-trip");
    expect(tripDayKindToDayType("transfer")).toBe("arrival");
    expect(tripDayKindToDayType("city")).toBe("city");
    expect(tripDayKindToDayType("mountain")).toBe("mountain");
    expect(tripDayKindToDayType("departure")).toBe("departure");
  });

  it("classifies logistics-primary and experience-shaped day types", () => {
    expect(isLogisticsPrimaryDayType("flight")).toBe(true);
    expect(isLogisticsPrimaryDayType("arrival")).toBe(true);
    expect(isLogisticsPrimaryDayType("experience")).toBe(false);

    expect(isExperienceShapedDayType("experience")).toBe(true);
    expect(isExperienceShapedDayType("road-trip")).toBe(true);
    expect(isExperienceShapedDayType("flight")).toBe(false);
  });
});
