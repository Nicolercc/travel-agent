import type { EnergyCost, EnergyMode, FixedEventKind, ItemCategory, TimeOfDay } from "./types";

/**
 * PLANNING HEURISTICS — the only place TripCanvas's planning numbers live: the realistic-day
 * engine's estimates and thresholds, and when an unresolved booking is worth raising.
 *
 * These are deliberately rough planning estimates, not measurements. They exist so that the
 * engine is deterministic and explainable; they do not make its output precise. Anything the
 * engine derives from them is shown to travelers rounded and prefixed "about", and a day built
 * mostly on category estimates is labelled as an estimate. See docs/DAY_LOAD.md.
 *
 * Changing a value here is a product decision: record the reason in docs/DAY_LOAD.md and
 * update the pinned seed expectations in day-load.test.ts.
 */

/** The part of a day that plans can use, before travel and appointments are subtracted. */
export const DAY_WINDOW: { start: TimeOfDay; end: TimeOfDay } = { start: "08:30", end: "22:00" };

/** Minutes to be at the airport before a flight departs. */
export const FLIGHT_BUFFER_MINUTES = { international: 150, other: 90 } as const;

/** Minutes to be at the terminal before other timed transport departs. */
export const DEPARTURE_BUFFER_MINUTES = { ferry: 60, train: 20 } as const;

/** Minutes after a flight, ferry, or train arrives before the traveler is free again. */
export const ARRIVAL_SETTLE_MINUTES = 45;

/** Only these appointment kinds block time; check-in/out times are "from"/"by" times, not slots. */
export const BLOCKING_FIXED_EVENT_KINDS: readonly FixedEventKind[] = ["airport", "pickup", "return", "departure"];

/** Assumed length of a blocking appointment that has only a start time. */
export const FIXED_EVENT_DEFAULT_MINUTES = 30;

/** Rough time to move between consecutive plans, by how far apart they are. */
export const TRANSITION_MINUTES = { sameArea: 15, sameCity: 30, otherCity: 60 } as const;

/** Typical visit length when a plan has no duration of its own (flagged as an estimate). */
export const CATEGORY_DURATION_MINUTES: Record<ItemCategory, number> = {
  museum: 120,
  experience: 120,
  viewpoint: 45,
  food: 75,
  cafe: 30,
  bar: 60,
  nightlife: 150,
  shop: 60,
  beach: 150,
  other: 60,
};

/** Typical effort when a plan has no energy cost of its own. */
export const CATEGORY_ENERGY: Record<ItemCategory, EnergyCost> = {
  museum: "medium",
  experience: "high",
  viewpoint: "medium",
  food: "low",
  cafe: "low",
  bar: "low",
  nightlife: "high",
  shop: "medium",
  beach: "medium",
  other: "medium",
};

export const ENERGY_POINTS: Record<EnergyCost, number> = { low: 1, medium: 2, high: 3 };

/** Energy a day can absorb before it stops feeling good, by the day's intended energy. */
export const ENERGY_BUDGET: Record<EnergyMode, number> = {
  controlled: 3,
  soft: 4,
  "soft-adaptable": 4,
  medium: 6,
  "full-controlled": 7,
  full: 8,
};

/** A long-haul arrival costs energy on the day you land. */
export const LONG_HAUL_ARRIVAL_ENERGY: EnergyCost = "high";

export const VERDICT_THRESHOLDS = {
  /** Committed share of available time above which a day is Tight. */
  tightUtilization: 0.85,
  /** Committed share of available time above which a day is Full. */
  fullUtilization: 0.6,
  /** Spare time below which a day is Tight (room for one delay). */
  lowSlackMinutes: 60,
  /** More distinct areas than this adds a MANY_AREAS reason. */
  manyAreas: 2,
  /** Available time below this adds a SHORT_WINDOW reason. */
  shortWindowMinutes: 360,
  /** Share of committed minutes from category estimates above which the verdict is an estimate. */
  mostlyEstimatedShare: 0.5,
} as const;

/** An unsecured booking is raised on its own once its first day is this close (days). */
export const BOOKING_ISSUE_HORIZON_DAYS = 14;
