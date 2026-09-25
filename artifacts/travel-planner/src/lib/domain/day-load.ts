import {
  ARRIVAL_SETTLE_MINUTES,
  BLOCKING_FIXED_EVENT_KINDS,
  CATEGORY_DURATION_MINUTES,
  CATEGORY_ENERGY,
  DAY_WINDOW,
  DEPARTURE_BUFFER_MINUTES,
  ENERGY_BUDGET,
  ENERGY_POINTS,
  FIXED_EVENT_DEFAULT_MINUTES,
  FLIGHT_BUFFER_MINUTES,
  LONG_HAUL_ARRIVAL_ENERGY,
  TRANSITION_MINUTES,
  VERDICT_THRESHOLDS,
} from "./planning-heuristics";
import { legIsInternational, legLeavesTrip, legsForDay } from "./legs";
import { formatApproxDuration, toMinutes } from "./time";
import type { Verdict } from "./vocabulary";
import type { Day, DayType, EnergyCost, EnergyMode, FixedEvent, Location, Place, Priority, TravelLeg } from "./types";

// ── Input model ─────────────────────────────────────────────────────────────────

export interface LoadStop {
  area: string;
  city: string;
}

export interface LoadActivity extends LoadStop {
  id: string;
  label: string;
  durationMinutes: number;
  /** True when the duration came from a category estimate rather than the plan itself. */
  durationEstimated: boolean;
  /** Minutes since midnight, when the plan has a set time. */
  start: number | null;
  energy: EnergyCost;
  priority: Priority;
  isAnchor: boolean;
}

export interface BusyBlock {
  id: string;
  label: string;
  start: number;
  end: number;
}

export interface DayLoadInput {
  dayType: DayType;
  energyMode: EnergyMode;
  startStop: LoadStop | null;
  endStop: LoadStop | null;
  busy: BusyBlock[];
  committed: LoadActivity[];
  optional: LoadActivity[];
  /** Energy from travel itself (a long-haul arrival). */
  travelEnergy: number;
}

// ── Output model ────────────────────────────────────────────────────────────────

export type { Verdict } from "./vocabulary";

export type ReasonCode =
  | "TIME_CONFLICT"
  | "OVER_CAPACITY"
  | "LOW_SLACK"
  | "ENERGY_OVER_BUDGET"
  | "MANY_AREAS"
  | "SHORT_WINDOW"
  | "TRAVEL_DAY_SQUEEZE"
  | "OPTIONAL_WONT_FIT"
  | "MOSTLY_ESTIMATED"
  | "NO_ANCHOR";

export interface DayLoadReason {
  code: ReasonCode;
  message: string;
}

export interface OptionalFit {
  placeId: string;
  fits: boolean;
}

export interface DayLoadSuggestion {
  placeId: string;
  label: string;
  verdictAfter: Verdict;
}

export interface DayLoad {
  verdict: Verdict;
  /** "estimate" when most committed time comes from category estimates. */
  confidence: "planned" | "estimate";
  availableMinutes: number;
  committedMinutes: number;
  slackMinutes: number;
  energyPoints: number;
  energyBudget: number;
  areas: string[];
  reasons: DayLoadReason[];
  optional: OptionalFit[];
  conflicts: [string, string][];
  suggestion: DayLoadSuggestion | null;
}

// ── Input builder ───────────────────────────────────────────────────────────────

const TRAVEL_DAY_TYPES: readonly DayType[] = ["flight", "arrival", "departure"];
const ANCHOR_DAY_TYPES: readonly DayType[] = ["experience", "road-trip", "city", "mountain"];

export function isTravelDayType(dayType: DayType): boolean {
  return TRAVEL_DAY_TYPES.includes(dayType);
}

export function isAnchorDayType(dayType: DayType): boolean {
  return ANCHOR_DAY_TYPES.includes(dayType);
}

