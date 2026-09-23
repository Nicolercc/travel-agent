import type { TripDayKind } from "@/types";
import type { DayType } from "@/types/journey";

/**
 * Maps legacy Trip Pulse `TripDayKind` values to journey `DayType`.
 * `flight` exists only in the journey model (e.g. day-0 departure).
 * Legacy `transfer` maps to `arrival` — connective travel days share arrival readiness semantics.
 */
export function tripDayKindToDayType(kind: TripDayKind): DayType {
  switch (kind) {
    case "arrival":
      return "arrival";
    case "experience":
      return "experience";
    case "road-trip":
      return "road-trip";
    case "transfer":
      return "arrival";
    case "city":
      return "city";
    case "mountain":
      return "mountain";
    case "departure":
      return "departure";
    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}

export function isLogisticsPrimaryDayType(dayType: DayType): boolean {
  return dayType === "flight" || dayType === "arrival" || dayType === "departure";
}

export function isExperienceShapedDayType(dayType: DayType): boolean {
  return (
    dayType === "experience" ||
    dayType === "road-trip" ||
    dayType === "city" ||
    dayType === "mountain"
  );
}
