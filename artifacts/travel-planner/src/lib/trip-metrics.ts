import { SavedPlace, Trip, TripDay, LogisticsItem } from "@/types";
import { differenceInCalendarDays } from "date-fns";
import { formatDateOnly, parseDateOnly, toLocalDateOnlyString } from "./dates";
import type { PackingProgress } from "./packing-storage";
import {
  computeBookingReadiness,
  countUnresolvedBookings,
} from "./booking-readiness";
import { getEffectiveAnchorPlace } from "./assignment";
import {
  dayHasAnchor,
  getDaysMissingAnchors,
  getDaysNeedingLogistics,
  getUnshapedDays,
  isAnchorRequiredDayKind,
} from "./day-readiness";

export interface DayWithMeta extends TripDay {
  hasAnchor: boolean;
  isOverloaded: boolean;
  count: number;
}

export function computeDaysWithMeta(days: TripDay[], places: SavedPlace[]): DayWithMeta[] {
  return days.map((day) => {
    const dayPlaces = places.filter((p) => p.assigned_day_id === day.id);
    const hasAnchor = dayHasAnchor(day, places);
    const activeItems = dayPlaces.filter(
      (p) => p.day_section !== "do-not-cram" && p.day_section !== "backup",
    );
    const isOverloaded = activeItems.length > 6;
    return { ...day, hasAnchor, isOverloaded, count: dayPlaces.length };
  });
}

export interface PlanningHealth {
  missingAnchors: DayWithMeta[];
  daysNeedingLogistics: DayWithMeta[];
  overloadedDays: DayWithMeta[];
  unsortedPlaces: SavedPlace[];
  bookingReadiness: ReturnType<typeof computeBookingReadiness>;
}

export function computePlanningHealth(
  days: TripDay[],
  places: SavedPlace[],
  logistics: LogisticsItem[],
): PlanningHealth {
  const daysWithMeta = computeDaysWithMeta(days, places);
  const missingAnchorIds = new Set(
    getDaysMissingAnchors(days, places).map((day) => day.id),
  );
  const needingLogisticsIds = new Set(
    getDaysNeedingLogistics(days, logistics).map((day) => day.id),
  );

  return {
    missingAnchors: daysWithMeta.filter((day) => missingAnchorIds.has(day.id)),
    daysNeedingLogistics: daysWithMeta.filter((day) =>
      needingLogisticsIds.has(day.id),
    ),
    overloadedDays: daysWithMeta.filter((day) => day.isOverloaded),
    unsortedPlaces: places.filter((p) => !p.assigned_day_id),
    bookingReadiness: computeBookingReadiness(places, logistics),
  };
}

export type FeatureDayLabel = "Today" | "Featured Day" | "Trip Preview";

export interface FeatureDayResult {
  day: TripDay;
  isToday: boolean;
  label: FeatureDayLabel;
}

export function getDashboardFeatureDay(
  days: TripDay[],
  referenceDate = new Date(),
): FeatureDayResult | null {
  if (days.length === 0) return null;

  const todayStr = toLocalDateOnlyString(referenceDate);
  const todayDay = days.find((d) => d.date === todayStr);
  if (todayDay) {
    return { day: todayDay, isToday: true, label: "Today" };
  }

  const refTime = parseDateOnly(todayStr).getTime();
  const upcoming = [...days]
    .filter((d) => parseDateOnly(d.date).getTime() >= refTime)
    .sort(
      (a, b) =>
        parseDateOnly(a.date).getTime() - parseDateOnly(b.date).getTime(),
    );

  if (upcoming.length > 0) {
    return { day: upcoming[0], isToday: false, label: "Featured Day" };
  }

  const lastDay = [...days].sort(
    (a, b) => parseDateOnly(b.date).getTime() - parseDateOnly(a.date).getTime(),
  )[0];
  return { day: lastDay, isToday: false, label: "Trip Preview" };
}

export function formatTripDateRange(startDate: string, endDate: string): string {
  const start = formatDateOnly(startDate, "MMM d");
  const end = formatDateOnly(endDate, "MMM d, yyyy");
  return `${start} – ${end}`;
}

export function formatTripDateRangeShort(
  startDate: string,
  endDate: string,
): string {
  const start = formatDateOnly(startDate, "MMM d");
  const end = formatDateOnly(endDate, "MMM d");
  return `${start} – ${end}`;
}

export function countItineraryDays(days: TripDay[]): number {
  return days.length;
}

