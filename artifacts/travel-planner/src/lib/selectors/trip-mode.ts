import { toLocalDateOnlyString } from "@/lib/domain/dates";
import { placeDuration } from "@/lib/domain/day-load";
import { mapsSearchUrl } from "@/lib/domain/links";
import { FIXED_EVENT_DEFAULT_MINUTES } from "@/lib/domain/planning-heuristics";
import { formatTimeOfDay, toMinutes } from "@/lib/domain/time";
import type { ProgressMark, TripState } from "@/lib/domain/trip-state";
import type { Booking, Location, Task, TripSeed } from "@/lib/domain/types";
import { bookingState, type BookingState } from "@/lib/domain/bookings";
import { selectDayView, type DayView, type FixedEventView, type LegView, type PlaceView } from "./day";
import { isKeyLeg } from "./itinerary";

const MINUTES_PER_DAY = 24 * 60;

export interface TripModeItem {
  /** The progress id (a place, fixed event, or leg). */
  id: string;
  kind: "travel" | "fixed" | "plan";
  title: string;
  /** Minutes after midnight on this day; null when untimed. */
  start: number | null;
  end: number | null;
  /** "6:55 PM", "dep 6:55 PM", "arrives 8:45 AM". */
  timeLabel: string | null;
  where: string | null;
  mapsUrl: string | null;
  anchor: boolean;
  mark: ProgressMark | undefined;
  /** Airport steps folded into a flight ("Arrive at JFK · 3:45 PM"): they are how you catch it, not separate plans. */
  steps: { id: string; label: string }[];
  place: PlaceView | null;
}

export interface TravelEntry {
  id: string;
  title: string;
  time: string | null;
  where: string;
  /** Appointments folded into this leg ("Arrive at JFK · 3:45 PM"). */
  steps: string[];
  booking: Booking | null;
  bookingState: BookingState | null;
}

export interface TripModeView {
  dayView: DayView;
  /** The clock is on another date: Trip Mode is a preview and nothing is "now". */
  previewing: boolean;
  clockMinutes: number;
  /** What the day commits to, in order: travel, fixed appointments, the anchor, planned stops, chosen backups. */
  items: TripModeItem[];
  now: TripModeItem | null;
  next: TripModeItem | null;
  /** Optional plans: listed, never counted as Next. */
  optional: TripModeItem[];
  travel: TravelEntry[];
  criticalTasks: Task[];
  /** Backups by the id of the plan they back up. */
  backupsFor: Record<string, PlaceView[]>;
  /** Backups not tied to one plan: offered when a skipped plan has none of its own. */
  generalBackups: PlaceView[];
  /** The day's written fallbacks ("If it rains: …"). */
  fallbacks: string[];
}

function where(location: Location): string {
  return location.name === location.city ? location.name : `${location.name}, ${location.city}`;
}

function planItem(view: PlaceView, dayView: DayView): TripModeItem {
  const { place } = view;
  const start = place.window ? toMinutes(place.window.start) : null;
  return {
    id: place.id,
    kind: "plan",
    title: place.name,
    start,
    end: start === null ? null : start + placeDuration(place).minutes,
    timeLabel: place.window ? formatTimeOfDay(place.window.start) : null,
    where: [place.area, place.city].filter(Boolean).join(", ") || null,
    mapsUrl: mapsSearchUrl(place.name, place.city),
    anchor: place.assignment?.placement === "anchor",
    mark: dayView.progress[place.id],
    steps: [],
    place: view,
  };
}

function fixedItem({ event, location }: FixedEventView, dayView: DayView): TripModeItem {
  const start = event.window ? toMinutes(event.window.start) : null;
  const end = event.window?.end ? toMinutes(event.window.end) : start === null ? null : start + FIXED_EVENT_DEFAULT_MINUTES;
  return {
    id: event.id,
    kind: "fixed",
    title: event.title,
    start,
    end,
    timeLabel: event.window ? formatTimeOfDay(event.window.start) : null,
    where: where(location),
    mapsUrl: mapsSearchUrl(location.name, location.city),
    anchor: false,
    mark: dayView.progress[event.id],
    steps: [],
    place: null,
  };
}

function travelItem(legView: LegView, dayView: DayView, prep: FixedEventView[]): TripModeItem {
  const { leg, from, to, relation } = legView;
  const arriving = relation === "arrives";
  const departure = leg.departure && !arriving ? toMinutes(leg.departure.time) : null;
  const arrival = leg.arrival && relation !== "departs" ? toMinutes(leg.arrival.time) : null;
  const prepStarts = prep.flatMap(({ event }) => (event.window ? [toMinutes(event.window.start)] : []));
  const start = prepStarts.length > 0 ? Math.min(...prepStarts) : departure ?? arrival;
  const scheduledEnd = arriving ? arrival : relation === "departs" ? MINUTES_PER_DAY : arrival ?? departure;
  // Only a departure time is known (a pickup): hold it for the same default as an appointment.
  const end = !arriving && scheduledEnd !== null && scheduledEnd === start ? scheduledEnd + FIXED_EVENT_DEFAULT_MINUTES : scheduledEnd;
  const origin = arriving ? to : from;
  return {
    id: leg.id,
    kind: "travel",
    title: leg.label,
    start,
    end,
    timeLabel: arriving
      ? leg.arrival && `arrives ${formatTimeOfDay(leg.arrival.time)}`
      : leg.departure
        ? `dep ${formatTimeOfDay(leg.departure.time)}`
        : null,
    where: where(origin),
    mapsUrl: mapsSearchUrl(origin.name, origin.city),
    anchor: false,
    mark: dayView.progress[leg.id],
    steps: prep.map(({ event }) => ({ id: event.id, label: `${event.title}${event.window ? ` · ${formatTimeOfDay(event.window.start)}` : ""}` })),
    place: null,
  };
}

