import { useCallback, useRef, useState } from "react";
import { ResolveBookingSheet } from "@/components/booking/ResolveBookingSheet";
import { useAnnounce } from "@/lib/a11y/announcer";
import type { BookingOverride } from "@/lib/domain/types";
import { selectBookings } from "@/lib/selectors";
import { useTrip } from "@/lib/state/TripProvider";

/**
 * Open the "Add confirmation" sheet for a booking. After saving, the change is announced and
 * focus goes to the first element (by id) that still exists — e.g. the next issue, then a heading.
 */
export function useBookingResolver() {
  const { seed, state, dispatch } = useTrip();
  const announce = useAnnounce();
  const [bookingId, setBookingId] = useState<string | null>(null);
  const returnFocus = useRef<string[]>([]);
  const booking = bookingId ? selectBookings(state, seed).get(bookingId)?.booking ?? null : null;

  const open = useCallback((id: string, focusAfterClose: string[]) => {
    returnFocus.current = focusAfterClose;
    setBookingId(id);
  }, []);

  const save = (id: string, value: BookingOverride) => {
    dispatch({ type: "resolveBooking", bookingId: id, override: value });
    const title = selectBookings(state, seed).get(id)?.booking.title ?? "Booking";
    announce(`${title} confirmed.`);
    setBookingId(null);
  };

  const sheet = (
    <ResolveBookingSheet
      booking={booking}
      onSave={save}
      onClose={() => setBookingId(null)}
      onCloseAutoFocus={(event) => {
        const target = returnFocus.current.map((id) => document.getElementById(id)).find(Boolean);
        if (target) {
          event.preventDefault();
          target.focus();
        }
      }}
    />
  );

  return { open, sheet };
}
