import type { Assignment, BookingOverride, PackingKey, Place, TripSeed } from "./types";

export const STATE_VERSION = 3;

export type ProgressMark = "done" | "skipped";

/**
 * Everything the traveler can change. Structure comes from the static seed; readiness,
 * verdicts, issues and "booked" are derived and deliberately absent (INV-4).
 */
export interface TripState {
  version: typeof STATE_VERSION;
  places: Place[];
  /** The traveler's own confirmation/link per booking, layered over the seed. */
  bookingOverrides: Record<string, BookingOverride>;
  resolvedTaskIds: string[];
  /** Completion per day and item (INV-10): moving a place never carries "done" with it. */
  progress: Record<string, Record<string, ProgressMark>>;
  packed: PackingKey[];
}

export function createInitialState(seed: TripSeed): TripState {
  return {
    version: STATE_VERSION,
    places: structuredClone(seed.places),
    bookingOverrides: {},
    resolvedTaskIds: [],
    progress: {},
    packed: [],
  };
}

/** Items that can be marked done or skipped (INV-10): places, fixed events, and travel legs. */
export function progressItemIds(places: Place[], seed: TripSeed): Set<string> {
  return new Set([...places.map((place) => place.id), ...seed.fixedEvents.map((event) => event.id), ...seed.legs.map((leg) => leg.id)]);
}

export interface AssignmentChange {
  placeId: string;
  before: Assignment | null;
  after: Assignment | null;
}
