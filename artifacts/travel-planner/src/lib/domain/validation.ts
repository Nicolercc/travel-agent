import { isDateOnlyString } from "./dates";
import { isTimeOfDay, toMinutes } from "./time";
import type { Place, TimeWindow, TripSeed } from "./types";

export interface ValidationIssue {
  code: string;
  message: string;
  entityId?: string;
}

function duplicates(ids: string[]): string[] {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const id of ids) (seen.has(id) ? dupes : seen).add(id);
  return [...dupes];
}

function windowIssues(window: TimeWindow | null, entityId: string): ValidationIssue[] {
  if (!window) return [];
  const issues: ValidationIssue[] = [];
  if (!isTimeOfDay(window.start)) {
    issues.push({ code: "invalid_time", message: `${entityId} has an invalid start time`, entityId });
  }
  if (window.end !== null && !isTimeOfDay(window.end)) {
    issues.push({ code: "invalid_time", message: `${entityId} has an invalid end time`, entityId });
  }
  if (
    issues.length === 0 &&
    window.end !== null &&
    toMinutes(window.end) <= toMinutes(window.start)
  ) {
    issues.push({ code: "window_order", message: `${entityId} ends before it starts`, entityId });
  }
  return issues;
}

export interface PlaceReferenceContext {
  dayIds: ReadonlySet<string>;
  bookingIds: ReadonlySet<string>;
}

/**
 * Rules every set of places must satisfy — seed or user state (INV-1, INV-9, INV-11).
 */
export function validatePlaces(places: Place[], context: PlaceReferenceContext): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const byId = new Map(places.map((place) => [place.id, place]));

  for (const id of duplicates(places.map((place) => place.id))) {
    issues.push({ code: "duplicate_id", message: `Duplicate place id ${id}`, entityId: id });
  }

  const anchorsPerDay = new Map<string, number>();
  for (const place of places) {
    issues.push(...windowIssues(place.window, place.id));
    if (place.durationMinutes !== null && !(place.durationMinutes > 0)) {
      issues.push({ code: "invalid_duration", message: `${place.id} has a non-positive duration`, entityId: place.id });
    }
    if (place.bookingId !== null && !context.bookingIds.has(place.bookingId)) {
      issues.push({ code: "missing_booking", message: `${place.id} references unknown booking ${place.bookingId}`, entityId: place.id });
    }

    const assignment = place.assignment;
    if (!assignment) continue;
    if (!context.dayIds.has(assignment.dayId)) {
      issues.push({ code: "missing_day", message: `${place.id} is assigned to unknown day ${assignment.dayId}`, entityId: place.id });
    }
    if (assignment.placement === "anchor") {
      anchorsPerDay.set(assignment.dayId, (anchorsPerDay.get(assignment.dayId) ?? 0) + 1);
    }
    if (assignment.backupFor !== null) {
      const target = byId.get(assignment.backupFor);
      if (assignment.placement !== "backup") {
        issues.push({ code: "backup_for_not_backup", message: `${place.id} names a backup target but is not a backup`, entityId: place.id });
      }
      if (!target || target.assignment?.dayId !== assignment.dayId || target.id === place.id) {
        issues.push({ code: "backup_target", message: `${place.id} backs up a place that is not on the same day`, entityId: place.id });
      }
    }
    if (assignment.reason !== null && assignment.placement !== "do-not-cram") {
      issues.push({ code: "reason_not_do_not_cram", message: `${place.id} has a do-not-cram reason but another placement`, entityId: place.id });
    }
  }

  for (const [dayId, count] of anchorsPerDay) {
    if (count > 1) {
      issues.push({ code: "multiple_anchors", message: `${dayId} has ${count} anchors`, entityId: dayId });
    }
  }
  return issues;
}

