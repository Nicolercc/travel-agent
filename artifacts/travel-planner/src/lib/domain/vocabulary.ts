import type { DayType, Placement, TransportMode } from "./types";

/** The product's fixed words for derived states (RFC §7, §12). UI may import these. */
export type Verdict = "comfortable" | "full" | "tight" | "overloaded";

export const VERDICT_LABEL: Record<Verdict, string> = {
  comfortable: "Comfortable",
  full: "Full",
  tight: "Tight",
  overloaded: "Overloaded",
};

export const PLACEMENT_LABEL: Record<Placement, string> = {
  anchor: "Anchor",
  planned: "Planned",
  optional: "Optional",
  backup: "Backup",
  "do-not-cram": "Do not cram",
};

export const DAY_TYPE_LABEL: Record<DayType, string> = {
  flight: "Flight",
  arrival: "Arrival",
  experience: "Experience",
  "road-trip": "Road trip",
  city: "City",
  mountain: "Mountain",
  departure: "Departure",
};

export const TRANSPORT_MODE_LABEL: Record<TransportMode, string> = {
  flight: "Flight",
  car: "Drive",
  train: "Train",
  funicular: "Rack railway",
  walk: "Walk",
  shuttle: "Shuttle",
  ferry: "Ferry",
};