export function placeDuration(place: Place): { minutes: number; estimated: boolean } {
  if (place.durationMinutes !== null) return { minutes: place.durationMinutes, estimated: false };
  if (place.window?.end) {
    return { minutes: toMinutes(place.window.end) - toMinutes(place.window.start), estimated: false };
  }
  return { minutes: CATEGORY_DURATION_MINUTES[place.category], estimated: true };
}

function toActivity(place: Place): LoadActivity {
  const duration = placeDuration(place);
  return {
    id: place.id,
    label: place.name,
    area: place.area ?? place.city ?? "",
    city: place.city ?? "",
    durationMinutes: duration.minutes,
    durationEstimated: duration.estimated,
    start: place.window ? toMinutes(place.window.start) : null,
    energy: place.energyCost ?? CATEGORY_ENERGY[place.category],
    priority: place.priority,
    isAnchor: place.assignment?.placement === "anchor",
  };
}

function stopFor(locationId: string | null, locationsById: ReadonlyMap<string, Location>): LoadStop | null {
  const location = locationId ? locationsById.get(locationId) : undefined;
  return location ? { area: location.area, city: location.city } : null;
}

function legBlock(leg: TravelLeg, day: Day, locationsById: ReadonlyMap<string, Location>, window: { start: number; end: number }): BusyBlock | null {
  if (!leg.departure || !leg.arrival) return null;
  let buffer: number;
  if (leg.mode === "flight") {
    buffer = legIsInternational(leg, locationsById) ? FLIGHT_BUFFER_MINUTES.international : FLIGHT_BUFFER_MINUTES.other;
  } else if (leg.mode === "ferry" || leg.mode === "train") {
    buffer = DEPARTURE_BUFFER_MINUTES[leg.mode];
  } else {
    return null;
  }
  const departsToday = leg.departure.date === day.date;
  const arrivesToday = leg.arrival.date === day.date && !legLeavesTrip(leg, locationsById);
  return {
    id: leg.id,
    label: leg.label,
    start: departsToday ? toMinutes(leg.departure.time) - buffer : window.start,
    end: arrivesToday ? toMinutes(leg.arrival.time) + ARRIVAL_SETTLE_MINUTES : window.end,
  };
}

function eventBlock(event: FixedEvent): BusyBlock | null {
  if (!event.window || !BLOCKING_FIXED_EVENT_KINDS.includes(event.kind)) return null;
  const start = toMinutes(event.window.start);
  const end = event.window.end ? toMinutes(event.window.end) : start + FIXED_EVENT_DEFAULT_MINUTES;
  return { id: event.id, label: event.title, start, end };
}

export interface DayLoadContext {
  day: Day;
  places: Place[];
  fixedEvents: FixedEvent[];
  legs: TravelLeg[];
  locationsById: ReadonlyMap<string, Location>;
}

/** Gather everything the engine needs for one day from domain data. Pure. */
export function buildDayLoadInput({ day, places, fixedEvents, legs, locationsById }: DayLoadContext): DayLoadInput {
  const window = { start: toMinutes(DAY_WINDOW.start), end: toMinutes(DAY_WINDOW.end) };
  const dayLegs = legsForDay(day, legs);
  const busy = [
    ...dayLegs.map((leg) => legBlock(leg, day, locationsById, window)),
    ...fixedEvents.filter((event) => event.dayId === day.id).map(eventBlock),
  ].filter((block): block is BusyBlock => block !== null);

  const dayPlaces = places.filter((place) => place.assignment?.dayId === day.id);
  const committed = dayPlaces
    .filter((place) => place.assignment!.placement === "anchor" || place.assignment!.placement === "planned")
    .map(toActivity);
  const optional = dayPlaces.filter((place) => place.assignment!.placement === "optional").map(toActivity);

  const longHaulArrival = dayLegs.some(
    (leg) =>
      leg.mode === "flight" &&
      leg.arrival?.date === day.date &&
      leg.departure?.date !== day.date &&
      legIsInternational(leg, locationsById),
  );

  return {
    dayType: day.dayType,
    energyMode: day.energyMode,
    startStop: stopFor(day.originLocationId, locationsById),
    endStop: stopFor(day.baseLocationId, locationsById),
    busy,
    committed,
    optional,
    travelEnergy: longHaulArrival ? ENERGY_POINTS[LONG_HAUL_ARRIVAL_ENERGY] : 0,
  };
}

