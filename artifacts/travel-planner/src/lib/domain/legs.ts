import type { Day, Location, TravelLeg } from "./types";

/**
 * INV-7 — a leg is owned by its departure day (`leg.dayId`) and appears on every day from its
 * departure date through its arrival date. Legs without times appear only on their owning day.
 */
export function legTouchesDay(leg: TravelLeg, day: Day): boolean {
  if (leg.dayId === day.id) return true;
  const from = leg.departure?.date;
  const to = leg.arrival?.date ?? from;
  if (!from || !to) return false;
  return from <= day.date && day.date <= to;
}

export function legsForDay(day: Day, legs: TravelLeg[]): TravelLeg[] {
  return legs.filter((leg) => legTouchesDay(leg, day));
}

/** A leg that ends outside the trip regions (the flight home). */
export function legLeavesTrip(leg: TravelLeg, locationsById: ReadonlyMap<string, Location>): boolean {
  return locationsById.get(leg.toLocationId)?.regionId === "transit";
}

/** International when either end is outside the trip's regions (the long-haul flights). */
export function legIsInternational(leg: TravelLeg, locationsById: ReadonlyMap<string, Location>): boolean {
  const from = locationsById.get(leg.fromLocationId)?.regionId;
  const to = locationsById.get(leg.toLocationId)?.regionId;
  return from === "transit" || to === "transit";
}

/**
 * Minutes between departure and arrival. Leg times are local wall-clock times at each end, so each
 * is converted with its location's time zone. Null when either time is unknown.
 */
export function legDurationMinutes(leg: TravelLeg, from: Location, to: Location): number | null {
  if (!leg.departure || !leg.arrival) return null;
  const minutes = (utcMillis(leg.arrival, to.timeZone) - utcMillis(leg.departure, from.timeZone)) / 60_000;
  return minutes >= 0 ? minutes : null;
}

/** The instant a local wall-clock time in `timeZone` denotes (resolved twice so DST edges settle). */
function utcMillis(endpoint: { date: string; time: string }, timeZone: string): number {
  const [year, month, day] = endpoint.date.split("-").map(Number);
  const [hours, minutes] = endpoint.time.split(":").map(Number);
  const wallClockAsUtc = Date.UTC(year, month - 1, day, hours, minutes);
  let instant = wallClockAsUtc - offsetMillis(wallClockAsUtc, timeZone);
  instant = wallClockAsUtc - offsetMillis(instant, timeZone);
  return instant;
}

/** The zone's UTC offset at an instant, e.g. -4 h for New York in July. */
function offsetMillis(instant: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).formatToParts(new Date(instant));
  const part = (type: string) => Number(parts.find((candidate) => candidate.type === type)!.value);
  const wallClock = Date.UTC(part("year"), part("month") - 1, part("day"), part("hour"), part("minute"));
  return wallClock - Math.floor(instant / 60_000) * 60_000;
}
