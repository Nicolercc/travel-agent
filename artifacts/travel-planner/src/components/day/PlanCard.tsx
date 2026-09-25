import { useEffect, useRef, useState } from "react";
import { ExternalLink, MapPin } from "lucide-react";
import { CategoryPill } from "@/components/ui/Pills";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { safeHttpUrl } from "@/lib/domain/links";
import { formatApproxDuration, formatTimeOfDay } from "@/lib/domain/time";
import type { Placement } from "@/lib/domain/types";
import { PLACEMENT_LABEL } from "@/lib/domain/vocabulary";
import type { PlaceView } from "@/lib/selectors";

const PLACEMENTS: Placement[] = ["anchor", "planned", "optional", "backup", "do-not-cram"];

export const placementControlId = (placeId: string) => `placement-${placeId}`;

export type PlacementChoice = Placement | "inbox";

interface PlanCardProps {
  view: PlaceView;
  dayId: string;
  otherDays: { id: string; label: string }[];
  onPlacementChange: (placeId: string, choice: PlacementChoice) => void;
  onMoveToDay: (placeId: string, dayId: string) => void;
  onResolveBooking: (bookingId: string) => void;
}

export function PlanCard({ view, dayId, otherDays, onPlacementChange, onMoveToDay, onResolveBooking }: PlanCardProps) {
  const { place } = view;
  const [moving, setMoving] = useState(false);
  const moveRef = useRef<HTMLButtonElement>(null);
  const link = safeHttpUrl(view.booking?.link ?? null);
  const placement = place.assignment!.placement;

  useEffect(() => {
    if (moving) moveRef.current?.focus();
  }, [moving]);

  const time = place.window
    ? place.window.end
      ? `${formatTimeOfDay(place.window.start)}–${formatTimeOfDay(place.window.end)}`
      : formatTimeOfDay(place.window.start)
    : null;
  const duration = `${formatApproxDuration(view.durationMinutes)}${view.durationEstimated ? " (typical)" : ""}`;

  return (
    <article className="space-y-3 rounded-xl border border-border bg-card p-4" aria-labelledby={`${placementControlId(place.id)}-name`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 id={`${placementControlId(place.id)}-name`} className="font-serif text-lg font-bold text-foreground">
            {place.name}
          </h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {[place.area, place.city].filter(Boolean).join(", ")}
            </span>
            {time && <span>· {time}</span>}
            {placement !== "do-not-cram" && placement !== "backup" && <span>· {duration}</span>}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CategoryPill category={place.category} />
          {view.booked && <span className="sc-status-ready-chip">Booked</span>}
          {view.fits !== null && (
            <span className={view.fits ? "sc-status-ready-chip" : "text-xs font-medium text-sc-status-attention-fg"}>
              {view.fits ? "Fits today" : "Won't fit today"}
            </span>
          )}
        </div>
      </div>

      {place.notes && <p className="text-sm leading-relaxed text-foreground/80">{place.notes}</p>}
      {view.backupForName && <p className="text-sm text-muted-foreground">Backup for {view.backupForName}</p>}
      {place.assignment!.reason && <p className="text-sm text-muted-foreground">Why not: {place.assignment!.reason}</p>}

      <div className="flex flex-wrap items-center gap-2 border-t border-border/50 pt-3">
        <Select
          value={placement}
          onValueChange={(value) => (value === "move" ? setMoving(true) : onPlacementChange(place.id, value as PlacementChoice))}
        >
          <SelectTrigger id={placementControlId(place.id)} aria-label={`Section for ${place.name}`} className="h-11 w-[170px] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PLACEMENTS.map((option) => (
              <SelectItem key={option} value={option}>
                {PLACEMENT_LABEL[option]}
              </SelectItem>
            ))}
            <SelectSeparator />
            <SelectItem value="move">Move to another day…</SelectItem>
            <SelectItem value="inbox">Back to Inbox</SelectItem>
          </SelectContent>
        </Select>

        {moving && (
          <Select onValueChange={(target) => onMoveToDay(place.id, target)} onOpenChange={(open) => !open && setMoving(false)}>
            <SelectTrigger ref={moveRef} aria-label={`Move ${place.name} to which day?`} className="h-11 w-[200px] text-sm">
              <SelectValue placeholder="Choose a day" />
            </SelectTrigger>
            <SelectContent>
              {otherDays
                .filter((day) => day.id !== dayId)
                .map((day) => (
                  <SelectItem key={day.id} value={day.id}>
                    {day.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        )}

        {view.bookingState && view.bookingState !== "secured" && view.booking && (
          <button
            type="button"
            onClick={() => onResolveBooking(view.booking!.id)}
            className="min-h-[44px] rounded-md border border-sc-status-attention-border px-3 text-sm text-sc-status-attention-fg focus-ring"
          >
            Needs confirmation
          </button>
        )}
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[44px] items-center gap-1 rounded-md px-3 text-sm text-primary underline-offset-4 hover:underline focus-ring"
          >
            {view.booking?.provider ?? "Booking"} <ExternalLink className="h-3 w-3" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        )}
      </div>
    </article>
  );
}
