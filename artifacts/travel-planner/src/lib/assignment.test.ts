import { describe, expect, it } from "vitest";
import { mockDays, mockPlaces } from "@/data/mockData";
import { SavedPlace } from "@/types";
import {
  dayHasEffectiveAnchor,
  daySectionForInboxAssignment,
  daySectionForPriority,
  getEffectiveAnchorPlace,
} from "./assignment";

describe("daySectionForPriority", () => {
  it("maps must and high to planned", () => {
    expect(daySectionForPriority("must")).toBe("planned");
    expect(daySectionForPriority("high")).toBe("planned");
  });

  it("maps medium to optional", () => {
    expect(daySectionForPriority("medium")).toBe("optional");
  });

  it("maps low to backup", () => {
    expect(daySectionForPriority("low")).toBe("backup");
  });
});

describe("daySectionForInboxAssignment", () => {
  it("respects explicit status before priority", () => {
    expect(
      daySectionForInboxAssignment({ priority: "must", status: "booked" }),
    ).toBe("booked");
    expect(
      daySectionForInboxAssignment({ priority: "high", status: "do-not-cram" }),
    ).toBe("do-not-cram");
    expect(
      daySectionForInboxAssignment({ priority: "must", status: "backup" }),
    ).toBe("backup");
  });

  it("never assigns anchor", () => {
    const section = daySectionForInboxAssignment({
      priority: "must",
      status: "planned",
    });
    expect(section).not.toBe("anchor");
  });
});

describe("effective anchor assignment", () => {
  const jul30 = mockDays.find((day) => day.id === "day-2")!;
  const cala = mockPlaces.find((place) => place.id === "place-menorca-cala")!;

  function withPlaces(places: SavedPlace[]) {
    return { jul30, places };
  }

  it("recognizes initial mutable anchor assignment for Jul 30", () => {
    const { jul30, places } = withPlaces(mockPlaces);
    const anchor = getEffectiveAnchorPlace(jul30, places);

    expect(anchor?.id).toBe("place-menorca-cala");
    expect(dayHasEffectiveAnchor(jul30, places)).toBe(true);
  });

  it("treats the day as unanchored when anchor moves to planned", () => {
    const moved: SavedPlace = { ...cala, day_section: "planned" };
    const places = mockPlaces.map((place) =>
      place.id === cala.id ? moved : place,
    );

    expect(dayHasEffectiveAnchor(jul30, places)).toBe(false);
    expect(getEffectiveAnchorPlace(jul30, places)).toBeUndefined();
  });

  it("treats the day as unanchored when anchor moves to inbox", () => {
    const moved: SavedPlace = {
      ...cala,
      assigned_day_id: null,
      day_section: undefined,
    };
    const places = mockPlaces.map((place) =>
      place.id === cala.id ? moved : place,
    );

    expect(dayHasEffectiveAnchor(jul30, places)).toBe(false);
  });

  it("restores anchored status when another place is assigned to anchor", () => {
    const replacement: SavedPlace = {
      ...mockPlaces.find((place) => place.id === "place-cova")!,
      assigned_day_id: "day-2",
      day_section: "anchor",
    };
    const places = mockPlaces
      .filter((place) => place.id !== "place-menorca-cala")
      .map((place) =>
        place.id === replacement.id ? replacement : place,
      );

    expect(getEffectiveAnchorPlace(jul30, places)?.id).toBe("place-cova");
    expect(dayHasEffectiveAnchor(jul30, places)).toBe(true);
  });

  it("does not treat static anchor_place_id as current truth without assignment", () => {
    const places = mockPlaces.filter((place) => place.id !== cala.id);

    expect(jul30.anchor_place_id).toBe("place-menorca-cala");
    expect(dayHasEffectiveAnchor(jul30, places)).toBe(false);
  });
});
