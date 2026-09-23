import type { JourneyDataset } from "@/lib/journey/dataset";
import { validateJourneyDataset } from "@/lib/journey/validation";
import { bookingReferences } from "./bookingReferences";
import { days } from "./days";
import { events } from "./events";
import { locations } from "./locations";
import { travelLegs } from "./travelLegs";
import { unresolvedTasks } from "./unresolvedTasks";

/** Spain 2026 structured journey dataset — Itinerary spec §9 + §11. */
export const spain2026JourneyDataset: JourneyDataset = {
  days,
  locations,
  bookingReferences,
  travelLegs,
  events,
  unresolvedTasks,
};

/** Validation result for referential integrity and domain rules (Phase 2A). */
export const spain2026ValidationResult = validateJourneyDataset(spain2026JourneyDataset);

export {
  bookingReferences,
  days,
  events,
  locations,
  travelLegs,
  unresolvedTasks,
};

export type { JourneyDataset } from "@/lib/journey/dataset";
export type { JourneyValidationResult } from "@/lib/journey/validation";
