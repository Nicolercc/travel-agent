import { getTripPhase, type TripPhaseInfo } from "@/lib/domain/trip-phase";
import type { TripSeed } from "@/lib/domain/types";

/** The trip's regions in the order they are visited, excluding transit ("Menorca → Costa Brava → Barcelona"). */
export function selectTripRoute(seed: TripSeed): string[] {
  const names = new Map(seed.trip.regions.map((region) => [region.id, region.name]));
  const visited: string[] = [];
  for (const day of seed.days) {
    const name = names.get(day.regionId);
    if (day.regionId !== "transit" && name && visited[visited.length - 1] !== name) visited.push(name);
  }
  return visited;
}

/** The day to show first: today during the trip, else the next day ahead, else the last day. */
export function selectFocusDayId(seed: TripSeed, today: string): string {
  const days = seed.days;
  return (days.find((day) => day.date === today) ?? days.find((day) => day.date > today) ?? days[days.length - 1]).id;
}

export function selectTripPhase(seed: TripSeed, now: Date): TripPhaseInfo {
  return getTripPhase(seed.trip, now);
}
