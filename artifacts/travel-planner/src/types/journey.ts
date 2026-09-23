import type { DateOnlyString } from "@/lib/dates";

// ── Enums (Itinerary spec §9) ───────────────────────────────────────────────

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
  | "full"
  | "full-controlled";

export type EventTier = "must-do" | "strong-maybe" | "skip-if-tired";

export type PlanStatus = "confirmed" | "planned" | "considered" | "unresolved";

export type TransportMode =
  | "flight"
  | "car"
  | "train"
  | "funicular"
  | "cable-car"
  | "walk"
  | "shuttle"
  | "ferry";

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
  | "nature";

export type JourneyRegion = "Menorca" | "Costa Brava" | "Barcelona" | "Transit";

export type UnresolvedTaskPriority = "critical" | "high" | "medium" | "low";

export type EventEnergyCost = "low" | "medium" | "high";

// ── Core entities ─────────────────────────────────────────────────────────────

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Location {
  id: string;
  name: string;
  kind: LocationKind;
  city: string;
  region: JourneyRegion;
  coordinates: GeoPoint;
  address?: string;
}

export interface BookingReference {
  id: string;
  provider: string;
  confirmationNumber: string | null;
  status: PlanStatus;
  bookingLink?: string | null;
  notes?: string;
}

export interface TravelLeg {
  id: string;
  dayId: string;
  mode: TransportMode;
  fromLocationId: string;
  toLocationId: string;
  departure?: { time: string; date: DateOnlyString } | null;
  arrival?: { time: string; date: DateOnlyString } | null;
  bookingRefId?: string | null;
  status: PlanStatus;
  label: string;
}

export interface ItineraryEvent {
  id: string;
  dayId: string;
  locationId: string;
  title: string;
  fixed: boolean;
  tier: EventTier | null;
  status: PlanStatus;
  timeWindow?: { start: string; end?: string } | null;
  durationMinutes?: number;
  bookingRefId?: string | null;
  notes?: string;
  energyCost: EventEnergyCost;
}

export interface UnresolvedTask {
  id: string;
  dayId: string;
  label: string;
  priority: UnresolvedTaskPriority;
  relatedBookingRefId?: string | null;
  relatedEventId?: string | null;
}

export interface JourneyDay {
  id: string;
  date: DateOnlyString;
  dayType: DayType;
  title: string;
  emotionalTheme: string;
  energyMode: EnergyMode;
  originLocationId: string | null;
  destinationLocationId: string | null;
  overnightBaseLocationId: string | null;
  fixedEventIds: string[];
  flexibleEventIds: string[];
  legIds: string[];
  unresolvedTaskIds: string[];
  dayVibe: string;
  outfitNote: string | null;
}
