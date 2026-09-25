import { validatePlaces, type ValidationIssue } from "@/lib/domain/validation";
import type { TripSeed } from "@/lib/domain/types";
import { progressItemIds, type TripState } from "@/lib/domain/trip-state";

/** Every rule a TripState must satisfy against its seed (INV-1, 9, 10, 11). Empty = valid. */
export function validateTripState(state: TripState, seed: TripSeed): ValidationIssue[] {
  const dayIds = new Set(seed.days.map((day) => day.id));
  const bookingIds = new Set(seed.bookings.map((booking) => booking.id));
  const taskIds = new Set(seed.tasks.map((task) => task.id));
  const packingKeys = new Set(seed.packing.flatMap((category) => category.items.map((item) => item.key)));
  const itemIds = progressItemIds(state.places, seed);

  const issues = validatePlaces(state.places, { dayIds, bookingIds });
  for (const bookingId of Object.keys(state.bookingOverrides)) {
    if (!bookingIds.has(bookingId)) issues.push({ code: "missing_booking", message: `Override for unknown booking ${bookingId}`, entityId: bookingId });
  }
  for (const taskId of state.resolvedTaskIds) {
    if (!taskIds.has(taskId)) issues.push({ code: "missing_task", message: `Unknown resolved task ${taskId}`, entityId: taskId });
  }
  for (const [dayId, marks] of Object.entries(state.progress)) {
    if (!dayIds.has(dayId)) issues.push({ code: "missing_day", message: `Progress for unknown day ${dayId}`, entityId: dayId });
    for (const itemId of Object.keys(marks)) {
      if (!itemIds.has(itemId)) issues.push({ code: "missing_item", message: `Progress for unknown item ${itemId}`, entityId: itemId });
    }
  }
  for (const key of state.packed) {
    if (!packingKeys.has(key)) issues.push({ code: "missing_packing_item", message: `Unknown packing item ${key}`, entityId: key });
  }
  if (new Set(state.packed).size !== state.packed.length) {
    issues.push({ code: "duplicate_packing_key", message: "A packing item is marked twice" });
  }
  return issues;
}