// ── Engine ─────────────────────────────────────────────────────────────────────

/** Least to most severe; a verdict's rank is its position. */
export const VERDICT_ORDER: readonly Verdict[] = ["comfortable", "full", "tight", "overloaded"];
/** Least to most important; the suggestion protects higher priorities. */
const PRIORITY_ORDER: readonly Priority[] = ["low", "medium", "high", "must"];

export const verdictRank = (verdict: Verdict): number => VERDICT_ORDER.indexOf(verdict);
const priorityRank = (priority: Priority): number => PRIORITY_ORDER.indexOf(priority);

export function transitionMinutes(from: LoadStop, to: LoadStop): number {
  const sameCity = from.city !== "" && from.city === to.city;
  if (sameCity && from.area === to.area) return TRANSITION_MINUTES.sameArea;
  if (sameCity) return TRANSITION_MINUTES.sameCity;
  return TRANSITION_MINUTES.otherCity;
}

/** Timed plans in time order, then untimed plans in their stored order. */
function sequence(activities: LoadActivity[]): LoadActivity[] {
  const timed = activities.filter((a) => a.start !== null).sort((a, b) => a.start! - b.start! || a.id.localeCompare(b.id));
  return [...timed, ...activities.filter((a) => a.start === null)];
}

function occupiedMinutes(blocks: BusyBlock[], window: { start: number; end: number }): number {
  const clipped = blocks
    .map((b) => ({ start: Math.max(b.start, window.start), end: Math.min(b.end, window.end) }))
    .filter((b) => b.end > b.start)
    .sort((a, b) => a.start - b.start);
  let total = 0;
  let cursorEnd = window.start;
  for (const block of clipped) {
    const start = Math.max(block.start, cursorEnd);
    if (block.end > start) total += block.end - start;
    cursorEnd = Math.max(cursorEnd, block.end);
  }
  return total;
}

interface Interval {
  id: string;
  start: number;
  end: number;
}

function overlapsAnything(item: LoadActivity, committed: LoadActivity[], busy: BusyBlock[], window: { start: number; end: number }): boolean {
  if (item.start === null) return false;
  const end = item.start + item.durationMinutes;
  if (item.start < window.start || end > window.end) return true;
  const others: { start: number; end: number }[] = [
    ...busy,
    ...committed.filter((a) => a.start !== null).map((a) => ({ start: a.start!, end: a.start! + a.durationMinutes })),
  ];
  return others.some((other) => item.start! < other.end && other.start < end);
}

function findConflicts(committed: LoadActivity[], busy: BusyBlock[], window: { start: number; end: number }): [string, string][] {
  const timed: Interval[] = committed
    .filter((a) => a.start !== null)
    .map((a) => ({ id: a.id, start: a.start!, end: a.start! + a.durationMinutes }));
  const conflicts: [string, string][] = [];
  for (let i = 0; i < timed.length; i++) {
    const a = timed[i];
    if (a.start < window.start || a.end > window.end) conflicts.push([a.id, "day-window"]);
    for (let j = i + 1; j < timed.length; j++) {
      const b = timed[j];
      if (a.start < b.end && b.start < a.end) conflicts.push([a.id, b.id]);
    }
    for (const block of busy) {
      if (a.start < block.end && block.start < a.end) conflicts.push([a.id, block.id]);
    }
  }
  return conflicts;
}

function stopsFor(input: DayLoadInput, activities: LoadActivity[]): LoadStop[] {
  const ordered = sequence(activities);
  if (ordered.length === 0) return [];
  return [...(input.startStop ? [input.startStop] : []), ...ordered, ...(input.endStop ? [input.endStop] : [])];
}