function byStart(a: TripModeItem, b: TripModeItem): number {
  return (a.start ?? Number.POSITIVE_INFINITY) - (b.start ?? Number.POSITIVE_INFINITY);
}

const open = (item: TripModeItem) => item.mark === undefined;

/**
 * Trip Mode's answer to "what do I need right now?" (RFC §10). Now: the open committed item whose
 * window contains the clock. Next: the first open item after it, by time then order; a chosen
 * backup goes first. Previewing another date: nothing is Now and Next is the day's first open item.
 */
export function selectTripMode(state: TripState, seed: TripSeed, dayId: string, clock: Date, chosenBackupIds: readonly string[] = []): TripModeView | null {
  const dayView = selectDayView(state, seed, dayId);
  if (!dayView) return null;
  const previewing = toLocalDateOnlyString(clock) !== dayView.day.date;
  const clockMinutes = clock.getHours() * 60 + clock.getMinutes();

  // A fixed event that is part of a leg folds into it, so nothing appears twice: airport steps before a
  // flight from that airport, and the appointment a booked leg exists for (same booking, same time).
  const departing = dayView.legs.filter(({ leg, relation }) => relation !== "arrives" && leg.departure);
  const partOf = ({ event }: FixedEventView) =>
    departing.find(({ leg }) => {
      const departs = toMinutes(leg.departure!.time);
      if (event.kind === "airport") {
        return leg.mode === "flight" && leg.fromLocationId === event.locationId && (!event.window || toMinutes(event.window.start) <= departs);
      }
      return event.bookingId !== null && event.bookingId === leg.bookingId && event.window !== null && toMinutes(event.window.start) === departs;
    });
  const prepFor = new Map<string, FixedEventView[]>();
  const folded = new Set<string>();
  for (const eventView of dayView.fixedEvents) {
    const leg = partOf(eventView);
    if (!leg) continue;
    folded.add(eventView.event.id);
    prepFor.set(leg.leg.id, [...(prepFor.get(leg.leg.id) ?? []), eventView]);
  }

  // Every key leg is listed under Today's travel; only timed ones can be Now or Next.
  const keyLegs = dayView.legs
    .filter((legView) => isKeyLeg(legView, dayView))
    .map((legView) => travelItem(legView, dayView, prepFor.get(legView.leg.id) ?? []));
  const travel = keyLegs.filter((item) => item.start !== null);
  const fixed = dayView.fixedEvents.filter(({ event }) => !folded.has(event.id)).map((view) => fixedItem(view, dayView));
  const committed = [dayView.anchor, ...dayView.planned].filter((view): view is PlaceView => view !== null).map((view) => planItem(view, dayView));
  const chosen = chosenBackupIds
    .map((id) => dayView.backup.find((view) => view.place.id === id))
    .filter((view): view is PlaceView => view !== undefined)
    .map((view) => planItem(view, dayView));

  // Stable: timed by start, untimed afterwards in their listed order.
  const items = [...travel, ...fixed, ...committed].sort(byStart).concat(chosen);

  const now = previewing
    ? null
    : items
        .filter((item) => open(item) && item.start !== null && item.end !== null && item.start <= clockMinutes && clockMinutes < item.end)
        .sort((a, b) => b.start! - a.start!)[0] ?? null;
  const preferred = [...chosen].reverse().find(open) ?? null;
  const next =
    preferred ??
    items.find((item) => item !== now && open(item) && (previewing || item.start === null || item.start >= clockMinutes)) ??
    null;

  const backupsFor: Record<string, PlaceView[]> = {};
  const generalBackups: PlaceView[] = [];
  for (const view of dayView.backup) {
    const target = view.place.assignment?.backupFor;
    if (target) backupsFor[target] = [...(backupsFor[target] ?? []), view];
    else generalBackups.push(view);
  }

  const travelEntries: TravelEntry[] = [
    ...keyLegs.map((item) => {
      const legView = dayView.legs.find(({ leg }) => leg.id === item.id)!;
      return {
        id: item.id,
        title: item.title,
        time: item.timeLabel,
        where: item.where!,
        steps: item.steps.map((step) => step.label),
        booking: legView.booking,
        bookingState: legView.bookingState,
        start: item.start,
      };
    }),
    ...dayView.fixedEvents
      .filter(({ event }) => event.kind !== "wake" && !folded.has(event.id))
      .map(({ event, location, booking }) => ({
        id: event.id,
        title: event.title,
        time: event.window ? formatTimeOfDay(event.window.start) : null,
        where: where(location),
        steps: [] as string[],
        booking,
        bookingState: booking ? bookingState(booking) : null,
        start: event.window ? toMinutes(event.window.start) : null,
      })),
  ]
    .sort((a, b) => (a.start ?? Number.POSITIVE_INFINITY) - (b.start ?? Number.POSITIVE_INFINITY))
    .map(({ start: _start, ...entry }) => entry);

  return {
    dayView,
    previewing,
    clockMinutes,
    items,
    now,
    next,
    optional: dayView.optional.map((view) => planItem(view, dayView)),
    travel: travelEntries,
    criticalTasks: dayView.openTasks.filter((task) => task.priority === "critical"),
    backupsFor,
    generalBackups,
    fallbacks: dayView.day.fallbacks,
  };
}
