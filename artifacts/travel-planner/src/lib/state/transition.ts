import { isRealReference } from "@/lib/domain/bookings";
import { placementForPriority } from "@/lib/domain/placement";
import type { Assignment, BookingOverride, Place, Placement, TripSeed } from "@/lib/domain/types";
import { validateTripState } from "./invariants";
import { createInitialState, progressItemIds, type AssignmentChange, type ProgressMark, type TripState } from "@/lib/domain/trip-state";

export type TripAction =
  | { type: "setPlacement"; placeId: string; dayId: string; placement: Placement }
  | { type: "assignToDay"; placeId: string; dayId: string }
  | { type: "unassignPlace"; placeId: string }
  | { type: "restoreAssignments"; changes: { placeId: string; assignment: Assignment | null }[] }
  | { type: "addPlace"; place: Place }
  | { type: "resolveBooking"; bookingId: string; override: BookingOverride }
  | { type: "clearBookingOverride"; bookingId: string }
  | { type: "setTaskResolved"; taskId: string; resolved: boolean }
  | { type: "toggleProgress"; dayId: string; itemId: string; mark: ProgressMark }
  | { type: "togglePacked"; key: string }
  | { type: "reset" };

/** What changed, so the UI can announce it and offer Undo without the state layer knowing about UI. */
export type TripEffect =
  | { type: "assignmentsChanged"; changes: AssignmentChange[] }
  | { type: "anchorDemoted"; placeId: string; dayId: string }
  | { type: "rejected"; reason: string };

export interface TransitionResult {
  state: TripState;
  effects: TripEffect[];
}

const unchanged = (state: TripState, reason: string): TransitionResult => ({
  state,
  effects: [{ type: "rejected", reason }],
});

function replaceAssignments(
  state: TripState,
  updates: Map<string, Assignment | null>,
): { places: Place[]; changes: AssignmentChange[] } {
  const changes: AssignmentChange[] = [];
  const places = state.places.map((place) => {
    if (!updates.has(place.id)) return place;
    const after = updates.get(place.id)!;
    changes.push({ placeId: place.id, before: place.assignment, after });
    return { ...place, assignment: after };
  });
  return { places, changes };
}

/** Backups that pointed at a place that is leaving the day lose their target (INV-9). */
function detachBackups(state: TripState, placeId: string, updates: Map<string, Assignment | null>): void {
  for (const place of state.places) {
    if (place.assignment?.backupFor === placeId && !updates.has(place.id)) {
      updates.set(place.id, { ...place.assignment, backupFor: null });
    }
  }
}

/**
 * The only way TripState changes. Pure: same state + action (+ seed) → same result.
 * Enforces INV-1 (one anchor per day), INV-9 (assignment consistency), INV-10 (per-day progress).
 */
