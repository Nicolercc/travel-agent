import type { Booking, BookingOverride } from "./types";

/** Values people type while a booking is still pending; never treated as a confirmation. */
const PLACEHOLDER = /^(tbc|tbd|pending|n\/?a|none|-+|\?+)$/i;

export function isRealReference(value: string | null | undefined): boolean {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  return trimmed.length > 0 && !PLACEHOLDER.test(trimmed);
}

/** Seed booking with the traveler's own confirmation/link layered on top. */
export function applyBookingOverride(booking: Booking, override: BookingOverride | undefined): Booking {
  if (!override) return booking;
  return {
    ...booking,
    confirmation: isRealReference(override.confirmation) ? override.confirmation!.trim() : booking.confirmation,
    link: override.link?.trim() ? override.link.trim() : booking.link,
  };
}

/**
 * INV-3/INV-4 — the single definition of booking truth: a booking is secured only when it has
 * a real confirmation reference. A link alone means "linked, unconfirmed".
 */
export function isBookingSecured(booking: Booking): boolean {
  return isRealReference(booking.confirmation);
}

export type BookingState = "secured" | "linked" | "missing";

export function bookingState(booking: Booking): BookingState {
  if (isBookingSecured(booking)) return "secured";
  return booking.link ? "linked" : "missing";
}
