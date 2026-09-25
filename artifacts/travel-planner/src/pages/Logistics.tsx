import { Car, ExternalLink, Hotel, LifeBuoy, Plane, Ticket, Bus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDateOnly } from "@/lib/domain/dates";
import { safeHttpUrl } from "@/lib/domain/links";
import type { BookingKind } from "@/lib/domain/types";
import { selectBookings, type BookingView } from "@/lib/selectors";
import { useTrip } from "@/lib/state/TripProvider";
import { CopyButton } from "@/components/CopyButton";
import { useBookingResolver } from "@/hooks/useBookingResolver";
import { useAnnounce } from "@/lib/a11y/announcer";

const SECTIONS: { kind: BookingKind; title: string; Icon: typeof Plane }[] = [
  { kind: "flight", title: "Flights", Icon: Plane },
  { kind: "stay", title: "Stays", Icon: Hotel },
  { kind: "car", title: "Rental cars", Icon: Car },
  { kind: "transfer", title: "Transfers", Icon: Bus },
  { kind: "ticket", title: "Tickets", Icon: Ticket },
];

const bookingHeadingId = (id: string) => `booking-${id}-title`;

interface BookingCardProps {
  view: BookingView;
  dates: string | null;
  onAddConfirmation: (bookingId: string) => void;
  onClear: (bookingId: string) => void;
}

function BookingCard({ view, dates, onAddConfirmation, onClear }: BookingCardProps) {
  const { booking } = view;
  const link = safeHttpUrl(booking.link);
  return (
    <Card className="border-border" data-testid={`booking-${booking.id}`}>
      <CardContent className="p-5 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 id={bookingHeadingId(booking.id)} tabIndex={-1} className="font-serif font-bold text-foreground text-lg leading-snug focus:outline-none">
              {booking.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {booking.provider}
              {dates && ` · ${dates}`}
            </p>
          </div>
          {view.state === "secured" ? (
            <CopyButton value={booking.confirmation!} label={`${booking.title} confirmation`} />
          ) : (
            <span className="text-xs text-sc-status-attention-fg bg-sc-status-attention-bg border border-sc-status-attention-border px-2 py-1 rounded shrink-0">
              {view.state === "linked" ? "Linked, not confirmed" : "Needs confirmation"}
            </span>
          )}
        </div>
        {booking.notes && <p className="text-sm text-foreground/75 bg-secondary/40 px-3 py-2 rounded-md">{booking.notes}</p>}
        <div className="flex flex-wrap gap-2">
          {view.state !== "secured" ? (
            <Button className="min-h-[44px]" onClick={() => onAddConfirmation(booking.id)}>
              Add confirmation
            </Button>
          ) : (
            view.edited && (
              <>
                <Button variant="outline" className="min-h-[44px]" onClick={() => onAddConfirmation(booking.id)}>
                  Edit confirmation
                </Button>
                <Button variant="ghost" className="min-h-[44px]" onClick={() => onClear(booking.id)}>
                  Clear what I added
                </Button>
              </>
            )
          )}
          {link && (
            <Button variant="outline" className="min-h-[44px] gap-2" asChild>
              <a href={link} target="_blank" rel="noreferrer">
                Open {booking.provider} <ExternalLink className="w-3 h-3" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Logistics() {
  const { seed, state, dispatch } = useTrip();
  const announce = useAnnounce();
  const resolver = useBookingResolver();
  const bookings = [...selectBookings(state, seed).values()];
  const needsConfirmation = bookings.filter((view) => view.state !== "secured");
  const dateOf = new Map(seed.days.map((day) => [day.id, day.date]));
  const datesFor = (view: BookingView) => {
    if (view.dayIds.length === 0) return null;
    const first = formatDateOnly(dateOf.get(view.dayIds[0])!, "MMM d");
    const last = formatDateOnly(dateOf.get(view.dayIds[view.dayIds.length - 1])!, "MMM d");
    return first === last ? first : `${first} – ${last}`;
  };

  const addConfirmation = (bookingId: string) => resolver.open(bookingId, [bookingHeadingId(bookingId)]);
  const clear = (bookingId: string) => {
    dispatch({ type: "clearBookingOverride", bookingId });
    announce(`Removed the details you added for ${selectBookings(state, seed).get(bookingId)?.booking.title ?? "this booking"}.`);
  };
  const card = (view: BookingView) => (
    <BookingCard key={view.booking.id} view={view} dates={datesFor(view)} onAddConfirmation={addConfirmation} onClear={clear} />
  );
  return (
    <div className="space-y-12 page-enter max-w-4xl">
      <header className="space-y-1">
        <h1 className="text-4xl md:text-5xl font-serif text-primary tracking-tight">Logistics</h1>
        <p className="text-lg text-muted-foreground">Flights, stays, cars, and tickets.</p>
      </header>

      {needsConfirmation.length > 0 && (
        <section className="space-y-3" aria-labelledby="logistics-needs">
          <h2 id="logistics-needs" className="text-xl font-serif text-foreground border-b border-border pb-3">
            Needs confirmation ({needsConfirmation.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{needsConfirmation.map(card)}</div>
        </section>
      )}

      {SECTIONS.map(({ kind, title, Icon }) => {
        const items = bookings.filter((view) => view.booking.kind === kind && view.state === "secured");
        if (items.length === 0) return null;
        return (
          <section key={kind} className="space-y-3" aria-labelledby={`logistics-${kind}`}>
            <h2 id={`logistics-${kind}`} className="text-xl font-serif text-foreground flex items-center gap-2.5 border-b border-border pb-3">
              <Icon className="w-4 h-4" /> {title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map(card)}
            </div>
          </section>
        );
      })}

      {resolver.sheet}

      <section className="space-y-3" aria-labelledby="logistics-emergency">
        <h2 id="logistics-emergency" className="text-xl font-serif text-foreground flex items-center gap-2.5 border-b border-border pb-3">
          <LifeBuoy className="w-4 h-4" /> Emergency info
        </h2>
        <dl className="grid gap-2 sm:grid-cols-2">
          {seed.trip.emergencyInfo.map((entry) => (
            <div key={entry.label} className="rounded-md bg-secondary/40 px-3 py-2">
              <dt className="text-xs text-muted-foreground">{entry.label}</dt>
              <dd className="font-medium text-foreground">{entry.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