export function transition(state: TripState, action: TripAction, seed: TripSeed): TransitionResult {
  switch (action.type) {
    case "setPlacement": {
      const place = state.places.find((p) => p.id === action.placeId);
      if (!place) return unchanged(state, "unknown place");
      if (!seed.days.some((day) => day.id === action.dayId)) return unchanged(state, "unknown day");

      const sameDay = place.assignment?.dayId === action.dayId;
      const updates = new Map<string, Assignment | null>();
      updates.set(place.id, {
        dayId: action.dayId,
        placement: action.placement,
        backupFor: sameDay && action.placement === "backup" ? place.assignment!.backupFor : null,
        reason: sameDay && action.placement === "do-not-cram" ? place.assignment!.reason : null,
      });
      if (!sameDay) detachBackups(state, place.id, updates);

      const effects: TripEffect[] = [];
      if (action.placement === "anchor") {
        const current = state.places.find(
          (p) => p.id !== place.id && p.assignment?.dayId === action.dayId && p.assignment.placement === "anchor",
        );
        if (current) {
          updates.set(current.id, { ...current.assignment!, placement: "planned" });
          effects.push({ type: "anchorDemoted", placeId: current.id, dayId: action.dayId });
        }
      }

      const { places, changes } = replaceAssignments(state, updates);
      return { state: { ...state, places }, effects: [{ type: "assignmentsChanged", changes }, ...effects] };
    }

    case "assignToDay": {
      // From the Inbox: placement follows priority and is never the anchor.
      const place = state.places.find((p) => p.id === action.placeId);
      if (!place) return unchanged(state, "unknown place");
      return transition(state, { type: "setPlacement", placeId: place.id, dayId: action.dayId, placement: placementForPriority(place.priority) }, seed);
    }

    case "unassignPlace": {
      const place = state.places.find((p) => p.id === action.placeId);
      if (!place) return unchanged(state, "unknown place");
      if (!place.assignment) return { state, effects: [] };
      const updates = new Map<string, Assignment | null>([[place.id, null]]);
      detachBackups(state, place.id, updates);
      const { places, changes } = replaceAssignments(state, updates);
      return { state: { ...state, places }, effects: [{ type: "assignmentsChanged", changes }] };
    }

    case "restoreAssignments": {
      // Undo: only applied when the restored arrangement is still valid (other edits may have happened since).
      const updates = new Map(action.changes.map((change) => [change.placeId, change.assignment]));
      const { places, changes } = replaceAssignments(state, updates);
      const next = { ...state, places };
      if (validateTripState(next, seed).length > 0) return unchanged(state, "undo no longer applies");
      return { state: next, effects: [{ type: "assignmentsChanged", changes }] };
    }

    case "addPlace": {
      if (state.places.some((p) => p.id === action.place.id)) return unchanged(state, "duplicate id");
      return { state: { ...state, places: [...state.places, { ...action.place, origin: "user" }] }, effects: [] };
    }

    case "resolveBooking": {
      if (!seed.bookings.some((booking) => booking.id === action.bookingId)) return unchanged(state, "unknown booking");
      const confirmation = action.override.confirmation?.trim() ?? null;
      const link = action.override.link?.trim() || null;
      if (!isRealReference(confirmation) && !link) return unchanged(state, "empty booking details");
      return {
        state: {
          ...state,
          bookingOverrides: {
            ...state.bookingOverrides,
            [action.bookingId]: { confirmation: isRealReference(confirmation) ? confirmation : null, link },
          },
        },
        effects: [],
      };
    }

    case "clearBookingOverride": {
      if (!(action.bookingId in state.bookingOverrides)) return { state, effects: [] };
      const { [action.bookingId]: _removed, ...rest } = state.bookingOverrides;
      return { state: { ...state, bookingOverrides: rest }, effects: [] };
    }

    case "setTaskResolved": {
      if (!seed.tasks.some((task) => task.id === action.taskId)) return unchanged(state, "unknown task");
      const others = state.resolvedTaskIds.filter((id) => id !== action.taskId);
      return { state: { ...state, resolvedTaskIds: action.resolved ? [...others, action.taskId] : others }, effects: [] };
    }

    case "toggleProgress": {
      if (!seed.days.some((d) => d.id === action.dayId)) return unchanged(state, "unknown day");
      if (!progressItemIds(state.places, seed).has(action.itemId)) return unchanged(state, "unknown item");
      const day = state.progress[action.dayId] ?? {};
      const { [action.itemId]: current, ...rest } = day;
      const nextDay = current === action.mark ? rest : { ...rest, [action.itemId]: action.mark };
      return { state: { ...state, progress: { ...state.progress, [action.dayId]: nextDay } }, effects: [] };
    }

    case "togglePacked": {
      const valid = seed.packing.some((category) => category.items.some((item) => item.key === action.key));
      if (!valid) return unchanged(state, "unknown packing item");
      const packed = state.packed.includes(action.key)
        ? state.packed.filter((key) => key !== action.key)
        : [...state.packed, action.key];
      return { state: { ...state, packed }, effects: [] };
    }

    case "reset":
      return { state: createInitialState(seed), effects: [] };
  }
}
