import { applyBookingOverride, bookingState, type BookingState } from "@/lib/domain/bookings";
import type { TripState } from "@/lib/domain/trip-state";
import type { Booking, Task, TripSeed } from "@/lib/domain/types";
import { indexes, memo } from "./memo";

export interface BookingView {
  booking: Booking;
  state: BookingState;
  /** Days this booking is used on (legs, appointments, plans), in trip order. */
  dayIds: string[];
  /** The traveler has entered their own details for it. */
  edited: boolean;
}

/** Seed bookings with the traveler's overrides applied (the single view of booking truth). */
export function selectBookings(state: TripState, seed: TripSeed): Map<string, BookingView> {
  return memo(seed, state, "bookings", () => {
    const dayOrder = new Map(seed.days.map((day, index) => [day.id, index]));
    const uses = new Map<string, Set<string>>();
    const use = (bookingId: string | null, dayId: string | undefined) => {
      if (!bookingId || !dayId) return;
      if (!uses.has(bookingId)) uses.set(bookingId, new Set());
      uses.get(bookingId)!.add(dayId);
    };
    for (const leg of seed.legs) use(leg.bookingId, leg.dayId);
    for (const event of seed.fixedEvents) use(event.bookingId, event.dayId);
    for (const place of state.places) use(place.bookingId, place.assignment?.dayId);

    return new Map(
      seed.bookings.map((seedBooking) => {
        const booking = applyBookingOverride(seedBooking, state.bookingOverrides[seedBooking.id]);
        const dayIds = [...(uses.get(seedBooking.id) ?? [])].sort((a, b) => dayOrder.get(a)! - dayOrder.get(b)!);
        return [
          seedBooking.id,
          { booking, state: bookingState(booking), dayIds, edited: seedBooking.id in state.bookingOverrides },
        ];
      }),
    );
  });
}

/** A task is done when the traveler marks it, or — for booking tasks — when its booking is secured. */
export function isTaskResolved(task: Task, state: TripState, seed: TripSeed): boolean {
  if (state.resolvedTaskIds.includes(task.id)) return true;
  if (task.resolvedBy === "booking" && task.relatedBookingId) {
    return selectBookings(state, seed).get(task.relatedBookingId)?.state === "secured";
  }
  return false;
}

export function selectOpenTasks(state: TripState, seed: TripSeed): Task[] {
  return memo(seed, state, "openTasks", () => seed.tasks.filter((task) => !isTaskResolved(task, state, seed)));
}

export { indexes };
