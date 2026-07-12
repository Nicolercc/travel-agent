import { LogisticsItem, LogisticsType, SavedPlace } from "@/types";

/** Logistics types that represent a booking obligation for readiness purposes. */
export const BOOKING_LOGISTICS_TYPES: LogisticsType[] = [
  "flight",
  "hotel",
  "car_rental",
  "ticket",
  "reservation",
];

/**
 * A booking is secured when it has a non-empty confirmation/reference or booking link.
 * Emergency info is excluded from completeness checks.
 */
export function hasSecuredReference(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export function isBookingLogisticsType(type: LogisticsType): boolean {
  return BOOKING_LOGISTICS_TYPES.includes(type);
}

export function isLogisticsItemSecured(item: LogisticsItem): boolean {
  if (item.type === "emergency") return true;
  if (!isBookingLogisticsType(item.type)) return true;
  return (
    hasSecuredReference(item.confirmation) || hasSecuredReference(item.booking_link)
  );
}

export function isSavedPlaceBookingSecured(place: SavedPlace): boolean {
  if (place.status !== "booked") return true;
  return hasSecuredReference(place.booking_link);
}

export interface BookingReadinessResult {
  securedCount: number;
  totalCount: number;
  unresolvedLogistics: LogisticsItem[];
  unresolvedPlaces: SavedPlace[];
}

export function computeBookingReadiness(
  places: SavedPlace[],
  logistics: LogisticsItem[],
): BookingReadinessResult {
  const relevantLogistics = logistics.filter((item) =>
    isBookingLogisticsType(item.type),
  );
  const bookedPlaces = places.filter((place) => place.status === "booked");

  const unresolvedLogistics = relevantLogistics.filter(
    (item) => !isLogisticsItemSecured(item),
  );
  const unresolvedPlaces = bookedPlaces.filter(
    (place) => !isSavedPlaceBookingSecured(place),
  );

  const securedCount =
    relevantLogistics.length -
    unresolvedLogistics.length +
    (bookedPlaces.length - unresolvedPlaces.length);
  const totalCount = relevantLogistics.length + bookedPlaces.length;

  return {
    securedCount,
    totalCount,
    unresolvedLogistics,
    unresolvedPlaces,
  };
}

export function countUnresolvedBookings(result: BookingReadinessResult): number {
  return result.unresolvedLogistics.length + result.unresolvedPlaces.length;
}