/** Referential integrity and domain rules for the static seed. Empty result = valid. */
export function validateSeed(seed: TripSeed): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const dayIds = new Set(seed.days.map((day) => day.id));
  const locationIds = new Set(seed.locations.map((location) => location.id));
  const bookingIds = new Set(seed.bookings.map((booking) => booking.id));
  const placeIds = new Set(seed.places.map((place) => place.id));
  const legIds = new Set(seed.legs.map((leg) => leg.id));
  const regionIds = new Set(seed.trip.regions.map((region) => region.id));

  const collections: [string, { id: string }[]][] = [
    ["day", seed.days],
    ["location", seed.locations],
    ["leg", seed.legs],
    ["fixed event", seed.fixedEvents],
    ["booking", seed.bookings],
    ["task", seed.tasks],
  ];
  for (const [label, items] of collections) {
    for (const id of duplicates(items.map((item) => item.id))) {
      issues.push({ code: "duplicate_id", message: `Duplicate ${label} id ${id}`, entityId: id });
    }
  }

  const missing = (code: string, entityId: string, what: string) =>
    issues.push({ code, message: `${entityId} references unknown ${what}`, entityId });

  if (seed.trip.startDate > seed.trip.endDate) {
    issues.push({ code: "trip_dates", message: "Trip ends before it starts" });
  }
  let previousDate = "";
  for (const day of seed.days) {
    if (!isDateOnlyString(day.date)) issues.push({ code: "invalid_date", message: `${day.id} has an invalid date`, entityId: day.id });
    if (day.date < seed.trip.startDate || day.date > seed.trip.endDate) {
      issues.push({ code: "day_outside_trip", message: `${day.id} falls outside the trip dates`, entityId: day.id });
    }
    if (day.date <= previousDate) issues.push({ code: "day_order", message: `${day.id} is not after the previous day`, entityId: day.id });
    previousDate = day.date;
    if (!regionIds.has(day.regionId)) missing("missing_region", day.id, `region ${day.regionId}`);
    for (const locationId of [day.originLocationId, day.baseLocationId]) {
      if (locationId !== null && !locationIds.has(locationId)) missing("missing_location", day.id, `location ${locationId}`);
    }
  }

  for (const location of seed.locations) {
    const { lat, lng } = location.coordinates;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      issues.push({ code: "invalid_coordinates", message: `${location.id} has out-of-range coordinates`, entityId: location.id });
    }
    if (!regionIds.has(location.regionId)) missing("missing_region", location.id, `region ${location.regionId}`);
    if (!isKnownTimeZone(location.timeZone)) {
      issues.push({ code: "invalid_time_zone", message: `${location.id} has an unknown time zone`, entityId: location.id });
    }
  }

  for (const leg of seed.legs) {
    if (!dayIds.has(leg.dayId)) missing("missing_day", leg.id, `day ${leg.dayId}`);
    for (const locationId of [leg.fromLocationId, leg.toLocationId]) {
      if (!locationIds.has(locationId)) missing("missing_location", leg.id, `location ${locationId}`);
    }
    if (leg.bookingId !== null && !bookingIds.has(leg.bookingId)) missing("missing_booking", leg.id, `booking ${leg.bookingId}`);
    for (const endpoint of [leg.departure, leg.arrival]) {
      if (endpoint && (!isDateOnlyString(endpoint.date) || !isTimeOfDay(endpoint.time))) {
        issues.push({ code: "invalid_time", message: `${leg.id} has an invalid endpoint`, entityId: leg.id });
      }
    }
    if (leg.departure && leg.arrival) {
      const depart = `${leg.departure.date}T${leg.departure.time}`;
      const arrive = `${leg.arrival.date}T${leg.arrival.time}`;
      if (arrive <= depart) {
        issues.push({ code: "leg_order", message: `${leg.id} arrives before it departs`, entityId: leg.id });
      }
    }
  }

  for (const event of seed.fixedEvents) {
    if (!dayIds.has(event.dayId)) missing("missing_day", event.id, `day ${event.dayId}`);
    if (!locationIds.has(event.locationId)) missing("missing_location", event.id, `location ${event.locationId}`);
    if (event.bookingId !== null && !bookingIds.has(event.bookingId)) missing("missing_booking", event.id, `booking ${event.bookingId}`);
    issues.push(...windowIssues(event.window, event.id));
  }

  for (const task of seed.tasks) {
    if (!dayIds.has(task.dayId)) missing("missing_day", task.id, `day ${task.dayId}`);
    if (task.relatedBookingId !== null && !bookingIds.has(task.relatedBookingId)) missing("missing_booking", task.id, `booking ${task.relatedBookingId}`);
    if (task.relatedPlaceId !== null && !placeIds.has(task.relatedPlaceId)) missing("missing_place", task.id, `place ${task.relatedPlaceId}`);
    if (task.relatedLegId !== null && !legIds.has(task.relatedLegId)) missing("missing_leg", task.id, `leg ${task.relatedLegId}`);
    if (task.resolvedBy === "booking" && task.relatedBookingId === null) {
      issues.push({ code: "task_resolution", message: `${task.id} resolves by booking but has none`, entityId: task.id });
    }
  }

  issues.push(...validatePlaces(seed.places, { dayIds, bookingIds }));

  const packingKeys = seed.packing.flatMap((category) => category.items.map((item) => item.key));
  for (const key of duplicates(packingKeys)) {
    issues.push({ code: "duplicate_packing_key", message: `Duplicate packing key ${key}`, entityId: key });
  }

  return issues;
}

function isKnownTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return timeZone.length > 0;
  } catch {
    return false;
  }
}
