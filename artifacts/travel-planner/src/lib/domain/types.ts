import type { DateOnlyString } from "./dates";

/**
 * TripCanvas domain model.
 *
 * Structure (days, bases, legs, fixed logistics, bookings, tasks) is static seed data.
 * Activities are `Place`s — the only mutable representation of anything a traveler might do.
 * Readiness, verdicts, issues and "booked" are always derived (see selectors), never stored.
 */

/** Local wall-clock time, "HH:mm" (24h). */
export type TimeOfDay = string;

export interface TimeWindow {
  start: TimeOfDay;
  end: TimeOfDay | null;
}

export type RegionId = "transit" | "menorca" | "costa-brava" | "barcelona";

export interface Region {
  id: RegionId;
  name: string;
}

export interface Trip {
  id: string;
  title: string;
  startDate: DateOnlyString;
  endDate: DateOnlyString;
  regions: Region[];
  /** Reference details to have at hand in an emergency (shown in Logistics). */
  emergencyInfo: { label: string; value: string }[];
}

export type DayType =
  | "flight"
  | "arrival"
  | "experience"
  | "road-trip"
  | "city"
  | "mountain"
  | "departure";

export type EnergyMode =
  | "controlled"
  | "soft"
  | "soft-adaptable"
  | "medium"
  | "full-controlled"
  | "full";

export interface Day {
  id: string;
  date: DateOnlyString;
  dayType: DayType;
  energyMode: EnergyMode;
  title: string;
  /** Traveler-facing one-line character of the day. */
  theme: string;
  regionId: RegionId;
  /** Where the day starts (previous night's base, or home). */
  originLocationId: string | null;
  /** Where the traveler sleeps; null when the day ends in transit. */
  baseLocationId: string | null;
  notes: string | null;
  outfitNote: string | null;
  /** Deliberate limits that are not tied to one place ("Two beaches max"). */
  guardrails: string[];
  /** Fallback plans that are not a specific place ("If tired, rest at the hotel"). */
  fallbacks: string[];
}

export type LocationKind =
  | "airport"
  | "hotel"
  | "beach"
  | "town"
  | "landmark"
  | "viewpoint"
  | "restaurant"
  | "shop"
  | "nightlife"
  | "nature"
  | "station";

export interface Location {
  id: string;
  name: string;
  kind: LocationKind;
  city: string;
  area: string;
  regionId: RegionId;
  coordinates: { lat: number; lng: number };
  /** IANA time zone. Leg times are local wall-clock times at each end, so durations need it. */
  timeZone: string;
}

export type TransportMode = "flight" | "car" | "train" | "funicular" | "walk" | "shuttle" | "ferry";

export interface LegEndpoint {
  date: DateOnlyString;
  time: TimeOfDay;
}

export interface TravelLeg {
  id: string;
  /** Owning day (the departure day) — used for ordering; display spans departure → arrival dates. */
  dayId: string;
  mode: TransportMode;
  fromLocationId: string;
  toLocationId: string;
  departure: LegEndpoint | null;
  arrival: LegEndpoint | null;
  bookingId: string | null;
  label: string;
}

export type FixedEventKind =
  | "wake"
  | "airport"
  | "check-in"
  | "check-out"
  | "pickup"
  | "return"
  | "departure";

/** Immovable logistics on a day (not an activity; activities are Places). */
export interface FixedEvent {
  id: string;
  dayId: string;
  kind: FixedEventKind;
  title: string;
  locationId: string;
  window: TimeWindow | null;
  bookingId: string | null;
}

export type BookingKind = "flight" | "stay" | "car" | "transfer" | "ticket";

export interface Booking {
  id: string;
  kind: BookingKind;
  provider: string;
  title: string;
  confirmation: string | null;
  link: string | null;
  notes: string | null;
}

/** User-entered booking details layered over the static seed booking. */
export interface BookingOverride {
  confirmation: string | null;
  link: string | null;
}

export type TaskPriority = "critical" | "high" | "medium" | "low";

export interface Task {
  id: string;
  dayId: string;
  label: string;
  priority: TaskPriority;
  relatedBookingId: string | null;
  relatedPlaceId: string | null;
  relatedLegId: string | null;
  /** "booking": done once the related booking is secured. "manual": the traveler marks it done. */
  resolvedBy: "booking" | "manual";
}

export type ItemCategory =
  | "food"
  | "bar"
  | "cafe"
  | "museum"
  | "experience"
  | "shop"
  | "viewpoint"
  | "nightlife"
  | "beach"
  | "other";

export type Priority = "must" | "high" | "medium" | "low";

export type Placement = "anchor" | "planned" | "optional" | "backup" | "do-not-cram";

export type EnergyCost = "low" | "medium" | "high";

export interface Assignment {
  dayId: string;
  placement: Placement;
  /** For backups: the place this one replaces (same day). */
  backupFor: string | null;
  /** For do-not-cram: why it is deliberately left out. */
  reason: string | null;
}

export interface Place {
  id: string;
  name: string;
  city: string | null;
  area: string | null;
  category: ItemCategory;
  priority: Priority;
  notes: string;
  sourceUrl: string | null;
  /** Explicit duration; when null the day-load engine uses a labelled category estimate. */
  durationMinutes: number | null;
  energyCost: EnergyCost | null;
  window: TimeWindow | null;
  bookingId: string | null;
  origin: "seed" | "user";
  assignment: Assignment | null;
}

export type PackingKey = string;

export interface PackingItem {
  key: PackingKey;
  label: string;
  /** Nice-to-have items are excluded from progress totals. */
  optional: boolean;
}

export interface PackingCategory {
  name: string;
  items: PackingItem[];
}

export interface TripSeed {
  trip: Trip;
  days: Day[];
  locations: Location[];
  legs: TravelLeg[];
  fixedEvents: FixedEvent[];
  bookings: Booking[];
  tasks: Task[];
  places: Place[];
  packing: PackingCategory[];
}