export function getFeatureDaySnapshot(day: TripDay, places: SavedPlace[]) {
  const dayPlaces = places.filter((p) => p.assigned_day_id === day.id);
  const anchor = getEffectiveAnchorPlace(day, places);
  const bookedCount = dayPlaces.filter((p) => p.day_section === "booked").length;
  const optionalCount = dayPlaces.filter(
    (p) => p.day_section === "optional",
  ).length;

  return { anchor, bookedCount, optionalCount };
}

export type TripPhase = "upcoming" | "traveling" | "completed";

export interface TripPhaseInfo {
  phase: TripPhase;
  daysUntilDeparture: number | null;
  label: string;
}

export function getTripPhase(
  trip: Trip,
  referenceDate = new Date(),
): TripPhaseInfo {
  const today = parseDateOnly(toLocalDateOnlyString(referenceDate));
  const start = parseDateOnly(trip.start_date);
  const end = parseDateOnly(trip.end_date);

  if (today < start) {
    const daysUntil = differenceInCalendarDays(start, today);
    return {
      phase: "upcoming",
      daysUntilDeparture: daysUntil,
      label:
        daysUntil === 1
          ? "1 day until departure"
          : `${daysUntil} days until departure`,
    };
  }

  if (today <= end) {
    return {
      phase: "traveling",
      daysUntilDeparture: null,
      label: "Currently traveling",
    };
  }

  return {
    phase: "completed",
    daysUntilDeparture: null,
    label: "Trip completed",
  };
}

export interface NextBestAction {
  id: string;
  title: string;
  reason: string;
  href: string;
  count: number;
  priority: number;
}

export function computeNextBestActions(
  health: PlanningHealth,
): NextBestAction[] {
  const candidates: NextBestAction[] = [];
  const unresolvedBookings = countUnresolvedBookings(health.bookingReadiness);

  if (health.missingAnchors.length > 0) {
    candidates.push({
      id: "missing-anchors",
      title: `Set anchors for ${health.missingAnchors.length} ${health.missingAnchors.length === 1 ? "day" : "days"}`,
      reason:
        "Experience days need one defining activity so the plan feels intentional, not scattered.",
      href: `/day/${health.missingAnchors[0].id}`,
      count: health.missingAnchors.length,
      priority: 1,
    });
  }

  if (health.daysNeedingLogistics.length > 0) {
    candidates.push({
      id: "days-needing-logistics",
      title: `Confirm logistics for ${health.daysNeedingLogistics.length} travel ${health.daysNeedingLogistics.length === 1 ? "day" : "days"}`,
      reason:
        "Arrival, transfer, and departure days rely on secured flights, stays, and transport details.",
      href: "/logistics",
      count: health.daysNeedingLogistics.length,
      priority: 2,
    });
  }

  if (unresolvedBookings > 0) {
    candidates.push({
      id: "missing-bookings",
      title: `Secure ${unresolvedBookings} unresolved ${unresolvedBookings === 1 ? "booking" : "bookings"}`,
      reason:
        "Confirmations and ticket links should be one tap away when you need them on the ground.",
      href: "/logistics",
      count: unresolvedBookings,
      priority: 3,
    });
  }

  if (health.unsortedPlaces.length > 0) {
    candidates.push({
      id: "unsorted-inbox",
      title: `Sort ${health.unsortedPlaces.length} unsorted saves`,
      reason:
        "Unassigned ideas stay invisible until you give them a day on the itinerary.",
      href: "/inbox",
      count: health.unsortedPlaces.length,
      priority: 4,
    });
  }

  if (health.overloadedDays.length > 0) {
    candidates.push({
      id: "overloaded-days",
      title: `Lighten ${health.overloadedDays.length} overloaded ${health.overloadedDays.length === 1 ? "day" : "days"}`,
      reason:
        "More than six active items usually means a day that collapses on the ground.",
      href: `/day/${health.overloadedDays[0].id}`,
      count: health.overloadedDays.length,
      priority: 5,
    });
  }

  return candidates.sort((a, b) => a.priority - b.priority).slice(0, 3);
}

export type ReadinessStage = "needs-attention" | "in-progress" | "ready";

export interface ReadinessDimension {
  id: string;
  label: string;
  stage: ReadinessStage;
  summary: string;
}

export interface TripReadinessResult {
  dimensions: ReadinessDimension[];
  summary: string;
}

