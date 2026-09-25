import type { TripState } from "@/lib/domain/trip-state";
import type { TripSeed } from "@/lib/domain/types";

const cache = new WeakMap<TripSeed, WeakMap<TripState, Map<string, unknown>>>();

/** Cache a derived value per (seed, state) pair. State is immutable, so identity is enough. */
export function memo<T>(seed: TripSeed, state: TripState, key: string, compute: () => T): T {
  let byState = cache.get(seed);
  if (!byState) cache.set(seed, (byState = new WeakMap()));
  let values = byState.get(state);
  if (!values) byState.set(state, (values = new Map()));
  if (!values.has(key)) values.set(key, compute());
  return values.get(key) as T;
}

/** Seed-only lookups (the seed never changes at runtime). */
const indexCache = new WeakMap<TripSeed, ReturnType<typeof buildIndexes>>();

function buildIndexes(seed: TripSeed) {
  return {
    daysById: new Map(seed.days.map((day) => [day.id, day])),
    locationsById: new Map(seed.locations.map((location) => [location.id, location])),
    legsById: new Map(seed.legs.map((leg) => [leg.id, leg])),
    tasksById: new Map(seed.tasks.map((task) => [task.id, task])),
  };
}

export function indexes(seed: TripSeed) {
  let value = indexCache.get(seed);
  if (!value) indexCache.set(seed, (value = buildIndexes(seed)));
  return value;
}
