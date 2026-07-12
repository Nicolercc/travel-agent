import { DaySection, Priority, SavedPlace, TripDay } from "@/types";

/** Current anchor assignment from mutable SavedPlace state (not static seed metadata). */
export function getEffectiveAnchorPlace(
  day: Pick<TripDay, "id">,
  places: SavedPlace[],
): SavedPlace | undefined {
  return places.find(
    (place) =>
      place.assigned_day_id === day.id && place.day_section === "anchor",
  );
}

export function dayHasEffectiveAnchor(
  day: Pick<TripDay, "id">,
  places: SavedPlace[],
): boolean {
  return getEffectiveAnchorPlace(day, places) !== undefined;
}

/**
 * Maps inbox place priority (and status when explicit) to a day section when assigning to a day.
 * Anchor is never chosen here — that requires explicit user action elsewhere.
 */
export function daySectionForInboxAssignment(
  place: Pick<SavedPlace, "priority" | "status">,
): DaySection {
  if (place.status === "booked") return "booked";
  if (place.status === "do-not-cram") return "do-not-cram";
  if (place.status === "backup") return "backup";

  return daySectionForPriority(place.priority);
}

export function daySectionForPriority(priority: Priority): DaySection {
  switch (priority) {
    case "must":
    case "high":
      return "planned";
    case "medium":
      return "optional";
    case "low":
      return "backup";
  }
}
