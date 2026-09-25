import { differenceInCalendarDays } from "date-fns";
import { parseDateOnly, toLocalDateOnlyString } from "./dates";
import type { Trip } from "./types";

export type TripPhase = "upcoming" | "traveling" | "completed";

export interface TripPhaseInfo {
  phase: TripPhase;
  daysUntilDeparture: number | null;
  label: string;
}

/** Where the trip stands relative to `now` (the demo clock — never the real clock, INV-12). */
export function getTripPhase(trip: Trip, now: Date): TripPhaseInfo {
  const today = parseDateOnly(toLocalDateOnlyString(now));
  const start = parseDateOnly(trip.startDate);
  const end = parseDateOnly(trip.endDate);
  if (today < start) {
    const days = differenceInCalendarDays(start, today);
    return { phase: "upcoming", daysUntilDeparture: days, label: days === 1 ? "1 day to go" : `${days} days to go` };
  }
  if (today <= end) return { phase: "traveling", daysUntilDeparture: null, label: "Traveling now" };
  return { phase: "completed", daysUntilDeparture: null, label: "Trip completed" };
}
