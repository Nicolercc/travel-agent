import type { TripState } from "@/lib/domain/trip-state";
import type { Place, TripSeed } from "@/lib/domain/types";
import { memo } from "./memo";

/** Inbox order: newest captures first, then seed order. */
export function inboxOrder(places: Place[]): Place[] {
  return [...places.filter((p) => p.origin === "user").reverse(), ...places.filter((p) => p.origin === "seed")];
}

/** Saved places without a day, in Inbox order. */
export function selectInbox(state: TripState, seed: TripSeed): Place[] {
  return memo(seed, state, "inbox", () => inboxOrder(state.places.filter((place) => place.assignment === null)));
}

/**
 * Unsorted places worth suggesting for a day: those in any city the day touches (its plans, where
 * it starts, where it ends). Falls back to every unsorted place, labelled honestly as not nearby.
 */
export function selectDayIdeas(state: TripState, seed: TripSeed, dayId: string): { nearbyCities: string[]; places: Place[] } {
  return memo(seed, state, `ideas:${dayId}`, () => {
    const day = seed.days.find((candidate) => candidate.id === dayId);
    const locationCity = (id: string | null) => seed.locations.find((location) => location.id === id)?.city ?? null;
    const cities = new Set(
      [
        ...state.places.filter((place) => place.assignment?.dayId === dayId).map((place) => place.city),
        locationCity(day?.originLocationId ?? null),
        locationCity(day?.baseLocationId ?? null),
      ].filter((city): city is string => Boolean(city)),
    );
    const inbox = selectInbox(state, seed);
    const nearby = inbox.filter((place) => place.city !== null && cities.has(place.city));
    return nearby.length > 0
      ? { nearbyCities: [...new Set(nearby.map((place) => place.city!))], places: nearby }
      : { nearbyCities: [], places: inbox };
  });
}
