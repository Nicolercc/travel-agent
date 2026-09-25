import type { TripState } from "@/lib/domain/trip-state";
import type { TripSeed } from "@/lib/domain/types";
import { selectBookings, selectOpenTasks } from "./bookings";
import { selectDayViews } from "./day";
import { memo } from "./memo";

export interface Progress {
  done: number;
  total: number;
}

export interface ReadinessSummary {
  bookings: Progress;
  /** Days that are Comfortable or Full. */
  days: Progress;
  tasks: Progress;
  unsorted: number;
  packing: Progress;
}

/** Counts derived from the same selectors as the issue list, so the two can never disagree. */
export function selectReadiness(state: TripState, seed: TripSeed): ReadinessSummary {
  return memo(seed, state, "readiness", () => {
    const bookings = [...selectBookings(state, seed).values()];
    const days = selectDayViews(state, seed);
    const packable = seed.packing.flatMap((category) => category.items.filter((item) => !item.optional));
    return {
      bookings: { done: bookings.filter((b) => b.state === "secured").length, total: bookings.length },
      days: {
        done: days.filter((view) => view.status.verdict === "comfortable" || view.status.verdict === "full").length,
        total: days.length,
      },
      tasks: { done: seed.tasks.length - selectOpenTasks(state, seed).length, total: seed.tasks.length },
      unsorted: state.places.filter((place) => place.assignment === null).length,
      packing: { done: packable.filter((item) => state.packed.includes(item.key)).length, total: packable.length },
    };
  });
}