function stageFromRatio(
  ratio: number,
  readyAt = 1,
  progressAt = 0.5,
): ReadinessStage {
  if (ratio >= readyAt) return "ready";
  if (ratio >= progressAt) return "in-progress";
  return "needs-attention";
}

export function computeTripReadiness(
  days: TripDay[],
  places: SavedPlace[],
  logistics: LogisticsItem[],
  packingProgress?: PackingProgress,
): TripReadinessResult {
  const health = computePlanningHealth(days, places, logistics);
  const totalPlaces = places.length;
  const assignedCount = places.filter((p) => p.assigned_day_id).length;
  const shapedDays = days.length - getUnshapedDays(days, places, logistics).length;
  const booking = health.bookingReadiness;
  const unresolvedBookings = countUnresolvedBookings(booking);

  const dimensions: ReadinessDimension[] = [
    {
      id: "inspiration",
      label: "Inspiration organized",
      stage:
        health.unsortedPlaces.length === 0
          ? "ready"
          : stageFromRatio(assignedCount / Math.max(totalPlaces, 1), 0.85, 0.55),
      summary:
        health.unsortedPlaces.length === 0
          ? "Every save has a day assignment."
          : `${health.unsortedPlaces.length} saves still need a day.`,
    },
    {
      id: "days",
      label: "Days shaped",
      stage: stageFromRatio(shapedDays / Math.max(days.length, 1), 1, 0.5),
      summary:
        shapedDays === days.length
          ? "Each day meets its planning rules — anchors or secured logistics."
          : `${days.length - shapedDays} days still need attention.`,
    },
    {
      id: "bookings",
      label: "Bookings secured",
      stage:
        booking.totalCount === 0
          ? "in-progress"
          : unresolvedBookings === 0
            ? "ready"
            : "needs-attention",
      summary:
        unresolvedBookings === 0
          ? `${booking.securedCount} bookings have confirmations or links.`
          : `${unresolvedBookings} bookings still need a confirmation or link.`,
    },
  ];

  if (packingProgress && packingProgress.total > 0) {
    const ratio = packingProgress.checked / packingProgress.total;
    dimensions.push({
      id: "packing",
      label: "Packing progress",
      stage:
        ratio === 0
          ? "needs-attention"
          : stageFromRatio(ratio, 1, 0.01),
      summary: `${packingProgress.checked} of ${packingProgress.total} items packed.`,
    });
  }

  let summary: string;
  if (unresolvedBookings > 0) {
    summary = `${unresolvedBookings} booking${unresolvedBookings === 1 ? "" : "s"} still need confirmations or links.`;
  } else if (health.daysNeedingLogistics.length > 0) {
    summary = `${health.daysNeedingLogistics.length} travel ${health.daysNeedingLogistics.length === 1 ? "day needs" : "days need"} secured logistics.`;
  } else if (health.missingAnchors.length > 0) {
    summary = `Your route is taking shape. ${health.missingAnchors.length} experience ${health.missingAnchors.length === 1 ? "day still needs" : "days still need"} an anchor.`;
  } else if (health.unsortedPlaces.length > 0) {
    summary = `Days are shaping up well. ${health.unsortedPlaces.length} saved places still need a day.`;
  } else {
    summary = "Your trip is in strong shape. Review days and enjoy the calm.";
  }

  return { dimensions, summary };
}

export interface DayPreviewSnapshot {
  anchor?: SavedPlace;
  bookedCount: number;
  plannedCount: number;
  optionalCount: number;
  hasAnchor: boolean;
  isOverloaded: boolean;
  isAnchorExpected: boolean;
}

export function getDayPreviewSnapshot(
  day: TripDay,
  places: SavedPlace[],
): DayPreviewSnapshot {
  const dayPlaces = places.filter((p) => p.assigned_day_id === day.id);
  const anchor = getEffectiveAnchorPlace(day, places);
  const activeItems = dayPlaces.filter(
    (p) => p.day_section !== "do-not-cram" && p.day_section !== "backup",
  );

  return {
    anchor,
    bookedCount: dayPlaces.filter((p) => p.day_section === "booked").length,
    plannedCount: dayPlaces.filter((p) => p.day_section === "planned").length,
    optionalCount: dayPlaces.filter((p) => p.day_section === "optional").length,
    hasAnchor: dayHasAnchor(day, places),
    isOverloaded: activeItems.length > 6,
    isAnchorExpected: isAnchorRequiredDayKind(day.day_kind),
  };
}
