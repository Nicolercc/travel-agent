import { useId, useRef, useState, type FormEvent } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validateBookingInput, type BookingInputErrors } from "@/lib/domain/booking-input";
import type { Booking, BookingOverride } from "@/lib/domain/types";

interface ResolveBookingSheetProps {
  booking: Booking | null;
  onSave: (bookingId: string, value: BookingOverride) => void;
  onClose: () => void;
  /** Where focus goes when the sheet closes (the next issue, or the list heading). */
  onCloseAutoFocus?: (event: Event) => void;
}

/** "Add confirmation": the in-place way to secure a booking (closes the Trip Pulse → Logistics dead end). */
export function ResolveBookingSheet({ booking, onSave, onClose, onCloseAutoFocus }: ResolveBookingSheetProps) {
  return (
    <Sheet open={booking !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md" onCloseAutoFocus={onCloseAutoFocus}>
        {booking && <BookingForm key={booking.id} booking={booking} onSave={onSave} />}
      </SheetContent>
    </Sheet>
  );
}

function BookingForm({ booking, onSave }: { booking: Booking; onSave: ResolveBookingSheetProps["onSave"] }) {
  const id = useId();
  const [confirmation, setConfirmation] = useState(booking.confirmation ?? "");
  const [link, setLink] = useState(booking.link ?? "");
  const [errors, setErrors] = useState<BookingInputErrors>({});
  const confirmationRef = useRef<HTMLInputElement>(null);
  const linkRef = useRef<HTMLInputElement>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const result = validateBookingInput(confirmation, link);
    if (!result.ok) {
      setErrors(result.errors);
      (result.errors.confirmation ? confirmationRef : linkRef).current?.focus();
      return;
    }
    onSave(booking.id, result.value);
  };

  const field = (name: "confirmation" | "link") => ({
    id: `${id}-${name}`,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${id}-${name}-error` : undefined,
  });

  return (
    <form onSubmit={submit} noValidate className="flex h-full flex-col gap-6">
      <SheetHeader className="pr-10 text-left">
        <SheetTitle className="font-serif text-xl">Add confirmation</SheetTitle>
        <SheetDescription>
          {booking.title} · {booking.provider}
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-2">
        <label htmlFor={`${id}-confirmation`} className="text-sm font-medium text-foreground">
          Confirmation or booking reference
        </label>
        <Input
          ref={confirmationRef}
          {...field("confirmation")}
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          autoComplete="off"
          className="min-h-[44px]"
        />
        {errors.confirmation && (
          <p id={`${id}-confirmation-error`} className="text-sm text-sc-status-critical">
            {errors.confirmation}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor={`${id}-link`} className="text-sm font-medium text-foreground">
          Link to the booking <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <Input
          ref={linkRef}
          {...field("link")}
          type="url"
          inputMode="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://"
          className="min-h-[44px]"
        />
        {errors.link && (
          <p id={`${id}-link-error`} className="text-sm text-sc-status-critical">
            {errors.link}
          </p>
        )}
      </div>

      <Button type="submit" className="min-h-[44px]">
        Save confirmation
      </Button>
    </form>
  );
}
