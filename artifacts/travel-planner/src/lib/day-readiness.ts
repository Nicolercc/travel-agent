import { LogisticsItem, SavedPlace, TripDay, TripDayKind } from "@/types";
import { dayHasEffectiveAnchor } from "./assignment";
import { isLogisticsItemSecured } from "./booking-readiness";

/** Experience-heavy days need an anchor activity to be considered shaped. */
export const ANCHOR_REQUIRED_DAY_KINDS: TripDayKind[] = [
  "experience",
  "road-trip",
  "city",
  "mountain",
];

/** Travel-movement days are shaped by secured logistics on that calendar date. */
export const LOGISTICS_PRIMARY_DAY_KINDS: TripDayKind[] = [
  "arrival",
  "transfer",
  "departure",
];

export function isAnchorRequiredDayKind(kind: TripDayKind): boolean {
  return ANCHOR_REQUIRED_DAY_KINDS.includes(kind);
}

export function isLogisticsPrimaryDayKind(kind: TripDayKind): boolean {
  return LOGISTICS_PRIMARY_DAY_KINDS.includes(kind);
}

export function dayHasAnchor(day: TripDay, places: SavedPlace[]): boolean {
  return dayHasEffectiveAnchor(day, places);
}

export function logisticsForDay(
  day: TripDay,
  logistics: LogisticsItem[],
): LogisticsItem[] {
  return logistics.filter(
    (item) => item.type !== "emergency" && item.date === day.date,
  );
}

/**
 * Logistics-primary days are shaped when every logistics item on that date is secured.
 * If no logistics exist yet for the date, the day is not shaped.
 */
export function dayHasSecuredLogistics(
  day: TripDay,
  logistics: LogisticsItem[],
): boolean {
  const items = logisticsForDay(day, logistics);
  if (items.length === 0) return false;
  return items.every(isLogisticsItemSecured);
}

export function isDayShaped(
  day: TripDay,
  places: SavedPlace[],
  logistics: LogisticsItem[],
): boolean {
  if (isAnchorRequiredDayKind(day.day_kind)) {
    return dayHasAnchor(day, places);
  }

  if (isLogisticsPrimaryDayKind(day.day_kind)) {
    return dayHasSecuredLogistics(day, logistics);
  }

  return dayHasAnchor(day, places);
}

export type DayRibbonStatusVariant = "ok" | "attention";

export interface DayRibbonStatus {
  label: string;
  variant: DayRibbonStatusVariant;
}

export function getDayRibbonStatus(
  day: TripDay,
  places: SavedPlace[],
  logistics: LogisticsItem[],
): DayRibbonStatus {
  if (isLogisticsPrimaryDayKind(day.day_kind)) {
    const items = logisticsForDay(day, logistics);
    if (items.length === 0) {
      return { label: "Needs logistics", variant: "attention" };
    }
    if (dayHasSecuredLogistics(day, logistics)) {
      return { label: "Logistics set", variant: "ok" };
    }
    return { label: "Needs confirmation", variant: "attention" };
  }

  if (dayHasAnchor(day, places)) {
    return { label: "Anchored", variant: "ok" };
  }

  return { label: "Needs anchor", variant: "attention" };
}

export function getDaysMissingAnchors(
  days: TripDay[],
  places: SavedPlace[],
): TripDay[] {
  return days.filter(
    (day) => isAnchorRequiredDayKind(day.day_kind) && !dayHasAnchor(day, places),
  );
}

export function getDaysNeedingLogistics(
  days: TripDay[],
  logistics: LogisticsItem[],
): TripDay[] {
  return days.filter(
    (day) =>
      isLogisticsPrimaryDayKind(day.day_kind) &&
      !dayHasSecuredLogistics(day, logistics),
  );
}

export function getUnshapedDays(
  days: TripDay[],
  places: SavedPlace[],
  logistics: LogisticsItem[],
): TripDay[] {
  return days.filter((day) => !isDayShaped(day, places, logistics));
}
