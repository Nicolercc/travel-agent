import { legDurationMinutes } from "@/lib/domain/legs";
import type { TripState } from "@/lib/domain/trip-state";
import type { Location, Region, TripSeed } from "@/lib/domain/types";
import { selectDayViews, type DayView, type LegView } from "./day";
import { indexes, memo } from "./memo";

export interface ItineraryLeg extends LegView {
  /** Scheduled minutes door to door, from each end's local time; null when a time is unknown. */
  durationMinutes: number | null;
}

export interface ItineraryDay {
  view: DayView;
  /** Legs worth showing between day rows: scheduled, booked, or the move to a new night's base. */
  keyLegs: ItineraryLeg[];
  /** The day's other, untimed moves (local drives, walks), summarized as a count. */
  otherMoves: number;
}

export interface ItineraryRegion {
  region: Region;
  days: ItineraryDay[];
}

/** A leg worth showing on its own: scheduled, booked, or the move to a new night's base. Local hops are not. */
export function isKeyLeg({ leg }: LegView, view: DayView): boolean {
  const movesBase = view.base !== null && view.base.id !== view.origin?.id;
  return leg.departure !== null || leg.bookingId !== null || (movesBase && leg.toLocationId === view.base!.id);
}

/** The trip as consecutive region runs (Transit, Menorca, Costa Brava, Barcelona), each an ordered list of days. */
export function selectItinerary(state: TripState, seed: TripSeed): ItineraryRegion[] {
  return memo(seed, state, "itinerary", () => {
    const regionsById = new Map(seed.trip.regions.map((region) => [region.id, region]));
    const groups: ItineraryRegion[] = [];
    for (const view of selectDayViews(state, seed)) {
      const keyLegs = view.legs
        .filter((legView) => isKeyLeg(legView, view))
        .map((legView) => ({ ...legView, durationMinutes: legDurationMinutes(legView.leg, legView.from, legView.to) }));
      const day: ItineraryDay = { view, keyLegs, otherMoves: view.legs.length - keyLegs.length };
      const last = groups[groups.length - 1];
      if (last && last.region.id === view.day.regionId) last.days.push(day);
      else groups.push({ region: regionsById.get(view.day.regionId)!, days: [day] });
    }
    return groups;
  });
}

export interface RouteStop {
  location: Location;
  /** Days whose night is spent here. */
  dayIds: string[];
}

export interface RouteSegment {
  legId: string;
  dayId: string;
  kind: "flight" | "ground";
  from: Location;
  to: Location;
}

export interface RouteDiagramData {
  bases: RouteStop[];
  /** Legs between two distinct points inside the trip's regions (walks and same-place legs are too small to draw). */
  segments: RouteSegment[];
  /** Legs that leave or enter the trip area (the long-haul flights), drawn as edge arrows. */
  offMap: RouteSegment[];
  summary: string;
}

/** Data for the Route diagram: bases in the order slept in, and every drawable move. Static (seed only). */
export function selectRouteDiagram(seed: TripSeed): RouteDiagramData {
  const { locationsById } = indexes(seed);
  const bases: RouteStop[] = [];
  for (const day of seed.days) {
    if (!day.baseLocationId) continue;
    const last = bases[bases.length - 1];
    if (last?.location.id === day.baseLocationId) last.dayIds.push(day.id);
    else bases.push({ location: locationsById.get(day.baseLocationId)!, dayIds: [day.id] });
  }

  const segments: RouteSegment[] = [];
  const offMap: RouteSegment[] = [];
  for (const leg of seed.legs) {
    const from = locationsById.get(leg.fromLocationId)!;
    const to = locationsById.get(leg.toLocationId)!;
    const segment: RouteSegment = { legId: leg.id, dayId: leg.dayId, kind: leg.mode === "flight" ? "flight" : "ground", from, to };
    if (from.regionId === "transit" || to.regionId === "transit") offMap.push(segment);
    else if (leg.mode !== "walk" && from.id !== to.id) segments.push(segment);
  }

  const flights = [...segments, ...offMap].filter((segment) => segment.kind === "flight").length;
  const ground = segments.length - segments.filter((segment) => segment.kind === "flight").length;
  const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;
  const summary = `${plural(bases.length, "base")}: ${bases.map((stop) => stop.location.city).join(", ")}; ${plural(flights, "flight")} and ${plural(ground, "ground transfer")}.`;
  return { bases, segments, offMap, summary };
}