/** Activity time plus the estimated moves between consecutive stops (base → plans → base). */
function plannedMinutes(input: DayLoadInput, activities: LoadActivity[]): number {
  const stops = stopsFor(input, activities);
  let transitions = 0;
  for (let i = 1; i < stops.length; i++) transitions += transitionMinutes(stops[i - 1], stops[i]);
  return activities.reduce((sum, a) => sum + a.durationMinutes, 0) + transitions;
}

function areaLabel(activity: LoadActivity): string {
  return !activity.city || activity.area === activity.city ? activity.area : `${activity.area} (${activity.city})`;
}

const ENERGY_MODE_PHRASE: Record<EnergyMode, string> = {
  controlled: "a calm travel day",
  soft: "a soft day",
  "soft-adaptable": "a soft day",
  medium: "a medium-energy day",
  "full-controlled": "a full day",
  full: "a full day",
};

interface Core {
  verdict: Verdict;
  reasons: DayLoadReason[];
  availableMinutes: number;
  committedMinutes: number;
  slackMinutes: number;
  energyPoints: number;
  energyBudget: number;
  areas: string[];
  conflicts: [string, string][];
  confidence: "planned" | "estimate";
  optional: OptionalFit[];
}

function evaluate(input: DayLoadInput): Core {
  const window = { start: toMinutes(DAY_WINDOW.start), end: toMinutes(DAY_WINDOW.end) };
  const availableMinutes = Math.max(0, window.end - window.start - occupiedMinutes(input.busy, window));

  const activityMinutes = input.committed.reduce((sum, a) => sum + a.durationMinutes, 0);
  const estimatedMinutes = input.committed.reduce((sum, a) => sum + (a.durationEstimated ? a.durationMinutes : 0), 0);
  const committedMinutes = plannedMinutes(input, input.committed);
  const slackMinutes = availableMinutes - committedMinutes;
  const energyPoints = input.travelEnergy + input.committed.reduce((sum, a) => sum + ENERGY_POINTS[a.energy], 0);
  const energyBudget = ENERGY_BUDGET[input.energyMode];
  const areas = [...new Set(input.committed.filter((a) => a.area).map(areaLabel))];
  const conflicts = findConflicts(input.committed, input.busy, window);
  const utilization = availableMinutes > 0 ? committedMinutes / availableMinutes : committedMinutes > 0 ? Infinity : 0;
  const confidence: Core["confidence"] =
    activityMinutes > 0 && estimatedMinutes / activityMinutes > VERDICT_THRESHOLDS.mostlyEstimatedShare ? "estimate" : "planned";

  // An optional plan fits when inserting it into today's sequence stays within the available time.
  const optional = input.optional.map((item) => ({
    placeId: item.id,
    fits:
      !overlapsAnything(item, input.committed, input.busy, window) &&
      plannedMinutes(input, [...input.committed, item]) <= availableMinutes,
  }));

  const hasCommitted = input.committed.length > 0;
  let verdict: Verdict;
  if (conflicts.length > 0 || committedMinutes > availableMinutes) verdict = "overloaded";
  else if (
    energyPoints > energyBudget ||
    (hasCommitted &&
      (slackMinutes < VERDICT_THRESHOLDS.lowSlackMinutes || utilization > VERDICT_THRESHOLDS.tightUtilization))
  )
    verdict = "tight";
  else if (hasCommitted && (utilization > VERDICT_THRESHOLDS.fullUtilization || energyPoints === energyBudget)) verdict = "full";
  else verdict = "comfortable";

  const reasons: DayLoadReason[] = [];
  if (conflicts.length > 0) {
    const labels = new Map([...input.committed, ...input.busy.map((b) => ({ id: b.id, label: b.label }))].map((x) => [x.id, x.label] as const));
    const [a, b] = conflicts[0];
    reasons.push({
      code: "TIME_CONFLICT",
      message:
        b === "day-window"
          ? `${labels.get(a)} runs outside the usable part of the day.`
          : `${labels.get(a)} overlaps ${labels.get(b)}.`,
    });
  }
  if (committedMinutes > availableMinutes) {
    reasons.push({
      code: "OVER_CAPACITY",
      message: `${cap(formatApproxDuration(committedMinutes))} of plans and travel for ${formatApproxDuration(availableMinutes)} available.`,
    });
  } else if (hasCommitted && slackMinutes < VERDICT_THRESHOLDS.lowSlackMinutes) {
    const spare = formatApproxDuration(slackMinutes);
    reasons.push({
      code: "LOW_SLACK",
      message: spare === "no time" ? "No spare time for delays." : `Only ${spare} spare for delays.`,
    });
  }
  if (energyPoints > energyBudget) {
    reasons.push({ code: "ENERGY_OVER_BUDGET", message: `More effort than ${ENERGY_MODE_PHRASE[input.energyMode]} can comfortably hold.` });
  }
  // A road trip covers several towns by design; zig-zagging only matters on other days.
  if (input.dayType !== "road-trip" && areas.length > VERDICT_THRESHOLDS.manyAreas) {
    reasons.push({ code: "MANY_AREAS", message: `Plans span ${areas.length} areas: ${areas.join(", ")}.` });
  }
  if (availableMinutes < VERDICT_THRESHOLDS.shortWindowMinutes) {
    reasons.push({ code: "SHORT_WINDOW", message: `Travel and appointments leave ${formatApproxDuration(availableMinutes)} free.` });
  }
  if (isTravelDayType(input.dayType) && input.committed.length > 1) {
    reasons.push({ code: "TRAVEL_DAY_SQUEEZE", message: "More than one plan on a travel day." });
  }
  const wontFit = input.optional.filter((item) => !optional.find((o) => o.placeId === item.id)!.fits);
  if (wontFit.length > 0) {
    reasons.push({ code: "OPTIONAL_WONT_FIT", message: `Won't fit today: ${wontFit.map((i) => i.label).join(", ")}.` });
  }
  if (confidence === "estimate") {
    reasons.push({ code: "MOSTLY_ESTIMATED", message: "Based mostly on typical durations. Add times to firm this up." });
  }
  if (isAnchorDayType(input.dayType) && !input.committed.some((a) => a.isAnchor)) {
    reasons.push({ code: "NO_ANCHOR", message: "No anchor chosen for this day yet." });
  }

  return { verdict, reasons, availableMinutes, committedMinutes, slackMinutes, energyPoints, energyBudget, areas, conflicts, confidence, optional };
}

