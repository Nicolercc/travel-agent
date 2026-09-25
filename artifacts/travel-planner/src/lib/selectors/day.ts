import { buildDayLoadInput, computeDayLoad, isAnchorDayType, placeDuration, type DayLoad } from "@/lib/domain/day-load";
import { VERDICT_LABEL, type Verdict } from "@/lib/domain/vocabulary";
import type { BookingState } from "@/lib/domain/bookings";
import { legsForDay } from "@/lib/domain/legs";
import { toMinutes } from "@/lib/domain/time";
import type { TripState, ProgressMark } from "@/lib/domain/trip-state";
import type { Booking, Day, FixedEvent, Location, Place, Task, TaskPriority, TravelLeg, TripSeed } from "@/lib/domain/types";
import { isTaskResolved, selectBookings } from "./bookings";
import { indexes, memo } from "./memo";

export interface PlaceView {
  place: Place;
  /** Its booking is secured (INV-3: derived, never stored). */
  booked: boolean;
  booking: Booking | null;
  bookingState: BookingState | null;
  /** Optional plans only: whether it still fits today. */
  fits: boolean | null;
  /** Backups only: the plan it replaces. */
  backupForName: string | null;
  /** How long it takes, and whether that is a typical-duration estimate (honesty rule). */
  durationMinutes: number;
  durationEstimated: boolean;
}

export interface LegView {
  leg: TravelLeg;
  from: Location;
  to: Location;
  /** How this day relates to the leg (INV-7: overnight legs appear on both days). */
  relation: "departs" | "arrives" | "within";
  booking: Booking | null;
  bookingState: BookingState | null;
}

export interface FixedEventView {
  event: FixedEvent;
  location: Location;
  booking: Booking | null;
}

export interface DayStatus {
  verdict: Verdict;
  verdictLabel: string;
  confidence: DayLoad["confidence"];
  /** The single most important reason, for compact surfaces. */
  headline: string | null;
  criticalTasks: number;
  openTasks: number;
  needsAnchor: boolean;
}

export interface DayView {
  day: Day;
  index: number;
  previous: Day | null;
  next: Day | null;
  origin: Location | null;
  base: Location | null;
  legs: LegView[];
  fixedEvents: FixedEventView[];
  anchor: PlaceView | null;
  planned: PlaceView[];
  optional: PlaceView[];
  backup: PlaceView[];
  doNotCram: PlaceView[];
  openTasks: Task[];
  progress: Record<string, ProgressMark>;
  load: DayLoad;
  status: DayStatus;
}

const PRIORITY_ORDER: readonly TaskPriority[] = ["critical", "high", "medium", "low"];

/** Timed plans by time, then untimed plans in stored order. */
function byTime(a: Place, b: Place): number {
  if (a.window && b.window) return toMinutes(a.window.start) - toMinutes(b.window.start);
  if (a.window) return -1;
  if (b.window) return 1;
  return 0;
}

function eventStart(view: FixedEventView): number {
  return view.event.window ? toMinutes(view.event.window.start) : Number.POSITIVE_INFINITY;
}

export function selectDayView(state: TripState, seed: TripSeed, dayId: string): DayView | null {
  return memo(seed, state, `day:${dayId}`, () => {
    const { daysById, locationsById } = indexes(seed);
    const day = daysById.get(dayId);
    if (!day) return null;
    const index = seed.days.indexOf(day);
    const bookings = selectBookings(state, seed);
    const bookingOf = (id: string | null) => (id ? bookings.get(id) ?? null : null);

    const load = computeDayLoad(
      buildDayLoadInput({ day, places: state.places, fixedEvents: seed.fixedEvents, legs: seed.legs, locationsById }),
    );
    const fits = new Map(load.optional.map((entry) => [entry.placeId, entry.fits]));

    const dayPlaces = state.places.filter((place) => place.assignment?.dayId === day.id);
    const namesById = new Map(state.places.map((place) => [place.id, place.name]));
    const view = (place: Place): PlaceView => {
      const booking = bookingOf(place.bookingId);
      const duration = placeDuration(place);
      return {
        durationMinutes: duration.minutes,
        durationEstimated: duration.estimated,
        place,
        booked: booking?.state === "secured",
        booking: booking?.booking ?? null,
        bookingState: booking?.state ?? null,
        fits: place.assignment!.placement === "optional" ? fits.get(place.id) ?? null : null,
        backupForName: place.assignment!.backupFor ? namesById.get(place.assignment!.backupFor) ?? null : null,
      };
    };
    const withPlacement = (placement: string) =>
      dayPlaces.filter((place) => place.assignment!.placement === placement).sort(byTime).map(view);

    const legs: LegView[] = legsForDay(day, seed.legs).map((leg) => {
      const booking = bookingOf(leg.bookingId);
      const departsToday = !leg.departure || leg.departure.date === day.date;
      const arrivesToday = !leg.arrival || leg.arrival.date === day.date;
      return {
        leg,
        from: locationsById.get(leg.fromLocationId)!,
        to: locationsById.get(leg.toLocationId)!,
        relation: departsToday && arrivesToday ? "within" : departsToday ? "departs" : "arrives",
        booking: booking?.booking ?? null,
        bookingState: booking?.state ?? null,
      };
    });

    const fixedEvents = seed.fixedEvents
      .filter((event) => event.dayId === day.id)
      .map((event) => ({ event, location: locationsById.get(event.locationId)!, booking: bookingOf(event.bookingId)?.booking ?? null }))
      .sort((a, b) => eventStart(a) - eventStart(b));

    const openTasks = seed.tasks
      .filter((task) => task.dayId === day.id && !isTaskResolved(task, state, seed))
      .sort((a, b) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority));

    const anchor = withPlacement("anchor")[0] ?? null;
    const status: DayStatus = {
      verdict: load.verdict,
      verdictLabel: VERDICT_LABEL[load.verdict],
      confidence: load.confidence,
      headline: load.reasons[0]?.message ?? null,
      criticalTasks: openTasks.filter((task) => task.priority === "critical").length,
      openTasks: openTasks.length,
      needsAnchor: isAnchorDayType(day.dayType) && anchor === null,
    };

    return {
      day,
      index,
      previous: seed.days[index - 1] ?? null,
      next: seed.days[index + 1] ?? null,
      origin: day.originLocationId ? locationsById.get(day.originLocationId) ?? null : null,
      base: day.baseLocationId ? locationsById.get(day.baseLocationId) ?? null : null,
      legs,
      fixedEvents,
      anchor,
      planned: withPlacement("planned"),
      optional: withPlacement("optional"),
      backup: withPlacement("backup"),
      doNotCram: withPlacement("do-not-cram"),
      openTasks,
      progress: state.progress[day.id] ?? {},
      load,
      status,
    };
  });
}

export function selectDayViews(state: TripState, seed: TripSeed): DayView[] {
  return memo(seed, state, "days", () => seed.days.map((day) => selectDayView(state, seed, day.id)!));
}
