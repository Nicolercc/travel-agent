import { isRealReference } from "./bookings";
import { safeHttpUrl } from "./links";
import type { BookingOverride } from "./types";

export interface BookingInputErrors {
  confirmation?: string;
  link?: string;
}

export type BookingInputResult = { ok: true; value: BookingOverride } | { ok: false; errors: BookingInputErrors };

/**
 * Validate what a traveler typed into the "Add confirmation" form. A booking only counts as
 * secured with a real confirmation (INV-4), so placeholders are refused with a reason.
 */
export function validateBookingInput(confirmation: string, link: string): BookingInputResult {
  const errors: BookingInputErrors = {};
  const trimmedConfirmation = confirmation.trim();
  const trimmedLink = link.trim();

  if (!trimmedConfirmation) {
    errors.confirmation = "Enter the confirmation or booking reference.";
  } else if (!isRealReference(trimmedConfirmation)) {
    errors.confirmation = "That looks like a placeholder. Enter the reference from your booking email.";
  }
  if (trimmedLink && !safeHttpUrl(trimmedLink)) {
    errors.link = "Enter a full web link starting with https://";
  }

  if (errors.confirmation || errors.link) return { ok: false, errors };
  return { ok: true, value: { confirmation: trimmedConfirmation, link: trimmedLink ? safeHttpUrl(trimmedLink) : null } };
}