function cap(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function better(a: Core, b: Core): boolean {
  const rank = verdictRank(a.verdict) - verdictRank(b.verdict);
  return rank < 0 || (rank === 0 && a.reasons.length < b.reasons.length);
}

/**
 * The realistic-day engine. Pure and deterministic: integer minutes, no clock, no I/O.
 *
 * For Tight or Overloaded days it suggests one demotion (plan → optional). It protects what the
 * traveler cares about most: it picks the lowest-priority plan whose demotion improves the day,
 * then, within that priority, the biggest improvement, then the longest plan, then id order.
 * The anchor is never suggested.
 */
export function computeDayLoad(input: DayLoadInput): DayLoad {
  const core = evaluate(input);
  let suggestion: DayLoadSuggestion | null = null;

  if (core.verdict === "tight" || core.verdict === "overloaded") {
    const improving = input.committed
      .filter((a) => !a.isAnchor)
      .map((activity) => ({
        activity,
        result: evaluate({
          ...input,
          committed: input.committed.filter((a) => a.id !== activity.id),
          optional: [...input.optional, activity],
        }),
      }))
      .filter(({ result }) => better(result, core))
      .sort(
        (a, b) =>
          priorityRank(a.activity.priority) - priorityRank(b.activity.priority) ||
          (better(a.result, b.result) ? -1 : better(b.result, a.result) ? 1 : 0) ||
          b.activity.durationMinutes - a.activity.durationMinutes ||
          a.activity.id.localeCompare(b.activity.id),
      );
    const best = improving[0];
    if (best) suggestion = { placeId: best.activity.id, label: best.activity.label, verdictAfter: best.result.verdict };
  }

  return { ...core, suggestion };
}
